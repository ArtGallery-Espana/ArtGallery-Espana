import {useState, useEffect} from 'react';
import {CartForm, Image, Money, useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';
export type CartMainProps = {cart: CartApiQueryFragment | null; layout: CartLayout};
export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

// ─── Save-for-later helpers ───────────────────────────────────────────────────

type SavedItem = {
  merchandiseId: string;
  quantity: number;
  productHandle: string;
  productTitle: string;
  imageUrl?: string;
  imageAlt?: string;
  variantTitle?: string;
  priceAmount: string;
  priceCurrencyCode: string;
};

const SAVED_KEY = 'cart-saved-items';
const SHIP = 480;
const INS = 331;

function readSaved(): SavedItem[] {
  try {
    const s = typeof window !== 'undefined' ? localStorage.getItem(SAVED_KEY) : null;
    return s ? (JSON.parse(s) as SavedItem[]) : [];
  } catch {
    return [];
  }
}
function writeSaved(items: SavedItem[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  } catch {}
}

// ─── Child-map ────────────────────────────────────────────────────────────────

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const result: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const pid = line.parentRelationship.parent.id;
      if (!result[pid]) result[pid] = [];
      result[pid].push(line);
    }
    if ('lineComponents' in line) {
      const nested = getLineItemChildrenMap(line.lineComponents);
      for (const [pid, kids] of Object.entries(nested)) {
        if (!result[pid]) result[pid] = [];
        result[pid].push(...kids);
      }
    }
  }
  return result;
}

type OptCart = ReturnType<typeof useOptimisticCart<CartApiQueryFragment | null>>;

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  if (layout === 'page') return <CartPage cart={cart} />;

  // aside drawer (unchanged)
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart && Boolean(cart?.discountCodes?.filter((c) => c.applicable)?.length);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section className={`cart-main ${withDiscount ? 'with-discount' : ''}`} aria-label="Cart drawer">
      <DrawerEmpty hidden={linesCount} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">Line items</p>
        <ul aria-labelledby="cart-lines">
          {(cart?.lines?.nodes ?? []).map((line) => {
            if ('parentRelationship' in line && line.parentRelationship?.parent) return null;
            return <CartLineItem key={line.id} line={line} layout={layout} childrenMap={childrenMap} />;
          })}
        </ul>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

// ─── Page cart ────────────────────────────────────────────────────────────────

