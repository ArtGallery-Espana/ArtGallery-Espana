export type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactFieldErrors = Partial<
  Record<keyof ContactFormValues, string>
>;

export class ContactSubmissionError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ContactSubmissionError';
    this.status = status;
  }
}

export function getContactFormValues(formData: FormData): ContactFormValues {
  return {
    name: getString(formData.get('name')),
    email: getString(formData.get('email')).toLowerCase(),
    subject: getString(formData.get('subject')),
    message: getString(formData.get('message')),
  };
}

export function validateContactForm(
  values: ContactFormValues,
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!values.name) {
    errors.name = 'Ingresa tu nombre.';
  } else if (values.name.length > 120) {
    errors.name = 'El nombre es demasiado largo.';
  }

  if (!values.email) {
    errors.email = 'Ingresa tu email.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Ingresa un email válido.';
  }

  if (!values.subject) {
    errors.subject = 'Ingresa un asunto.';
  } else if (values.subject.length > 200) {
    errors.subject = 'El asunto es demasiado largo.';
  }

  if (!values.message) {
    errors.message = 'Escribe tu mensaje.';
  } else if (values.message.length < 10) {
    errors.message = 'Tu mensaje debe tener al menos 10 caracteres.';
  } else if (values.message.length > 5000) {
    errors.message = 'Tu mensaje es demasiado largo.';
  }

  return errors;
}

export function assertContactEnv(
  env: Partial<
    Pick<Env, 'RESEND_API_KEY' | 'CONTACT_FROM_EMAIL' | 'CONTACT_TO_EMAIL'>
  >,
) {
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
    throw new ContactSubmissionError(
      'La configuración del formulario de contacto no está completa en el servidor.',
      500,
    );
  }
}

export async function sendContactEmail(
  env: Pick<
    Env,
    | 'RESEND_API_KEY'
    | 'CONTACT_FROM_EMAIL'
    | 'CONTACT_TO_EMAIL'
    | 'CONTACT_CC_EMAIL'
  >,
  values: ContactFormValues,
  meta: {shop: string},
) {
  const cc = env.CONTACT_CC_EMAIL ? [env.CONTACT_CC_EMAIL] : undefined;

  const payload = {
    from: env.CONTACT_FROM_EMAIL,
    to: [env.CONTACT_TO_EMAIL],
    ...(cc ? {cc} : {}),
    reply_to: values.email,
    subject: `[Contacto galería] ${values.subject}`,
    html: buildHtml(values, meta),
    text: buildText(values, meta),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return response;
  }

  const message = await extractErrorMessage(response);
  throw new ContactSubmissionError(message, response.status);
}

function buildText(values: ContactFormValues, meta: {shop: string}) {
  return [
    'Nuevo mensaje desde el formulario de contacto',
    '',
    `Nombre:  ${values.name}`,
    `Email:   ${values.email}`,
    `Asunto:  ${values.subject}`,
    `Tienda:  ${meta.shop}`,
    '',
    'Mensaje:',
    values.message,
  ].join('\n');
}

function buildHtml(values: ContactFormValues, meta: {shop: string}) {
  const safe = (s: string) => escapeHtml(s);
  const messageHtml = safe(values.message).replace(/\n/g, '<br>');

  return `<!doctype html>
<html lang="es">
  <body style="font-family:Inter,system-ui,sans-serif;background:#f6f1ea;margin:0;padding:24px;color:#232327;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(35,35,39,.12);padding:32px;">
      <p style="margin:0 0 8px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#c84d92;">Nuevo contacto</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;line-height:1.2;color:#111111;">${safe(values.subject)}</h1>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:rgba(35,35,39,.6);width:120px;">Nombre</td><td style="padding:8px 0;">${safe(values.name)}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(35,35,39,.6);">Email</td><td style="padding:8px 0;"><a href="mailto:${safe(values.email)}" style="color:#2f9ea0;">${safe(values.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:rgba(35,35,39,.6);">Tienda</td><td style="padding:8px 0;">${safe(meta.shop)}</td></tr>
      </table>

      <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(35,35,39,.12);">
        <p style="margin:0 0 8px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(35,35,39,.5);">Mensaje</p>
        <p style="margin:0;line-height:1.6;color:#232327;">${messageHtml}</p>
      </div>
    </div>
  </body>
</html>`;
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function extractErrorMessage(response: Response) {
  const fallback =
    response.status >= 500
      ? 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.'
      : 'No pudimos registrar tu mensaje. Revisa los datos e inténtalo nuevamente.';

  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as Record<string, unknown>;
      const candidate =
        payload.message ?? payload.error ?? payload.errors ?? payload.detail;

      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }

    const text = await response.text();
    if (text.trim()) {
      return text.trim();
    }
  } catch {
    // fall through
  }

  return fallback;
}
