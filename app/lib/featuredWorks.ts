/**
 * Modelo de datos y lógica del carrusel de obras destacadas del home.
 *
 * Mantiene en un solo lugar:
 *   - El tipo `CarouselSlide` (forma normalizada que consume el componente).
 *   - `MANUAL_FEATURED_SLIDES`: obras de Jorge España fuera del catálogo
 *     Shopify (esculturas expuestas, etc.) que el equipo puede editar a mano.
 *   - `buildFeaturedSlides()`: combina obras manuales + productos de la tienda
 *     y decide qué se muestra.
 *
 * Es código puro (sin React): se ejecuta en el loader del home, server-side.
 *
 * ── ¿Cómo se decide qué aparece en el carrusel? ──────────────────────────────
 *   1. Obras manuales (`MANUAL_FEATURED_SLIDES`) — siempre primero.
 *   2. Productos de Shopify con el tag `carrusel` (orden: más reciente primero).
 *      → Editable desde Shopify Admin sin tocar código: basta etiquetar la obra.
 *   3. Si ningún producto tiene el tag `carrusel`, se usan los últimos 5
 *      productos agregados como fallback.
 *   El total se limita a `MAX_SLIDES`.
 */

export const MAX_SLIDES = 5;

/**
 * Tags "de control" que NO deben mostrarse como categoría en el overlay
 * (sirven para curar contenido, no describen la obra).
 */
const CONTROL_TAGS = new Set(['carrusel', 'destacado']);

export type CarouselSlide = {
  /** Identificador único y estable (id de Shopify o slug manual). */
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  /** Línea de metadatos (ej. "Escultura · 2024"). Opcional. */
  meta?: string;
  /** Enlace a la ficha de obra. Ausente en obras manuales sin página. */
  href?: string;
  /** Precio para mostrar con <Money>. Ausente en obras manuales. */
  price?: {amount: string; currencyCode: string} | null;
};

/**
 * Obras de Jorge España que NO están en el catálogo Shopify
 * (esculturas expuestas: Colibrí, Personas de Piedra, Halcón, …).
 *
 * Para añadir una:
 *   1. Sube la imagen a `public/images/`.
 *   2. Agrega una entrada aquí con su ruta `/images/...`.
 *
 * Aparecen primero en el carrusel (antes de los productos de la tienda).
 */
export const MANUAL_FEATURED_SLIDES: CarouselSlide[] = [
  // {
  //   id: 'colibri',
  //   title: 'Colibrí',
  //   imageUrl: '/images/colibri.jpg',
  //   imageAlt: 'Escultura Colibrí de Jorge España',
  //   meta: 'Cobre repujado · 2024',
  // },
];

/**
 * Forma mínima de un producto que necesita el carrusel. La definimos aquí
 * (estructural) para no acoplar este módulo al tipo del loader del home.
 */
export type ProductLike = {
  id: string;
  handle: string;
  title: string;
  tags: readonly string[];
  publishedAt?: string | null;
  featuredImage?: {url: string; altText?: string | null} | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
};

/**
 * Combina obras manuales + productos (etiquetados o recientes) en la lista
 * final de slides, limitada a `MAX_SLIDES`.
 *
 * @param tagged Productos con tag `carrusel` (prioridad sobre recientes).
 * @param recent Últimos productos agregados (fallback).
 */
export function buildFeaturedSlides(
  tagged: ProductLike[],
  recent: ProductLike[],
): CarouselSlide[] {
  const source = tagged.length > 0 ? tagged : recent;

  const productSlides = source
    .slice(0, MAX_SLIDES)
    .map(productToSlide)
    .filter((slide): slide is CarouselSlide => slide !== null);

  return [...MANUAL_FEATURED_SLIDES, ...productSlides].slice(0, MAX_SLIDES);
}

/**
 * Normaliza un producto de Shopify a `CarouselSlide`.
 * Devuelve `null` si no tiene imagen (sin imagen no tiene sentido en el carrusel).
 */
function productToSlide(product: ProductLike): CarouselSlide | null {
  const image = product.featuredImage;
  if (!image?.url) return null;

  const year = product.publishedAt
    ? new Date(product.publishedAt).getFullYear().toString()
    : '';
  // Primer tag que no sea de control (evita mostrar "carrusel"/"destacado").
  const primaryTag = product.tags?.find(
    (tag) => !CONTROL_TAGS.has(tag.toLowerCase()),
  );
  const meta = [primaryTag, year].filter(Boolean).join(' · ');

  return {
    id: product.id,
    title: product.title,
    imageUrl: image.url,
    imageAlt: image.altText || product.title,
    meta: meta || undefined,
    href: `/products/${product.handle}`,
    price: product.priceRange?.minVariantPrice ?? null,
  };
}
