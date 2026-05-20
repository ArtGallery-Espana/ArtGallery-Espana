/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

/**
 * Extiende el tipo global `Env` de Hydrogen con las variables propias del
 * proyecto. Toda nueva variable consumida desde loaders/actions debe
 * declararse aquí para tener autocompletado y typecheck en context.env.
 */
declare global {
  interface Env {
    /** API key de Resend (https://resend.com). Server-only. */
    RESEND_API_KEY: string;
  }
}
