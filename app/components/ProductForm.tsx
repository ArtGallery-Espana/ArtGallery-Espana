import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

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

                const baseClassName = `inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                  selected
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[rgba(35,35,39,.18)] text-[#232327] hover:border-[#2F9EA0] hover:text-[#2F9EA0]'
                }`;

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={baseClassName}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{opacity: available ? 1 : 0.35}}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={baseClassName}
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
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <AddToCartButton
        className="inline-flex h-[54px] w-full items-center justify-center rounded-[2px] bg-[#111111] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F6F1EA] transition hover:bg-[#2F9EA0] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
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
        {selectedVariant?.availableForSale
          ? 'Comprar · Añadir al carrito'
          : 'Agotado'}
      </AddToCartButton>
    </div>
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
