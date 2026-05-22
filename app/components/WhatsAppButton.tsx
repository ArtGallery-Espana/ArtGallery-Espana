/**
 * Botón flotante de WhatsApp.
 *
 * Se renderiza fijo abajo a la derecha de la ventana en todas las páginas
 * del storefront. Es un `<a>` puro (sin estado ni hooks) para que pueda
 * vivir dentro del shell SSR sin coste de hidratación.
 *
 * El estilo vive en `app/styles/tailwind.css` bajo la sección
 * `=== 6.14 FLOATING WHATSAPP ===`. Editar ahí cualquier ajuste visual.
 */

// El número del estudio: única fuente de verdad para el CTA global.
// Cualquier formato es válido (espacios, símbolos): `buildWhatsAppHref`
// se encarga de normalizarlo antes de construir la URL de wa.me.
const DEFAULT_PHONE = '+593 99 807 3728';
const DEFAULT_LABEL = 'Chatear';
const DEFAULT_ARIA_LABEL = 'Chatear por WhatsApp';

export type WhatsAppButtonProps = {
  /** Número de teléfono visible. Formato libre; se normaliza a dígitos. */
  phone?: string;
  /** Texto que acompaña al ícono. */
  label?: string;
  /** Mensaje pre-cargado opcional que abre con el chat. */
  message?: string;
  /** Etiqueta accesible anunciada por lectores de pantalla. */
  ariaLabel?: string;
};

export function WhatsAppButton({
  phone = DEFAULT_PHONE,
  label = DEFAULT_LABEL,
  message,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: WhatsAppButtonProps = {}) {
  return (
    <a
      aria-label={ariaLabel}
      className="floating-whatsapp"
      href={buildWhatsAppHref(phone, message)}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* La etiqueta va ANTES del ícono en el DOM para que, al expandirse
          el botón hacia la izquierda (está anclado a `right`), el ícono
          quede fijo a la derecha y el texto deslice hacia afuera. */}
      <strong className="floating-whatsapp-label">{label}</strong>
      <span aria-hidden="true" className="floating-whatsapp-icon">
        <WhatsAppIcon />
      </span>
    </a>
  );
}

/**
 * Construye una URL `https://wa.me/<digits>` a partir de un número con
 * cualquier formato y un mensaje pre-cargado opcional.
 */
function buildWhatsAppHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, '');
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function WhatsAppIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.8c.2-.5.5-.5.8-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.8l-.4.5a5.7 5.7 0 0 0 2 2l.5-.4c.2-.2.5-.2.8-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .6-.5.8-.5.2-1.7.3-3.6-.6a9.4 9.4 0 0 1-4.2-4.2c-.9-1.9-.8-3.1-.6-3.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
