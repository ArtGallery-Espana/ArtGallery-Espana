import * as React from 'react';
import {useFetcher} from 'react-router';

const formFieldBaseClass =
  'w-full rounded-[2px] !border !border-[rgba(35,35,39,.14)] bg-white px-4 text-[14px] text-[#111111] outline-none transition placeholder:text-[rgba(35,35,39,.42)] focus:!border-[#2F9EA0]';

const formInputClass = `${formFieldBaseClass} h-[54px] !mt-0 !mb-0 !py-0`;
const formTextareaClass = `${formFieldBaseClass} min-h-[100px] !mt-0 !mb-0 py-3`;

type OfferFieldErrors = Partial<
  Record<'name' | 'email' | 'quantity' | 'offer' | 'product_id' | 'variant_id', string>
>;

type OfferActionData = {
  status: 'success' | 'error';
  message: string;
  fieldErrors?: OfferFieldErrors;
  values?: {
    name: string;
    email: string;
    quantity: string;
    offer: string;
    message: string;
  };
};

type ProductImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type MoneyValue = {
  amount: string;
  currencyCode: string;
};

type ProductOfferFormProps = {
  compareAtPrice?: MoneyValue | null;
  currency: string;
  maxQuantity?: number | null;
  onSuccess?: (email: string) => void;
  price: MoneyValue;
  productId: string;
  productImage?: ProductImage | null;
  productTitle: string;
  variantId?: string | null;
  variantTitle?: string | null;
};

