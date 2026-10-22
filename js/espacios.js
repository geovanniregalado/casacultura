(function () {
  /* =========================================================
     RUTA DE LAS FOTOS — AJUSTA AQUÍ
     Carpeta donde pusiste las fotos del zip (termina con "/").
  ========================================================= */
  const RUTA_FOTOS = "img/espacios/";

  /* =========================================================
     DATOS
     Un objeto por espacio. Campos:
       zapoteco:  nombre en zapoteco (vacío '' si no tiene)
       espanol:   nombre en español
       foto:      archivo de la foto dentro de RUTA_FOTOS
       posicion:  (opcional) qué parte de la foto se ve en la tarjeta,
                  ej. 'center 30%'
       texto:     arreglo de párrafos de la descripción
       datos:     (opcional) datos clave como etiquetas
       enlace:    (opcional) { texto, url } para un botón al final
     Los textos vienen del PDF institucional "Lidxi Guendabiaani".
  ========================================================= */
  const espacios = [
    {
      zapoteco: "",
      espanol: "Tienda",
      foto: "tienda.jpg",
      texto: [
        "Este sitio está destinado principalmente a la comercialización de obra artística local y nacional. Artesanos, artistas, escritores y diseñadores pueden utilizar el espacio para publicitar su trabajo; de esta forma, se contribuye a su economía y al mantenimiento mismo de la Casa de la Cultura.",
      ],
      datos: ["Obra artística local y nacional"],
    },
    {
      zapoteco: "Ndxii",
      espanol: "Auditorio",
      foto: "auditorio.jpg",
      texto: [
        "Este espacio de encuentro tiene la posibilidad de albergar 78 lugares. Está destinado a la presentación de obras de teatro, conferencias, presentaciones de libros, cuentacuentos, conciertos y demás expresiones artísticas y actividades interdisciplinarias que requieran un espacio cerrado y equipo audiovisual para acompañar la experiencia estética del público.",
      ],
      datos: ["78 lugares", "Equipo audiovisual"],
    },
    {
      zapoteco: "Bigose",
      espanol: "Sala de música",
      foto: "sala-musica.jpg",
      texto: [
        "Es un espacio destinado al estudio, práctica y ejecución de múltiples instrumentos musicales. Cuenta con un piano Steinway de cola y un piano Yamaha de pared, a completa disposición de los alumnos de la Casa de la Cultura de Juchitán, los artistas invitados al recinto y los ensayos de la Banda Filarmónica Infantil y Juvenil de la institución.",
        "La Casa de la Cultura cuenta con la Banda Filarmónica Infantil y Juvenil “San Vicente”, que tiene 13 años de haberse fundado bajo la dirección del Mtro. Apolonio Blas Gil, con el propósito de preservar nuestra música tradicional para las nuevas generaciones a través de los instrumentos de viento.",
      ],
      datos: ["Piano Steinway de cola", "Piano Yamaha de pared"],
    },
    {
      zapoteco: "Berelele",
      espanol: "Sala de danza",
      foto: "sala-danza.jpg",
      texto: [
        "Es un espacio destinado al estudio, práctica y ejecución de diferentes estilos de danza y movimiento corporal escénico. Se encuentra a completa disposición de los alumnos de la Casa de la Cultura de Juchitán, los artistas invitados al recinto y los ensayos del grupo de danza folklórica Saa Stinu de Juchitán de Zaragoza.",
      ],
      datos: ["Danza y movimiento corporal escénico"],
    },
    {
      zapoteco: "Cha’ca",
      espanol: "Sala de usos múltiples",
      foto: "sala-usos-multiples.jpg",
      texto: [
        "La sala de usos múltiples “Cha’ca” es un espacio dedicado a la exposición de proyectos artísticos para el disfrute y difusión de las artes plásticas y visuales. Es un espacio abierto a los artistas locales, nacionales e internacionales con trayectoria, y contempla un programa anual de exposiciones y charlas bimestrales con los artistas participantes.",
      ],
      datos: ["Exposiciones", "Charlas bimestrales"],
    },
    {
      zapoteco: "Xhumbé",
      espanol: "Sala de arte prehispánico",
      foto: "sala-prehispanico.jpg",
      texto: [
        "La Sala de Arte Prehispánico de la Casa de la Cultura de Juchitán es considerada la tercera colección de mayor importancia del estado de Oaxaca, ya que exhibe importantes piezas de arte prehispánico de diferentes culturas de México, especialmente una vasta colección de origen zapoteca. Esta colección fue donada en su mayoría por el artista Francisco Toledo y la sociedad civil del Istmo de Tehuantepec. Actualmente la sala está en resguardo de la Casa de la Cultura y del Instituto Nacional de Antropología e Historia, y cuenta con un acervo de 1900 piezas, entre ellas hachas votivas, vasijas, cajetes, figurillas, yugos, glifos y esculturas.",
        "Para nosotros los juchitecos es importante el diálogo entre la colección y el quehacer artístico de alfareros y ceramistas de la comunidad local y nacional, así como el diálogo directo entre artistas y artesanos a través del análisis y estudio de arqueólogos y artistas, que permita discursos museográficos con las piezas exhibidas y las que se encuentren en el acervo bajo resguardo.",
      ],
      datos: ["1,900 piezas", "Tercera colección más importante de Oaxaca"],
    },
    {
      zapoteco: "Bisiá",
      espanol: "Administración",
      foto: "administracion.jpg",
      texto: [
        "El área administrativa está conformada por un director, una secretaria y un coordinador que llevan los registros, trámites, difusión y gestiones correspondientes para que la Casa de la Cultura brinde una plataforma sólida en el quehacer cultural y artístico en Juchitán y la región del Istmo. En este espacio se lleva a cabo la gestión de actividades culturales para la preservación y difusión de nuestro patrimonio, las cuales son generadas por el resto de talleres y organismos presentes en la Casa de la Cultura.",
      ],
      datos: ["Gestión de actividades culturales"],
    },
    {
      zapoteco: "Bacuzaguí",
      espanol: "Biblioteca",
      foto: "biblioteca.jpg",
      texto: [
        "La biblioteca “Bacuzaguí” es un espacio de conservación de más de 10 mil libros especializados en arte, literatura, fotografía, historia, ciencias naturales, idiomas, lenguas originarias, literatura infantil y otros apartados. Dicha colección ha sido donada por artistas como Francisco Toledo y diversas personas de la sociedad civil juchiteca, con el fin de brindar libertad de consulta a los visitantes que desean saber más sobre un tema.",
        "Cuenta además con una sala de lectura y ofrece servicio de préstamo interno para cualquier visitante que cumpla con los lineamientos estipulados en el Reglamento de la Biblioteca de la Casa de la Cultura de Juchitán. También es recinto para la impartición de talleres educativos y actividades culturales como presentaciones de libros, y otorga el servicio de documentación para la investigación previa a talleres, exposiciones y guiones museográficos.",
      ],
      datos: ["Más de 10 mil libros", "Sala de lectura", "Préstamo interno"],
      enlace: { texto: "Ir al sistema de biblioteca", url: "/biblioteca.html" }, // AJUSTA AQUÍ: la URL real (o borra esta línea)
    },
    {
      zapoteco: "",
      espanol: "Ludoteca",
      foto: "ludoteca.jpg",
      posicion: "center 60%",
      texto: [
        "La ludoteca de la Casa de la Cultura de Juchitán de Zaragoza, Oax., es un espacio dedicado al desarrollo de actividades lúdicas, especialmente diseñado para niños. Su objetivo principal es proporcionar un entorno donde se fomente el aprendizaje, la socialización y el desarrollo de habilidades a través del juego. Es un lugar para el entretenimiento enfocado en aspectos educativos, psicomotrices y de desarrollo social.",
      ],
      datos: ["Espacio infantil", "Aprendizaje a través del juego"],
    },
    {
      zapoteco: "",
      espanol: "Taller de Artes Gráficas",
      foto: "taller-artes-graficas.jpg",
      posicion: "center 35%",
      texto: [
        "El Taller de Artes Gráficas es un espacio destinado a la enseñanza y exploración de disciplinas plásticas, gráficas y visuales. Se ubica en un sitio anexo frente a la Casa de la Cultura y cuenta con una sala principal de exposición, un área de grabado y una planta alta para reuniones y exposiciones pequeñas.",
        "Actualmente, en este recinto se llevan a cabo las actividades del Taller de Arte Infantil y Juvenil “Xuba Cubi”, que acompaña el proceso de enseñanza y aprendizaje de niños de 5 a 10 años y de niños y adolescentes de 10 a 15 años.",
      ],
      datos: ["Sala de exposición", "Área de grabado"],
    },
  ];

  const grid = document.getElementById("esp-grid");
  const modal = document.getElementById("esp-modal");
  let indiceAbierto = 0;

  function titulo(esp) {
    return esp.zapoteco || esp.espanol;
  }

  // --- Tarjetas ---
  espacios.forEach((esp, i) => {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "esp-tarjeta" + (esp.zapoteco ? "" : " sin-zapoteco");
    tarjeta.setAttribute("data-aos", "flip-up");

    tarjeta.setAttribute("aria-label", "Ver más sobre " + esp.espanol);
    tarjeta.innerHTML = `
      <img src="${RUTA_FOTOS + esp.foto}" alt="${esp.espanol}" loading="lazy" style="${esp.posicion ? "object-position:" + esp.posicion : ""}">
      <div class="esp-degradado"></div>
      <div class="esp-nombres">
        ${esp.zapoteco ? `<div class="esp-zapoteco">${esp.zapoteco}</div>` : ""}
        <div class="esp-espanol">${esp.espanol}</div>
        <div class="esp-raya"></div>
      </div>
    `;
    tarjeta.addEventListener("click", () => abrir(i));
    grid.appendChild(tarjeta);
  });

  // --- Ventana de detalle ---
  function abrir(i) {
    indiceAbierto = (i + espacios.length) % espacios.length;
    const esp = espacios[indiceAbierto];

    const foto = document.getElementById("esp-modal-foto");
    foto.src = RUTA_FOTOS + esp.foto;
    foto.alt = esp.espanol;
    foto.style.objectPosition = esp.posicion || "";

    document.getElementById("esp-modal-titulo").textContent = titulo(esp);
    document.getElementById("esp-modal-espanol").textContent = esp.zapoteco
      ? esp.espanol
      : "";
    document.getElementById("esp-modal-espanol").style.display = esp.zapoteco
      ? "block"
      : "none";

    document.getElementById("esp-modal-texto").innerHTML = esp.texto
      .map((p) => `<p>${p}</p>`)
      .join("");
    document.getElementById("esp-modal-datos").innerHTML = (esp.datos || [])
      .map((d) => `<span class="esp-dato">${d}</span>`)
      .join("");
    document.getElementById("esp-modal-enlace").innerHTML = esp.enlace
      ? `<a class="esp-enlace" href="${esp.enlace.url}">${esp.enlace.texto} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>`
      : "";

    modal.classList.add("abierto");
    document.body.style.overflow = "hidden";
    modal.querySelector(".esp-panel").scrollTop = 0;
  }

  function cerrar() {
    modal.classList.remove("abierto");
    document.body.style.overflow = "";
  }

  document.getElementById("esp-cerrar").addEventListener("click", cerrar);
  document
    .getElementById("esp-anterior")
    .addEventListener("click", () => abrir(indiceAbierto - 1));
  document
    .getElementById("esp-siguiente")
    .addEventListener("click", () => abrir(indiceAbierto + 1));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("abierto")) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowLeft") abrir(indiceAbierto - 1);
    if (e.key === "ArrowRight") abrir(indiceAbierto + 1);
  });
})();
