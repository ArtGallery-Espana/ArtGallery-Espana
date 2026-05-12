const ARTIST_IMAGE_URL = '/images/El Artista.jpg';
const WORKSHOP_IMAGE_URL = '/images/Tecnica y proceso.png';

const ARTIST_FACTS = [
  {
    label: 'Nacimiento',
    value: '1981, Cuenca, Ecuador',
  },
  {
    label: 'Formacion',
    value: 'Universidad de Cuenca · Real Academia de San Carlos, Mexico DF',
  },
  {
    label: 'Reside',
    value: 'Cuenca, EC · estancias anuales en Galapagos',
  },
  {
    label: 'Galeria',
    value: 'Estudio independiente · representacion bajo consulta',
  },
  {
    label: 'Idiomas',
    value: 'Espanol · Ingles · Portugues',
  },
];

const CREATIVE_PROCESS = [
  {
    step: '01',
    title: 'Observacion',
    body: 'Estancias prolongadas en el sitio. Registro en cuadernos, fotografia y dialogo con el entorno.',
  },
  {
    step: '02',
    title: 'Materia',
    body: 'Preparacion de soportes, pigmentos y bases. Atencion a la densidad, absorcion y comportamiento de la superficie.',
  },
  {
    step: '03',
    title: 'Pintura',
    body: 'Aplicacion de capas finas durante semanas. La obra reposa entre cada intervencion, permitiendo que la imagen emerja progresivamente.',
  },
  {
    step: '04',
    title: 'Archivo',
    body: 'Registro profesional, certificacion y documentacion de la obra antes de su circulacion.',
  },
];

export function ArtistEditorialPage() {
  return (
    <article className="editorial-page artist-page">
      <section className="editorial-hero artist-hero">
        <div className="editorial-copy">
          <p className="editorial-kicker">El artista</p>
          <h1>Jorge España</h1>
          <p className="artist-origin">Cuenca, 1981</p>
          <p className="editorial-lede">
            Pintor ecuatoriano. Su obra se desarrolla entre Cuenca y Galapagos,
            dos territorios que han marcado una practica construida desde la
            observacion lenta, la memoria y la materia.
          </p>
        </div>

        <figure className="artist-placeholder">
          <img
            alt="Retrato del artista Jorge España"
            className="artist-hero-image"
            src={ARTIST_IMAGE_URL}
          />
        </figure>
      </section>

      <section className="editorial-section artist-statement">
        <div>
          <p className="editorial-kicker">Declaracion artistica</p>
          <h2>La luz como paisaje, tiempo y experiencia.</h2>
        </div>
        <div className="editorial-two-column-copy">
          <p>
            La pintura de Jorge España se construye desde la observacion
            prolongada y el silencio. Su practica investiga la luz como fenomeno
            fisico y emocional, en relacion con el agua, el territorio y las
            formas de vida que lo habitan.
          </p>
          <p>
            Lejos del gesto inmediato, cada obra se desarrolla mediante
            acumulacion lenta: capas delgadas, tiempos de reposo y una economia
            rigurosa del color. La superficie deja de ser soporte y se convierte
            en archivo.
          </p>
          <p>
            Su trabajo articula una tension constante entre lo ancestral y lo
            contemporaneo. Texturas densas, fragmentos simbolicos, presencias
            animales y estructuras abiertas configuran un lenguaje donde lo
            figurativo y lo abstracto coexisten sin jerarquia.
          </p>
        </div>
      </section>

      <section className="editorial-section artist-biography">
        <div>
          <p className="editorial-kicker">Biografia</p>
          <h2>Una practica entre taller, residencia y desplazamiento.</h2>
        </div>
        <div className="editorial-two-column-copy">
          <p>
            Jorge España es un pintor ecuatoriano cuya practica se ha
            desarrollado entre el trabajo de taller, la residencia y el
            desplazamiento. Formado en la Universidad de Cuenca y en la Real
            Academia de San Carlos en Ciudad de Mexico, su trayectoria se
            articula en torno a la pintura y la exploracion de la materia como
            lenguaje.
          </p>
          <p>
            A lo largo de los anos, su obra ha transitado por distintos medios:
            encaustica, oleo y acrilico. Mantiene una atencion constante al
            espesor de la superficie, al valor simbolico del color y a la
            relacion entre imagen y tiempo.
          </p>
          <p>
            Su trabajo ha sido exhibido en America Latina, Europa y Asia,
            consolidando una practica que combina investigacion material,
            observacion del entorno y una aproximacion reflexiva a la pintura.
          </p>
        </div>
      </section>

      <section className="editorial-section artist-facts-section">
        <div>
          <p className="editorial-kicker">Datos basicos</p>
          <h2>Perfil del artista</h2>
        </div>
        <dl className="artist-facts-grid">
          {ARTIST_FACTS.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="editorial-section artist-trajectory">
        <div>
          <p className="editorial-kicker">02 — Trayectoria</p>
          <h2>Una pintura que sabe esperar.</h2>
        </div>
        <div className="editorial-single-copy">
          <p>
            Quince anos de trabajo continuado entre el taller, la residencia en
            Galapagos y exposiciones en America Latina, Europa y, mas
            recientemente, Asia. Su trayectoria se define por una investigacion
            sostenida en torno a la forma, la materia y la luz.
          </p>
          <p>
            La evolucion de su lenguaje transita desde la figuracion hacia
            estructuras mas abiertas, donde el paisaje y los signos se vuelven
            esenciales.
          </p>
        </div>
      </section>

      <section className="editorial-section galapagos-section">
        <div>
          <p className="editorial-kicker">Conexion Galapagos</p>
          <h2>“Galapagos no es paisaje. Es una manera de mirar.”</h2>
        </div>
        <div className="editorial-single-copy">
          <p>
            Desde 2016, Jorge España viaja de forma periodica a Galapagos,
            incorporando estos desplazamientos como parte central de su proceso.
            En este contexto, la pintura deja de ser representacion para
            convertirse en observacion extendida.
          </p>
          <p>
            Las obras producidas a partir de estas estancias exploran la luz
            tropical, el comportamiento del agua y la relacion con el entorno
            natural, construyendo imagenes donde el tiempo, la materia y la
            percepcion se entrelazan.
          </p>
        </div>
      </section>

      <section className="editorial-section process-section">
        <div className="process-media">
          <img alt="Vista del taller del artista" src={WORKSHOP_IMAGE_URL} />
        </div>
        <div className="process-copy">
          <p className="editorial-kicker">05 — Proceso creativo</p>
          <h2>De la luz a la pintura.</h2>
          <div className="creative-process-grid">
            {CREATIVE_PROCESS.map((item) => (
              <section key={item.step} className="creative-process-card">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
