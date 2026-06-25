/**
 * Anti-spam mínimo para los formularios que disparan email (oferta, contacto,
 * consulta de obra). Dos capas, sin dependencias ni infraestructura:
 *
 *   1. Honeypot: un campo oculto que los humanos nunca ven ni rellenan. Los
 *      bots que completan todos los inputs lo llenan y los descartamos.
 *   2. Rate-limit por IP: tope de envíos por ventana de tiempo.
 *
 * El honeypot es lo que frena el 99% del spam automatizado (los correos de
 * "Fiksifypro", "Abisola Racheal", etc. son bots que rellenan todo).
 */

// Nombre del campo trampa. Suena legítimo para que el bot lo rellene, pero
// está oculto por CSS. Única fuente de verdad: lo usan el form y el server.
export const HONEYPOT_FIELD = 'company_website';

/** true si el honeypot llegó con valor → es un bot. */
export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === 'string' && value.trim().length > 0;
}

/** IP del visitante en Oxygen/Cloudflare, con fallbacks. */
export function getClientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get('CF-Connecting-IP') ||
    h.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    h.get('X-Real-IP') ||
    'unknown'
  );
}

// ponytail: rate-limit en memoria por isolate. Se reinicia en cold start y NO
// se comparte entre isolates de Oxygen; suficiente para cortar ráfagas de spam
// junto al honeypot. Subir a Cloudflare KV/Durable Objects solo si el abuso
// persiste pese a esto.
const hits = new Map<string, number[]>();

/**
 * Registra un intento para `key` y devuelve true si está permitido, false si
 * superó el tope dentro de la ventana.
 */
export function rateLimit(
  key: string,
  {limit, windowMs}: {limit: number; windowMs: number},
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Limpieza perezosa para que el Map no crezca sin tope.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return true;
}

// Límite por defecto para los formularios de email: 5 envíos cada 10 minutos
// por IP. Holgado para un humano, letal para un bot en ráfaga.
export const EMAIL_FORM_LIMIT = {limit: 5, windowMs: 10 * 60 * 1000};
