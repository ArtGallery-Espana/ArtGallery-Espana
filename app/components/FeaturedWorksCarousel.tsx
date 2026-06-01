/**
 * Carrusel full-bleed de obras monumentales (cabecera del home).
 *
 * Características:
 *   - Loop infinito BIDIRECCIONAL: clon del último al inicio y clon del
 *     primero al final; al llegar a cada extremo se salta al real sin animar.
 *   - Autoplay cada 3s; se pausa al pasar el cursor (escritorio).
 *   - Flechas ← / → para navegación manual en escritorio y móvil.
 *   - Swipe horizontal táctil: umbral de 50px para reconocer el gesto.
 *   - Dots de posición (abajo centrados).
 *   - Fondo Piedra (#EEE8E1) con gradiente marfil en el overlay,
 *     coherente con la paleta del sitio.
 *   - Respeta `prefers-reduced-motion`: sin autoplay ni transición CSS.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import type {CarouselSlide} from '~/lib/featuredWorks';

const AUTOPLAY_MS = 3_000;
const SLIDE_MS = 750;
// Desplazamiento mínimo (px) para reconocer un swipe como intencional
const SWIPE_THRESHOLD = 50;

export function FeaturedWorksCarousel({slides}: {slides: CarouselSlide[]}) {
  const count = slides.length;
  const prefersReduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  // La pista tiene un clon del ÚLTIMO slide al inicio (índice 0) y un clon
  // del PRIMERO al final (índice count+1). Las slides reales ocupan 1..count.
  // Arrancamos en índice 1 (primera slide real visible).
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);

  // Referencia al X del toque inicial para detectar swipe
  const touchStartX = useRef<number | null>(null);

  // ── Navegación ───────────────────────────────────────────────────────────
  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => i + 1);
  }, []);

  const prev = useCallback(() => {
    setAnimate(true);
    setIndex((i) => i - 1);
  }, []);

  // goTo recibe el índice real (0-based) y lo ajusta al índice en la pista
  const goTo = useCallback((target: number) => {
    setAnimate(true);
    setIndex(target + 1);
  }, []);

  // ── Autoplay (pausa en hover) ────────────────────────────────────────────
  useEffect(() => {
    if (count <= 1 || paused || prefersReduced) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused, prefersReduced, next]);

  // ── Loop infinito bidireccional ───────────────────────────────────────────
  // Al terminar la transición en un extremo (clon), se salta al real opuesto
  // sin animar; el siguiente frame reactiva la animación.
  const handleTransitionEnd = useCallback(() => {
    if (index === count + 1) {
      // Clon del primero al final → salta a la slide real 1
      setAnimate(false);
      setIndex(1);
    } else if (index === 0) {
      // Clon del último al inicio → salta a la slide real count
      setAnimate(false);
      setIndex(count);
    }
  }, [index, count]);

  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // ── Swipe táctil ──────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  if (count === 0) return null;

  // Pista: [clon_último, slide_0…slide_{n-1}, clon_primero]
  const track = [slides[count - 1], ...slides, slides[0]];

  // Dot activo en rango 0..count-1
  const activeDot =
    index === 0 ? count - 1 : index === count + 1 ? 0 : index - 1;

  return (
    <section
      aria-label="Obras monumentales — carrusel"
      aria-roledescription="carrusel"
      // Márgenes negativos rompen el contenedor para llegar al borde del viewport
      className="relative -mx-3 -mt-3 h-[68vh] min-h-[460px] overflow-hidden bg-[#EEE8E1] sm:h-[78vh] md:-mx-4 md:-mt-4 lg:h-[86vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      {/* ── Pista de slides ─────────────────────────────────────────────── */}
      <div
        className="flex h-full"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition:
            animate && !prefersReduced
              ? `transform ${SLIDE_MS}ms cubic-bezier(0.77, 0, 0.175, 1)`
              : 'none',
        }}
      >
        {track.map((slide, i) => (
          // El clon del primero (i === 1) se carga ansiosamente; el resto, lazy
          <CarouselSlideView eager={i === 1} key={`${slide.id}-${i}`} slide={slide} />
        ))}
      </div>

      {/* ── Dots de posición ────────────────────────────────────────────── */}
      {count > 1 ? (
        <CarouselDots active={activeDot} count={count} onSelect={goTo} />
      ) : null}
    </section>
  );
}

// ─── Slide individual ─────────────────────────────────────────────────────────

type CarouselSlideViewProps = {
  slide: CarouselSlide;
  /** Carga ansiosa solo la primera slide visible al montar; el resto, lazy. */
  eager: boolean;
};

function CarouselSlideView({slide, eager}: CarouselSlideViewProps) {
  const inner = (
    <>
      {/* imageFit controla el recorte: 'cover' (defecto) llena el viewport;
          'contain' muestra la obra completa con fondo Piedra en los laterales */}
      <img
        alt={slide.imageAlt}
        className="h-full w-full"
        loading={eager ? 'eager' : 'lazy'}
        sizes="100vw"
        src={slide.imageUrl}
        style={{objectFit: slide.imageFit ?? 'cover'}}
      />

      {/* Velo sutil desde abajo — solo lo necesario para leer el título */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(246,241,234,.55)] via-[rgba(246,241,234,.08)] to-transparent" />

      {/* Título y metadatos superpuestos en la parte inferior */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16">
        <div className="mx-auto max-w-[1440px]">
          {slide.meta ? (
            <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.65)]">
              {slide.meta}
            </span>
          ) : null}
          <h2 className="mt-3 max-w-[18ch] [font-family:var(--serif)] text-[clamp(2.4rem,6vw,5rem)] leading-[0.98] text-[#111111]">
            {slide.title}
          </h2>
        </div>
      </div>
    </>
  );

  const baseClass = 'group relative h-full w-full shrink-0';

  // Con href → toda la slide es un enlace; sin href (obras manuales) → div estático
  return slide.href ? (
    <Link
      aria-label={`Ver ${slide.title}`}
      className={`${baseClass} block`}
      to={slide.href}
    >
      {inner}
    </Link>
  ) : (
    <div className={baseClass}>{inner}</div>
  );
}

// ─── Dots de posición ─────────────────────────────────────────────────────────

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
      {Array.from({length: count}).map((_, dotIndex) => {
        const isActive = dotIndex === active;
        return (
          // El <button> garantiza área táctil de 44px; el <span> es el punto visual
          <button
            aria-current={isActive}
            aria-label={`Ir a la obra ${dotIndex + 1} de ${count}`}
            className="flex h-11 items-center justify-center px-1"
            key={dotIndex}
            onClick={() => onSelect(dotIndex)}
            type="button"
          >
            <span
              className={`block h-[3px] rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-8 bg-[#C84D92]'
                  : 'w-2 bg-[rgba(35,35,39,.28)] hover:bg-[rgba(35,35,39,.55)]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Hook: prefers-reduced-motion ────────────────────────────────────────────

/**
 * Suscripción a `prefers-reduced-motion`. Inicializa en `false` (SSR-safe)
 * y se sincroniza en cliente, reaccionando si el usuario cambia la preferencia.
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
