/**
 * Carrusel full-bleed de obras destacadas (cabecera del home).
 *
 * Características:
 *   - Deslizamiento HORIZONTAL entre slides (la pista se traslada en X).
 *   - Loop infinito sin "rebobinar": se añade un clon de la primera slide al
 *     final; al llegar a él, se salta de vuelta a la real sin animar.
 *   - Autoplay cada 5s; se pausa al pasar el mouse y se limpia en el cleanup.
 *   - Cada slide es un enlace a su ficha de obra (click en cualquier parte).
 *   - Dots de navegación manual (fuera del enlace, superpuestos).
 *   - Respeta `prefers-reduced-motion`: sin autoplay ni transición.
 *
 * Estructura no monolítica: el orquestador maneja índice/timer/loop; la vista
 * de slide y los dots son subcomponentes. Los datos llegan normalizados como
 * `CarouselSlide[]` desde `app/lib/featuredWorks.ts`.
 *
 * Referencia visual: ineditad.com (obra protagonista a sangre + overlay
 * editorial).
 */

import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {CarouselSlide} from '~/lib/featuredWorks';

const AUTOPLAY_MS = 5_000;
const SLIDE_MS = 800;

export function FeaturedWorksCarousel({slides}: {slides: CarouselSlide[]}) {
  const count = slides.length;
  const prefersReduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  // `index` recorre 0..count. La posición `count` es un CLON de la primera
  // slide; alcanzarla y saltar a 0 (sin animar) crea el loop infinito.
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  const next = useCallback(() => setIndex((i) => i + 1), []);

  const goTo = useCallback((target: number) => {
    setAnimate(true);
    setIndex(target);
  }, []);

  // ── Autoplay (5s) ────────────────────────────────────────────────────────
  useEffect(() => {
    if (count <= 1 || paused || prefersReduced) return;
    const intervalId = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(intervalId);
  }, [count, paused, prefersReduced, next]);

  // ── Loop infinito ──────────────────────────────────────────────────────────
  // Al terminar la transición hacia el clon, salta instantáneamente (sin
  // animar) a la slide real 0.
  const handleTransitionEnd = useCallback(() => {
    if (index === count) {
      setAnimate(false);
      setIndex(0);
    }
  }, [index, count]);

  // Reactiva la transición en el frame siguiente al salto instantáneo.
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  if (count === 0) return null;

  // Pista = slides reales + clon de la primera al final.
  const track = [...slides, slides[0]];
  const activeDot = index === count ? 0 : index;

  return (
    <section
      aria-label="Obras destacadas"
      aria-roledescription="carrusel"
      // Márgenes negativos = al margen de `main.site-main` (0.75rem / 1rem en
      // md) para romper el contenedor y llegar a los bordes del viewport.
      className="relative -mx-3 -mt-3 h-[68vh] min-h-[460px] overflow-hidden bg-[#0d0d0d] sm:h-[78vh] md:-mx-4 md:-mt-4 lg:h-[86vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition:
            animate && !prefersReduced
              ? `transform ${SLIDE_MS}ms cubic-bezier(0.7, 0, 0.2, 1)`
              : 'none',
        }}
      >
        {track.map((slide, i) => (
          <CarouselSlideView eager={i === 0} key={`${slide.id}-${i}`} slide={slide} />
        ))}
      </div>

      {count > 1 ? (
        <CarouselDots active={activeDot} count={count} onSelect={goTo} />
      ) : null}
    </section>
  );
}

// ─── Slide individual (enlace a la ficha de obra) ─────────────────────────────

type CarouselSlideViewProps = {
  slide: CarouselSlide;
  /** Carga ansiosa solo la primera (visible al montar); el resto, lazy. */
  eager: boolean;
};

function CarouselSlideView({slide, eager}: CarouselSlideViewProps) {
  const inner = (
    <>
      {/* object-contain: muestra la obra completa (sin recortar). Las fotos
          tienen fondo negro, que se funde con el fondo oscuro del escenario. */}
      <img
        alt={slide.imageAlt}
        className="h-full w-full object-contain"
        loading={eager ? 'eager' : 'lazy'}
        sizes="100vw"
        src={slide.imageUrl}
      />

      {/* Velo inferior para legibilidad del overlay. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(13,13,13,.82)] via-[rgba(13,13,13,.16)] to-[rgba(13,13,13,.04)]" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16">
        <div className="mx-auto max-w-[1440px]">
          {slide.meta ? (
            <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(246,241,234,.72)]">
              {slide.meta}
            </span>
          ) : null}
          <h2 className="mt-3 max-w-[18ch] [font-family:var(--serif)] text-[clamp(2.4rem,6vw,5rem)] leading-[0.98] text-[#F6F1EA]">
            {slide.title}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {slide.price ? (
              <span className="[font-family:var(--mono)] text-[14px] tracking-[0.04em] text-[rgba(246,241,234,.9)]">
                {/* currencyCode se normaliza como string; Money espera el enum
                    CurrencyCode de MoneyV2 — cast seguro (mismo valor). */}
                <Money data={slide.price as MoneyV2} />
              </span>
            ) : null}
            {/* Pista visual (no es un <Link> anidado: toda la slide ya enlaza). */}
            <span className="inline-flex items-center gap-2 border-b border-[rgba(246,241,234,.5)] pb-1 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#F6F1EA] transition group-hover:border-[#2F9EA0] group-hover:text-[#2F9EA0]">
              Ver obra →
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const baseClass = 'group relative h-full w-full shrink-0';

  // Con ficha → toda la slide enlaza; sin ficha (obra manual) → div estático.
  return slide.href ? (
    <Link aria-label={`Ver ${slide.title}`} className={`${baseClass} block`} to={slide.href}>
      {inner}
    </Link>
  ) : (
    <div className={baseClass}>{inner}</div>
  );
}

// ─── Dots de navegación ──────────────────────────────────────────────────────

type CarouselDotsProps = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
};

function CarouselDots({count, active, onSelect}: CarouselDotsProps) {
  return (
    <div
      aria-label="Navegación del carrusel"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 md:bottom-10"
      role="tablist"
    >
      {Array.from({length: count}).map((_, index) => {
        const isActive = index === active;
        return (
          <button
            aria-current={isActive}
            aria-label={`Ir a la obra ${index + 1} de ${count}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              isActive ? 'w-8 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
            }`}
            key={index}
            onClick={() => onSelect(index)}
            type="button"
          />
        );
      })}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Suscripción a `prefers-reduced-motion`. Inicializa en `false` (SSR-safe) y
 * sincroniza en cliente, reaccionando si el usuario cambia la preferencia.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}
