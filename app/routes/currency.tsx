import {redirect} from 'react-router';
import type {Route} from './+types/currency';
import {CURRENCY_COOKIE, currencyToCountry} from '~/lib/i18n';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const currency = formData.get('currency');
  const redirectTo = safeRedirect(formData.get('redirectTo'));

  if (currency !== 'USD' && currency !== 'EUR') {
    return redirect(redirectTo);
  }

  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `${CURRENCY_COOKIE}=${currency}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`,
  );

  // Re-price an existing cart in the new currency by switching its buyer
  // identity country. A missing cart id means there is nothing to re-price.
  if (context.cart.getCartId()) {
    const result = await context.cart.updateBuyerIdentity({
      countryCode: currencyToCountry(currency),
    });
    if (result?.cart?.id) {
      for (const cookie of context.cart
        .setCartId(result.cart.id)
        .getSetCookie()) {
        headers.append('Set-Cookie', cookie);
      }
    }
  }

  return redirect(redirectTo, {headers});
}

// The currency route only handles POST submissions; a direct visit bounces home.
export async function loader() {
  return redirect('/');
}

// Only same-origin relative paths are allowed, to avoid an open redirect.
function safeRedirect(value: FormDataEntryValue | null): string {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
  ) {
    return value;
  }
  return '/';
}
