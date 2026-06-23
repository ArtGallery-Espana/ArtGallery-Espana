import * as React from 'react';
import {Link, data, useLoaderData, useNavigate, useNavigationType} from 'react-router';
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
import {ProductConsultation} from '~/components/ProductConsultation';
import {ProductForm} from '~/components/ProductForm';
import {ProductOfferForm} from '~/components/ProductOfferForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  assertOffersEnv,
  getOfferFormValues,
  normalizeVariantTitle,
  OfferSubmissionError,
  submitOffer,
  validateOfferForm,
} from '~/lib/offers.server';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? 'Obra'} | Galería J. España`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  return loadCriticalData(args);
}

export async function action({context, params, request}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data(
      {status: 'error', message: 'Método no permitido.' as const},
      {status: 405},
    );
  }

  const values = getOfferFormValues(await request.formData());
  const fieldErrors = validateOfferForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return data(
      {
        status: 'error' as const,
        message: 'Revisa los campos marcados e inténtalo nuevamente.',
        fieldErrors,
        values,
      },
      {status: 400},
    );
  }

  const {handle} = params;

  if (!handle) {
    return data(
      {
        status: 'error' as const,
        message: 'No pudimos identificar el producto de la oferta.',
        fieldErrors: {product_id: 'Producto no disponible.'},
        values,
      },
      {status: 400},
    );
  }

  try {
    assertOffersEnv(context.env);

    const {product} = await context.storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    });

    if (!product?.id) {
      return data(
        {
          status: 'error' as const,
          message: 'No pudimos identificar el producto de la oferta.',
          fieldErrors: {product_id: 'Producto no disponible.'},
          values,
        },
        {status: 400},
      );
    }

    const selectedVariant = product.selectedOrFirstAvailableVariant;

    if (!selectedVariant?.id) {
      return data(
        {
          status: 'error' as const,
          message: 'Selecciona una variante válida antes de enviar la oferta.',
          fieldErrors: {variant_id: 'Selecciona una variante válida.'},
          values,
        },
        {status: 400},
      );
    }

    await submitOffer(context.env, {
      shop: context.env.OFFERS_SHOP_DOMAIN,
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_title: product.title,
      variant_title: normalizeVariantTitle(selectedVariant.title),
      name: values.name,
      email: values.email,
      quantity: Number(values.quantity),
      offer: Number(values.offer),
      currency:
        selectedVariant.price.currencyCode ||
        product.priceRange.minVariantPrice.currencyCode,
      message: values.message || undefined,
    });

    return data({
      status: 'success' as const,
      message: 'Tu oferta fue enviada correctamente. Te contactaremos muy pronto.',
    });
  } catch (error) {
    const status =
      error instanceof OfferSubmissionError && error.status ? error.status : 500;
    const message =
      error instanceof Error
        ? error.message
        : 'No pudimos enviar tu oferta. Inténtalo nuevamente.';

    return data(
      {
        status: 'error' as const,
        message,
        values,
      },
      {status},
    );
  }
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
  const [isOfferDialogOpen, setIsOfferDialogOpen] = React.useState(false);
  const [offerSuccessEmail, setOfferSuccessEmail] = React.useState<string | null>(null);

  const handleOfferSuccess = React.useCallback((email: string) => {
    setIsOfferDialogOpen(false);
    setOfferSuccessEmail(email);
  }, []);

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
    () => getProductGallery(product),
    [product],
  );

  React.useEffect(() => {
    if (!gallery.length) return;
    const variantImageId = selectedVariant?.image?.id;
    if (variantImageId) {
      // Cuando la variante tiene imagen propia, siempre mostramos esa imagen.
      setSelectedImageId(variantImageId);
    } else {
      // Sin imagen específica de variante: mantenemos la actual si sigue en
      // la galería, o caemos al primer elemento.
      setSelectedImageId((currentId) => {
        if (currentId && gallery.some((img) => img.id === currentId)) return currentId;
        return gallery[0]?.id ?? null;
      });
    }
  }, [gallery, selectedVariant?.image?.id]);

  const activeImage =
    gallery.find((image) => image.id === selectedImageId) ?? gallery[0] ?? null;
  const activeImageIndex = Math.max(
    0,
    gallery.findIndex((image) => image.id === activeImage?.id),
  );

  // Proporción real de la fotografía activa (solo imágenes normales). El
  // contenedor adopta este aspect-ratio para que una foto horizontal no quede
  // centrada dentro de una caja vertical fija 4/5 dejando franjas vacías arriba
  // y abajo. Los modelos 3D NO entran aquí: conservan su propia caja 4/5.
  const photoAspectRatio =
    activeImage?.mediaContentType === 'IMAGE' &&
    activeImage.width &&
    activeImage.height
      ? `${activeImage.width} / ${activeImage.height}`
      : undefined;

  const descriptionHtml = product.descriptionHtml?.trim();
  const plainDescription = product.description?.trim();
  const publishedYear =
    normalizeMetafieldScalar(product.anio?.value) || null;
  const dimensions = getProductDimensions(product);
  const primaryTag = getDisplayTag(product.tags);
  const title = product.title;
  const actionCopy = selectedVariant?.availableForSale
    ? 'Comprar · Añadir al carrito'
    : 'Agotado';
  const hasOptions = productOptions.some((option) => option.optionValues.length > 1);
  const permiteOfertas = product.permite_ofertas?.value === 'true';

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

  // Autoplay eliminado: el cambio automático de fotos interfería con la
  // navegación manual y con el cambio de variante.

  React.useEffect(() => {
    if (!isOfferDialogOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOfferDialogOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOfferDialogOpen]);

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
      <section className="px-6 pb-2 pt-10 md:px-10 xl:px-14 xl:pb-3 xl:pt-12">
        <div className="mx-auto max-w-[1440px]">
          <BackToCatalogButton />
          <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] xl:gap-20">
            <div>
              <figure className="group">
                {/* Cuando hay modelo 3D activo usamos un div (no button) para
                    que el model-viewer reciba los eventos de drag sin conflicto */}
                {activeImage?.mediaContentType === 'MODEL_3D' ? (
                  <div
                    className="group relative block w-full overflow-hidden bg-[#1a1a1a]"
                    style={{aspectRatio: '4 / 5'}}
                  >
                    <Model3dViewer
                      alt={activeImage.altText ?? title}
                      sources={activeImage.sources}
                    />
                    <div className="pointer-events-none absolute inset-0 border border-[rgba(255,255,255,.06)]" />
                    <div className="pointer-events-none absolute left-3.5 bottom-3.5 bg-[rgba(0,0,0,.55)] px-2 py-1 [font-family:var(--mono)] text-[9px] uppercase tracking-[0.16em] text-white/70">
                      Vista 3D · Arrastra para rotar
                    </div>
                  </div>
                ) : (
                  <button
                    aria-label="Ver imagen en primer plano"
                    className="relative block w-full overflow-hidden bg-[#F6F1EA] text-left"
                    onClick={() => setIsLightboxOpen(true)}
                    type="button"
                    // Con foto real usamos su proporción original; sólo como
                    // respaldo (sin imagen) mantenemos la caja 4/5 del placeholder.
                    style={{aspectRatio: photoAspectRatio ?? '4 / 5'}}
                  >
                    {activeImage ? (
                      <Image
                        alt={activeImage.altText || title}
                        className="h-full w-full object-contain"
                        data={activeImage as any}
                        sizes="(min-width: 1280px) 760px, 100vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#E1D5C6]" />
                    )}
                    <div className="pointer-events-none absolute inset-0 border border-[rgba(35,35,39,.06)]" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,.16)] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="absolute left-3.5 bottom-3.5 bg-[rgba(246,241,234,.88)] px-2 py-1 [font-family:var(--mono)] text-[9px] uppercase tracking-[0.16em] text-[rgba(35,35,39,.72)] opacity-0 transition group-hover:opacity-100">
                      Click para ampliar
                    </div>
                  </button>
                )}
              </figure>

              {gallery.length > 1 ? (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {gallery.map((image, index) => {
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
                          {image.mediaContentType === 'MODEL_3D' ? (
                            /* Thumbnail del modelo 3D: usa su imagen de previsualización */
                            image.previewImage ? (
                              <img
                                alt={image.altText || `${title} 3D`}
                                className="h-full w-full object-cover"
                                src={image.previewImage.url}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="[font-family:var(--mono)] text-[9px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.50)]">3D</span>
                              </div>
                            )
                          ) : (
                            <Image
                              alt={image.altText || `${title} ${index + 1}`}
                              className="h-full w-full object-cover"
                              data={image}
                              sizes="120px"
                            />
                          )}
                        </div>
                        <span className="absolute bottom-2 right-2 bg-[rgba(246,241,234,.88)] px-1.5 py-0.5 [font-family:var(--mono)] text-[8px] tracking-[0.12em] text-[rgba(35,35,39,.72)]">
                          {image.mediaContentType === 'MODEL_3D' ? '3D' : String(index + 1).padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-20 xl:mt-24">
                <Kicker accent="mag">Sobre la obra</Kicker>
                {(descriptionHtml || plainDescription) ? (
                  <div className="mt-6 max-w-[52ch] text-[15px] leading-[1.9] text-[#232327]">
                    {descriptionHtml ? (
                      <div
                        className="[&_p]:mb-4 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{__html: descriptionHtml}}
                      />
                    ) : (
                      <p>{plainDescription}</p>
                    )}
                  </div>
                ) : null}
                {(publishedYear || primaryTag || dimensions) ? (
                  <div className="mt-12 border-y border-[rgba(35,35,39,.10)] py-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {publishedYear ? <DataPair label="Año" value={publishedYear} /> : null}
                      {primaryTag ? <DataPair label="Categoría" value={primaryTag} /> : null}
                      {dimensions ? <DataPair label="Medidas" value={dimensions} /> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="xl:sticky xl:top-28 xl:self-start">
              <div className="border border-[rgba(35,35,39,.10)] bg-[rgba(255,255,255,.28)] p-6 backdrop-blur-sm md:p-8">
                <div className="mb-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
                  {[primaryTag, publishedYear].filter(Boolean).join(' · ')}
                </div>
                <h1 className="[font-family:var(--serif)] text-[clamp(2.8rem,4vw,4.25rem)] leading-[0.98] tracking-[-0.02em] text-[#111111]">
                  {title}
                </h1>
                {dimensions ? (
                  <div className="mt-4 text-[15px] text-[rgba(35,35,39,.72)]">
                    {dimensions}
                  </div>
                ) : null}

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
                      className="inline-flex h-[54px] w-full items-center justify-center rounded-[2px] bg-[#0F0F12] px-8 text-[12px] font-medium uppercase tracking-[0.22em] text-[#F6F1EA] transition hover:bg-[#A23A76] disabled:cursor-not-allowed disabled:opacity-50"
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

                  {permiteOfertas ? (
                    <button
                      className="home-cta-ghost inline-flex h-[54px] w-full items-center justify-center rounded-[2px] border border-[#C84D92] px-6 text-[11px] uppercase tracking-[0.18em] text-[#C84D92] transition hover:bg-[#C84D92] hover:!text-white hover:no-underline"
                      onClick={() => setIsOfferDialogOpen(true)}
                      type="button"
                    >
                      Ofertar
                    </button>
                  ) : null}
                </div>

                <ProductConsultation productTitle={title} />

                {hasOptions ? (
                  <div className="mt-8 border-t border-[rgba(35,35,39,.10)] pt-6">
                    <ProductForm
                      productOptions={productOptions}
                      selectedVariant={selectedVariant}
                    />
                  </div>
                ) : null}

                <div className="mt-1 space-y-5 border-t border-[rgba(35,35,39,.10)] pt-3">
                  <InfoBlock
                    title="Incluye"
                    items={[
                      'Firma del artista y factura emitida desde la galería.',
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
                  data={activeImage as any}
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

      {isOfferDialogOpen ? (
        <div
          aria-label="Formulario de oferta"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(17,17,17,.72)] p-4 pt-[8vh] md:p-8 md:pt-[10vh]"
          role="dialog"
        >
          <button
            aria-label="Cerrar"
            className="absolute inset-0"
            onClick={() => setIsOfferDialogOpen(false)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-[780px] bg-[#F6F1EA] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
                Hacer oferta
              </div>
              <button
                aria-label="Cerrar"
                className="inline-flex h-8 w-8 items-center justify-center border border-[rgba(35,35,39,.14)] bg-white text-[14px] text-[#232327] transition hover:border-[rgba(35,35,39,.28)]"
                onClick={() => setIsOfferDialogOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <ProductOfferForm
              compareAtPrice={selectedVariant?.compareAtPrice ?? null}
              currency={
                selectedVariant?.price.currencyCode ||
                product.priceRange.minVariantPrice.currencyCode
              }
              maxQuantity={selectedVariant?.quantityAvailable ?? null}
              onSuccess={handleOfferSuccess}
              price={selectedVariant?.price || product.priceRange.minVariantPrice}
              productId={product.id}
              productImage={activeImage ?? selectedVariant?.image ?? null}
              productTitle={product.title}
              variantId={selectedVariant?.id}
              variantTitle={selectedVariant?.title}
            />
          </div>
        </div>
      ) : null}

      {offerSuccessEmail !== null ? (
        <div
          aria-label="Oferta enviada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,17,.72)] p-4"
          role="dialog"
        >
          <button
            aria-label="Cerrar"
            className="absolute inset-0"
            onClick={() => setOfferSuccessEmail(null)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-[420px] bg-[#F6F1EA] p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C84D92]/12 mx-auto">
              <svg
                className="h-6 w-6 text-[#C84D92]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mb-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
              Oferta recibida
            </div>
            <p className="mb-2 text-[15px] font-medium text-[#C84D92]">
              Estamos revisando tu oferta
            </p>
            <p className="mb-10 text-[13px] leading-[1.7] text-[rgba(35,35,39,.65)]">
              Nos pondremos en contacto contigo en{' '}
              <span className="font-medium text-[#C84D92]">{offerSuccessEmail}</span>{' '}
              una vez hayamos revisado tu propuesta con la galería.
            </p>
            <button
              className="mt-4 inline-flex h-[48px] w-full items-center justify-center rounded-[2px] bg-[#C84D92] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#A23A76]"
              onClick={() => setOfferSuccessEmail(null)}
              type="button"
            >
              Aceptar
            </button>
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
  accent?: 'mag';
}) {
  const accentColor = '#C84D92';

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

/**
 * Botón "Volver al catálogo" del PDP.
 *
 * Comportamiento:
 *   - Si el visitante llegó por navegación cliente (clicó un <Link>),
 *     `useNavigationType()` reporta 'PUSH' y `navigate(-1)` regresa al
 *     paso anterior — típicamente la collection desde la que vino.
 *   - Si entró por URL directa (recarga, share, bookmark), el tipo es
 *     'POP'/'REPLACE': no hay historial al que volver, así que enviamos
 *     a `/collections/all` como destino seguro.
 *
 * El handler se memoriza con useCallback porque el botón vive en una
 * página con bastante render churn (sidebar sticky + lightbox state).
 */
function BackToCatalogButton() {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const canGoBack = navigationType === 'PUSH';

  const handleBack = React.useCallback(() => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/collections/all');
    }
  }, [canGoBack, navigate]);

  return (
    <div className="mb-6">
      <button
        className="-ml-1 inline-flex min-h-[44px] items-center gap-2 px-1 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)] underline-offset-4 transition hover:text-[#232327] hover:underline"
        onClick={handleBack}
        type="button"
      >
        <span aria-hidden="true">←</span>
        Volver al catálogo
      </button>
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

// Tipo unificado para los ítems de la galería (imágenes y modelos 3D).
export type GalleryItem =
  | {
      mediaContentType: 'IMAGE';
      id: string;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | {
      mediaContentType: 'MODEL_3D';
      id: string;
      altText?: string | null;
      previewImage?: {url: string; altText?: string | null} | null;
      sources: {url: string; mimeType: string; format: string; filesize: number}[];
    };

// ─── Visor de modelo 3D ──────────────────────────────────────────────────────

type Model3dSource = {url: string; mimeType: string; format: string; filesize: number};

/**
 * Renderiza un <model-viewer> de Google mediante dangerouslySetInnerHTML.
 * El script se carga en root.tsx con el nonce de CSP. Al ser un Web Component,
 * el navegador actualiza el elemento automáticamente cuando el custom element
 * queda registrado, sin depender de timing en useEffect.
 */
function Model3dViewer({sources, alt}: {sources: Model3dSource[]; alt?: string}) {
  const glb = sources.find(
    (s) => s.mimeType === 'model/gltf-binary' || s.format === 'glb',
  );
  const usdz = sources.find(
    (s) => s.mimeType === 'model/vnd.usdz+zip' || s.format === 'usdz',
  );
  const src = glb?.url ?? sources[0]?.url;

  if (!src) return null;

  const safeAlt = (alt ?? '').replace(/"/g, '&quot;');
  const iosSrc = usdz?.url ? ` ios-src="${usdz.url}"` : '';

  return (
    <div
      className="absolute inset-0"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `<model-viewer src="${src}"${iosSrc} alt="${safeAlt}" camera-controls auto-rotate ar environment-image="legacy" exposure="0.8" shadow-intensity="1" style="width:100%;height:100%;background:#1a1a1a;display:block;"></model-viewer>`,
      }}
      suppressHydrationWarning
    />
  );
}

// ─── Galería de producto ──────────────────────────────────────────────────────

function getProductGallery(product: ProductData): GalleryItem[] {
  return (product.media?.nodes ?? []).flatMap((node) => {
    if (node.__typename === 'MediaImage' && node.image) {
      return [{
        mediaContentType: 'IMAGE' as const,
        id: node.image.id,
        url: node.image.url,
        altText: node.image.altText,
        width: node.image.width,
        height: node.image.height,
      }];
    }
    if (node.__typename === 'Model3d') {
      return [{
        mediaContentType: 'MODEL_3D' as const,
        id: node.id,
        altText: node.alt,
        previewImage: node.previewImage,
        sources: node.sources,
      }];
    }
    return [];
  });
}

// Tags que no deben mostrarse públicamente en la ficha de producto.
const HIDDEN_TAGS = new Set(['catálogo', 'catalogo', 'Cobre', 'cobre']);

function getDisplayTag(tags?: readonly string[] | null): string | null {
  if (!tags?.length) return null;
  const visible = tags.find((t) => !HIDDEN_TAGS.has(t));
  return visible ?? null;
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
  media?: {
    nodes: Array<
      | {
          __typename: 'MediaImage';
          id: string;
          image: {id: string; url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
        }
      | {
          __typename: 'Model3d';
          id: string;
          alt?: string | null;
          previewImage?: {url: string; altText?: string | null} | null;
          sources: {url: string; mimeType: string; format: string; filesize: number}[];
        }
    >;
  } | null;
  alto?: {value: string} | null;
  ancho?: {value: string} | null;
  profundidad?: {value: string} | null;
  anio?: {value: string} | null;
  permite_ofertas?: {value: string} | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  selectedOrFirstAvailableVariant: {
    id: string;
    availableForSale: boolean;
    quantityAvailable?: number | null;
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
    quantityAvailable
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
    media(first: 20) {
      nodes {
        ... on MediaImage {
          __typename
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
        ... on Model3d {
          __typename
          id
          alt
          previewImage {
            url
            altText
          }
          sources {
            url
            mimeType
            format
            filesize
          }
        }
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
    anio: metafield(namespace: "custom", key: "ano") {
      value
    }
    permite_ofertas: metafield(namespace: "custom", key: "permite_ofertas") {
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
