export type OfferFormValues = {
  name: string;
  email: string;
  quantity: string;
  offer: string;
  message: string;
};

export type OfferFieldErrors = Partial<
  Record<'name' | 'email' | 'quantity' | 'offer' | 'product_id' | 'variant_id', string>
>;

export type OfferPayload = {
  shop: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_title?: string;
  name: string;
  email: string;
  quantity: number;
  offer: number;
  currency: string;
  message?: string;
};

export class OfferSubmissionError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'OfferSubmissionError';
    this.status = status;
  }
}

export function getOfferFormValues(formData: FormData): OfferFormValues {
  return {
    name: getString(formData.get('name')),
    email: getString(formData.get('email')).toLowerCase(),
    quantity: getString(formData.get('quantity')),
    offer: getString(formData.get('offer')),
    message: getString(formData.get('message')),
  };
}

export function validateOfferForm(values: OfferFormValues): OfferFieldErrors {
  const errors: OfferFieldErrors = {};

  if (!values.name) {
    errors.name = 'Ingresa tu nombre.';
  }

  if (!values.email) {
    errors.email = 'Ingresa tu email.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Ingresa un email válido.';
  }

  const quantity = Number(values.quantity);
  if (!values.quantity) {
    errors.quantity = 'Ingresa una cantidad.';
  } else if (!Number.isInteger(quantity) || quantity < 1) {
    errors.quantity = 'La cantidad debe ser un número mayor o igual a 1.';
  }

  const offer = Number(values.offer);
  if (!values.offer) {
    errors.offer = 'Ingresa tu oferta.';
  } else if (!Number.isFinite(offer) || offer <= 0) {
    errors.offer = 'La oferta debe ser un número mayor a 0.';
  }

  return errors;
}

export async function submitOffer(
  env: Pick<Env, 'OFFERS_APP_TOKEN' | 'OFFERS_APP_URL'>,
  payload: OfferPayload,
) {
  const endpoint = new URL('/api/offers', env.OFFERS_APP_URL).toString();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-offer-ingest-token': env.OFFERS_APP_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return response;
  }

  const message = await extractErrorMessage(response);
  throw new OfferSubmissionError(message, response.status);
}

export function assertOffersEnv(
  env: Partial<Pick<Env, 'OFFERS_APP_TOKEN' | 'OFFERS_APP_URL' | 'OFFERS_SHOP_DOMAIN'>>,
) {
  if (!env.OFFERS_APP_URL || !env.OFFERS_APP_TOKEN || !env.OFFERS_SHOP_DOMAIN) {
    throw new OfferSubmissionError(
      'La configuración de ofertas no está completa en el servidor.',
      500,
    );
  }
}

export function normalizeVariantTitle(title?: string | null) {
  if (!title || title === 'Default Title') return undefined;
  return title;
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function extractErrorMessage(response: Response) {
  const fallback =
    response.status >= 500
      ? 'No pudimos enviar tu oferta. Inténtalo de nuevo en unos minutos.'
      : 'No pudimos registrar tu oferta. Revisa los datos e inténtalo nuevamente.';

  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as Record<string, unknown>;
      const candidate =
        payload.message ?? payload.error ?? payload.errors ?? payload.detail;

      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }

      if (Array.isArray(candidate) && candidate.length) {
        const first = candidate.find((item) => typeof item === 'string');
        if (typeof first === 'string' && first.trim()) {
          return first;
        }
      }
    }

    const text = await response.text();
    if (text.trim()) {
      return text.trim();
    }
  } catch {
    // Use fallback below.
  }

  return fallback;
}
