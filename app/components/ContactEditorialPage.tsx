const CONTACT_DETAILS = {
  studio: 'Estudio Jorge España',
  email: 'estudio@jorgeespana.art',
  whatsappDisplay: '+593 99 412 0871',
  whatsappHref: 'https://wa.me/593994120871',
  addressLineOne: 'Calle Larga 6-21',
  addressLineTwo: 'Cuenca, Ecuador',
};

export function ContactEditorialPage() {
  return (
    <article className="editorial-page contact-page">
      <header className="editorial-page-header">
        <p className="editorial-kicker">Contacto</p>
        <h1>Conversemos sobre una obra, una visita o una consulta.</h1>
      </header>

      <section className="contact-layout">
        <form
          className="contact-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="contact-form-grid">
            <label>
              <span>Nombre</span>
              <input autoComplete="name" name="name" type="text" />
            </label>
            <label>
              <span>Email</span>
              <input autoComplete="email" name="email" type="email" />
            </label>
          </div>

          <label>
            <span>Asunto</span>
            <input name="subject" type="text" />
          </label>

          <label>
            <span>Mensaje</span>
            <textarea name="message" rows={7} />
          </label>

          <button className="contact-submit" type="submit">
            Enviar
          </button>
        </form>

        <aside className="contact-details">
          <div>
            <p className="editorial-kicker">Estudio</p>
            <p>{CONTACT_DETAILS.studio}</p>
          </div>
          <div>
            <p className="editorial-kicker">Email directo</p>
            <a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a>
          </div>
          <div>
            <p className="editorial-kicker">WhatsApp</p>
            <a href={CONTACT_DETAILS.whatsappHref}>{CONTACT_DETAILS.whatsappDisplay}</a>
          </div>
          <div>
            <p className="editorial-kicker">Direccion del taller</p>
            <p>{CONTACT_DETAILS.addressLineOne}</p>
            <p>{CONTACT_DETAILS.addressLineTwo}</p>
          </div>
        </aside>
      </section>

      <a
        aria-label="Chatear por WhatsApp"
        className="floating-whatsapp"
        href={CONTACT_DETAILS.whatsappHref}
      >
        <span aria-hidden="true" className="floating-whatsapp-icon">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.6Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="M9 8.8c.2-.5.5-.5.8-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.8l-.4.5a5.7 5.7 0 0 0 2 2l.5-.4c.2-.2.5-.2.8-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .6-.5.8-.5.2-1.7.3-3.6-.6a9.4 9.4 0 0 1-4.2-4.2c-.9-1.9-.8-3.1-.6-3.6Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <strong>Chatear</strong>
      </a>
    </article>
  );
}