export function ProductOfferForm({
  compareAtPrice,
  currency,
  maxQuantity,
  onSuccess,
  price,
  productId,
  productImage,
  productTitle,
  variantId,
  variantTitle,
}: ProductOfferFormProps) {
  const fetcher = useFetcher<OfferActionData>();
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const isSubmitting = fetcher.state !== 'idle';
  const fieldErrors = fetcher.data?.status === 'error' ? fetcher.data.fieldErrors : undefined;
  const hasVariantError = Boolean(fieldErrors?.product_id || fieldErrors?.variant_id);

  const [offerAmount, setOfferAmount] = React.useState(
    fetcher.data?.values?.offer ?? '',
  );
  const [quantity, setQuantity] = React.useState(
    parseInt(fetcher.data?.values?.quantity ?? '1', 10),
  );
  const [email, setEmail] = React.useState(fetcher.data?.values?.email ?? '');

  const referencePrice = compareAtPrice ?? price;
  const referencePriceNum = parseFloat(referencePrice.amount);
  const offerNum = parseFloat(offerAmount);

  const fmt = (amount: string, currencyCode: string) =>
    new Intl.NumberFormat('es-ES', {style: 'currency', currency: currencyCode}).format(
      parseFloat(amount),
    );

  const quantityError =
    maxQuantity != null && quantity > maxQuantity
      ? `Solo tenemos ${maxQuantity} ${maxQuantity === 1 ? 'unidad disponible' : 'unidades disponibles'}`
      : null;

  const offerError =
    offerNum > 0 && offerNum >= referencePriceNum
      ? `La oferta debe ser menor al precio del producto`
      : null;

  const discountPct =
    !isNaN(offerNum) && offerNum > 0 && referencePriceNum > 0
      ? ((referencePriceNum - offerNum) / referencePriceNum) * 100
      : null;

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.status === 'success') {
      onSuccess?.(email);
      formRef.current?.reset();
      setOfferAmount('');
      setQuantity(1);
      setEmail('');
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_220px]">
      {/* ── Left: form ── */}
      <div>
        <fetcher.Form className="space-y-4" method="post" ref={formRef}>
          <input name="product_id" type="hidden" value={productId} />
          <input name="variant_id" type="hidden" value={variantId ?? ''} />
          <input name="product_title" type="hidden" value={productTitle} />
          <input name="variant_title" type="hidden" value={variantTitle ?? ''} />
          <input name="currency" type="hidden" value={currency} />

          <FormField
            autoComplete="name"
            defaultValue={fetcher.data?.values?.name ?? ''}
            error={fieldErrors?.name}
            id="offer-name"
            label="Nombre"
            name="name"
            placeholder="Tu nombre"
            type="text"
          />

          <div>
            <label
              className="mb-2 block [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]"
              htmlFor="offer-email"
            >
              Email
            </label>
            <input
              aria-describedby={fieldErrors?.email ? 'offer-email-error' : undefined}
              aria-invalid={fieldErrors?.email ? true : undefined}
              autoComplete="email"
              className={formInputClass}
              id="offer-email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              type="email"
              value={email}
            />
            {fieldErrors?.email ? (
              <p className="mt-2 text-[12px] text-[#B2437D]" id="offer-email-error">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]"
                htmlFor="offer-quantity"
              >
                Cantidad
                {maxQuantity != null ? (
                  <span className="ml-1 normal-case tracking-normal opacity-60">
                    (máx. {maxQuantity})
                  </span>
                ) : null}
              </label>
              <input
                aria-describedby={
                  quantityError ?? fieldErrors?.quantity ? 'offer-quantity-error' : undefined
                }
                aria-invalid={quantityError ?? fieldErrors?.quantity ? true : undefined}
                className={`${formInputClass} ${
                  quantityError ?? fieldErrors?.quantity
                    ? '!border-[#C84D92]'
                    : ''
                }`}
                id="offer-quantity"
                inputMode="numeric"
                max={maxQuantity ?? undefined}
                min={1}
                name="quantity"
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                step={1}
                type="number"
                value={quantity}
              />
              {(quantityError ?? fieldErrors?.quantity) ? (
                <p className="mt-2 text-[12px] text-[#B2437D]" id="offer-quantity-error">
                  {quantityError ?? fieldErrors?.quantity}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-2 block [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]"
                htmlFor="offer-amount"
              >
                {`Oferta (${currency})`}
              </label>
              <input
                aria-describedby={
                  offerError ?? fieldErrors?.offer ? 'offer-amount-error' : undefined
                }
                aria-invalid={offerError ?? fieldErrors?.offer ? true : undefined}
                className={`${formInputClass} ${
                  offerError ?? fieldErrors?.offer
                    ? '!border-[#C84D92]'
                    : ''
                }`}
                defaultValue={fetcher.data?.values?.offer ?? ''}
                id="offer-amount"
                inputMode="decimal"
                min={0.01}
                name="offer"
                onChange={(e) => setOfferAmount(e.target.value)}
                step="0.01"
                type="number"
              />
              {(offerError ?? fieldErrors?.offer) ? (
                <p className="mt-2 text-[12px] text-[#B2437D]" id="offer-amount-error">
                  {offerError ?? fieldErrors?.offer}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              className="mb-2 block [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]"
              htmlFor="offer-message"
            >
              Mensaje
            </label>
            <textarea
              className={formTextareaClass}
              defaultValue={fetcher.data?.values?.message ?? ''}
              id="offer-message"
              name="message"
              placeholder="Cuéntanos algún detalle adicional sobre tu oferta."
            />
          </div>

          {hasVariantError ? (
            <p className="rounded-[2px] border border-[#C84D92]/30 bg-[#C84D92]/8 px-4 py-3 text-[13px] text-[#7A2551]">
              {fieldErrors?.variant_id || fieldErrors?.product_id}
            </p>
          ) : null}

          {fetcher.data?.message && fetcher.data.status !== 'success' ? (
            <p className="rounded-[2px] border border-[#C84D92]/30 bg-[#C84D92]/8 px-4 py-3 text-[13px] text-[#7A2551]">
              {fetcher.data.message}
            </p>
          ) : null}

          <button
            className="inline-flex h-[54px] w-full items-center justify-center rounded-[2px] bg-[#2F9EA0] px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#247D7F] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting || !variantId || Boolean(quantityError) || Boolean(offerError)}
            type="submit"
          >
            {isSubmitting ? 'Enviando oferta…' : 'Enviar oferta'}
          </button>
        </fetcher.Form>
      </div>

      {/* ── Right: product preview ── */}
      {productImage ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full overflow-hidden rounded-[2px] border border-[rgba(35,35,39,.10)] bg-white">
            <img
              alt={productImage.altText ?? productTitle}
              className="h-auto w-full object-cover"
              height={productImage.height ?? undefined}
              src={productImage.url}
              width={productImage.width ?? undefined}
            />
          </div>

          <div className="w-full text-center">
            <p className="mb-1 [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]">
              {productTitle}
            </p>

            {compareAtPrice ? (
              <p className="text-[13px] text-[rgba(35,35,39,.42)] line-through">
                {fmt(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </p>
            ) : null}

            <p className="text-[14px] font-medium text-[#232327]">
              {fmt(price.amount, price.currencyCode)}
            </p>

            {discountPct !== null ? (
              <p className="mt-2 text-[12px] text-[#2F9EA0]">
                Tu oferta: {fmt(String(offerNum), currency)}
                <br />
                <span className="font-medium">
                  {discountPct > 0
                    ? `${discountPct.toFixed(1)}% de descuento`
                    : discountPct < 0
                      ? `${Math.abs(discountPct).toFixed(1)}% sobre el precio`
                      : 'Sin descuento'}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type FormFieldProps = {
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  id: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  label: string;
  min?: number;
  name: string;
  placeholder?: string;
  step?: number | string;
  type: React.HTMLInputTypeAttribute;
};

function FormField({
  autoComplete,
  defaultValue,
  error,
  id,
  inputMode,
  label,
  min,
  name,
  placeholder,
  step,
  type,
}: FormFieldProps) {
  return (
    <div>
      <label
        className="mb-2 block [font-family:var(--mono)] text-[10px] uppercase tracking-[0.18em] text-[rgba(35,35,39,.55)]"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        className={formInputClass}
        defaultValue={defaultValue}
        id={id}
        inputMode={inputMode}
        min={min}
        name={name}
        placeholder={placeholder}
        step={step}
        type={type}
      />
      {error ? (
        <p className="mt-2 text-[12px] text-[#B2437D]" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
