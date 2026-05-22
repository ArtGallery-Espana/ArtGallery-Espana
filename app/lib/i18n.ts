import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

export type CurrencyChoice = 'USD' | 'EUR';

/**
 * Cookie that stores the buyer's currency preference (set by the header
 * currency selector). The chosen currency maps to a country, and that country
 * is what Hydrogen passes to `@inContext` so the Storefront API returns
 * converted prices — provided the matching Shopify Market exists.
 */
export const CURRENCY_COOKIE = 'buyerCurrency';

const COUNTRY_BY_CURRENCY: Record<CurrencyChoice, I18nLocale['country']> = {
  USD: 'US',
  EUR: 'ES',
};

export function currencyToCountry(
  currency: CurrencyChoice,
): I18nLocale['country'] {
  return COUNTRY_BY_CURRENCY[currency];
}

export function countryToCurrency(
  country: I18nLocale['country'],
): CurrencyChoice {
  return country === COUNTRY_BY_CURRENCY.EUR ? 'EUR' : 'USD';
}

export function getCurrencyFromCookie(request: Request): CurrencyChoice | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${CURRENCY_COOKIE}=(USD|EUR)`),
  );
  return (match?.[1] as CurrencyChoice | undefined) ?? null;
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  type I18nFromUrl = [I18nLocale['language'], I18nLocale['country']];

  let pathPrefix = '';
  let [language, country]: I18nFromUrl = ['EN', 'US'];

  if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
    pathPrefix = '/' + firstPathPart;
    [language, country] = firstPathPart.split('-') as I18nFromUrl;
  }

  // The currency selector stores its choice in a cookie. When present it
  // overrides the country so Storefront API prices convert accordingly.
  const cookieCurrency = getCurrencyFromCookie(request);
  if (cookieCurrency) {
    country = currencyToCountry(cookieCurrency);
  }

  return {language, country, pathPrefix};
}
