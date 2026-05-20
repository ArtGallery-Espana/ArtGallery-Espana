/**
 * Orquestador de animaciones de entrada al hacer scroll.
 *
 * Se monta UNA sola vez (en PageLayout) y observa todos los elementos
 * marcados con `data-reveal`. Cuando un elemento entra al viewport recibe
 * la clase `.is-revealed` (fade + slide up); cuando sale, se le quita.
 * Gracias a ese toggle la animación ocurre tanto al BAJAR como al SUBIR.
 *
 * Decisiones clave:
 *   - `useIsomorphicLayoutEffect`: en cliente aplica la clase base `.reveal`
 *     ANTES del primer paint, evitando el parpadeo del contenido visible.
 *   - Sin JavaScript el contenido nunca recibe `.reveal`, así que se ve
 *     normal (no se rompe SSR ni accesibilidad).
 *   - Respeta `prefers-reduced-motion`: revela todo sin animar.
 *   - Re-escanea en cada cambio de ruta (`pathname`) porque React Router
 *     monta nodos nuevos en la navegación cliente.
 *
 * Uso: añadir `data-reveal` a cualquier elemento que deba animarse.
 * El estilo vive en `app/styles/tailwind.css` (sección "SCROLL REVEAL").
 */

import {useEffect, useLayoutEffect} from 'react';
import {useLocation} from 'react-router';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollReveal() {
  const {pathname} = useLocation();

  useIsomorphicLayoutEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    if (elements.length === 0) return;

    // Estado oculto base, aplicado antes del paint.
    for (const el of elements) el.classList.add('reveal');

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) {
      for (const el of elements) el.classList.add('is-revealed');
      return;
    }

    // `rootMargin` recorta el 18% inferior del viewport: el elemento debe
    // subir hasta ese punto antes de revelarse, así la animación ocurre
    // dentro del área visible y se aprecia bien. Toggle según intersección
    // = anima en ambos sentidos del scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        }
      },
      {rootMargin: '0px 0px -18% 0px', threshold: 0},
    );

    for (const el of elements) observer.observe(el);

    return () => {
      observer.disconnect();
      // Reset para que un re-escaneo (cambio de ruta) parta limpio.
      for (const el of elements) {
        el.classList.remove('reveal', 'is-revealed');
      }
    };
  }, [pathname]);

  return null;
}
