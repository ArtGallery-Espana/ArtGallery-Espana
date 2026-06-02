export function ShippingEditorialPage() {
  return (
    <article className="editorial-page shipping-page">
      <header className="editorial-page-header" data-reveal>
        <p className="editorial-kicker">Servicio</p>
        <h1>Envios y pagos</h1>
        <p className="editorial-lede">
          Informacion base para coordinar entregas, devoluciones y medios de
          pago aceptados.
        </p>
      </header>

      <section className="editorial-section shipping-table-section" data-reveal>
        <div>
          <p className="editorial-kicker">Metodos de envio</p>
          <h2>Opciones nacionales e internacionales</h2>
        </div>

        <div className="shipping-table-wrap">
          <table className="shipping-table">
            <thead>
              <tr>
                <th scope="col">Cobertura</th>
                <th scope="col">Modalidad</th>
                <th scope="col">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Nacional</th>
                <td>Servientrega — entrega coordinada dentro de Ecuador</td>
                <td>
                  El comprador debe indicar C.I., Provincia, Ciudad y
                  Dirección.
                </td>
              </tr>
              <tr>
                <th scope="row">Internacional</th>
                <td>DHL Express — envíos a todo el mundo</td>
                <td>Entrega internacional con seguimiento.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="editorial-section shipping-national-section" data-reveal>
        <div>
          <p className="editorial-kicker">Envío nacional</p>
          <h2>Servientrega</h2>
        </div>
        <div className="shipping-national-info">
          <p>
            Los envíos dentro de Ecuador se coordinan a través de Servientrega.
            Una vez enviado el comprobante de pago, indícanos los siguientes
            datos para gestionar la entrega:
          </p>
          <ul className="shipping-fields">
            <li>C.I.</li>
            <li>Provincia</li>
            <li>Ciudad</li>
            <li>Dirección</li>
            <li>Referencia</li>
          </ul>
        </div>
      </section>

      <section
        className="editorial-section shipping-international-section"
        data-reveal
      >
        <div>
          <p className="editorial-kicker">Envío internacional</p>
          <h2>DHL Express</h2>
        </div>
        <div className="shipping-international-info">
          <p>
            Trabajamos con DHL Express para envíos internacionales a todo el
            mundo.
          </p>
        </div>
      </section>

      <section className="editorial-section returns-section" data-reveal>
        <div>
          <p className="editorial-kicker">Devoluciones</p>
          <h2>Politica en preparacion</h2>
        </div>
        <p>
          Esta seccion deja lista la estructura de la politica de devoluciones.
          El contenido definitivo sera incorporado cuando Jorge entregue el texto
          aprobado.
        </p>
      </section>

      <section className="editorial-section payments-section" data-reveal>
        <div>
          <p className="editorial-kicker">Pagos aceptados</p>
          <h2>Formas disponibles</h2>
        </div>
        <div className="payment-grid">
          <div className="payment-card">
            <h3>Tarjeta de debito y credito</h3>
            <p>Pago directo mediante los canales habilitados por la tienda.</p>
          </div>
          <div className="payment-card">
            <h3>Transferencia bancaria</h3>
            <p>
              Coordinación manual con confirmación previa a la liberación de la
              obra.
            </p>
            <dl className="payment-detail">
              <div>
                <dt>Banco</dt>
                <dd>Banco Pichincha</dd>
              </div>
              <div>
                <dt>Cuenta de ahorros</dt>
                <dd className="payment-detail-pending">Por confirmar</dd>
              </div>
              <div>
                <dt>Titular</dt>
                <dd>Jorge España</dd>
              </div>
              <div>
                <dt>Envío de comprobante</dt>
                <dd>
                  <a
                    href="https://wa.me/593998073728"
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp +593 99 807 3728
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className="payment-card">
            <h3>PayPal</h3>
            <p>
              Pago internacional con confirmación inmediata a través de PayPal.
            </p>
          </div>
        </div>
        <p className="payment-note">
          No se aceptan pagos a plazos ni plan privado a medida.
        </p>
      </section>
    </article>
  );
}
