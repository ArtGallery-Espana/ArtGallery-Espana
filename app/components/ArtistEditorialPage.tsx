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
      'Tortuga terrestre, cobre repujado, 18 x 28 cm, 2024',
  },
  {
    src: '/images/galapagos2.png',
    alt: 'Detalle visual vinculado a la experiencia en Galapagos',
    caption: 'Vista de la exposición individual del artista. Aeropuerto Mariscal Lamar de Cuenca, febrero de 2025',
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
    value: '1954, Cuenca, Ecuador',
  },
  {
    label: 'Formacion',
    value: 'Universidad de Cuenca · Facultad de Bellas Artes',
  },
  {
    label: 'Reside',
    value: 'Cuenca, EC · San Antonio de Gapal',
  },
  {
    label: 'Galeria',
    value: 'Estudio independiente',
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
];

const TRAJECTORY_TIMELINE = [
  {
    year: '1954',
    body: 'Nace en Cuenca, Ecuador.',
  },
  {
    year: '1970s',
    body: 'Inicia su formación artística y exploración material.',
  },
  {
    year: '1980',
    body: 'Realiza sus primeras exposiciones en Ecuador.',
  },
  {
    year: '1989',
    body: 'Recibe reconocimiento del público en la II Bienal de Pintura de Cuenca.',
  },
  {
    year: '2008',
    body: 'Realiza La Familia para la Asamblea Nacional del Ecuador.',
  },
  {
    year: '2016',
    body: 'Desarrolla Los Estudiantes para la Universidad de Cuenca.',
  },
  {
    year: '2025',
    body: 'Presenta obra reciente en espacios expositivos de Cuenca.',
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
            Pintor ecuatoriano. Reconocido por su obra en escultura y pintura,
            inspirada en los paisajes andinos y la identidad latinoamericana. Su
            estilo destaca por el uso de texturas, cobre, acero y tierras de
            colores.
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
          <h2>Una obra enraizada en el paisaje y la materia.</h2>
        </div>
        <div className="editorial-two-column-copy">
          <p>
            Jorge España nació en Cuenca, Ecuador, en 1954. Desde temprana edad
            desarrolló un interés por el dibujo y las formas de la naturaleza,
            influenciado por el paisaje andino de Yunguilla y Girón. En los años
            setenta viajó a Colombia, donde entró en contacto con la obra de
            artistas como Botero, Obregón y Caballero, experiencias que marcaron
            el desarrollo de su lenguaje artístico.
          </p>
          <p>
            A su regreso a Ecuador ingresó a la Escuela de Bellas Artes de
            Cuenca y comenzó a trabajar con materiales como cobre y bronce,
            explorando la pintura, el relieve y la materia. Su obra se caracteriza
            por el uso de texturas, collage y tierras de color, elementos que
            construyen un universo visual profundamente ligado al paisaje y a la
            identidad cultural.
          </p>
          <p>
            Desde 1980 ha realizado exposiciones en Ecuador, Colombia, Estados
            Unidos, Bélgica y Perú, participando en galerías, museos y bienales
            internacionales. Entre sus reconocimientos destacan el premio por
            votación del público en la Segunda Bienal de Pintura de Cuenca y
            proyectos escultóricos como “La Familia” para la Asamblea Nacional
            del Ecuador y “Los Estudiantes” para la Universidad Estatal de Cuenca.
          </p>
        </div>
      </section>

      <section className="editorial-section artist-statement" data-reveal>
        <div>
          <p className="editorial-kicker">Declaracion artistica</p>
          <h2>Materia, color y memoria.</h2>
        </div>
        <div className="artist-statement-content">
          <div className="editorial-two-column-copy">
            <p>
              Jorge España desarrolla una obra profundamente vinculada a la
              materia, el color y la memoria. A través de texturas, tierras,
              pigmentos y relieves, construye un lenguaje visual inspirado en el
              paisaje andino, la naturaleza y las raíces culturales que han
              marcado su vida y su entorno.
            </p>
            <p>
              Su trabajo nace de una búsqueda constante de identidad y
              experimentación. Desde el cobre, el pastel y la encáustica hasta el
              collage y la abstracción, cada etapa de su obra explora nuevas
              formas de expresión, manteniendo siempre una fuerte conexión con lo
              telúrico, lo simbólico y lo humano.
            </p>
            <p>
              En sus composiciones convergen signos, formas y superficies que
              evocan lo ancestral, lo orgánico y lo ritual. Su pintura busca ir
              más allá de la representación visual, creando espacios donde la
              textura, la luz y el color transmiten sensaciones, memoria y una
              relación íntima con la tierra.
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
              Una obra arraigada en el paisaje andino, la materia y la identidad
              cultural, desarrollada entre Cuenca y San Antonio de Gapal.
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
        <div className="trajectory-header">
          <p className="editorial-kicker">Recorrido</p>
          <h2>Trayectoria</h2>
        </div>

        <div className="trajectory-content">
          {/* Línea de tiempo horizontal */}
          <ol className="trajectory-timeline">
            {TRAJECTORY_TIMELINE.map((item, index) => (
              <li key={item.year} className={index % 2 === 0 ? 'tl-above' : 'tl-below'}>
                <div className="tl-text">
                  <span className="tl-year">{item.year}</span>
                  <p className="tl-body">{item.body}</p>
                </div>
                <div className="tl-dot" aria-hidden="true" />
              </li>
            ))}
            <div className="tl-line" aria-hidden="true" />
          </ol>

          {/* Galería de fotos de archivo */}
          <div className="trajectory-gallery">
            {TRAJECTORY_IMAGES.map((image) => (
              <figure key={image.src}>
                <img alt={image.alt} src={image.src} />
                <figcaption>{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
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
              Ese vínculo atraviesa su obra reciente y se traduce en obras de
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
