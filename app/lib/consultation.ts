/**
 * Configuración y helpers de los CTAs de "Consulta sobre la obra".
 *
 * Mantiene en un único lugar:
 *   - Los destinatarios de email (alternados entre develop y producción).
 *   - El número de WhatsApp del estudio.
 *   - Los builders de URL para los enlaces directos (wa.me, mailto:).
 *   - El template HTML del email enviado vía Resend (ver `app/lib/resend.ts`).
 *
 * Para cambiar a destinatarios de producción: poner `IS_PRODUCTION = true`
 * antes de mergear a `main`. No depende de NODE_ENV porque queremos que
 * el toggle sea explícito y obvio en el diff del PR.
 */

// ── Toggle de entorno ───────────────────────────────────────────────────────
const IS_PRODUCTION = false;

// ── Destinatarios ──────────────────────────────────────────────────────────
// `cc` puede ser '' si no se requiere copia.
type Recipients = {to: string; cc: string};

// ⚠️ En modo onboarding de Resend (sin dominio verificado) SOLO se puede
// enviar al correo dueño de la cuenta de Resend, y eso incluye el CC.
// Por eso `to` = correo de la cuenta y `cc` vacío durante pruebas.
// Cuando se verifique un dominio en Resend, restaurar los correos reales
// del estudio y `EMAIL_FROM` al dominio verificado.
const TEST_RECIPIENTS: Recipients = {
  to: 'barrosoandy03@gmail.com',
  cc: '',
};

const PRODUCTION_RECIPIENTS: Recipients = {
  to: 'jespanaa9207@gmail.com',
  cc: 'maite.guic2@gmail.com',
};

export const EMAIL_RECIPIENTS: Recipients = IS_PRODUCTION
  ? PRODUCTION_RECIPIENTS
  : TEST_RECIPIENTS;

// ── WhatsApp ───────────────────────────────────────────────────────────────
// Número del estudio sin símbolos: wa.me solo acepta dígitos.
export const WHATSAPP_PHONE_DIGITS = '593998073728';
export const WHATSAPP_PHONE_DISPLAY = '+593 99 807 3728';

// ── Dirección "From" del email ─────────────────────────────────────────────
// `onboarding@resend.dev` funciona out-of-the-box mientras la cuenta de
// Resend no tenga un dominio verificado. Una vez que el equipo verifique
// `galeriatallerjespana.com` en Resend, reemplazar por
// `Galería Taller J España <hola@galeriatallerjespana.com>`.
export const EMAIL_FROM = 'Galería Taller J España <onboarding@resend.dev>';

// ── Builders de URL ────────────────────────────────────────────────────────

/**
 * Construye el `https://wa.me/<digits>?text=<msg>` con el mensaje
 * pre-cargado pidiendo info sobre la obra.
 */
export function buildWhatsAppConsultationUrl(productTitle: string): string {
  const message = `Hola, deseo saber más sobre la obra "${productTitle}"...`;
  return `https://wa.me/${WHATSAPP_PHONE_DIGITS}?text=${encodeURIComponent(message)}`;
}

// ── Validación del payload del form ────────────────────────────────────────

export type ConsultationPayload = {
  productTitle: string;
  visitorName: string;
  visitorEmail: string;
  message: string;
};

export type ValidationResult =
  | {ok: true; data: ConsultationPayload}
  | {ok: false; errors: Record<string, string>};

/**
 * Valida los campos del formulario de consulta. Devuelve un Result
 * tipado que el caller puede consumir sin necesidad de try/catch.
 *
 * Reglas:
 *   - Todos los campos son requeridos.
 *   - `visitorEmail` debe parecer un email (regex laxa, suficiente para
 *     evitar errores honestos).
 *   - `message` se limita a 2000 caracteres para evitar abusos.
 */
export function validateConsultation(form: FormData): ValidationResult {
  const productTitle = (form.get('productTitle') ?? '').toString().trim();
  const visitorName = (form.get('visitorName') ?? '').toString().trim();
  const visitorEmail = (form.get('visitorEmail') ?? '').toString().trim();
  const message = (form.get('message') ?? '').toString().trim();

  const errors: Record<string, string> = {};
  if (!productTitle) errors.productTitle = 'Falta la obra de referencia.';
  if (!visitorName) errors.visitorName = 'Indícanos tu nombre.';
  if (!visitorEmail) errors.visitorEmail = 'Necesitamos un correo de contacto.';
  else if (!isLikelyEmail(visitorEmail)) errors.visitorEmail = 'Correo no válido.';
  if (!message) errors.message = 'Escribe tu consulta.';
  else if (message.length > 2000) errors.message = 'Máximo 2000 caracteres.';

  if (Object.keys(errors).length > 0) return {ok: false, errors};
  return {ok: true, data: {productTitle, visitorName, visitorEmail, message}};
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ── Template del email ─────────────────────────────────────────────────────

/**
 * Genera el HTML del correo enviado al estudio. Sencillo y robusto:
 * estilos inline (los clientes de email no procesan CSS externo) y
 * todo el contenido del visitante pasa por `escapeHtml` para evitar
 * inyección.
 */
export function renderConsultationEmail(payload: ConsultationPayload): string {
  const title = escapeHtml(payload.productTitle);
  const name = escapeHtml(payload.visitorName);
  const email = escapeHtml(payload.visitorEmail);
  // El mensaje conserva saltos de línea como <br />.
  const message = escapeHtml(payload.message).replace(/\n/g, '<br />');

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f6f1ea;font-family:Helvetica,Arial,sans-serif;color:#232327;line-height:1.6;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e3dc;padding:32px;">
      <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c84d92;">
        Consulta nueva
      </p>
      <h1 style="margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;color:#111111;">
        ${title}
      </h1>

      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 0;width:30%;color:rgba(35,35,39,0.62);font-size:13px;">Nombre</td>
          <td style="padding:8px 0;color:#111111;font-size:14px;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(35,35,39,0.62);font-size:13px;">Email</td>
          <td style="padding:8px 0;color:#111111;font-size:14px;">
            <a href="mailto:${email}" style="color:#2f9ea0;text-decoration:none;">${email}</a>
          </td>
        </tr>
      </table>

      <div style="border-top:1px solid #e8e3dc;padding-top:24px;color:#232327;font-size:15px;">
        ${message}
      </div>

      <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e8e3dc;font-size:11px;color:rgba(35,35,39,0.55);">
        Enviado desde el storefront de Galería Taller J España.
      </p>
    </div>
  </body>
</html>`;
}

/**
 * Escapa los 5 caracteres peligrosos para HTML. No usa innerHTML ni
 * librerías; suficiente para emails de texto.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
