import {useState, type ReactNode} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {MockShopNotice} from '~/components/MockShopNotice';
import {FeaturedWorksCarousel} from '~/components/FeaturedWorksCarousel';
import {MANUAL_FEATURED_SLIDES} from '~/lib/featuredWorks';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Galería J. España | Inicio'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {storefront, env} = context;

  // Solo consultamos los productos recientes para la sección del catálogo.
  // Las obras monumentales (carrusel y vitrina) son datos estáticos.
  const {recentProducts} = await storefront.query(HOMEPAGE_PRODUCTS_QUERY);

  return {
    isShopLinked: Boolean(env.PUBLIC_STORE_DOMAIN),
    recentWorks: recentProducts.nodes.slice(0, 3),
    // Slides del carrusel: obras monumentales estáticas (featuredWorks.ts)
    carouselSlides: MANUAL_FEATURED_SLIDES,
  };
}

export default function Homepage() {
  const {isShopLinked, recentWorks, carouselSlides} =
    useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">
      {isShopLinked ? null : <MockShopNotice />}

      {/* Carrusel full-bleed: obras monumentales (La Familia, Los Estudiantes, Allcamari) */}
      {carouselSlides.length > 0 ? (
        <FeaturedWorksCarousel slides={carouselSlides} />
      ) : null}

      {/* Vitrina de obras monumentales con navegación por flechas */}
      <MonumentalShowcase />

      {/* Productos publicados en el catálogo Shopify */}
      <section className="px-6 pt-24 md:px-10 xl:px-14 xl:pt-[160px]" data-reveal>
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            num="Productos Publicados"
            title="Últimos productos publicados"
            desc="Descubre las piezas más recientes incorporadas a nuestro catálogo. Arte contemporáneo con alma artesanal."
          />

          <div className="grid gap-12 lg:grid-cols-3">
            {recentWorks.map((product: HomepageProduct) => (
              <Link
                key={product.id}
                className="block"
                to={getProductPath(product.handle)}
              >
                <ArtworkProduct product={product} ratio="4 / 5" />
                <div className="pt-[18px]">
                  <div className="[font-family:var(--serif)] text-[24px] leading-[1.15] text-[#111111]">
                    {product.title}{' '}
                    <em className="italic text-[rgba(35,35,39,.72)]">
                      · {getPublishedYear(product.publishedAt)}
                    </em>
                  </div>
                  <p className="mt-3 line-clamp-3 max-w-[42ch] text-[14px] leading-[1.65] text-[rgba(35,35,39,.72)]">
                    {getProductDescription(product) ||
                      'Sin descripción disponible.'}
                  </p>
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
                      {getPrimaryTag(product.tags)}
                    </span>
                    <span className="text-[13px] text-[#232327]">
                      {/* MoneyV2.currencyCode es un enum; el valor del API siempre es ISO válido */}
                      <Money data={product.priceRange.minVariantPrice as any} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 flex justify-center xl:mt-20">
            <Link
              className="home-cta-outline inline-flex h-12 items-center justify-center rounded-[2px] border border-[#232327] px-6 text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:border-[#C84D92] hover:!text-[#C84D92] hover:no-underline"
              to="/collections/all"
            >
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Sección del taller en Cuenca */}
      <section
        className="px-6 pt-28 md:px-10 xl:px-14 xl:pt-[200px]"
        data-reveal
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-14 xl:grid-cols-[1fr_1.35fr] xl:gap-24">
            <div>
              <Kicker>Nuestro taller</Kicker>
              <h2 className="mt-4 [font-family:var(--serif)] text-[clamp(3rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.015em] text-[#111111]">
                Un espacio íntimo en Cuenca donde la obra se piensa, se prueba
                y toma forma con calma.
              </h2>
              <p className="mt-7 max-w-[42ch] text-[15px] leading-[1.7] text-[rgba(35,35,39,.72)]">
                Entre herramientas, pigmentos y maquetas, el taller reúne las
                piezas en proceso, la obra terminada y la conversación que da
                sentido a cada serie.
              </p>
              <div className="mt-9">
                <Link
                  className="home-cta-link inline-flex items-center border-b border-[#232327] pb-1 text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:border-[#C84D92] hover:!text-[#C84D92] hover:no-underline"
                  to="/pages/artista"
                >
                  Conocer al artista →
                </Link>
              </div>
            </div>

            <div className="grid gap-8">
              <figure className="group">
                <div
                  className="relative overflow-hidden bg-[#EEE8E1]"
                  style={{aspectRatio: '16 / 9'}}
                >
                  <img
                    alt="Vista del taller en Cuenca"
                    className="h-full w-full object-cover"
                    src="/images/taller-cuenca.jpeg"
                  />
                  <div className="pointer-events-none absolute inset-0 border border-[rgba(35,35,39,.06)]" />
                  <div className="absolute left-3.5 top-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.72)]">
                    Nuestro taller · Cuenca
                  </div>
                  <div className="absolute bottom-3.5 right-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] tracking-[0.12em] text-[rgba(35,35,39,.72)]">
                    ATELIER
                  </div>
                </div>
                <figcaption className="mt-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                  Vista del taller en Cuenca
                </figcaption>
              </figure>

              {/* Ubicación del taller */}
              <div className="border-t border-[rgba(35,35,39,.10)] pt-6">
                <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                  Ubicación
                </div>
                <div className="mt-2 [font-family:var(--serif)] text-[20px] leading-[1.25] text-[#111111]">
                  Cuenca, Ecuador
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Vitrina de obras monumentales ──────────────────────────────────────────

/**
 * Datos estáticos de las tres obras monumentales principales de Jorge España.
 * No están en el catálogo Shopify: se gestionan directamente aquí.
 * Para agregar otra obra, añade una entrada a este arreglo y sube la imagen
 * a `public/images/`.
 */
const MONUMENTAL_WORKS = [
  {
    id: 'la-familia',
    title: 'La Familia',
    meta: 'Asamblea Nacional del Ecuador · 2008',
    description:
      'Obra realizada en 2008, inspirada en el concepto del Sumak Kawsay o Buen Vivir, donde la familia se presenta como símbolo de equilibrio, comunidad y convivencia.',
    dimensions: '250 cm alto × 400 cm largo',
    imageUrl: '/images/obra-la-familia.jpeg',
    imageAlt:
      'La Familia — obra monumental de Jorge España, Asamblea Nacional del Ecuador',
  },
  {
    id: 'los-estudiantes',
    title: 'Los Estudiantes',
    meta: 'Universidad de Cuenca',
    description:
      'Conjunto escultórico realizado para los patios de la Facultad de Economía, concebido como una representación de la vida cotidiana de los estudiantes. La obra está compuesta por cinco piezas, entre ellas dos figuras de monjas, en referencia al pasado histórico del lugar.',
    dimensions: '195 cm alto × 60 cm ancho',
    imageUrl: '/images/obra-los-estudiantes.jpg',
    imageAlt:
      'Los Estudiantes — conjunto escultórico monumental, Universidad de Cuenca',
  },
  {
    id: 'allcamari',
    title: 'Allcamari',
    meta: 'Edificio Allcamari',
    description:
      'Escultura inspirada en un ave emblemática de la cordillera de los Andes ecuatorianos y peruanos. Instalada en la entrada del edificio que lleva el mismo nombre, estableciendo un vínculo simbólico entre el espacio y la identidad andina.',
    dimensions: '180 cm alto, ancho proporcional',
    imageUrl: '/images/obra-allcamari.jpg',
    imageAlt: 'Allcamari — escultura monumental inspirada en el cóndor andino',
  },
];

/**
 * Muestra las obras monumentales con navegación manual por flechas.
 * Componente cliente (usa useState); SSR renderiza la primera obra.
 */
function MonumentalShowcase() {
  const [current, setCurrent] = useState(0);
  const total = MONUMENTAL_WORKS.length;
  const work = MONUMENTAL_WORKS[current];

  const prev = () => setCurrent((i) => (i - 1 + total) % total);
  const next = () => setCurrent((i) => (i + 1) % total);

  return (
    <section className="px-6 pb-16 pt-8 md:px-10 xl:px-14 xl:pb-20 xl:pt-12">
      <div className="mx-auto max-w-360">
        <div className="grid items-center gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-24">
          {/* Columna de texto */}
          <div>
            <Kicker accent="mag">Obras Monumentales</Kicker>
            <h1 className="mt-10 [font-family:var(--serif)] text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.98] tracking-[-0.015em] text-[#111111]">
              {work.title}
            </h1>
            <p className="mb-9 mt-9 max-w-[44ch] text-[17px] leading-[1.7] text-[rgba(35,35,39,.72)]">
              {work.description}
            </p>
            <div className="mb-10 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
              {work.meta}
              <span className="mx-3 text-[#D9D4CF]">·</span>
              {work.dimensions}
            </div>

            {/* Flechas de navegación entre obras monumentales */}
            <div className="mb-14 flex items-center gap-5">
              <button
                type="button"
                aria-label="Obra anterior"
                onClick={prev}
                className="flex h-11 w-11 items-center justify-center border border-[rgba(35,35,39,.18)] text-[#232327] transition-colors hover:border-[#C84D92] hover:text-[#C84D92]"
              >
                ←
              </button>
              <span className="[font-family:var(--mono)] text-[12px] tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                {current + 1} / {total}
              </span>
              <button
                type="button"
                aria-label="Obra siguiente"
                onClick={next}
                className="flex h-11 w-11 items-center justify-center border border-[rgba(35,35,39,.18)] text-[#232327] transition-colors hover:border-[#C84D92] hover:text-[#C84D92]"
              >
                →
              </button>
            </div>

            <Link
              className="home-cta-primary inline-flex h-12 items-center justify-center rounded-[2px] bg-[#0F0F12] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#A23A76] hover:text-white hover:no-underline"
              to="/collections/all"
            >
              Ver catálogo
            </Link>
          </div>

          {/* Columna de imagen */}
          <div className="relative mx-auto w-full max-w-[620px] xl:mx-0">
            <div
              className="relative overflow-hidden bg-[#EEE8E1]"
              style={{aspectRatio: '4 / 5'}}
            >
              <img
                alt={work.imageAlt}
                className="h-full w-full object-cover"
                src={work.imageUrl}
              />
              <div className="pointer-events-none absolute inset-0 border border-[rgba(35,35,39,.06)]" />
              <div className="absolute left-3.5 top-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.72)]">
                {work.title}
              </div>
            </div>

            {/* Tarjeta de información de la obra */}
            <div className="mt-6 border border-[rgba(35,35,39,.10)] bg-[#F6F1EA] p-6 xl:absolute xl:-bottom-6 xl:-right-6 xl:mt-0 xl:max-w-[280px]">
              <div className="mb-2.5 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[#C84D92]">
                Obra monumental
              </div>
              <div className="mb-1.5 [font-family:var(--serif)] text-[22px] leading-[1.15] text-[#111111]">
                {work.title}
              </div>
              <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
                {work.meta}
              </div>
              <div className="mt-1 [font-family:var(--mono)] text-[10px] tracking-[0.12em] text-[rgba(35,35,39,.45)]">
                {work.dimensions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Componentes de presentación ──────────────────────────────────────────────

function Kicker({
  children,
  accent,
}: {
  children: ReactNode;
  accent?: 'mag' | 'turq';
}) {
  const accentColor =
    accent === 'mag' || accent === 'turq' ? '#C84D92' : 'rgba(35,35,39,.5)';

  return (
    <div className="flex items-center gap-3.5 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
      <span
        className="h-px w-6 shrink-0"
        style={{backgroundColor: accentColor}}
      />
      <span>{children}</span>
    </div>
  );
}

function SectionHead({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-16 grid gap-8 border-b border-[#232327] pb-9 xl:grid-cols-[1fr_2fr] xl:items-end xl:gap-12">
      <div>
        <div className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
          {num}
        </div>
        <h2 className="mt-3 [font-family:var(--serif)] text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.015em] text-[#111111]">
          {title}
        </h2>
      </div>
      <div className="max-w-[46ch] text-[14px] leading-[1.65] text-[rgba(35,35,39,.72)]">
        {desc}
      </div>
    </div>
  );
}

function ArtworkProduct({
  product,
  ratio,
}: {
  product: HomepageProduct | null;
  ratio: string;
}) {
  if (!product?.featuredImage) {
    return (
      <ArtworkPlaceholder
        tone="tone-3"
        label={product?.title ?? 'Obra'}
        code={product?.handle ?? 'SIN-IMAGEN'}
        ratio={ratio}
      />
    );
  }

  return (
    <figure className="group">
      <div
        className="relative overflow-hidden bg-[#EEE8E1]"
        style={{aspectRatio: ratio}}
      >
        <Image
          alt={product.featuredImage.altText || product.title}
          className="h-full w-full object-cover"
          data={product.featuredImage}
          sizes="(min-width: 1280px) 620px, 100vw"
        />
        <div className="pointer-events-none absolute inset-0 border border-[rgba(35,35,39,.06)]" />
        <div className="absolute left-3.5 top-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.72)]">
          {product.title}
        </div>
        <div className="absolute bottom-3.5 right-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] tracking-[0.12em] text-[rgba(35,35,39,.72)]">
          {getPrimaryTag(product.tags)}
        </div>
      </div>
    </figure>
  );
}

function ArtworkPlaceholder({
  tone,
  label,
  code,
  ratio,
  caption,
}: {
  tone:
    | 'tone-1'
    | 'tone-2'
    | 'tone-3'
    | 'tone-4'
    | 'tone-mist'
    | 'tone-stone'
    | 'tone-lav'
    | 'tone-warm';
  label: string;
  code: string;
  ratio: string;
  caption?: string;
}) {
  const tones: Record<string, string> = {
    'tone-1': '#EFE7DD',
    'tone-2': '#E7DFD3',
    'tone-3': '#E1D5C6',
    'tone-4': '#DCD0BF',
    'tone-mist': '#D9D4CF',
    'tone-stone': '#EEE8E1',
    'tone-lav': '#E5DCEC',
    'tone-warm': '#EAD8C8',
  };

  return (
    <figure className="group">
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: ratio,
          backgroundColor: tones[tone],
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(35,35,39,.04) 0 1px, transparent 1px 8px)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 border border-[rgba(35,35,39,.06)]" />
        <div className="absolute left-3.5 top-3.5 [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
          {label}
        </div>
        <div className="absolute bottom-3.5 right-3.5 [font-family:var(--mono)] text-[9.5px] tracking-[0.12em] text-[rgba(35,35,39,.55)]">
          {code}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-[13px] text-[rgba(35,35,39,.72)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function getProductPath(handle: string) {
  return `/products/${handle}`;
}

function getPublishedYear(publishedAt?: string | null) {
  if (!publishedAt) return '—';
  return new Date(publishedAt).getFullYear().toString();
}

function getPrimaryTag(tags?: readonly string[] | null) {
  if (!tags?.length) return 'catálogo';
  return tags[0];
}

function getProductDescription(product?: HomepageProduct | null) {
  const description =
    product?.description?.trim() || product?.seo.description?.trim();
  return description ? truncate(description, 220) : '';
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

// ─── Tipos y GraphQL ──────────────────────────────────────────────────────────

type HomepageProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  publishedAt?: string | null;
  totalInventory?: number | null;
  tags: readonly string[];
  seo: {
    description?: string | null;
    title?: string | null;
  };
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

const HOMEPAGE_PRODUCT_FRAGMENT = `#graphql
  fragment HomepageProduct on Product {
    id
    handle
    title
    description
    publishedAt
    totalInventory
    tags
    seo {
      title
      description
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
` as const;

// Solo consultamos los productos recientes para la sección "Productos Publicados".
// El carrusel y la vitrina de obras monumentales usan datos estáticos en featuredWorks.ts.
const HOMEPAGE_PRODUCTS_QUERY = `#graphql
  query HomepageProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    recentProducts: products(first: 3, reverse: true, sortKey: CREATED_AT) {
      nodes {
        ...HomepageProduct
      }
    }
  }
  ${HOMEPAGE_PRODUCT_FRAGMENT}
` as const;
