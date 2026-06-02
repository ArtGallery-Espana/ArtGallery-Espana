/**
 * Enlaces a las redes sociales de la galería.
 *
 * Las URLs viven centralizadas en `SOCIAL_LINKS` para tener una única
 * fuente de verdad: si mañana cambian, se editan aquí y se reflejan en
 * todos los lugares que usen este componente (ficha de obra, footer, etc.).
 *
 * Render: íconos circulares con borde fino que cambian a turquesa en hover,
 * en línea con el lenguaje visual del PDP.
 */

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/1DnoWXnotP/?mibextid=wwXIfr',
  instagram:
    'https://www.instagram.com/galeria_taller__jorge_espana?igsh=MTZ4dnB5NWp1dmZiNA==',
} as const;

type SocialLinksProps = {
  /** Clases extra para el contenedor (ej. alineación/espaciado). */
  className?: string;
};

export function SocialLinks({className = ''}: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <SocialIcon href={SOCIAL_LINKS.facebook} label="Facebook">
        <FacebookGlyph />
      </SocialIcon>
      <SocialIcon href={SOCIAL_LINKS.instagram} label="Instagram">
        <InstagramGlyph />
      </SocialIcon>
    </div>
  );
}

/** Botón-enlace circular reutilizable para cada red. */
function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,255,255,.35)] text-[rgba(255,255,255,.80)] transition hover:border-[#2F9EA0] hover:text-[#2F9EA0]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

// ── Íconos de marca ─────────────────────────────────────────────────────────

function FacebookGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="18"
        rx="5"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="3"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="1.1" />
    </svg>
  );
}