function CartPage({cart}: {cart: OptCart}) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // hydrate from localStorage (client only)
  useEffect(() => { setSavedItems(readSaved()); }, []);

  const activeLines = (cart?.lines?.nodes ?? []).filter(
    (l) => !('parentRelationship' in l && l.parentRelationship?.parent),
  ) as CartLine[];

  const activeCount = cart?.totalQuantity ?? 0;

  // ── When an item reappears in the active cart, remove it from saved ──────────
  useEffect(() => {
    if (savedItems.length === 0) return;
    const activeIds = new Set(activeLines.map((l) => l.merchandise.id));
    const stillSaved = savedItems.filter((s) => !activeIds.has(s.merchandiseId));
    if (stillSaved.length !== savedItems.length) {
      setSavedItems(stillSaved);
      writeSaved(stillSaved);
    }
  }, [activeLines]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave(line: CartLine) {
    const {merchandise} = line;
    const item: SavedItem = {
      merchandiseId: merchandise.id,
      quantity: line.quantity,
      productHandle: merchandise.product.handle,
      productTitle: merchandise.product.title,
      imageUrl: merchandise.image?.url ?? merchandise.product.featuredImage?.url,
      imageAlt: merchandise.image?.altText ?? undefined,
      variantTitle: merchandise.title !== 'Default Title' ? merchandise.title : undefined,
      priceAmount: merchandise.price.amount,
      priceCurrencyCode: merchandise.price.currencyCode,
    };
    const updated = [...savedItems.filter((s) => s.merchandiseId !== item.merchandiseId), item];
    setSavedItems(updated);
    writeSaved(updated);
  }

  // Empty state
  if (activeCount === 0 && savedItems.length === 0) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-8 bg-[#F6F1EA] px-6 text-center">
        <div className="flex items-center gap-4">
          <span className="block h-px w-10 bg-[#C84D92]" aria-hidden="true" />
          <span className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.55)]">Carrito</span>
        </div>
        <p className="[font-family:var(--serif)] text-[clamp(2rem,4vw,3rem)] text-[#111111]">Su carrito está vacío.</p>
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
              Carrito · {activeCount} obra{activeCount !== 1 ? 's' : ''} reservada{activeCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-20">
            <h1 className="[font-family:var(--serif)] text-[clamp(3rem,7vw,5.5rem)] leading-[1.0] tracking-[-0.02em] text-[#111111]">
              Su selección.
            </h1>
            <p className="max-w-[380px] text-[15px] leading-[1.65] text-[rgba(35,35,39,.62)] lg:ml-auto lg:pt-4">
              Las obras quedan reservadas durante 48 horas mientras decide.
              Puede continuar al checkout, guardar para más tarde o solicitar una llamada con el estudio.
            </p>
          </div>
        </div>
      </section>

      {/* BODY: two-column */}
      <section className="px-6 pb-28 md:px-10 xl:px-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-12">

            {/* LEFT — items list */}
            <div className="min-w-0 flex-1">

              {/* active items */}
              {activeLines.length > 0 && (
                <div className="border-t border-[rgba(35,35,39,.12)]">
                  {activeLines.map((line) => (
                    <ActiveLine key={line.id} line={line} onSave={() => handleSave(line)} />
                  ))}
                </div>
              )}

              {/* saved for later */}
              {savedItems.length > 0 && (
                <div className="mt-12">
                  <p className="mb-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.22em] text-[rgba(35,35,39,.38)]">
                    Guardado para más tarde
                  </p>
                  <div className="border-t border-[rgba(35,35,39,.08)]">
                    {savedItems.map((item) => (
                      <SavedLine key={item.merchandiseId} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* bottom bar */}
              <div className="mt-10 flex flex-col gap-6 border-t border-[rgba(35,35,39,.10)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/collections/all"
                  className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#232327] underline underline-offset-4"
                >
                  ← Seguir explorando el catálogo
                </Link>
                <DiscountForm />
              </div>
            </div>

            {/* RIGHT — order summary (sticky) */}
            <div className="w-full shrink-0 lg:sticky lg:top-8 lg:w-[340px] xl:w-[380px]">
              <OrderSummary cart={cart} activeCount={activeCount} />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Active line item ─────────────────────────────────────────────────────────

function ActiveLine({line, onSave}: {line: CartLine; onSave: () => void}) {
  const {id, merchandise, isOptimistic} = line;
  const {product, title: variantTitle, image} = merchandise;
  const thumb = image ?? product.featuredImage;

  return (
    <div className="border-b border-[rgba(35,35,39,.12)] py-10">
      <div className="flex gap-6 md:gap-8">

        {/* thumbnail */}
        <div className="relative h-[160px] w-[160px] shrink-0 overflow-hidden bg-[#EEE8E1] md:h-[190px] md:w-[190px]">
          {thumb && <Image data={thumb} className="h-full w-full object-cover" sizes="190px" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,.50)] to-transparent" />
          <span className="absolute bottom-2 left-2 max-w-[55%] [font-family:var(--mono)] text-[8px] uppercase leading-tight tracking-[0.10em] text-white">
            {product.title}
          </span>
          <span className="absolute bottom-2 right-2 [font-family:var(--mono)] text-[8px] uppercase tracking-[0.10em] text-white">
            {product.handle.toUpperCase()}
          </span>
        </div>

        {/* info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.50)]">
                {product.handle.toUpperCase()}
              </p>
              <h2 className="[font-family:var(--serif)] text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.1] text-[#111111]">
                {product.title}
              </h2>
              {variantTitle && variantTitle !== 'Default Title' && (
                <p className="mt-1 text-[13px] text-[rgba(35,35,39,.50)]">{variantTitle}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="mb-1 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.45)]">
                Precio
              </p>
              <div className="[font-family:var(--serif)] text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none text-[#111111]">
                <Money data={line.cost.totalAmount} />
              </div>
              <p className="mt-1 [font-family:var(--mono)] text-[9px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.40)]">
                Pieza única
              </p>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#232327] underline underline-offset-4"
            >
              Ver ficha
            </Link>
            <span className="text-[rgba(35,35,39,.22)]">|</span>
            {/* Save: updates localStorage first, then removes from cart */}
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds: [id]}}>
              <button
                type="submit"
                disabled={!!isOptimistic}
                onClick={onSave}
                className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)] underline underline-offset-4 disabled:opacity-40"
              >
                Guardar para más tarde
              </button>
            </CartForm>
            <span className="text-[rgba(35,35,39,.22)]">|</span>
            {/* Remove entirely */}
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds: [id]}}>
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

// ─── Saved line item ──────────────────────────────────────────────────────────
// NOTE: onAddBack is NOT called onClick — the useEffect in CartPage handles
// cleanup once the item is confirmed back in the active cart. This prevents
// the component from unmounting before the CartForm can submit.

