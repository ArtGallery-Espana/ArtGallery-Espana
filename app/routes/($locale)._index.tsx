import type {ReactNode} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {MockShopNotice} from '~/components/MockShopNotice';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Galeria Taller J España | Home'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {storefront, env} = context;
  const {featuredProducts, recentProducts} = await storefront.query(
    HOMEPAGE_PRODUCTS_QUERY,
  );

  const recentWorks = recentProducts.nodes;
  const heroProduct = featuredProducts.nodes[0] ?? recentWorks[0] ?? null;

  return {
    isShopLinked: Boolean(env.PUBLIC_STORE_DOMAIN),
    heroProduct,
    recentWorks,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const heroProduct = data.heroProduct;
  const heroDescription = getProductDescription(heroProduct);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">
      {data.isShopLinked ? null : <MockShopNotice />}

      <section className="px-6 pb-16 pt-8 md:px-10 xl:px-14 xl:pb-20 xl:pt-12">
        <div className="mx-auto max-w-360">
          <div className="grid items-center gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-24">
            <div>
              <Kicker accent="mag">
                {heroProduct ? 'Obra destacada' : 'Obra del mes · Mayo 2026'}
              </Kicker>
              <h1 className="mt-10 [font-family:var(--serif)] text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.98] tracking-[-0.015em] text-[#111111]">
                {heroProduct ? (
                  heroProduct.title
                ) : (
                  <>
                    Pintar la luz
                    <br />
                    <span className="italic text-[rgba(35,35,39,.72)]">
                      sin levantar la voz.
                    </span>
                  </>
                )}
              </h1>
              <p className="mb-11 mt-9 max-w-[44ch] text-[17px] leading-[1.7] text-[rgba(35,35,39,.72)]">
                {heroDescription ||
                  'Obra contemporánea de Jorge España, pintor ecuatoriano radicado en Cuenca. Galápagos, paisajes interiores y pequeñas iluminaciones, en óleo y técnica mixta.'}
              </p>
              <div className="mb-14 mt-4 flex flex-wrap items-start gap-4">
              <Link
                className="home-cta-primary inline-flex h-12 items-center justify-center rounded-[2px] bg-[#111111] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#2F9EA0] hover:text-white hover:no-underline"
                to="/collections/all"
              >
                Ver catálogo
              </Link>
              <Link
                className="home-cta-link group relative flex h-12 w-[182px] items-center text-[11px] uppercase tracking-[0.18em] text-[#232327] transition-colors hover:text-[#2F9EA0] hover:no-underline"
                to={
                  heroProduct
                    ? getProductPath(heroProduct.handle)
                    : '/pages/artista'
                  }
                >
                  <span className="flex items-center leading-none">
                    {heroProduct ? 'Ver obra →' : 'Sobre el artista →'}
                  </span>
                  <span className="absolute bottom-0 left-0 block h-px w-full bg-[#232327] transition-colors group-hover:bg-[#2F9EA0]" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                <span>
                  {heroProduct
                    ? `Publicado ${getPublishedYear(heroProduct.publishedAt)}`
                    : 'EST. 2009'}
                </span>
                <span className="text-[#D9D4CF]">·</span>
                <span className="text-[#D9D4CF]">·</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[620px] xl:mx-0">
              <ArtworkProduct product={heroProduct} ratio="4 / 5" />
              {heroProduct ? (
                <div className="mt-6 border border-[rgba(35,35,39,.10)] bg-[#F6F1EA] p-6 xl:absolute xl:-bottom-6 xl:-right-6 xl:mt-0 xl:max-w-[280px]">
                  <div className="mb-2.5 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[#C84D92]">
                    Obra protagonista
                  </div>
                  <div className="mb-1.5 [font-family:var(--serif)] text-[22px] leading-[1.15] text-[#111111]">
                    {heroProduct.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
                    <span>{getPublishedYear(heroProduct.publishedAt)}</span>
                    <span>·</span>
                    <span>{getPrimaryTag(heroProduct.tags)}</span>
                    {getProductDimensions(heroProduct) ? (
                      <>
                        <span>·</span>
                        <span>{getProductDimensions(heroProduct)}</span>
                      </>
                    ) : null}
                    <span>·</span>
                    <Money data={heroProduct.priceRange.minVariantPrice} />
                  </div>
                  <Link
                    className="home-cta-link mt-4 inline-flex items-end border-b border-[#232327] pb-1 text-[10px] uppercase tracking-[0.18em] text-[#232327] transition-colors hover:border-[#2F9EA0] hover:text-[#2F9EA0]"
                    to={getProductPath(heroProduct.handle)}
                  >
                    Ficha de obra →
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pt-20 md:px-10 xl:px-14 xl:pt-35" data-reveal>
        <div className="mx-auto max-w-360">
          <div className="grid border-y border-[rgba(35,35,39,.10)] lg:grid-cols-3">
            <TrustBlock
              num="01"
              title="Autenticidad"
              body="Cada obra incluye certificado firmado por el artista, archivo fotográfico y registro ICOM."
            />
            <TrustBlock
              num="02"
              title="Envío internacional"
              body="DHL Express con embalaje museográfico para coleccionistas en Europa, Asia y Américas."
              accent
            />
            <TrustBlock
              num="03"
              title="Asesoría privada"
              body="Visita virtual al taller, propuestas de adquisición y planes de pago para coleccionistas."
              last
            />
          </div>
        </div>
      </section>

      <section className="px-6 pt-24 md:px-10 xl:px-14 xl:pt-[160px]" data-reveal>
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            num="02 — Obra reciente"
            title="Últimos productos publicados"
            desc="Descubre las piezas más recientes incorporadas a nuestro catálogo. Arte contemporáneo con alma artesanal."
          />

          <div className="grid gap-12 lg:grid-cols-3">
            {data.recentWorks.map((product) => (
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
                      <Money data={product.priceRange.minVariantPrice} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 flex justify-center xl:mt-20">
            <Link
              className="home-cta-outline inline-flex h-12 items-center justify-center rounded-[2px] border border-[#232327] px-6 text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:border-[#2F9EA0] hover:!text-[#2F9EA0] hover:no-underline"
              to="/collections/all"
            >
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pt-28 md:px-10 xl:px-14 xl:pt-[200px]" data-reveal>
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-14 xl:grid-cols-[1fr_1.35fr] xl:gap-24">
            <div>
              <Kicker>Nuestro taller</Kicker>
              <h2 className="mt-4 [font-family:var(--serif)] text-[clamp(3rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.015em] text-[#111111]">
                Un espacio íntimo en Cuenca donde la obra se piensa, se prueba y
                toma forma con calma.
              </h2>
              <p className="mt-7 max-w-[42ch] text-[15px] leading-[1.7] text-[rgba(35,35,39,.72)]">
                Entre herramientas, pigmentos y maquetas, el taller reúne las
                piezas en proceso, la obra terminada y la conversación que da
                sentido a cada serie.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  className="home-cta-ghost inline-flex h-12 items-center justify-center rounded-[2px] border border-[#2F9EA0] px-6 text-[11px] uppercase tracking-[0.18em] text-[#2F9EA0] transition hover:bg-[#2F9EA0] hover:!text-white hover:no-underline"
                  to="/pages/contacto"
                >
                  Solicitar visita
                </Link>
                <Link
                  className="home-cta-link inline-flex items-center border-b border-[#232327] pb-1 text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:border-[#2F9EA0] hover:!text-[#2F9EA0] hover:no-underline"
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
                    src="https://cdn.shopify.com/s/files/1/0761/3857/8106/files/Taller.jpg?v=1778463311"
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
              <div className="grid gap-6 border-y border-[rgba(35,35,39,.10)] py-7 sm:grid-cols-3">
                <div>
                  <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                    Ubicación
                  </div>
                  <div className="mt-2 [font-family:var(--serif)] text-[20px] leading-[1.25] text-[#111111]">
                    Cuenca, Ecuador
                  </div>
                </div>
                <div>
                  <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                    Acceso
                  </div>
                  <div className="mt-2 [font-family:var(--serif)] text-[20px] leading-[1.25] text-[#111111]">
                    Visita previa agendada
                  </div>
                </div>
                <div>
                  <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                    Ritmo
                  </div>
                  <div className="mt-2 [font-family:var(--serif)] text-[20px] leading-[1.25] text-[#111111]">
                    Dos miércoles al mes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kicker({
  children,
  accent,
}: {
  children: ReactNode;
  accent?: 'mag' | 'turq';
}) {
  const accentColor =
    accent === 'mag'
      ? '#C84D92'
      : accent === 'turq'
        ? '#2F9EA0'
        : 'rgba(35,35,39,.55)';

  return (
    <div className="flex items-center gap-3.5 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
      <span
        className="h-px w-6 shrink-0"
        style={{
          backgroundColor:
            accentColor === 'rgba(35,35,39,.55)'
              ? 'rgba(35,35,39,.5)'
              : accentColor,
        }}
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

function TrustBlock({
  num,
  title,
  body,
  accent,
  last,
}: {
  num: string;
  title: string;
  body: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="grid items-start gap-5 py-12 pl-4 lg:grid-cols-[18px_1fr] lg:pl-6 lg:pr-8"
      style={{borderRight: last ? 'none' : '1px solid rgba(35,35,39,.10)'}}
    >
      <div
        className="self-start pt-[4px] [font-family:var(--mono)] text-[10px] leading-none tracking-[0.22em]"
        style={{color: accent ? '#C84D92' : 'rgba(35,35,39,.55)'}}
      >
        {num}
      </div>
      <div>
        <h3 className="mb-2.5 [font-family:var(--serif)] text-[24px] leading-[1.25] text-[#111111]">
          {title}
        </h3>
        <p className="max-w-[38ch] text-[13px] leading-[1.7] text-[rgba(35,35,39,.72)]">
          {body}
        </p>
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

function getProductDimensions(product?: HomepageProduct | null) {
  if (!product) return '';

  const alto = formatDecimalMetafield(product.alto?.value);
  const ancho = formatDecimalMetafield(product.ancho?.value);
  const profundidad = formatDecimalMetafield(product.profundidad?.value);

  const dimensions = [alto, ancho, profundidad].filter(Boolean);
  return dimensions.length ? `${dimensions.join(' × ')} cm` : '';
}

function formatDecimalMetafield(value?: string | null) {
  const raw = normalizeMetafieldScalar(value);
  if (!raw) return '';

  const normalized = Number.parseFloat(raw.replace(',', '.'));
  if (Number.isNaN(normalized)) return raw;

  return new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(normalized);
}

function normalizeMetafieldScalar(value?: string | null) {
  if (!value) return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('[') ||
    trimmed.startsWith('"') ||
    trimmed.startsWith("'")
  ) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return normalizeMetafieldScalar(
          parsed[0] == null ? '' : String(parsed[0]),
        );
      }
      if (typeof parsed === 'string') return parsed;
      if (typeof parsed === 'number') return String(parsed);
    } catch {
      // Fall through to the raw string.
    }
  }

  return trimmed;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

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
  alto?: {value: string} | null;
  ancho?: {value: string} | null;
  profundidad?: {value: string} | null;
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
    alto: metafield(namespace: "custom", key: "alto") {
      value
    }
    ancho: metafield(namespace: "custom", key: "ancho") {
      value
    }
    profundidad: metafield(namespace: "custom", key: "profundidad") {
      value
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
` as const;

const HOMEPAGE_PRODUCTS_QUERY = `#graphql
  query HomepageProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    featuredProducts: products(
      first: 1
      reverse: true
      sortKey: CREATED_AT
      query: "tag:destacado"
    ) {
      nodes {
        ...HomepageProduct
      }
    }
    recentProducts: products(first: 3, reverse: true, sortKey: CREATED_AT) {
      nodes {
        ...HomepageProduct
      }
    }
  }
  ${HOMEPAGE_PRODUCT_FRAGMENT}
` as const;
