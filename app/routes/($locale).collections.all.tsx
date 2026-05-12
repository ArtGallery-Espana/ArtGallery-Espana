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

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-[14px] [font-family:var(--mono)] text-[10px] uppercase tracking-[0.2em] text-[rgba(35,35,39,.55)]">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`inline-flex items-center rounded-full border px-[11px] py-[5px] [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.16em] transition ${
              value === o
                ? 'border-[#2F9EA0] bg-[rgba(47,158,160,.06)] text-[#2F9EA0]'
                : 'border-[rgba(35,35,39,.15)] text-[rgba(35,35,39,.72)] hover:border-[#2F9EA0] hover:text-[#2F9EA0]'
            }`}
          >
            {o}
          </button>
        ))}
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
            sizes="(min-width: 1200px) 380px, (min-width: 768px) 50vw, 100vw"
          />
        ) : null}
        {consultar && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-full border border-[#C84D92] px-[11px] py-[5px] [font-family:var(--mono)] text-[9.5px] uppercase tracking-[0.16em] text-[#C84D92]">
              En consulta
            </span>
          </div>
        )}
      </div>

      <div className="pt-5">
        <div className="mb-[6px] flex items-baseline justify-between">
          <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
            {product.handle.toUpperCase()}
            {year ? ` · ${year}` : ''}
          </span>
          {product.productType ? (
            <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.55)]">
              {product.productType}
            </span>
          ) : null}
        </div>

        <h2 className="[font-family:var(--serif)] text-[24px] leading-[1.15] text-[#111111] transition group-hover:text-[#2F9EA0]">
          {product.title}
        </h2>

        {(product.ancho?.value || product.alto?.value) && (
          <div className="mt-[6px] text-[13px] text-[rgba(35,35,39,.72)]">
            {[product.ancho?.value, product.alto?.value]
              .filter(Boolean)
              .join(' × ')}{' '}
            cm
          </div>
        )}

        <div
          className={`mt-[10px] text-[14px] ${consultar ? 'text-[#C84D92]' : 'text-[#111111]'}`}
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

  const [cat, setCat] = useState('Todas');
  const [precio, setPrecio] = useState('Todos');
  const [tamano, setTamano] = useState('Todos');
  const [sort, setSort] = useState('Recientes');

  const enriched = useMemo<EnrichedProduct[]>(
    () =>
      products.map((p) => ({
        ...p,
        tamano: computeTamano(p.alto?.value, p.ancho?.value),
        priceVal: parseFloat(p.priceRange.minVariantPrice.amount),
      })),
    [products],
  );

  const cats = useMemo(() => {
    const unique = [
      ...new Set(enriched.map((p) => p.productType).filter(Boolean)),
    ];
    return ['Todas', ...unique.sort()];
  }, [enriched]);

  const tamanos = useMemo(() => {
    const order = ['S', 'M', 'L', 'XL'];
    const unique = [
      ...new Set(enriched.map((p) => p.tamano).filter(Boolean)),
    ];
    return ['Todos', ...unique.sort((a, b) => order.indexOf(a) - order.indexOf(b))];
  }, [enriched]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (cat !== 'Todas') result = result.filter((p) => p.productType === cat);
    if (tamano !== 'Todos') result = result.filter((p) => p.tamano === tamano);
    if (precio === 'Hasta 5.000')
      result = result.filter((p) => p.priceVal > 0 && p.priceVal <= 5000);
    else if (precio === '5.000 — 15.000')
      result = result.filter(
        (p) => p.priceVal >= 5000 && p.priceVal <= 15000,
      );
    else if (precio === '+15.000')
      result = result.filter((p) => p.priceVal > 15000);
    else if (precio === 'Consultar')
      result = result.filter((p) => p.priceVal === 0);
    return result;
  }, [enriched, cat, tamano, precio]);

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

  function clearFilters() {
    setCat('Todas');
    setPrecio('Todos');
    setTamano('Todos');
  }

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">
      {/* HERO */}
      <section className="px-6 pb-0 pt-10 md:px-10 xl:px-14 xl:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="pt-6">
            <div className="mb-9 flex items-center gap-[14px] [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[#C84D92]">
              <span className="h-px w-6 bg-[#C84D92] opacity-80 inline-block" />
              Catálogo · {products.length} obras disponibles
            </div>
            <div className="grid items-end gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
              <h1 className="[font-family:var(--serif)] text-[clamp(56px,6.5vw,96px)] leading-[.98] text-[#111111]">
                Obras disponibles
                <br />
                <span className="italic text-[rgba(35,35,39,.55)]">
                  Mayo 2026.
                </span>
              </h1>
              <p className="max-w-[42ch] text-[15px] leading-[1.7] text-[rgba(35,35,39,.72)]">
                El catálogo se actualiza el primer lunes de cada mes. Para obras
                que ya no aparecen, escribir al estudio: en muchos casos
                permanecen disponibles bajo consulta directa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="mt-[80px] px-6 md:px-10 xl:mt-[120px] xl:px-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap items-end gap-8 border-b border-[rgba(35,35,39,.12)] border-t border-[#232327] py-7 lg:gap-12">
            <FilterGroup
              label="Categoría"
              value={cat}
              options={cats}
              onChange={setCat}
            />
            {tamanos.length > 1 && (
              <FilterGroup
                label="Tamaño"
                value={tamano}
                options={tamanos}
                onChange={setTamano}
              />
            )}
            <FilterGroup
              label="Precio"
              value={precio}
              options={[
                'Todos',
                'Hasta 5.000',
                '5.000 — 15.000',
                '+15.000',
                'Consultar',
              ]}
              onChange={setPrecio}
            />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.2em] text-[rgba(35,35,39,.55)]">
                Orden
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-[13px] text-[#232327] tracking-[0.02em] outline-none cursor-pointer"
              >
                <option>Recientes</option>
                <option>Precio ↑</option>
                <option>Precio ↓</option>
                <option>A–Z</option>
              </select>
            </div>
            <div className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#C84D92]">
              {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="px-6 pb-24 pt-16 md:px-10 xl:px-14 xl:pb-32 xl:pt-20">
        <div className="mx-auto max-w-[1200px]">
          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-12 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
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
