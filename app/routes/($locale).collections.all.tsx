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

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-[5px]">
      <span
        className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center border transition ${
          checked
            ? 'border-[#2F9EA0] bg-[#2F9EA0]'
            : 'border-[rgba(35,35,39,.30)]'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 8" fill="none" className="h-[9px] w-[9px]">
            <path
              d="M1 4l3 3 5-6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-[13px] leading-snug text-[rgba(35,35,39,.80)]">
        {label}
      </span>
    </label>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[rgba(35,35,39,.10)] pb-6">
      <p className="mb-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
        {title}
      </p>
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
  if (min >= max) return null;
  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
  return (
    <div>
      <div className="mb-3 flex justify-between [font-family:var(--mono)] text-[11px] tracking-[0.04em] text-[rgba(35,35,39,.72)]">
        <span>{fmt(floor)}</span>
        <span>{fmt(ceiling)}</span>
      </div>
      <div className="space-y-2">
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
        {product.productType ? (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-[#2F9EA0] px-[10px] py-[4px] [font-family:var(--mono)] text-[9px] uppercase tracking-[0.16em] text-white">
              {product.productType}
            </span>
          </div>
        ) : null}
      </div>

      <div className="pt-3">
        <div className="mb-[6px] flex items-center justify-between [font-family:var(--mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(35,35,39,.45)]">
          <span>{product.handle.toUpperCase()}</span>
          <span>{year}{product.tamano ? ` · ${product.tamano}` : ''}</span>
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
      maxPrice: vals.length ? Math.ceil(Math.max(...vals)) : 0,
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

  const filtered = useMemo(() => {
    let result = enriched;
    if (selectedCategorias.length > 0)
      result = result.filter((p) =>
        selectedCategorias.includes(p.productType),
      );
    if (selectedTamanos.length > 0)
      result = result.filter((p) => selectedTamanos.includes(p.tamano));
    result = result.filter(
      (p) => p.priceVal === 0 || (p.priceVal >= floor && p.priceVal <= ceiling),
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
      {/* HEADER */}
      <section className="px-6 pb-0 pt-10 md:px-10 xl:px-14 xl:pt-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="border-b border-[#232327] pb-8">
            <div className="mb-4 flex items-center gap-4">
              <span className="block h-px w-10 bg-[#C84D92]" aria-hidden="true" />
              <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[#C84D92]">
                Catálogo
              </span>
            </div>
            <h1 className="[font-family:var(--serif)] text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.02] tracking-[-0.015em] text-[#111111]">
              Obras disponibles
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.6] text-[rgba(35,35,39,.65)]">
              Pintura contemporánea de Jorge España — artista ecuatoriano. Selecciona una obra para conocer sus detalles.
            </p>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="px-6 pb-24 pt-10 md:px-10 xl:px-14 xl:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">

            {/* SIDEBAR */}
            <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[240px] xl:w-[280px]">
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
                  <SidebarSection title="Categoría">
                    {categorias.map((cat) => (
                      <CheckboxRow
                        key={cat}
                        label={cat}
                        checked={selectedCategorias.includes(cat)}
                        onChange={() =>
                          setSelectedCategorias((prev) =>
                            prev.includes(cat)
                              ? prev.filter((c) => c !== cat)
                              : [...prev, cat],
                          )
                        }
                      />
                    ))}
                  </SidebarSection>
                )}

                {tamanos.length > 0 && (
                  <SidebarSection title="Tamaño">
                    {tamanos.map((t) => (
                      <CheckboxRow
                        key={t}
                        label={t}
                        checked={selectedTamanos.includes(t)}
                        onChange={() =>
                          setSelectedTamanos((prev) =>
                            prev.includes(t)
                              ? prev.filter((x) => x !== t)
                              : [...prev, t],
                          )
                        }
                      />
                    ))}
                  </SidebarSection>
                )}

                {minPrice < maxPrice && (
                  <SidebarSection title="Precio">
                    <PriceSlider
                      min={minPrice}
                      max={maxPrice}
                      floor={floor}
                      ceiling={ceiling}
                      onFloorChange={setPriceFloor}
                      onCeilingChange={setPriceCeiling}
                    />
                  </SidebarSection>
                )}
              </div>
            </aside>

            {/* MAIN */}
            <div className="min-w-0 flex-1">
              {/* top bar */}
              <div className="mb-8 flex items-center justify-between border-b border-[rgba(35,35,39,.10)] pb-5">
                <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#C84D92]">
                  {sorted.length} obra{sorted.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-3">
                  <span className="hidden [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)] sm:inline">
                    Orden
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="cursor-pointer bg-transparent text-[13px] text-[#232327] outline-none"
                  >
                    <option>Reciente</option>
                    <option>Precio ↑</option>
                    <option>Precio ↓</option>
                    <option>A–Z</option>
                  </select>
                </div>
              </div>

              {/* grid */}
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
