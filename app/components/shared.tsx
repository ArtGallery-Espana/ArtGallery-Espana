import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import {Form, Link, NavLink, useLocation} from 'react-router';
import type {CurrencyChoice} from '~/lib/i18n';
import {SocialLinks} from '~/components/SocialLinks';

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
  emailSecondary?: string;
  whatsapp: string;
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

// Datos de contacto visibles en el footer y la página de Contacto.
// El dominio del email es fijo (verificado en Resend); solo cambia el nombre del remitente.
const DEFAULT_CONTACT = {
  email: 'jespanaa9207@gmail.com',
  emailSecondary: 'maite.guic2@gmail.com',
  whatsapp: '+593 99 807 3728',
};

/**
 * Indica si la página ha hecho scroll más allá de un umbral.
 *
 * Usa histéresis para evitar el titilado (flickering) cuando el usuario
 * frena el scroll cerca del tope:
 *   - El header pasa a "scrolled" (oscuro/comprimido) al superar `enterAt`.
 *   - Solo vuelve a "no scrolled" cuando baja de `leaveAt`.
 * De este modo, entre leaveAt y enterAt el estado no cambia, lo que elimina
 * los cambios rápidos de clase causados por el momentum del scroll.
 */
function useHasScrolled(enterAt = 40, leaveAt = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (prev) return y > leaveAt;   // ya activo: solo desactiva muy cerca del tope
        return y > enterAt;             // inactivo: activa al superar el umbral alto
      });
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, [enterAt, leaveAt]);

  return scrolled;
}

export function TopBar({
  logoText = 'Galería J. España',
  logoSrc = '/logo-j-espana.jpeg',
  navItems = DEFAULT_NAV_ITEMS,
  languages = DEFAULT_LANGUAGES,
  currentLanguage = 'ES',
  currency = 'USD',
  cartCount = 0,
  cartHref = '/cart',
  onLanguageChange,
}: TopBarProps) {
  const scrolled = useHasScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Cierra el menú automáticamente al cambiar de página
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Bloquea el scroll del body mientras el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const headerClass = [
    'shared-topbar',
    scrolled ? 'is-scrolled' : '',
    menuOpen ? 'menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={headerClass}>
        {/* Marca / Logo */}
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

        {/* Navegación principal — solo escritorio */}
        <nav className="shared-topbar-nav" aria-label="Navegación principal">
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

        {/* Utilidades — solo escritorio */}
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

        {/* Acciones móviles: carrito + hamburguesa — solo en móvil */}
        <div className="shared-topbar-mobile-actions">
          <Link className="shared-cart-button" to={cartHref} aria-label="Carrito">
            <span>Carrito</span>
            <span className="shared-cart-badge" aria-label={`${cartCount} items`}>
              {cartCount}
            </span>
          </Link>
          <button
            type="button"
            className="shared-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="shared-mobile-menu"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Menú móvil — panel de pantalla completa */}
      <div
        id="shared-mobile-menu"
        className={`shared-mobile-menu${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Menú de navegación"
      >
        <nav aria-label="Menú móvil">
          {navItems.map((item) => (
            <NavLink
              key={`mob-${item.label}-${item.to}`}
              className={({isActive}) => (isActive ? 'active' : '')}
              to={item.to}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/* Selector de moneda accesible desde el menú móvil */}
        <div className="shared-mobile-menu-footer">
          <CurrencySelector currency={currency} />
        </div>
      </div>
    </>
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
  brandName = 'Galería J. España',
  navItems = DEFAULT_NAV_ITEMS,
  contact = DEFAULT_CONTACT,
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
          {contact.emailSecondary && (
            <a href={`mailto:${contact.emailSecondary}`}>
              {contact.emailSecondary}
            </a>
          )}
          <a href={`https://wa.me/${formatWhatsapp(contact.whatsapp)}`}>
            {contact.whatsapp}
          </a>
        </FooterColumn>

        <FooterColumn title="Redes sociales">
          <SocialLinks />
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
