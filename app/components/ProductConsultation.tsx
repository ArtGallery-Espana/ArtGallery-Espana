/**
 * Bloque "Comunícate con nosotros" del PDP.
 *
 * Renderiza dos vías de consulta para la obra:
 *   - WhatsApp → enlace directo a wa.me con mensaje pre-cargado.
 *   - Email     → abre un modal con un formulario que se envía vía
 *                 `POST /api/consultation` (Resend en server-side).
 *
 * El componente está organizado en tres piezas internas claramente
 * separadas para mantener el JSX legible:
 *
 *   ProductConsultation  → orquestador: kicker + dos botones
 *   ConsultationModal    → diálogo accesible con el form
 *   ConsultationIcon*    → ícono SVG inline (WhatsApp / Email)
 */

import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useFetcher} from 'react-router';
import {buildWhatsAppConsultationUrl} from '~/lib/consultation';
import {SocialLinks} from '~/components/SocialLinks';
import {HoneypotField} from '~/components/HoneypotField';

type ProductConsultationProps = {
  /** Título de la obra. Se inyecta en los mensajes pre-cargados. */
  productTitle: string;
};

export function ProductConsultation({productTitle}: ProductConsultationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const whatsappUrl = buildWhatsAppConsultationUrl(productTitle);

  const openEmailModal = useCallback(() => setIsModalOpen(true), []);
  const closeEmailModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <section className="mt-6 border-t border-[rgba(35,35,39,.10)] pt-6">
      <p className="mb-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
        Comunícate con nosotros
      </p>

      <div className="grid grid-cols-2 gap-3">
        <a
          aria-label={`Consultar por WhatsApp sobre ${productTitle}`}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[2px] border border-[#C84D92] px-4 text-[11px] uppercase tracking-[0.18em] text-[#C84D92] transition hover:bg-[#C84D92] hover:text-white"
          href={whatsappUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <WhatsAppGlyph />
          WhatsApp
        </a>

        <button
          aria-label={`Consultar por email sobre ${productTitle}`}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[2px] border border-[#232327] px-4 text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:bg-[#232327] hover:text-white"
          onClick={openEmailModal}
          type="button"
        >
          <EmailGlyph />
          Email
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.45)]">
          Síguenos
        </span>
        <SocialLinks />
      </div>

      {isModalOpen ? (
        <ConsultationModal
          onClose={closeEmailModal}
          productTitle={productTitle}
        />
      ) : null}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Modal con el form de consulta
// ────────────────────────────────────────────────────────────────────────────

type ConsultationModalProps = {
  productTitle: string;
  onClose: () => void;
};

type FetcherData = {
  ok: boolean;
  error?: string;
  errors?: Record<string, string>;
};

function ConsultationModal({productTitle, onClose}: ConsultationModalProps) {
  const fetcher = useFetcher<FetcherData>();
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Estados derivados del fetcher: simples, no pasan por useState.
  const isSubmitting = fetcher.state !== 'idle';
  const isSuccess = fetcher.state === 'idle' && fetcher.data?.ok === true;
  const fieldErrors = fetcher.data?.errors ?? {};
  const generalError = fetcher.data && !fetcher.data.ok ? fetcher.data.error : undefined;

  // Foco al primer campo al abrir, bloqueo de scroll y cierre con Escape.
  useEffect(() => {
    firstFieldRef.current?.focus();

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const modal = (
    // Outer = backdrop + scroll container. Cualquier overflow se resuelve
    // aquí; `onClick` cierra al hacer clic fuera del panel.
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(17,17,17,.55)]"
      onClick={onClose}
      role="dialog"
    >
      {/* Wrapper de centrado: `min-h-full` + flex permite centrar verticalmente
          cuando el contenido cabe y, si no, alinea al inicio para que el
          scroll natural muestre todo el panel sin recortar arriba/abajo. */}
      <div className="flex min-h-full items-center justify-center p-4 md:p-8">
        <div
          className="relative w-full max-w-[520px] border border-[rgba(35,35,39,.12)] bg-[#F6F1EA] p-8 md:p-10"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Botón ✕ siempre visible en la esquina del panel. Permite cerrar
              sin tener que llegar al "Cancelar" del final del formulario. */}
          <button
            aria-label="Cerrar"
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center text-[22px] leading-none text-[rgba(35,35,39,.55)] transition hover:text-[#232327]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>

          <header className="mb-6 pr-8">
            <p className="mb-2 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[#C84D92]">
              Consulta
            </p>
            <h2
              id={titleId}
              className="[font-family:var(--serif)] text-[clamp(1.6rem,2.4vw,2rem)] leading-[1.1] text-[#111111]"
            >
              Sobre {productTitle}
            </h2>
          </header>

        {isSuccess ? (
          <SuccessState onClose={onClose} />
        ) : (
          <fetcher.Form
            action="/api/consultation"
            className="space-y-4"
            method="post"
          >
            <input name="productTitle" type="hidden" value={productTitle} />
            <HoneypotField />

            <Field
              error={fieldErrors.visitorName}
              label="Tu nombre"
              name="visitorName"
              ref={firstFieldRef}
              required
            />
            <Field
              error={fieldErrors.visitorEmail}
              label="Tu email"
              name="visitorEmail"
              required
              type="email"
            />
            <Field
              defaultValue={`Hola, deseo saber más sobre la obra "${productTitle}".`}
              error={fieldErrors.message}
              label="Mensaje"
              multiline
              name="message"
              required
              rows={5}
            />

            {generalError ? (
              <p
                aria-live="polite"
                className="border border-[rgba(200,77,146,.35)] bg-[rgba(200,77,146,.06)] p-3 text-[12px] text-[#C84D92]"
              >
                {generalError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)] transition hover:text-[#232327]"
                onClick={onClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="inline-flex h-[48px] items-center justify-center rounded-[2px] bg-[#111111] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6F1EA] transition hover:bg-[#C84D92] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Enviando…' : 'Enviar consulta'}
              </button>
            </div>
          </fetcher.Form>
        )}
        </div>
      </div>
    </div>
  );

  // Renderizamos en un portal a <body> para que `position: fixed` sea
  // relativo al viewport y NO al sidebar del PDP (que tiene `backdrop-blur`
  // → crea containing block y atraparía el modal al hacer scroll).
  // `isModalOpen` solo es true tras un click en cliente, así que `document`
  // siempre existe aquí; el guard es defensivo para SSR.
  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

// ────────────────────────────────────────────────────────────────────────────
// Estado de éxito + Field genérico
// ────────────────────────────────────────────────────────────────────────────

function SuccessState({onClose}: {onClose: () => void}) {
  return (
    <div className="space-y-5 text-center">
      <p className="[font-family:var(--serif)] text-[1.6rem] leading-[1.2] text-[#111111]">
        Consulta enviada.
      </p>
      <p className="text-[14px] leading-[1.6] text-[rgba(35,35,39,.62)]">
        El estudio recibirá tu mensaje y responderá al correo que indicaste.
      </p>
      <button
        className="inline-flex h-[48px] items-center justify-center rounded-[2px] bg-[#C84D92] px-6 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-[#A23A76]"
        onClick={onClose}
        type="button"
      >
        Cerrar
      </button>
    </div>
  );
}

type FieldProps = {
  defaultValue?: string;
  error?: string;
  label: string;
  multiline?: boolean;
  name: string;
  required?: boolean;
  rows?: number;
  type?: string;
};

/**
 * Campo de formulario con label, control y mensaje de error. Soporta
 * <input> y <textarea> a través de la prop `multiline`. Usa `forwardRef`
 * solo para que `firstFieldRef` pueda enfocar el primer campo al abrir
 * el modal — el resto de campos no necesita ref.
 */
const Field = function Field({
  defaultValue,
  error,
  label,
  multiline,
  name,
  required,
  rows = 4,
  type = 'text',
  ref,
}: FieldProps & {ref?: React.Ref<HTMLInputElement>}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  const baseClass =
    'w-full border border-[rgba(35,35,39,.18)] bg-white px-3.5 py-2.5 text-[14px] text-[#232327] transition focus:border-[#C84D92] focus:outline focus:outline-2 focus:outline-[rgba(200,77,146,.16)]';

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-1.5 block [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.62)]">
        {label}
        {required ? <span aria-hidden="true"> · *</span> : null}
      </span>

      {multiline ? (
        <textarea
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={`${baseClass} resize-vertical`}
          defaultValue={defaultValue}
          id={fieldId}
          name={name}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={baseClass}
          defaultValue={defaultValue}
          id={fieldId}
          name={name}
          ref={ref}
          required={required}
          type={type}
        />
      )}

      {error ? (
        <span
          className="mt-1.5 block text-[12px] text-[#C84D92]"
          id={errorId}
        >
          {error}
        </span>
      ) : null}
    </label>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Íconos
// ────────────────────────────────────────────────────────────────────────────

function WhatsAppGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
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

function EmailGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="5"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
