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
  return {products: products.nodes as CatalogProductFragment[]};
}

type EnrichedProduct = CatalogProductFragment & {
  tamano: string;
  priceVal: number;
};

function computeTamano(
  alto: string | null | undefined,
  ancho: string | null | undefined,
): string {
  const a = parseFloat(alto ?? '0');
  const b = parseFloat(ancho ?? '0');
  const max = Math.max(a, b);
  if (max <= 0) return '';
  if (max < 40) return 'S';
  if (max < 70) return 'M';
  if (max < 120) return 'L';
  return 'XL';
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-[6px]">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center border transition ${
          checked
            ? 'border-[#2F9EA0] bg-[#2F9EA0]'
            : 'border-[rgba(35,35,39,.30)] bg-transparent'
        }`}
      >
        {checked && (
          <svg
            className="h-2.5 w-2.5 text-white"
            viewBox="0 0 10 8"
            fill="none"
          >
            <path
              d="M1 4l3 3 5-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-[13px] text-[rgba(35,35,39,.80)]">{label}</span>
    </label>
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
    <div className="border-b border-[rgba(35,35,39,.10)] pb-6">
      <div className="mb-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
        {title}
      </div>
      {children}
    </div>
  );
}

function PriceSlider({
  min,
  max,
  floor,
  ceiling,
  onFloorChange,
  onCeilingChange,
}: {
  min: number;
  max: number;
  floor: number;
  ceiling: number;
  onFloorChange: (v: number) => void;
  onCeilingChange: (v: number) => void;
}) {
  if (min === max) return null;

  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

  return (
    <div className="pt-1">
      <div className="mb-4 flex justify-between [font-family:var(--mono)] text-[11px] tracking-[0.04em] text-[rgba(35,35,39,.72)]">
        <span>{fmt(floor)}</span>
        <span>{fmt(ceiling)}</span>
      </div>
      <div className="space-y-3">
        <input
          type="range"
          min={min}
          max={max}
          value={floor}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= ceiling) onFloorChange(v);
          }}
          className="w-full accent-[#2F9EA0]"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={ceiling}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= floor) onCeilingChange(v);
          }}
          className="w-full accent-[#2F9EA0]"
        />
      </div>
    </div>
  );
}

function CatalogCard({product}: {product: EnrichedProduct}) {
  const consultar = product.priceVal === 0;
  const year = product.createdAt
    ? new Date(product.createdAt).getFullYear()
    : '';

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block"
    >
      <div
        className="relative overflow-hidden bg-[#EEE8E1]"
        style={{aspectRatio: '4 / 5'}}
      >
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(min-width: 1200px) 320px, (min-width: 768px) 50vw, 100vw"
          />
        ) : null}
        {product.productType ? (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-[#2F9EA0] px-[10px] py-[4px] [font-family:var(--mono)] text-[9px] uppercase tracking-[0.16em] text-white">
              {product.productType}
            </span>
          </div>
        ) : null}
      </div>

      <div className="pt-4">
        <div className="mb-[5px] [font-family:var(--mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(35,35,39,.50)]">
          {year}
          {product.tamano ? ` · ${product.tamano}` : ''}
        </div>

        <h2 className="[font-family:var(--serif)] text-[22px] leading-[1.15] text-[#111111] transition group-hover:text-[#2F9EA0]">
          {product.title}
        </h2>

        {(product.ancho?.value || product.alto?.value) && (
          <div className="mt-[4px] text-[12px] text-[rgba(35,35,39,.60)]">
            {[product.ancho?.value, product.alto?.value]
              .filter(Boolean)
              .join(' × ')}{' '}
            cm
          </div>
        )}

        <div
          className={`mt-[8px] [font-family:var(--mono)] text-[13px] tracking-[0.02em] ${
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
  const {products} = useLoaderData<typeof loader>();

  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedTamanos, setSelectedTamanos] = useState<string[]>([]);
  const [sort, setSort] = useState('Reciente');

  const enriched = useMemo<EnrichedProduct[]>(
    () =>
      products.map((p) => ({
        ...p,
        tamano: computeTamano(p.alto?.value, p.ancho?.value),
        priceVal: parseFloat(p.priceRange.minVariantPrice.amount),
      })),
    [products],
  );

  const {minPrice, maxPrice} = useMemo(() => {
    const vals = enriched.map((p) => p.priceVal).filter((v) => v > 0);
    return {
      minPrice: vals.length ? Math.floor(Math.min(...vals)) : 0,
      maxPrice: vals.length ? Math.ceil(Math.max(...vals)) : 10000,
    };
  }, [enriched]);

  const [priceFloor, setPriceFloor] = useState<number | null>(null);
  const [priceCeiling, setPriceCeiling] = useState<number | null>(null);

  const floor = priceFloor ?? minPrice;
  const ceiling = priceCeiling ?? maxPrice;

  const categorias = useMemo(() => {
    const unique = [
      ...new Set(enriched.map((p) => p.productType).filter(Boolean)),
    ];
    return unique.sort();
  }, [enriched]);

  const tamanos = useMemo(() => {
    const order = ['S', 'M', 'L', 'XL'];
    const unique = [
      ...new Set(enriched.map((p) => p.tamano).filter(Boolean)),
    ];
    return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [enriched]);

  function toggleCategoria(cat: string) {
    setSelectedCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function toggleTamano(t: string) {
    setSelectedTamanos((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  const filtered = useMemo(() => {
    let result = enriched;
    if (selectedCategorias.length > 0)
      result = result.filter((p) =>
        selectedCategorias.includes(p.productType),
      );
    if (selectedTamanos.length > 0)
      result = result.filter((p) => selectedTamanos.includes(p.tamano));
    result = result.filter(
      (p) =>
        p.priceVal === 0 || (p.priceVal >= floor && p.priceVal <= ceiling),
    );
    return result;
  }, [enriched, selectedCategorias, selectedTamanos, floor, ceiling]);

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

  const hasFilters =
    selectedCategorias.length > 0 ||
    selectedTamanos.length > 0 ||
    floor > minPrice ||
    ceiling < maxPrice;

  function clearFilters() {
    setSelectedCategorias([]);
    setSelectedTamanos([]);
    setPriceFloor(null);
    setPriceCeiling(null);
  }

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">
      {/* PAGE HEADER */}
      <section className="px-6 pb-0 pt-10 md:px-10 xl:px-14 xl:pt-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="border-b border-[#232327] pb-7">
            <div className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
              Catálogo
            </div>
            <h1 className="mt-3 [font-family:var(--serif)] text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-[-0.015em] text-[#111111]">
              Obras disponibles
            </h1>
          </div>
        </div>
      </section>

      {/* CONTENT: SIDEBAR + MAIN */}
      <section className="px-6 pb-24 pt-10 md:px-10 xl:px-14 xl:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14 xl:grid-cols-[280px_1fr]">

            {/* SIDEBAR — FILTERS */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="space-y-6">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#2F9EA0] underline underline-offset-4"
                  >
                    Limpiar filtros
                  </button>
                )}

                {categorias.length > 0 && (
                  <FilterGroup title="Categoría">
                    {categorias.map((cat) => (
                      <CheckboxRow
                        key={cat}
                        label={cat}
                        checked={selectedCategorias.includes(cat)}
                        onChange={() => toggleCategoria(cat)}
                      />
                    ))}
                  </FilterGroup>
                )}

                {tamanos.length > 0 && (
                  <FilterGroup title="Tamaño">
                    {tamanos.map((t) => (
                      <CheckboxRow
                        key={t}
                        label={t}
                        checked={selectedTamanos.includes(t)}
                        onChange={() => toggleTamano(t)}
                      />
                    ))}
                  </FilterGroup>
                )}

                <FilterGroup title="Precio">
                  <PriceSlider
                    min={minPrice}
                    max={maxPrice}
                    floor={floor}
                    ceiling={ceiling}
                    onFloorChange={setPriceFloor}
                    onCeilingChange={setPriceCeiling}
                  />
                </FilterGroup>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div>
              {/* TOP BAR: counter + sort */}
              <div className="mb-8 flex items-center justify-between border-b border-[rgba(35,35,39,.10)] pb-5">
                <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#C84D92]">
                  {sorted.length} obra{sorted.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-3">
                  <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
                    Orden
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="cursor-pointer bg-transparent text-[13px] text-[#232327] tracking-[0.02em] outline-none"
                  >
                    <option>Reciente</option>
                    <option>Precio ↑</option>
                    <option>Precio ↓</option>
                    <option>A–Z</option>
                  </select>
                </div>
              </div>

              {/* GRID: 2 cols mobile → 3 md → 4 xl */}
              {sorted.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-3 xl:grid-cols-4">
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
