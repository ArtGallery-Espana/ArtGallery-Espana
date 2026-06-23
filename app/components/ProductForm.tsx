import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';

export function ProductForm({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        // Se activa el selector de color cuando los valores traen swatch
        // (color o imagen) desde Shopify. El resto de opciones (p. ej. tamaño)
        // se muestran como botones de texto.
        const isColorOption = option.optionValues.some(
          (value) => value.swatch?.color || value.swatch?.image,
        );

        return (
          <div key={option.name}>
            <h5 className="mb-3 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
              {option.name}
            </h5>
            <div className="flex flex-wrap gap-3">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const inner = isColorOption ? (
                  <ColorSwatch swatch={swatch} name={name} selected={selected} />
                ) : (
                  <ProductOptionSwatch swatch={swatch} name={name} />
                );

                const className = isColorOption
                  ? 'inline-flex flex-col items-center gap-2 bg-transparent'
                  : `inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                      selected
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[rgba(35,35,39,.18)] text-[#232327] hover:border-[#2F9EA0] hover:text-[#2F9EA0]'
                    }`;

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={className}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{opacity: available ? 1 : 0.35}}
                    >
                      {inner}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={className}
                    key={option.name + name}
                    style={{opacity: available ? 1 : 0.35}}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Swatch grande para el selector de color de las esculturas. Muestra el color
// (o la foto de la variante cuando esté disponible) y el nombre debajo, con un
// anillo cuando está seleccionado. Queda listo para cuando se carguen colores y
// fotos finales en Shopify.
function ColorSwatch({
  swatch,
  name,
  selected,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
  selected: boolean;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  return (
    <>
      <span
        aria-hidden
        title={name}
        className={`h-9 w-9 overflow-hidden rounded-full border transition ${
          selected
            ? 'border-[#111111] ring-2 ring-[#111111] ring-offset-2 ring-offset-[#F6F1EA]'
            : 'border-[rgba(35,35,39,.20)] hover:border-[#2F9EA0]'
        }`}
        style={{backgroundColor: color || 'transparent'}}
      >
        {!!image && (
          <img alt="" className="h-full w-full object-cover" src={image} />
        )}
      </span>
      <span
        className={`[font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] ${
          selected ? 'text-[#111111]' : 'text-[rgba(35,35,39,.55)]'
        }`}
      >
        {name}
      </span>
    </>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <span>{name}</span>;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="h-4 w-4 overflow-hidden rounded-full border border-[rgba(35,35,39,.12)]"
        style={{backgroundColor: color || 'transparent'}}
      >
        {!!image && (
          <img alt="" className="h-full w-full object-cover" src={image} />
        )}
      </span>
      <span>{name}</span>
    </span>
  );
}
