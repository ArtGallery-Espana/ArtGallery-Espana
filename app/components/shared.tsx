import type {ReactNode} from 'react';
import {Form, Link, NavLink, useLocation} from 'react-router';
import type {CurrencyChoice} from '~/lib/i18n';

type NavItem = {
  label: string;
  to: string;
};

type LanguageItem = {
  label: string;
  value: string;
};

type ContactInfo = {
  email: string;
  whatsapp: string;
  address: string;
};

type TopBarProps = {
  logoText?: string;
  logoSrc?: string;
  navItems?: NavItem[];
  languages?: LanguageItem[];
  currentLanguage?: string;
  currency?: CurrencyChoice;
  cartCount?: number;
  cartHref?: string;
  onLanguageChange?: (language: string) => void;
};

type FooterProps = {
  brandName?: string;
  navItems?: NavItem[];
  contact?: ContactInfo;
  legalItems?: NavItem[];
};

type FooterColumnProps = {
  title: string;
  children: ReactNode;
};

const DEFAULT_NAV_ITEMS = [
  {label: 'Inicio', to: '/'},
  {label: 'El Artista', to: '/pages/artista'},
  {label: 'Catálogo', to: '/collections/all'},
  {label: 'Envios - Pagos', to: '/pages/envios-y-pagos'},
  {label: 'Contacto', to: '/pages/contacto'},
];

const DEFAULT_LANGUAGES = [
  {label: 'ES', value: 'ES'},
  {label: 'EN', value: 'EN'},
];

const DEFAULT_CONTACT = {
  email: 'contacto@galeriatallerjespana.com',
  whatsapp: '+593 000 000 000',
  address: 'Taller Galeria J España',
};

export function TopBar({
  logoText = 'Galeria Taller J España',
  logoSrc = '/logo-j-esparza.svg',
  navItems = DEFAULT_NAV_ITEMS,
  languages = DEFAULT_LANGUAGES,
  currentLanguage = 'ES',
  currency = 'USD',
  cartCount = 0,
  cartHref = '/cart',
  onLanguageChange,
}: TopBarProps) {
  return (
    <header className="shared-topbar">
      <Link className="shared-topbar-logo" to="/" aria-label={logoText}>
        {logoSrc && (
          <img
            className="shared-topbar-logo-image"
            src={logoSrc}
            alt=""
            aria-hidden="true"
          />
        )}
        <span>{logoText}</span>
      </Link>

      <nav className="shared-topbar-nav" aria-label="Navegacion principal">
        {navItems.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            className={({isActive}) =>
              isActive
                ? 'shared-topbar-link shared-topbar-link-active'
                : 'shared-topbar-link'
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="shared-topbar-actions">
        <label className="shared-language">
          <span className="sr-only">Idioma</span>
          <select
            aria-label="Seleccionar idioma"
            value={currentLanguage}
            onChange={(event) => onLanguageChange?.(event.target.value)}
          >
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        <CurrencySelector currency={currency} />

        <Link className="shared-cart-button" to={cartHref} aria-label="Carrito">
          <span>Carrito</span>
          <span className="shared-cart-badge" aria-label={`${cartCount} items`}>
            {cartCount}
          </span>
        </Link>
      </div>
    </header>
  );
}

function CurrencySelector({currency}: {currency: CurrencyChoice}) {
  const location = useLocation();
  const redirectTo = location.pathname + location.search;

  return (
    <Form method="post" action="/currency" className="shared-currency">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        name="currency"
        value="USD"
        aria-pressed={currency === 'USD'}
        className={
          currency === 'USD'
            ? 'shared-currency-option shared-currency-option-active'
            : 'shared-currency-option'
        }
      >
        USD $
      </button>
      <span className="shared-currency-divider" aria-hidden="true">
        |
      </span>
      <button
        type="submit"
        name="currency"
        value="EUR"
        aria-pressed={currency === 'EUR'}
        className={
          currency === 'EUR'
            ? 'shared-currency-option shared-currency-option-active'
            : 'shared-currency-option'
        }
      >
        EUR €
      </button>
    </Form>
  );
}

export function Footer({
  brandName = 'Galeria Taller J España',
  navItems = DEFAULT_NAV_ITEMS,
  contact = DEFAULT_CONTACT,
  legalItems = [
    {label: 'Privacidad', to: '/policies/privacy-policy'},
    {label: 'Devoluciones', to: '/policies/refund-policy'},
    {label: 'Terminos', to: '/policies/terms-of-service'},
  ],
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shared-footer">
      <div className="shared-footer-grid">
        <div>
          <Link className="shared-footer-brand" to="/">
            {brandName}
          </Link>
        </div>

        <FooterColumn title="Navegacion">
          {navItems.map((item) => (
            <Link key={`${item.label}-${item.to}`} to={item.to}>
              {item.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="Contacto">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={`https://wa.me/${formatWhatsapp(contact.whatsapp)}`}>
            {contact.whatsapp}
          </a>
          <p>{contact.address}</p>
        </FooterColumn>

        <FooterColumn title="Legal">
          {legalItems.map((item) => (
            <Link key={`${item.label}-${item.to}`} to={item.to}>
              {item.label}
            </Link>
          ))}
        </FooterColumn>
      </div>

      <p className="shared-footer-copy">
        Copyright {currentYear} {brandName}. Todos los derechos reservados.
      </p>
    </footer>
  );
}

function FooterColumn({title, children}: FooterColumnProps) {
  return (
    <section className="shared-footer-column" aria-labelledby={`footer-${title}`}>
      <h2 id={`footer-${title}`}>{title}</h2>
      <div className="shared-footer-links">{children}</div>
    </section>
  );
}

function formatWhatsapp(value: string) {
  return value.replace(/[^\d]/g, '');
}
