import {useState, useMemo} from 'react';
import type {Route} from './+types/collections.all';
import {useLoaderData, Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CatalogProductFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => [
  {title: 'Galería Taller J España | Catálogo'},
];

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {first: 250},
  });
  const now = new Date();
  const month = now.toLocaleString('es-ES', {month: 'long'});
  const year = now.getFullYear();
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1);
  return {
    products: products.nodes as RawProduct[],
    dateLabel: `${monthLabel} ${year}`,
  };
}

type RawProduct = CatalogProductFragment & {
  collections?: {nodes: {title: string; handle: string}[]};
};

type EnrichedProduct = RawProduct & {
  categoria: string;
  tamano: string;
  priceVal: number;
};

type PriceBucket = 'todos' | 'hasta5' | '5a15' | 'mas15' | 'consultar';

function parseMetaVal(value: string | null | undefined): number {
  if (!value) return 0;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parseFloat(String(parsed[0])) || 0;
    if (typeof parsed === 'object' && parsed !== null && 'value' in parsed)
      return parseFloat(String((parsed as {value: unknown}).value)) || 0;
    return parseFloat(String(parsed)) || 0;
  } catch {
    return parseFloat(value) || 0;
  }
}

function formatDim(value: string | null | undefined): string | null {
  const n = parseMetaVal(value);
  return n > 0 ? String(n) : null;
}

function computeTamano(
  alto: string | null | undefined,
  ancho: string | null | undefined,
): string {
  const a = parseMetaVal(alto);
  const b = parseMetaVal(ancho);
  const max = Math.max(a, b);
  if (max <= 0) return '';
  if (max < 40) return 'S';
  if (max < 70) return 'M';
  if (max < 120) return 'L';
  return 'XL';
}

function getCategory(p: RawProduct): string {
  if (p.productType) return p.productType;
  return p.collections?.nodes?.[0]?.title ?? '';
}

