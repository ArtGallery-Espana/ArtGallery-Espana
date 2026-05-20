const ARTIST_IMAGE_URL = '/images/El Artista.jpg';
const WORKSHOP_IMAGE_URL = '/images/Tecnica y proceso.png';
const PROFILE_IMAGE_URL = '/images/Perfil.png';
const STATEMENT_WORKS = [
  {
    src: '/images/pintura 1.png',
    alt: 'Composición II de Jorge España',
    caption: 'Composición II, óleo sobre lienzo, 97 x 87 cm, 2001',
  },
  {
    src: '/images/pintura 2.png',
    alt: 'Obra de la serie Secuencia de una memoria',
    caption:
      'De la serie Secuencia de una memoria, óleo sobre lienzo, 87 x 97 cm, 2002',
  },
  {
    src: '/images/pintura 3.png',
    alt: 'La chica del portal de Jorge España',
    caption: 'La chica del portal, óleo sobre lienzo, 87 x 97 cm, 2003',
  },
];
const GALAPAGOS_IMAGES = [
  {
    src: '/images/galapagos1.png',
    alt: 'Paisaje de Galapagos observado por el artista',
    caption:
      'Vista de la exposición individual del artista. Aeropuerto Mariscal Lamar de Cuenca, febrero de 2025',
  },
  {
    src: '/images/galapagos2.png',
    alt: 'Detalle visual vinculado a la experiencia en Galapagos',
    caption: 'Tortuga marina · cobre repujado · 10 x 24 cm · 2024',
  },
  {
    src: '/images/galapagos3.png',
    alt: 'Escena asociada al proceso creativo en Galapagos',
    caption: 'Lobo marino · cobre repujado · 33 x 22 cm · 2024',
  },
];
const TRAJECTORY_IMAGES = [
  {
    src: '/images/Jorge 1984.png',
    alt: 'Jorge España en 1984',
    caption: 'Jorge España junto a una de sus obras tempranas, c. 1984',
  },
  {
    src: '/images/Jorge con el grupo 1994.png',
    alt: 'Jorge España junto a un grupo en 1994',
    caption:
      'Jorge España junto a los integrantes de “El Grupo”: Edgar Carrasco, Wolfram Palacio, Jorge Chalco y Julio Montesinos, c. 1994',
  },
  {
    src: '/images/Jorge 2001.png',
    alt: 'Jorge España en 2001',
    caption: 'El artista elaborando su serie de dibujos en Nueva York, 2001',
  },
];
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
    value: 'Español · Ingles · Portugues',
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

const TRAJECTORY_TIMELINE = [
  {
    year: '1974',
    body: 'De regreso a Cuenca, ingresa en la Escuela de Bellas Artes y comienza una etapa de exploracion material con cobre y bronce.',
  },
  {
    year: '1980',
    body: 'Realiza su primera exposicion en el Municipio de Cuenca, con obras en cobre. Ese mismo periodo presenta trabajo en el Banco del Pacifico.',
  },
  {
    year: '1981',
    body: 'Lleva su obra a Quito con dos exhibiciones: una en La Mascara de Oro y otra en la Galeria Pampite.',
  },
  {
    year: '1984',
    body: 'Presenta una nueva muestra en la Galeria La Tienda, en Cuenca, consolidando su presencia dentro del circuito artistico local.',
  },
  {
    year: '1985',
    body: 'Expone en la Casa de la Cultura, Nucleo del Azuay, dentro de una etapa de mayor visibilidad institucional en Cuenca.',
  },
  {
    year: '1986',
    body: 'Participa con una muestra en la Mackenzie Gallery de Miami, una de sus primeras proyecciones expositivas fuera del Ecuador.',
  },
  {
    year: '1987',
    body: 'Obtiene el segundo lugar en el Concurso de Pintura Luis A. Martinez, en Ambato, y recibe una Primera Mencion en el VIII Salon Nacional del Azuay.',
  },
  {
    year: '1989',
    body: 'Presenta Los castillos dorados y temas festivos en la galeria La Manzana Verde de Cuenca y obtiene el premio del publico en la II Bienal de Pintura de Cuenca.',
  },
  {
    year: '1994',
    body: 'Exhibe sus obras en la Casa de la Cultura de Quito y en la Alianza Francesa de Cuenca, ampliando su circulacion entre ambas ciudades.',
  },
  {
    year: '1996',
    body: 'Expone en el Instituto Ibaguereño de Cultura y Turismo, en Ibague, Colombia, dentro de una etapa de intercambio regional.',
  },
  {
    year: '1998',
    body: 'Presenta obra en el Museo Fundacion Ecuatoriana de Desarrollo y en la Galeria Posada de las Artes Kingman, en Quito. Tambien expone en la Galeria Mortier Flores, en Belgica.',
  },
  {
    year: '1999',
    body: 'Participa en la exposicion Convenio por la Paz, en Lima, y lleva su trabajo a la galeria Latitudes South Houston, en Texas.',
  },
  {
    year: '2000',
    body: 'Expone en Galaxi D. Art, en Nueva York, y en U. Frame-it Art Gallery, en Oakland, Nueva Jersey.',
  },
  {
    year: '2001',
    body: 'Presenta sus obras en el Salon Abya Yala del Consulado Ecuatoriano, en Nueva York, y en Princeton, Nueva Jersey.',
  },
  {
    year: '2002',
    body: 'Expone en C.G. Gallery L.T.D., en Nueva Jersey, y en el Museo Puertas de la Ciudad, en Loja. Ese año recibe el primer premio otorgado por la Direccion de Turismo de Cuenca.',
  },
  {
    year: '2003',
    body: 'Exhibe en el Museo Arqueologico del Banco del Pacifico, en Guayaquil, reforzando su presencia en espacios culturales de alcance nacional.',
  },
  {
    year: '2008',
    body: 'Presenta Encuentros en el Centro Cultural Quinta Bolivar, en Cuenca, muestra que subraya la madurez de su lenguaje pictorico.',
  },
  {
    year: '2012',
    body: 'Elabora un mural y un conjunto escultorico titulados La familia para la Asamblea Nacional del Ecuador, en Quito.',
  },
  {
    year: '2016',
    body: 'Realiza el conjunto escultorico Los estudiantes para la Universidad de Cuenca, ampliando su produccion hacia la obra publica.',
  },
  {
    year: '2025',
    body: 'En abril inaugura una exhibicion en la Galeria OFF Arte Contemporaneo y en el Aeropuerto Nacional Mariscal La Mar, en Cuenca.',
  },
];

