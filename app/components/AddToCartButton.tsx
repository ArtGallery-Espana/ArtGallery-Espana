import {type FetcherWithComponents} from 'react-router';
import * as React from 'react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  className,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const form = buttonRef.current?.closest('form');
    if (!form) return;
    const syncWidth = () => {
      const parentWidth = form.parentElement?.getBoundingClientRect().width;
      form.style.display = 'block';
      if (parentWidth) {
        form.style.width = `${parentWidth}px`;
        if (buttonRef.current) {
          buttonRef.current.style.width = `${parentWidth}px`;
        }
      } else {
        form.style.width = '100%';
        if (buttonRef.current) {
          buttonRef.current.style.width = '100%';
        }
      }
    };

    syncWidth();
    window.addEventListener('resize', syncWidth);

    return () => window.removeEventListener('resize', syncWidth);
  }, []);

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            className={className}
            ref={buttonRef}
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}