function SavedLine({item}: {item: SavedItem}) {
  const priceData = {amount: item.priceAmount, currencyCode: item.priceCurrencyCode};

  return (
    <div className="border-b border-[rgba(35,35,39,.08)] py-8 opacity-60">
      <div className="flex gap-6">
        <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden bg-[#EEE8E1]">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.imageAlt ?? item.productTitle} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,.40)] to-transparent" />
          <span className="absolute bottom-2 right-2 [font-family:var(--mono)] text-[7px] uppercase tracking-[0.10em] text-white">
            {item.productHandle.toUpperCase()}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[rgba(35,35,39,.40)]">
                {item.productHandle.toUpperCase()}
              </p>
              <h3 className="[font-family:var(--serif)] text-[1.25rem] leading-[1.1] text-[#111111]">
                {item.productTitle}
              </h3>
              {item.variantTitle && (
                <p className="mt-1 text-[13px] text-[rgba(35,35,39,.40)]">{item.variantTitle}</p>
              )}
            </div>
            <div className="[font-family:var(--serif)] text-[1.2rem] leading-none text-[rgba(35,35,39,.50)]">
              <Money data={priceData} />
            </div>
          </div>
          {/* Add back: submits LinesAdd, useEffect removes from saved once confirmed */}
          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesAdd}
            inputs={{lines: [{merchandiseId: item.merchandiseId, quantity: item.quantity}]}}
          >
            <button
              type="submit"
              className="mt-4 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[#2F9EA0] underline underline-offset-4"
            >
              Agregar a la compra
            </button>
          </CartForm>
        </div>
      </div>
    </div>
  );
}

// ─── Discount code form ───────────────────────────────────────────────────────

function DiscountForm() {
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

// ─── Order summary sidebar ────────────────────────────────────────────────────

function OrderSummary({cart, activeCount}: {cart: OptCart; activeCount: number}) {
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  const subtotalVal = parseFloat(subtotal?.amount ?? '0');
  const totalEst = subtotalVal + SHIP + INS;

  const currency = subtotal?.currencyCode ?? 'USD';
  const fmtAmt = (n: number) =>
    new Intl.NumberFormat('en-US', {style: 'currency', currency, minimumFractionDigits: 0}).format(n);

  return (
    <div className="border border-[rgba(35,35,39,.12)] bg-white p-8">

      <p className="mb-6 [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-[#C84D92]">
        Resumen del pedido
      </p>

      <div className="space-y-[14px] text-[14px]">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[rgba(35,35,39,.65)]">
            Subtotal · {activeCount} obra{activeCount !== 1 ? 's' : ''}
          </span>
          <span className="shrink-0 text-[#232327]">
            {subtotal ? <Money data={subtotal} /> : '—'}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[rgba(35,35,39,.65)]">Envío DHL · Internacional</span>
          <span className="shrink-0 text-[#232327]">USD {SHIP}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[rgba(35,35,39,.65)]">Seguro a valor declarado</span>
          <span className="shrink-0 text-[#232327]">USD {INS}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[rgba(35,35,39,.65)]">Impuestos (exento · obra de arte)</span>
          <span className="shrink-0 text-[#232327]">USD 0</span>
        </div>
      </div>

      <div className="my-6 border-t border-[rgba(35,35,39,.12)]" />

      <div className="flex items-end justify-between">
        <span className="[font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
          Total estimado
        </span>
        <span className="[font-family:var(--serif)] text-[2.4rem] leading-none text-[#111111]">
          {fmtAmt(totalEst)}
        </span>
      </div>

      <div className="my-6 border-t border-[rgba(35,35,39,.12)]" />

      <a
        href={checkoutUrl ?? '#'}
        className="block w-full bg-[#232327] py-[18px] text-center [font-family:var(--mono)] text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-[#111111]"
      >
        Continuar al checkout
      </a>

      <div className="my-5 border-t border-[rgba(35,35,39,.08)]" />

      <Link
        to="/pages/contacto"
        className="block text-center [font-family:var(--mono)] text-[11px] uppercase tracking-[0.18em] text-[#232327] transition hover:text-[#2F9EA0]"
      >
        Solicitar llamada con el estudio →
      </Link>

      <div className="my-6 border-t border-[rgba(35,35,39,.08)]" />

      <ul className="space-y-5">
        {[
          {title: 'Reserva por 48h', desc: 'Sus obras se mantienen apartadas mientras decide.'},
          {title: 'Pago seguro Shopify', desc: '3D Secure, encriptación punto a punto.'},
          {title: 'Devolución 14 días', desc: 'Reembolso completo desde la entrega.'},
        ].map(({title, desc}) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#2F9EA0]" />
            <div>
              <p className="[font-family:var(--mono)] text-[11px] uppercase tracking-[0.12em] text-[#232327]">{title}</p>
              <p className="mt-[3px] text-[13px] leading-[1.5] text-[rgba(35,35,39,.58)]">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Aside empty ──────────────────────────────────────────────────────────────

function DrawerEmpty({hidden = false}: {hidden: boolean}) {
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
