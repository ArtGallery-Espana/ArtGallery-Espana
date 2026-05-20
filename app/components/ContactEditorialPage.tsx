const CONTACT_DETAILS = {
  studio: 'Estudio Jorge España',
  email: 'estudio@jorgeespana.art',
  whatsappDisplay: '+593 99 807 3728',
  whatsappHref: 'https://wa.me/593998073728',
  addressLineOne: 'Calle Larga 6-21',
  addressLineTwo: 'Cuenca, Ecuador',
};

export function ContactEditorialPage() {
  return (
    <article className="editorial-page contact-page">
      <header className="editorial-page-header" data-reveal>
        <p className="editorial-kicker">Contacto</p>
        <h1>Conversemos sobre una obra, una visita o una consulta.</h1>
      </header>

      <section className="contact-layout" data-reveal>
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
    </article>
  );
}
