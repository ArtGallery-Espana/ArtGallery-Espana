import {HONEYPOT_FIELD} from '~/lib/spam-guard';

/**
 * Campo trampa anti-spam. Invisible y fuera de foco para humanos; los bots que
 * rellenan todos los inputs lo completan y el servidor descarta el envío.
 *
 * No usa `display:none` a propósito: muchos bots saltan campos ocultos así. El
 * posicionamiento fuera de pantalla los engaña mejor. `autoComplete="off"` y
 * `tabIndex={-1}` evitan que el autofill del navegador o el tabulado humano lo
 * toquen por accidente.
 */
export function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <label>
        No rellenar
        <input
          autoComplete="off"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          type="text"
        />
      </label>
    </div>
  );
}