export function ArtistEditorialPage() {
  return (
    <article className="editorial-page artist-page">
      <section className="editorial-hero artist-hero" data-reveal>
        <div className="editorial-copy">
          <p className="editorial-kicker">El artista</p>
          <h1>Jorge España</h1>
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

      <section className="editorial-section artist-biography" data-reveal>
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
            A lo largo de los años, su obra ha transitado por distintos medios:
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

      <section className="editorial-section artist-statement" data-reveal>
        <div>
          <p className="editorial-kicker">Declaracion artistica</p>
          <h2>La luz como paisaje, tiempo y experiencia.</h2>
        </div>
        <div className="artist-statement-content">
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
          <div className="statement-works-gallery">
            {STATEMENT_WORKS.map((work) => (
              <figure key={work.src}>
                <img alt={work.alt} src={work.src} />
                <figcaption>{work.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section artist-facts-section" data-reveal>
        <div className="artist-profile-story">
          <figure className="artist-profile-media">
            <img
              alt="Retrato de perfil del artista Jorge España"
              src={PROFILE_IMAGE_URL}
            />
          </figure>
          <div className="artist-profile-intro">
            <p className="editorial-kicker">Identidad y recorrido</p>
            <h2>Perfil del artista</h2>
            <p className="artist-profile-summary">
              Una práctica construida entre Cuenca, Galápagos, la formación
              académica y una trayectoria de circulación internacional.
            </p>
          </div>
        </div>
        <div className="artist-profile-details">
          <dl className="artist-facts-grid">
            {ARTIST_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="editorial-section artist-trajectory" data-reveal>
        <div>
          <h2>Trayectoria</h2>
          <div className="trajectory-gallery">
            {TRAJECTORY_IMAGES.map((image) => (
              <figure key={image.src}>
                <img alt={image.alt} src={image.src} />
                <figcaption>{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <ol className="trajectory-timeline">
          {TRAJECTORY_TIMELINE.map((item) => (
            <li key={item.year}>
              <span>{item.year}</span>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="editorial-section galapagos-section" data-reveal>
        <div className="galapagos-header">
          <div>
            <p className="editorial-kicker">Conexion Galapagos</p>
            <h2>“Galapagos no es paisaje. Es una manera de mirar.”</h2>
          </div>
          <div className="galapagos-intro">
            <p>
              Desde 2016, Jorge España ha hecho de Galapagos un territorio de
              estudio continuo: un lugar donde observa la luz, la materia y la
              vida marina hasta convertirlas en memoria visual.
            </p>
            <p>
              Ese vínculo atraviesa su obra reciente y se traduce en piezas de
              cobre repujado, escenas expositivas y formas que condensan
              movimiento, fragilidad y permanencia.
            </p>
          </div>
        </div>
        <div className="galapagos-gallery">
          {GALAPAGOS_IMAGES.map((image) => (
            <figure key={image.src}>
              <img alt={image.alt} src={image.src} />
              <figcaption>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="editorial-section process-section" data-reveal>
        <div className="process-media">
          <img alt="Vista del taller del artista" src={WORKSHOP_IMAGE_URL} />
        </div>
        <div className="process-copy">
          <p className="editorial-kicker">Proceso creativo</p>
          <h2>De la luz a la pintura.</h2>
          <ol className="creative-process-flow">
            {CREATIVE_PROCESS.map((item) => (
              <li key={item.step} className="creative-process-step">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  );
}
