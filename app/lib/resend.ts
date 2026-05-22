/**
 * Cliente mínimo de la API de Resend (https://resend.com/docs/api-reference).
 *
 * Server-only: no debe importarse desde código que corra en el cliente.
 * La `RESEND_API_KEY` vive en `context.env`, accesible en loaders/actions
 * de Hydrogen.
 *
 * Filosofía:
 *   - Cero dependencias. `fetch` está disponible en el runtime de Oxygen.
 *   - Devolvemos un Result tipado (`{ok: true, id}` | `{ok: false, error}`)
 *     para que el caller decida la UX sin lidiar con excepciones.
 *   - Validamos la API key arriba para diferenciar "config faltante" de
 *     "Resend rechazó el envío".
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type ResendPayload = {
  /** Remitente verificado en Resend (formato `Nombre <correo@dominio>`). */
  from: string;
  /** Uno o varios destinatarios principales. */
  to: string | string[];
  /** Copia opcional. Si se pasa una cadena vacía, se omite. */
  cc?: string | string[];
  /** Reply-to: usualmente el correo del visitante para responder directo. */
  replyTo?: string;
  subject: string;
  /** Contenido HTML del email. */
  html: string;
};

export type ResendResult =
  | {ok: true; id: string}
  | {ok: false; error: string};

/**
 * Envía un email vía Resend. Retorna un Result; nunca lanza para errores
 * esperables (config faltante, 4xx/5xx del API). Lanza solo si el `fetch`
 * mismo falla a nivel de red — el caller puede dejarlo escalar al action
 * de la ruta.
 */
export async function sendResendEmail(
  apiKey: string | undefined,
  payload: ResendPayload,
): Promise<ResendResult> {
  if (!apiKey) {
    return {
      ok: false,
      error: 'RESEND_API_KEY no está configurada en el entorno.',
    };
  }

  const body = {
    from: payload.from,
    to: normalize(payload.to),
    cc: payload.cc ? normalize(payload.cc) : undefined,
    reply_to: payload.replyTo,
    subject: payload.subject,
    html: payload.html,
  };

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Resend devuelve `{id: string}` en éxito y `{message, name, statusCode}`
  // en error. Parseamos defensivamente porque algunos códigos (e.g. 502)
  // pueden devolver texto plano.
  const text = await response.text();
  if (!response.ok) {
    return {ok: false, error: extractErrorMessage(text, response.status)};
  }

  try {
    const json = JSON.parse(text) as {id?: string};
    if (!json.id) return {ok: false, error: 'Resend no devolvió un id de envío.'};
    return {ok: true, id: json.id};
  } catch {
    return {ok: false, error: 'Respuesta de Resend no parseable.'};
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Filtra cadenas vacías y normaliza a array para el formato de Resend. */
function normalize(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : [value];
  return list.map((v) => v.trim()).filter(Boolean);
}

function extractErrorMessage(text: string, status: number): string {
  try {
    const json = JSON.parse(text) as {message?: string; name?: string};
    if (json.message) return json.message;
    if (json.name) return json.name;
  } catch {
    // texto plano, caemos al genérico
  }
  return `Resend respondió con estado ${status}.`;
}
