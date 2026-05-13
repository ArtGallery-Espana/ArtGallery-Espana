import * as React from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Analytics,
  Image,
  Money,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? 'Obra'} | Galería Taller J España`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  return loadCriticalData(args);
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null,
  );
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [lightboxZoom, setLightboxZoom] = React.useState(1);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const gallery = React.useMemo(
    () => getProductGallery(product, selectedVariant?.image ?? null),
    [product, selectedVariant?.image],
  );

  React.useEffect(() => {
    if (!gallery.length) return;
    setSelectedImageId((currentImageId) => {
      if (currentImageId && gallery.some((image) => image.id === currentImageId)) {
        return currentImageId;
      }
      return selectedVariant?.image?.id ?? gallery[0]?.id ?? null;
    });
  }, [gallery, selectedVariant?.image?.id]);

  const activeImage =
    gallery.find((image) => image.id === selectedImageId) ?? gallery[0] ?? null;
  const activeImageIndex = Math.max(
    0,
    gallery.findIndex((image) => image.id === activeImage?.id),
  );

  const descriptionHtml = product.descriptionHtml?.trim();
  const plainDescription = product.description?.trim();
  const publishedYear = getPublishedYear(product.publishedAt);
  const dimensions = getProductDimensions(product);
  const primaryTag = getPrimaryTag(product.tags);
  const title = product.title;
  const actionCopy = selectedVariant?.availableForSale
    ? 'Comprar · Añadir al carrito'
    : 'Agotado';
  const hasOptions = productOptions.some((option) => option.optionValues.length > 1);

  const showImageAtIndex = React.useCallback(
    (index: number) => {
      if (!gallery.length) return;
      const normalizedIndex = (index + gallery.length) % gallery.length;
      setSelectedImageId(gallery[normalizedIndex]?.id ?? null);
    },
    [gallery],
  );

  const showNextImage = React.useCallback(() => {
    showImageAtIndex(activeImageIndex + 1);
  }, [activeImageIndex, showImageAtIndex]);

  const showPreviousImage = React.useCallback(() => {
    showImageAtIndex(activeImageIndex - 1);
  }, [activeImageIndex, showImageAtIndex]);

  React.useEffect(() => {
    if (gallery.length <= 1 || isLightboxOpen) return;

    const interval = window.setInterval(() => {
      setSelectedImageId((currentImageId) => {
        const currentIndex = gallery.findIndex((image) => image.id === currentImageId);
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
        return gallery[nextIndex % gallery.length]?.id ?? currentImageId ?? null;
      });
    }, 4000);

    return () => window.clearInterval(interval);
  }, [gallery, isLightboxOpen]);

  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setLightboxZoom((value) => Math.min(3, Number((value + 0.2).toFixed(2))));
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        setLightboxZoom((value) => Math.max(1, Number((value - 0.2).toFixed(2))));
      }
      if (event.key === 'ArrowRight') showNextImage();
      if (event.key === 'ArrowLeft') showPreviousImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, showNextImage, showPreviousImage]);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">
      <section className="px-6 pb-20 pt-10 md:px-10 xl:px-14 xl:pb-28 xl:pt-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] xl:gap-20">
            <div>
              <figure className="group">
                <button
                  aria-label="Ver imagen en primer plano"
                  className="relative block w-full overflow-hidden bg-black text-left"
                  onClick={() => setIsLightboxOpen(true)}
                  type="button"
                  style={{aspectRatio: '4 / 5'}}
                >
                  {activeImage ? (
                    <Image
                      alt={activeImage.altText || title}
                      className="h-full w-full object-contain p-3 md:p-4"
                      data={activeImage}
                      sizes="(min-width: 1280px) 760px, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#E1D5C6]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 border border-[rgba(35,35,39,.06)]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,.16)] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute left-3.5 top-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.72)]">
                    {title}
                  </div>
                  <div className="absolute left-3.5 bottom-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9px] uppercase tracking-[0.16em] text-[rgba(35,35,39,.72)] opacity-0 transition group-hover:opacity-100">
                    Click para ampliar
                  </div>
                  <div className="absolute bottom-3.5 right-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9.5px] tracking-[0.12em] text-[rgba(35,35,39,.72)]">
                    {product.handle}
                  </div>
                </button>
              </figure>

              {gallery.length > 1 ? (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {gallery.slice(0, 5).map((image, index) => {
                    const isActive = image.id === activeImage?.id;
                    return (
                      <button
                        key={image.id}
                        className={`relative overflow-hidden border transition ${
                          isActive
                            ? 'border-[#C84D92] ring-2 ring-[rgba(200,77,146,.18)] ring-inset'
                            : 'border-[rgba(35,35,39,.10)] hover:border-[rgba(35,35,39,.28)]'
                        }`}
                        onClick={() => setSelectedImageId(image.id)}
                        type="button"
                      >
                        <div className="aspect-square bg-[#EEE8E1]">
                          <Image
                            alt={image.altText || `${title} ${index + 1}`}
                            className="h-full w-full object-cover"
                            data={image}
                            sizes="120px"
                          />
                        </div>
                        <span className="absolute bottom-2 right-2 bg-[rgba(246,241,234,.88)] px-1.5 py-0.5 [font-family:var(--mono)] text-[8px] tracking-[0.12em] text-[rgba(35,35,39,.72)]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-20 xl:mt-24">
                <Kicker accent="mag">Sobre la obra</Kicker>
                <h2 className="mt-6 max-w-[10ch] [font-family:var(--serif)] text-[clamp(2.8rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.02em] text-[#111111]">
                  {title}
                </h2>
                <div className="mt-6 max-w-[52ch] text-[15px] leading-[1.9] text-[#232327]">
                  {descriptionHtml ? (
                    <div
                      className="[&_p]:mb-4 [&_p:last-child]:mb-0"
                      dangerouslySetInnerHTML={{__html: descriptionHtml}}
                    />
                  ) : (
                    <p>
                      {plainDescription ||
                        'La descripción de esta obra estará disponible muy pronto.'}
                    </p>
                  )}
                </div>
                <div className="mt-12 border-y border-[rgba(35,35,39,.10)] py-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <DataPair label="Año" value={publishedYear} />
                    <DataPair label="Categoría" value={primaryTag} />
                    <DataPair label="Medidas" value={dimensions || 'Consultar'} />
                    <DataPair label="SKU" value={selectedVariant?.sku || 'Sin referencia'} />
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:sticky xl:top-28 xl:self-start">
              <div className="border border-[rgba(35,35,39,.10)] bg-[rgba(255,255,255,.28)] p-6 backdrop-blur-sm md:p-8">
                <div className="mb-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
                  {product.handle} · {primaryTag} · {publishedYear}
                </div>
                <h1 className="[font-family:var(--serif)] text-[clamp(2.8rem,4vw,4.25rem)] leading-[0.98] tracking-[-0.02em] text-[#111111]">
                  {title}
                </h1>
                <div className="mt-4 text-[15px] text-[rgba(35,35,39,.72)]">
                  {dimensions || 'Medidas a consultar'}
                  {selectedVariant?.sku ? ` · Ref. ${selectedVariant.sku}` : ''}
                </div>

                <div className="mb-8 mt-8 flex items-end gap-4 border-y border-[rgba(35,35,39,.10)] py-6">
                  <div>
                    <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
                      Precio
                    </div>
                    <div className="mt-2 [font-family:var(--serif)] text-[36px] leading-none text-[#111111]">
                      <Money
                        data={
                          selectedVariant?.price || product.priceRange.minVariantPrice
                        }
                      />
                    </div>
                  </div>
                  {selectedVariant?.compareAtPrice ? (
                    <div className="pb-1 text-[14px] text-[rgba(35,35,39,.55)] line-through">
                      <Money data={selectedVariant.compareAtPrice} />
                    </div>
                  ) : null}
                  <div className="ml-auto pb-1 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
                    {selectedVariant?.availableForSale ? 'Disponible' : 'Agotado'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="[&_form]:block [&_form]:w-full">
                    <AddToCartButton
                      className="inline-flex h-[54px] w-full items-center justify-center rounded-[2px] bg-[#111111] px-8 text-[12px] font-medium uppercase tracking-[0.22em] text-[#F6F1EA] transition hover:bg-[#2F9EA0] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!selectedVariant || !selectedVariant.availableForSale}
                      lines={
                        selectedVariant
                          ? [
                              {
                                merchandiseId: selectedVariant.id,
                                quantity: 1,
                                selectedVariant,
                              },
                            ]
                          : []
                      }
                    >
                      {actionCopy}
                    </AddToCartButton>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      className="home-cta-ghost inline-flex h-[54px] items-center justify-center rounded-[2px] border border-[#2F9EA0] px-6 text-[11px] uppercase tracking-[0.18em] text-[#2F9EA0] transition hover:bg-[#2F9EA0] hover:!text-white hover:no-underline"
                      to="/pages/contacto"
                    >
                      Ofertar
                    </Link>
                    <Link
                      className="home-cta-ghost inline-flex h-[54px] items-center justify-center rounded-[2px] border border-[#2F9EA0] px-6 text-[11px] uppercase tracking-[0.18em] text-[#2F9EA0] transition hover:bg-[#2F9EA0] hover:!text-white hover:no-underline"
                      to="/pages/contacto"
                    >
                      Consultar
                    </Link>
                  </div>
                </div>

                {hasOptions ? (
                  <div className="mt-8 border-t border-[rgba(35,35,39,.10)] pt-6">
                    <ProductForm
                      productOptions={productOptions}
                      selectedVariant={selectedVariant}
                    />
                  </div>
                ) : null}

                <div className="mt-8 space-y-5 border-t border-[rgba(35,35,39,.10)] pt-6">
                  <InfoBlock
                    title="Incluye"
                    items={[
                      'Certificado y factura emitida desde la galería.',
                      'Acompañamiento para coordinar envío o entrega.',
                      'Atención directa para resolver dudas sobre la obra.',
                    ]}
                  />
                  <InfoBlock
                    title="Compra"
                    items={[
                      'Pago seguro desde Shopify.',
                      'Añade la obra al carrito o contáctanos para atención personalizada.',
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />

      {isLightboxOpen && activeImage ? (
        <div
          aria-label="Visor de imagen"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,17,.92)] p-4 md:p-8"
          role="dialog"
        >
          <button
            aria-label="Cerrar visor"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => {
              setIsLightboxOpen(false);
              setLightboxZoom(1);
            }}
            type="button"
          />
          <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex items-start justify-between gap-4 md:inset-x-8 md:top-8">
            <div className="rounded bg-[rgba(17,17,17,.55)] px-3 py-2 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-white/72">
              {title} · {String(activeImageIndex + 1).padStart(2, '0')} /{' '}
              {String(gallery.length).padStart(2, '0')}
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
                <button
                  className="inline-flex h-11 items-center justify-center border border-white/20 bg-[rgba(17,17,17,.55)] px-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#F6F1EA] transition hover:border-white/40"
                  onClick={() =>
                    setLightboxZoom((value) => Math.min(3, Number((value + 0.2).toFixed(2))))
                  }
                  type="button"
                >
                  Zoom +
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center border border-white/20 bg-[rgba(17,17,17,.55)] px-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#F6F1EA] transition hover:border-white/40"
                  onClick={() =>
                    setLightboxZoom((value) => Math.max(1, Number((value - 0.2).toFixed(2))))
                  }
                  type="button"
                >
                  Zoom -
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center border border-white/20 bg-[rgba(17,17,17,.55)] px-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#F6F1EA] transition hover:border-white/40"
                  onClick={() => {
                    setIsLightboxOpen(false);
                    setLightboxZoom(1);
                  }}
                  type="button"
                >
                  Cerrar
                </button>
            </div>
          </div>

          <div className="pointer-events-none relative z-10 flex w-full max-w-[1400px] flex-col gap-4 pt-20 md:pt-24">
            <div
              className="relative flex items-center justify-center"
              onWheel={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const delta = event.deltaY < 0 ? 0.12 : -0.12;
                setLightboxZoom((value) =>
                  Math.min(3, Math.max(1, Number((value + delta).toFixed(2)))),
                );
              }}
            >
              {gallery.length > 1 ? (
                <button
                  aria-label="Imagen anterior"
                  className="pointer-events-auto absolute left-3 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[rgba(17,17,17,.35)] text-xl text-[#F6F1EA] transition hover:border-white/40"
                  onClick={showPreviousImage}
                  type="button"
                >
                  ‹
                </button>
              ) : null}

              <button
                aria-label="Restablecer zoom"
                className="pointer-events-auto relative z-10 block max-h-[78vh] max-w-[88vw] cursor-zoom-in"
                onClick={() => {
                  setLightboxZoom((value) => (value > 1 ? 1 : 1.4));
                }}
                onDoubleClick={() => setLightboxZoom(1)}
                type="button"
              >
                <Image
                  alt={activeImage.altText || title}
                  className="max-h-[78vh] w-full object-contain"
                  data={activeImage}
                  sizes="100vw"
                  style={{
                    transform: `scale(${lightboxZoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 140ms ease',
                  }}
                />
              </button>

              {gallery.length > 1 ? (
                <button
                  aria-label="Imagen siguiente"
                  className="pointer-events-auto absolute right-3 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[rgba(17,17,17,.35)] text-xl text-[#F6F1EA] transition hover:border-white/40"
                  onClick={showNextImage}
                  type="button"
                >
                  ›
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Kicker({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: 'mag' | 'turq';
}) {
  const accentColor = accent === 'mag' ? '#C84D92' : '#2F9EA0';

  return (
    <div className="flex items-center gap-3.5 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
      <span className="h-px w-6 shrink-0" style={{backgroundColor: accentColor}} />
      <span>{children}</span>
    </div>
  );
}

function DataPair({label, value}: {label: string; value: string}) {
  return (
    <div>
      <div className="mb-2 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
        {label}
      </div>
      <div className="text-[14px] leading-[1.55] text-[#111111]">{value}</div>
    </div>
  );
}

function InfoBlock({title, items}: {title: string; items: string[]}) {
  return (
    <div>
      <div className="mb-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
        {title}
      </div>
      <ul className="space-y-2.5 text-[13px] leading-[1.75] text-[#232327]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[#C84D92]">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getProductGallery(
  product: ProductData,
  variantImage: ProductData['selectedOrFirstAvailableVariant']['image'] | null,
) {
  const seen = new Set<string>();
  const gallery = [variantImage, ...(product.images?.nodes ?? [])].filter(
    (image): image is NonNullable<typeof image> => Boolean(image?.id),
  );

  return gallery.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}

function getPublishedYear(publishedAt?: string | null) {
  if (!publishedAt) return '—';
  return new Date(publishedAt).getFullYear().toString();
}

function getPrimaryTag(tags?: readonly string[] | null) {
  if (!tags?.length) return 'catálogo';
  return tags[0];
}

function getProductDimensions(product?: ProductData | null) {
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
      // fall through
    }
  }

  return trimmed;
}

type ProductData = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  description: string;
  descriptionHtml: string;
  publishedAt?: string | null;
  tags: string[];
  images?: {
    nodes: Array<{
      id: string;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    }>;
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
  selectedOrFirstAvailableVariant: {
    id: string;
    availableForSale: boolean;
    sku?: string | null;
    title: string;
    image?: {
      id: string;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
    price: {
      amount: string;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
};

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    publishedAt
    tags
    images(first: 6) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    alto: metafield(namespace: "custom", key: "alto") {
      value
    }
    ancho: metafield(namespace: "custom", key: "ancho") {
      value
    }
    profundidad: metafield(namespace: "custom", key: "profundidad") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
