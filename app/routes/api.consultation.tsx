/**
 * Endpoint API para las consultas de obra enviadas desde el PDP.
 *
 * Ruta: POST /api/consultation
 *
 * Recibe un FormData con los campos del modal `ProductConsultation`,
 * valida con `validateConsultation`, y delega el envío real a Resend
 * vía `sendResendEmail`. Devuelve JSON consumible por `useFetcher`.
 *
 * Convención de respuesta:
 *   - 200 → {ok: true}                              envío exitoso
 *   - 400 → {ok: false, errors: {<field>: <msg>}}   validación falló
 *   - 500 → {ok: false, error: <msg>}               Resend o config fallaron
 */

import {data} from 'react-router';
import type {Route} from './+types/api.consultation';
import {
  EMAIL_FROM,
  EMAIL_RECIPIENTS,
  renderConsultationEmail,
  validateConsultation,
} from '~/lib/consultation';
import {sendResendEmail} from '~/lib/resend';

export async function action({request, context}: Route.ActionArgs) {
  // Solo aceptamos POST: cualquier otro método responde 405.
  if (request.method !== 'POST') {
    return data({ok: false, error: 'Método no permitido.'}, {status: 405});
  }

  const formData = await request.formData();
  const validation = validateConsultation(formData);
  if (!validation.ok) {
    return data({ok: false, errors: validation.errors}, {status: 400});
  }

  const payload = validation.data;

  const result = await sendResendEmail(context.env.RESEND_API_KEY, {
    from: EMAIL_FROM,
    to: EMAIL_RECIPIENTS.to,
    cc: EMAIL_RECIPIENTS.cc || undefined,
    replyTo: payload.visitorEmail,
    subject: `Consulta sobre la obra: ${payload.productTitle}`,
    html: renderConsultationEmail(payload),
  });

  if (!result.ok) {
    // Logueamos el detalle solo en el servidor; al cliente le devolvemos
    // un mensaje genérico para no exponer información del proveedor.
    console.error('[api.consultation] Resend error:', result.error);
    return data(
      {ok: false, error: 'No pudimos enviar la consulta. Intenta de nuevo.'},
      {status: 500},
    );
  }

  return data({ok: true}, {status: 200});
}

/**
 * GET sobre este endpoint no tiene sentido funcional. Devolvemos 405
 * en lugar de un loader vacío para que sea claro a quien llegue por URL.
 */
export async function loader() {
  return data({ok: false, error: 'Método no permitido.'}, {status: 405});
}
