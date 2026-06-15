import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN;
  const checkoutDomain = context.env.PUBLIC_CHECKOUT_DOMAIN;
  const shopDomains = [storeDomain, checkoutDomain]
    .filter((domain): domain is string => Boolean(domain))
    .map((domain) => `https://${domain}`);

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain,
      storeDomain,
    },
    // <model-viewer> genera URLs `blob:` para las texturas del GLB (y posibles
    // workers). Sin `blob:` en el CSP el navegador las bloquea y el modelo se
    // ve blanco tipo "clay render" (geometría sí, texturas no). `connectSrc` se
    // FUSIONA con los defaults de Hydrogen (self, cdn.shopify, monorail, dominios
    // de tienda/checkout), así que aquí basta con añadir `blob:`.
    connectSrc: ['blob:'],
    // `imgSrc`/`mediaSrc`/`workerSrc` NO tienen default en Hydrogen: al definirlas
    // dejan de heredar de `default-src`, por eso van completas (incluyen los
    // orígenes de imágenes actuales: cdn.shopify.com, shopify.com y la tienda).
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      ...shopDomains,
    ],
    mediaSrc: ["'self'", 'blob:', 'https://cdn.shopify.com', ...shopDomains],
    workerSrc: ["'self'", 'blob:'],
    // Permite cargar la hoja de estilos de Google Fonts (Playfair Display,
    // Manrope, JetBrains Mono). Sin este permiso el navegador bloquea el @import
    // de tailwind.css y el sitio cae a tipografías de respaldo.
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
      'http://localhost:*',
    ],
    // Permite descargar los archivos .woff2 desde el CDN de Google Fonts.
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
