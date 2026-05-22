/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

import type {HydrogenEnv} from '@shopify/hydrogen';

/**
 * Extiende el tipo global `Env` de Hydrogen con las variables propias del
 * proyecto. Toda nueva variable consumida desde loaders/actions debe
 * declararse aquí para tener autocompletado y typecheck en context.env.
 */
declare global {
  interface Env extends HydrogenEnv {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    // Flujo de ofertas (PR #11)
    OFFERS_APP_URL: string;
    OFFERS_APP_TOKEN: string;
    OFFERS_SHOP_DOMAIN: string;
    // Resend: usado tanto por el formulario de contacto (contact.server.ts)
    // como por la consulta de obra del PDP (lib/resend.ts).
    RESEND_API_KEY: string;
    CONTACT_FROM_EMAIL: string;
    CONTACT_TO_EMAIL: string;
    CONTACT_CC_EMAIL?: string;
  }
}

export {};
