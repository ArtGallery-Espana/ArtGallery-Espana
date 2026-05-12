import {CartForm, Image, Money, useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const nested = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(nested)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  if (layout === 'page') {
    return <CartPage cart={cart} />;
  }

  // ASIDE layout (drawer) — unchanged
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label="Cart drawer"
    >
      <CartDrawerEmpty hidden={linesCount} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

// ─── PAGE LAYOUT ─────────────────────────────────────────────────────────────

type OptimisticCart = ReturnType<typeof useOptimisticCart<CartApiQueryFragment | null>>;

function CartPage({cart}: {cart: OptimisticCart}) {
  const lines = (cart?.lines?.nodes ?? []).filter(
    (line) =>
      !('parentRelationship' in line && line.parentRelationship?.parent),
  );
  const count = cart?.totalQuantity ?? 0;

  if (count === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 bg-[#F6F1EA] px-6 text-center">
        <div className="flex items-center gap-4">
          <span className="block h-px w-10 bg-[#C84D92]" aria-hidden="true" />
          <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
            Carrito
          </span>
        </div>
        <p className="[font-family:var(--serif)] text-[clamp(2rem,4vw,3rem)] text-[#111111]">
          Su carrito está vacío.
        </p>
        <p className="max-w-[340px] text-[15px] leading-[1.6] text-[rgba(35,35,39,.60)]">
          Explore el catálogo y reserve una obra para su colección.
        </p>
        <Link
          to="/collections/all"
          className="border border-[#232327] px-8 py-4 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[#232327] transition hover:bg-[#232327] hover:text-[#F6F1EA]"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#232327]">

      {/* HERO */}
      <section className="px-6 pb-14 pt-12 md:px-10 xl:px-14 xl:pt-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex items-center gap-4">
            <span className="block h-px w-10 bg-[#C84D92]" aria-hidden="true" />
            <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">
              Carrito&nbsp;·&nbsp;{count} obra{count !== 1 ? 's' : ''} reservada{count !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-16">
            <h1 className="[font-family:var(--serif)] text-[clamp(3rem,7vw,5.5rem)] leading-[1.0] tracking-[-0.02em] text-[#111111] lg:max-w-[55%]">
              Su selección.
            </h1>
            <p className="max-w-[380px] text-[15px] leading-[1.65] text-[rgba(35,35,39,.62)] lg:mb-2 lg:ml-auto">
              Las obras quedan reservadas durante 48 horas mientras decide.
              Puede continuar al checkout, guardar para más tarde o solicitar
              una llamada con el estudio.
            </p>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="px-6 pb-28 md:px-10 xl:px-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-16">

            {/* LEFT — line items */}
            <div className="min-w-0 flex-1">
              <div className="border-t border-[rgba(35,35,39,.12)]">
                {lines.map((line) => (
                  <PageCartLine key={line.id} line={line as CartLine} />
                ))}
              </div>

              {/* bottom bar */}
              <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/collections/all"
                  className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#232327] underline underline-offset-4"
                >
                  ← Seguir explorando el catálogo
                </Link>
                <DiscountCodeForm />
              </div>
            </div>

            {/* RIGHT — summary */}
            <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[380px] xl:w-[420px]">
              <OrderSummary cart={cart} />
            </aside>

          </div>
        </div>
      </section>

    </div>
  );
}

function PageCartLine({line}: {line: CartLine}) {
  const {id, merchandise, isOptimistic} = line;
  const {product, title: variantTitle, image} = merchandise;
  const handle = product.handle;
  const title = product.title;
  const thumb = image ?? product.featuredImage;

  return (
    <div className="border-b border-[rgba(35,35,39,.12)] py-10">
      <div className="flex gap-6 md:gap-10">

        {/* thumbnail */}
        <div className="relative h-[160px] w-[160px] shrink-0 overflow-hidden bg-[#EEE8E1] md:h-[200px] md:w-[200px]">
          {thumb ? (
            <Image
              data={thumb}
              className="h-full w-full object-cover"
              sizes="200px"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,.50)] to-transparent" />
          <span className="absolute bottom-2 left-2 max-w-[55%] [font-family:var(--mono)] text-[8px] uppercase leading-tight tracking-[0.10em] text-white">
            {title}
          </span>
          <span className="absolute bottom-2 right-2 [font-family:var(--mono)] text-[8px] uppercase tracking-[0.10em] text-white">
            {handle.toUpperCase()}
          </span>
        </div>

        {/* details */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-[6px] [font-family:var(--mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.50)]">
                {handle.toUpperCase()}
              </p>
              <h2 className="[font-family:var(--serif)] text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.1] text-[#111111]">
                {title}
              </h2>
              {variantTitle && variantTitle !== 'Default Title' && (
                <p className="mt-1 text-[13px] text-[rgba(35,35,39,.50)]">
                  {variantTitle}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="mb-[5px] [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.45)]">
                Precio
              </p>
              <div className="[font-family:var(--serif)] text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none text-[#111111]">
                <Money data={line.cost.totalAmount} />
              </div>
              <p className="mt-[5px] [font-family:var(--mono)] text-[9px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.40)]">
                Pieza única
              </p>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to={`/products/${handle}`}
              prefetch="intent"
              className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#232327] underline underline-offset-4"
            >
              Ver ficha
            </Link>
            <span className="text-[rgba(35,35,39,.25)]" aria-hidden="true">|</span>
            <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.40)]">
              Guardar para más tarde
            </span>
            <span className="text-[rgba(35,35,39,.25)]" aria-hidden="true">|</span>
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesRemove}
              inputs={{lineIds: [id]}}
            >
              <button
                type="submit"
                disabled={!!isOptimistic}
                className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#C84D92] underline underline-offset-4 disabled:opacity-40"
              >
                Quitar
              </button>
            </CartForm>
          </div>
        </div>

      </div>
    </div>
  );
}

function DiscountCodeForm() {
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.DiscountCodesUpdate}>
      {(fetcher: {state: string}) => (
        <div className="flex items-center gap-3">
          <span className="shrink-0 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(35,35,39,.45)]">
            Código de coleccionista
          </span>
          <input
            name="discountCode"
            type="text"
            placeholder="JE-XXXX"
            className="w-28 border-b border-[rgba(35,35,39,.30)] bg-transparent pb-1 [font-family:var(--mono)] text-[12px] uppercase tracking-[0.10em] placeholder:text-[rgba(35,35,39,.28)] focus:border-[#232327] focus:outline-none"
          />
          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="border border-[#232327] px-4 py-2 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#232327] transition hover:bg-[#232327] hover:text-[#F6F1EA] disabled:opacity-40"
          >
            Aplicar
          </button>
        </div>
      )}
    </CartForm>
  );
}

function OrderSummary({cart}: {cart: OptimisticCart}) {
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;
  const count = cart?.totalQuantity ?? 0;

  return (
    <div>
      <p className="mb-6 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[#C84D92]">
        Resumen del pedido
      </p>

      <div className="space-y-[14px]">
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="text-[rgba(35,35,39,.65)]">
            Subtotal · {count} obra{count !== 1 ? 's' : ''}
          </span>
          {subtotal && <Money data={subtotal} className="text-[#232327]" />}
        </div>
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="text-[rgba(35,35,39,.65)]">Envío DHL · Internacional</span>
          <span className="[font-family:var(--mono)] text-[11px] text-[rgba(35,35,39,.45)]">
            En el checkout
          </span>
        </div>
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="text-[rgba(35,35,39,.65)]">Seguro a valor declarado</span>
          <span className="[font-family:var(--mono)] text-[11px] text-[rgba(35,35,39,.45)]">
            En el checkout
          </span>
        </div>
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="text-[rgba(35,35,39,.65)]">Impuestos (exento · obra de arte)</span>
          <span className="text-[#232327]">USD 0</span>
        </div>
      </div>

      <div className="my-6 border-t border-[rgba(35,35,39,.12)]" />

      <div className="flex items-end justify-between">
        <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
          Total estimado
        </span>
        {subtotal && (
          <Money
            data={subtotal}
            className="[font-family:var(--serif)] text-[2.6rem] leading-none text-[#111111]"
          />
        )}
      </div>

      <div className="my-6 border-t border-[rgba(35,35,39,.12)]" />

      <a
        href={checkoutUrl ?? '#'}
        className="block w-full bg-[#232327] py-5 text-center [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-[#111111]"
      >
        Continuar al checkout
      </a>

      <div className="my-5 border-t border-[rgba(35,35,39,.10)]" />

      <Link
        to="/pages/contacto"
        className="block text-center [font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:text-[#2F9EA0]"
      >
        Solicitar llamada con el estudio →
      </Link>

      <div className="my-6 border-t border-[rgba(35,35,39,.10)]" />

      <ul className="space-y-5">
        {[
          {
            title: 'Reserva por 48h',
            desc: 'Sus obras se mantienen apartadas mientras decide.',
          },
          {
            title: 'Pago seguro Shopify',
            desc: '3D Secure, encriptación punto a punto.',
          },
          {
            title: 'Devolución 14 días',
            desc: 'Reembolso completo desde la entrega.',
          },
        ].map(({title, desc}) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#2F9EA0]" />
            <div>
              <p className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.12em] text-[#232327]">
                {title}
              </p>
              <p className="mt-[3px] text-[13px] leading-[1.5] text-[rgba(35,35,39,.58)]">
                {desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── ASIDE EMPTY STATE ────────────────────────────────────────────────────────

function CartDrawerEmpty({hidden = false}: {hidden: boolean}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>El carrito está vacío.</p>
      <br />
      <Link to="/collections/all" onClick={close} prefetch="viewport">
        Explorar catálogo →
      </Link>
    </div>
  );
}
