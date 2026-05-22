import {data, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {ArtistEditorialPage} from '~/components/ArtistEditorialPage';
import {ContactEditorialPage} from '~/components/ContactEditorialPage';
import {ShippingEditorialPage} from '~/components/ShippingEditorialPage';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  ContactSubmissionError,
  assertContactEnv,
  getContactFormValues,
  sendContactEmail,
  validateContactForm,
  type ContactFieldErrors,
  type ContactFormValues,
} from '~/lib/contact.server';

export type ContactActionData = {
  status: 'success' | 'error';
  message: string;
  fieldErrors?: ContactFieldErrors;
  values?: ContactFormValues;
};

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

export async function action({
  request,
  context,
}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent !== 'contact') {
    return data<ContactActionData>(
      {status: 'error', message: 'Acción no soportada.'},
      {status: 400},
    );
  }

  const values = getContactFormValues(formData);
  const fieldErrors = validateContactForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return data<ContactActionData>(
      {
        status: 'error',
        message: 'Revisa los campos del formulario.',
        fieldErrors,
        values,
      },
      {status: 400},
    );
  }

  try {
    assertContactEnv(context.env);
    await sendContactEmail(context.env, values, {
      shop: context.env.PUBLIC_STORE_DOMAIN,
    });
    return data<ContactActionData>({
      status: 'success',
      message:
        'Recibimos tu mensaje. Te responderemos pronto desde el estudio.',
    });
  } catch (error) {
    const isKnown = error instanceof ContactSubmissionError;
    return data<ContactActionData>(
      {
        status: 'error',
        message: isKnown
          ? error.message
          : 'No pudimos enviar tu mensaje. Intenta nuevamente en unos minutos.',
        values,
      },
      {status: isKnown ? error.status : 500},
    );
  }
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  if (page.handle === 'artista') {
    return <ArtistEditorialPage />;
  }

  if (page.handle === 'envios-y-pagos') {
    return <ShippingEditorialPage />;
  }

  if (page.handle === 'contacto') {
    return <ContactEditorialPage />;
  }

  return (
    <div className="page">
      <header>
        <h1>{page.title}</h1>
      </header>
      <main dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
