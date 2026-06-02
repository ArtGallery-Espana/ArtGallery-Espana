import * as React from 'react';
import {useFetcher} from 'react-router';
import type {ContactActionData} from '~/routes/($locale).pages.$handle';

const CONTACT_DETAILS = {
  studio: 'Galería J. España',
  email: 'jespanaa9207@gmail.com',
  emailSecondary: 'maite.guic2@gmail.com',
  whatsappDisplay: '+593 99 807 3728',
  whatsappHref: 'https://wa.me/593998073728',
};

export function ContactEditorialPage() {
  const fetcher = useFetcher<ContactActionData>();
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const isSubmitting = fetcher.state !== 'idle';
  const status = fetcher.data?.status;
  const fieldErrors = status === 'error' ? fetcher.data?.fieldErrors : undefined;
  const submitMessage = fetcher.data?.message;
  const submittedValues = fetcher.data?.values;

  React.useEffect(() => {
    if (status === 'success') {
      formRef.current?.reset();
    }
  }, [status]);

  const fieldError = (key: 'name' | 'email' | 'subject' | 'message') =>
    fieldErrors?.[key];

  return (
    <article className="editorial-page contact-page">
      <header className="editorial-page-header" data-reveal>
        <p className="editorial-kicker">Contacto</p>
        <h1>Conversemos sobre una obra o una consulta.</h1>
        <p className="editorial-lede">
          Escríbenos para consultar por una obra, conocer disponibilidad o
          recibir información personalizada.
        </p>
      </header>

      <section className="contact-layout" data-reveal>
        <fetcher.Form
          ref={formRef}
          className="contact-form"
          method="post"
          noValidate
        >
          <input type="hidden" name="intent" value="contact" />

          <div className="contact-form-grid">
            <label>
              <span>Nombre</span>
              <input
                autoComplete="name"
                name="name"
                type="text"
                required
                defaultValue={submittedValues?.name ?? ''}
                aria-invalid={Boolean(fieldError('name')) || undefined}
                aria-describedby={fieldError('name') ? 'contact-name-error' : undefined}
              />
              {fieldError('name') && (
                <small id="contact-name-error" className="contact-field-error">
                  {fieldError('name')}
                </small>
              )}
            </label>
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                required
                defaultValue={submittedValues?.email ?? ''}
                aria-invalid={Boolean(fieldError('email')) || undefined}
                aria-describedby={fieldError('email') ? 'contact-email-error' : undefined}
              />
              {fieldError('email') && (
                <small id="contact-email-error" className="contact-field-error">
                  {fieldError('email')}
                </small>
              )}
            </label>
          </div>

          <label>
            <span>Asunto</span>
            <input
              name="subject"
              type="text"
              required
              defaultValue={submittedValues?.subject ?? ''}
              aria-invalid={Boolean(fieldError('subject')) || undefined}
              aria-describedby={fieldError('subject') ? 'contact-subject-error' : undefined}
            />
            {fieldError('subject') && (
              <small id="contact-subject-error" className="contact-field-error">
                {fieldError('subject')}
              </small>
            )}
          </label>

          <label>
            <span>Mensaje</span>
            <textarea
              name="message"
              rows={7}
              required
              minLength={10}
              defaultValue={submittedValues?.message ?? ''}
              aria-invalid={Boolean(fieldError('message')) || undefined}
              aria-describedby={fieldError('message') ? 'contact-message-error' : undefined}
            />
            {fieldError('message') && (
              <small id="contact-message-error" className="contact-field-error">
                {fieldError('message')}
              </small>
            )}
          </label>

          {submitMessage && (
            <p
              role={status === 'success' ? 'status' : 'alert'}
              className={`contact-form-feedback contact-form-feedback--${status}`}
            >
              {submitMessage}
            </p>
          )}

          <button
            className="contact-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar'}
          </button>
        </fetcher.Form>

        <div className="contact-details">
          <div>
            <p className="editorial-kicker">Estudio</p>
            <p>{CONTACT_DETAILS.studio}</p>
          </div>
          <div>
            <p className="editorial-kicker">Email directo</p>
            <a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a>
            <a href={`mailto:${CONTACT_DETAILS.emailSecondary}`}>{CONTACT_DETAILS.emailSecondary}</a>
          </div>
          <div>
            <p className="editorial-kicker">WhatsApp</p>
            <a href={CONTACT_DETAILS.whatsappHref}>{CONTACT_DETAILS.whatsappDisplay}</a>
          </div>
        </div>
      </section>
    </article>
  );
}