function matchesPriceBucket(priceVal: number, bucket: PriceBucket): boolean {
  if (bucket === 'todos') return true;
  if (bucket === 'consultar') return priceVal === 0;
  if (priceVal === 0) return false;
  if (bucket === 'hasta5') return priceVal <= 5000;
  if (bucket === '5a15') return priceVal > 5000 && priceVal <= 15000;
  if (bucket === 'mas15') return priceVal > 15000;
  return true;
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-4 py-[6px] [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] transition ${
        active
          ? 'border-[#2F9EA0] bg-transparent text-[#2F9EA0]'
          : 'border-[rgba(35,35,39,.22)] bg-transparent text-[rgba(35,35,39,.65)] hover:border-[#2F9EA0] hover:text-[#2F9EA0]'
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.40)]">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function CatalogCard({product}: {product: EnrichedProduct}) {
  const consultar = product.priceVal === 0;
  const year = product.createdAt
    ? new Date(product.createdAt).getFullYear()
    : '';
  const dimAlto = formatDim(product.alto?.value);
  const dimAncho = formatDim(product.ancho?.value);

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block"
    >
      <div
        className="relative w-full overflow-hidden bg-[#EEE8E1]"
        style={{aspectRatio: '4/5'}}
      >
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          />
        ) : null}
        {product.categoria ? (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-[#2F9EA0] px-[10px] py-[4px] [font-family:var(--mono)] text-[9px] uppercase tracking-[0.16em] text-white">
              {product.categoria}
            </span>
          </div>
        ) : null}
      </div>

      <div className="pt-3">
        <div className="mb-[6px] flex items-center justify-between [font-family:var(--mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(35,35,39,.45)]">
          <span>{product.handle.toUpperCase()}</span>
          <span>
            {year}
            {product.tamano ? ` · ${product.tamano}` : ''}
          </span>
        </div>
        <h2 className="[font-family:var(--serif)] text-[19px] leading-[1.15] text-[#111111] transition group-hover:text-[#2F9EA0]">
          {product.title}
        </h2>
        {(dimAncho || dimAlto) && (
          <div className="mt-[5px] text-[12px] text-[rgba(35,35,39,.50)]">
            {[dimAncho, dimAlto].filter(Boolean).join(' × ')} cm
          </div>
        )}
        <div
          className={`mt-2 [font-family:var(--mono)] text-[13px] tracking-[0.02em] ${
            consultar ? 'text-[#C84D92]' : 'text-[#111111]'
          }`}
        >
          {consultar ? (
            'Consultar'
          ) : (
            <Money data={product.priceRange.minVariantPrice} />
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const {products, dateLabel} = useLoaderData<typeof loader>();

  const [selectedTamano, setSelectedTamano] = useState('todas');
  const [selectedPrecio, setSelectedPrecio] = useState<PriceBucket>('todos');
  const [sort, setSort] = useState('Recientes');

  const enriched = useMemo<EnrichedProduct[]>(
    () =>
      products.map((p) => ({
        ...p,
        categoria: getCategory(p),
        tamano: computeTamano(p.alto?.value, p.ancho?.value),
        priceVal: parseFloat(p.priceRange.minVariantPrice.amount),
      })),
    [products],
  );

  const tamanos = useMemo(() => {
    const order = ['S', 'M', 'L', 'XL'];
    const unique = [
      ...new Set(enriched.map((p) => p.tamano).filter(Boolean)),
    ];
    return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [enriched]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (selectedTamano !== 'todas')
      result = result.filter((p) => p.tamano === selectedTamano);
    result = result.filter((p) =>
      matchesPriceBucket(p.priceVal, selectedPrecio),
    );
    return result;
  }, [enriched, selectedTamano, selectedPrecio]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'Precio ↑':
        return copy.sort((a, b) => a.priceVal - b.priceVal);
      case 'Precio ↓':
        return copy.sort((a, b) => b.priceVal - a.priceVal);
      case 'A–Z':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return copy;
    }
  }, [filtered, sort]);

  const hasFilters = selectedTamano !== 'todas' || selectedPrecio !== 'todos';

  function clearFilters() {
    setSelectedTamano('todas');
    setSelectedPrecio('todos');
  }

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">

      {/* HERO */}
      <section className="px-6 pb-12 pt-12 md:px-10 xl:px-14 xl:pt-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex items-center gap-4">
            <span className="block h-px w-10 bg-[#C84D92]" aria-hidden="true" />
            <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
              Catálogo&nbsp;·&nbsp;{products.length} obras disponibles
            </span>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-16">
            <div className="lg:max-w-[60%]">
              <h1 className="[font-family:var(--serif)] text-[clamp(2.8rem,6vw,5rem)] leading-[1.0] tracking-[-0.02em] text-[#111111]">
                Obras disponibles
              </h1>
              <p className="[font-family:var(--serif)] text-[clamp(2.8rem,6vw,5rem)] leading-[1.0] tracking-[-0.02em] italic text-[rgba(35,35,39,.38)]">
                {dateLabel}.
              </p>
            </div>
            <p className="max-w-[360px] text-[15px] leading-[1.65] text-[rgba(35,35,39,.62)] lg:mb-2 lg:ml-auto">
              El catálogo se actualiza el primer lunes de cada mes. Para obras
              que ya no aparecen, escribir al estudio: en muchos casos
              permanecen disponibles bajo consulta directa.
            </p>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="border-y border-[rgba(35,35,39,.10)] px-6 py-5 md:px-10 xl:px-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">

            {tamanos.length > 0 && (
              <FilterGroup title="Tamaño">
                <FilterPill
                  label="Todos"
                  active={selectedTamano === 'todas'}
                  onClick={() => setSelectedTamano('todas')}
                />
                {tamanos.map((t) => (
                  <FilterPill
                    key={t}
                    label={t}
                    active={selectedTamano === t}
                    onClick={() =>
                      setSelectedTamano(selectedTamano === t ? 'todas' : t)
                    }
                  />
                ))}
              </FilterGroup>
            )}

            <FilterGroup title="Precio">
              {(
                [
                  {key: 'todos', label: 'Todos'},
                  {key: 'hasta5', label: 'Hasta 5.000'},
                  {key: '5a15', label: '5.000 – 15.000'},
                  {key: 'mas15', label: '+15.000'},
                  {key: 'consultar', label: 'Consultar'},
                ] as {key: PriceBucket; label: string}[]
              ).map(({key, label}) => (
                <FilterPill
                  key={key}
                  label={label}
                  active={selectedPrecio === key}
                  onClick={() => setSelectedPrecio(key)}
                />
              ))}
            </FilterGroup>

            <div className="ml-auto flex items-center gap-4">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#2F9EA0] underline underline-offset-4"
                >
                  Limpiar
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="hidden [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.40)] sm:inline">
                  Orden
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="cursor-pointer bg-transparent [font-family:var(--mono)] text-[11px] uppercase tracking-[0.12em] text-[#232327] outline-none"
                >
                  <option>Recientes</option>
                  <option>Precio ↑</option>
                  <option>Precio ↓</option>
                  <option>A–Z</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="px-6 pb-24 pt-8 md:px-10 xl:px-14" data-reveal>
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-8 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[#C84D92]">
            {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
          </p>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {sorted.map((product) => (
                <CatalogCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-5 border border-dashed border-[rgba(35,35,39,.20)] p-10">
              <p className="[font-family:var(--serif)] text-[22px] leading-[1.3] text-[#111111]">
                Ninguna obra coincide con tu selección.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#2F9EA0] underline underline-offset-4"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DOSSIER CTA */}
      <section className="border-t border-[rgba(35,35,39,.12)] px-6 py-20 md:px-10 xl:px-14" data-reveal>
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-[520px] [font-family:var(--serif)] text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.2] text-[#111111]">
              ¿Busca una obra que no ve aquí?<br />
              Muchas piezas viven fuera del catálogo público.
            </h2>
            <Link
              to="/pages/contacto"
              className="inline-flex shrink-0 items-center border border-[#232327] px-7 py-4 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[#232327] transition hover:bg-[#232327] hover:text-[#F6F1EA]"
            >
              Solicitar dossier privado
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

const CATALOG_PRODUCT_FRAGMENT = `#graphql
  fragment CatalogProduct on Product {
    id
    handle
    title
    productType
    createdAt
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    alto: metafield(namespace: "custom", key: "alto") {
      value
    }
    ancho: metafield(namespace: "custom", key: "ancho") {
      value
    }
    collections(first: 5) {
      nodes {
        title
        handle
      }
    }
  }
` as const;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...CatalogProduct
      }
    }
  }
  ${CATALOG_PRODUCT_FRAGMENT}
` as const;
