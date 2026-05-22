import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart: image, title, price, quantity controls and
 * a remove button. Parent lines with child components (warranties, gift
 * wrapping, etc.) render their children nested below.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise, isOptimistic} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-inner">
        {image && (
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
          />
        )}

        <div>
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <p>
              <strong>{product.title}</strong>
            </p>
          </Link>
          <ProductPrice price={line?.cost?.totalAmount} />
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-3">
            <CartQuantityControls line={line} size="sm" />
            <CartLineRemoveButton lineIds={[id]} disabled={!!isOptimistic} />
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * [−] [N] [+] quantity controls, shared by the cart page and the cart drawer.
 * When the decrement would take quantity to 0, the line is removed instead —
 * Shopify's cart API rejects qty=0 on a LinesUpdate. Controls are disabled
 * while the line is still optimistic (server hasn't confirmed the add yet).
 */
export function CartQuantityControls({
  line,
  size = 'md',
}: {
  line: CartLine;
  size?: 'sm' | 'md';
}) {
  const {id, quantity, isOptimistic} = line;
  // `quantityAvailable` is null when inventory tracking is off (unlimited).
  const available = line.merchandise.quantityAvailable;
  const atMax = typeof available === 'number' && quantity >= available;

  const btn =
    (size === 'sm'
      ? 'h-7 w-7 text-[14px]'
      : 'h-8 w-8 text-[15px]') +
    ' flex items-center justify-center border border-[rgba(35,35,39,.25)] leading-none text-[#232327] transition hover:border-[#232327] disabled:cursor-not-allowed disabled:opacity-40';

  const num =
    (size === 'sm' ? 'min-w-[1.5rem] text-[13px]' : 'min-w-[2rem] text-[14px]') +
    ' text-center [font-family:var(--mono)] text-[#232327]';

  return (
    <div className="flex items-center gap-2">
      {quantity <= 1 ? (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesRemove}
          inputs={{lineIds: [id]}}
        >
          <button
            type="submit"
            aria-label="Disminuir cantidad"
            disabled={!!isOptimistic}
            className={btn}
          >
            −
          </button>
        </CartForm>
      ) : (
        <CartForm
          fetcherKey={`qty-${id}`}
          route="/cart"
          action={CartForm.ACTIONS.LinesUpdate}
          inputs={{lines: [{id, quantity: quantity - 1}]}}
        >
          <button
            type="submit"
            aria-label="Disminuir cantidad"
            disabled={!!isOptimistic}
            className={btn}
          >
            −
          </button>
        </CartForm>
      )}

      <span aria-live="polite" className={num}>
        {quantity}
      </span>

      <CartForm
        fetcherKey={`qty-${id}`}
        route="/cart"
        action={CartForm.ACTIONS.LinesUpdate}
        inputs={{lines: [{id, quantity: quantity + 1}]}}
      >
        <button
          type="submit"
          aria-label="Aumentar cantidad"
          disabled={!!isOptimistic || atMax}
          className={btn}
        >
          +
        </button>
      </CartForm>

      {atMax && (
        <span className="ml-1 [font-family:var(--mono)] text-[9px] uppercase tracking-[0.12em] text-[rgba(35,35,39,.45)]">
          Máx. {available}
        </span>
      )}
    </div>
  );
}

/**
 * Removes a line item from the cart. Disabled while the line is still
 * optimistic (the server hasn't confirmed the add yet).
 */
export function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={['remove', ...lineIds].join('-')}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        type="submit"
        disabled={disabled}
        className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#C84D92] underline underline-offset-4 transition hover:text-[#a83c7a] disabled:opacity-40"
      >
        Eliminar
      </button>
    </CartForm>
  );
}
