export function ShippingEditorialPage() {
  return (
    <article className="editorial-page shipping-page">
      <header className="editorial-page-header">
        <p className="editorial-kicker">Servicio</p>
        <h1>Envios y pagos</h1>
        <p className="editorial-lede">
          Informacion base para coordinar entregas, devoluciones y medios de
          pago aceptados.
        </p>
      </header>

      <section className="editorial-section shipping-table-section">
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
                <td>Entrega coordinada dentro de Ecuador</td>
                <td>Confirmacion de destino y proteccion adecuada de la obra.</td>
              </tr>
              <tr>
                <th scope="row">Internacional</th>
                <td>Despacho sujeto a coordinacion previa</td>
                <td>Embalaje reforzado y validacion de tiempos por pais.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="editorial-section returns-section">
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

      <section className="editorial-section payments-section">
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
            <h3>Transferencias bancarias</h3>
            <p>Coordinacion manual y confirmacion previa a la liberacion.</p>
          </div>
        </div>
        <p className="payment-note">
          No se aceptan pagos a plazos ni plan privado a medida.
        </p>
      </section>
    </article>
  );
}
