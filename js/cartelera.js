/* ==========================================================================
   CARTELERA · Casa de la Cultura de Juchitán

   PARA AGREGAR UNA ACTIVIDAD: copia un bloque { ... } de la lista de abajo.
   Campos:
     tipo       "curso" | "taller" | "exposicion" | "presentacion" | "noticia"
     titulo     Título corto (el cartel ya trae el detalle)
     resumen    1 o 2 frases, opcional
     inicio     "AAAA-MM-DD"  (fecha de inicio)
     fin        "AAAA-MM-DD"  (opcional; al pasar esa fecha la actividad se
                               oculta sola y pasa a "actividades anteriores")
     permanente true para actividades que no tienen fecha (ej. talleres permanentes)
     cuando     Texto de la fecha tal como quieres que se lea
     horario    Texto del horario (opcional)
     edades     Texto de edades (opcional)
     imagen     Ruta del cartel
     whatsapp   Número con lada, solo dígitos y con 52 al inicio (opcional).
                Si lo dejas vacío, el botón será "Ver cartel".
   ========================================================================== */
(function () {
  const publicaciones = [
    {
      tipo: "curso",
      titulo: "Talleres permanentes",
      resumen:
        "Te invitamos a formar parte de nuestra oferta de talleres permanentes. Consulta los horarios e inscríbete al que más te apasione.",
      permanente: true,
      cuando: "Inscripciones abiertas todo el año",
      horario: "Los horarios por taller vienen en el cartel",
      edades: "De 15 años en adelante",
      imagen: "img/cartelera/permanentes.jfif",
      whatsapp: "",
    },
    {
      tipo: "curso",
      titulo: "Curso de inglés",
      resumen:
        "Aprende inglés este mes de octubre y mejora tus habilidades en el idioma con nuestros cursos.",
      inicio: "2026-10-01",
      fin: "2026-10-30",
      cuando: "Del 1 al 30 de octubre",
      horario: "Jueves y viernes · 4:00 a 7:00 p.m.",
      edades: "De 15 años en adelante",
      imagen: "img/cartelera/curso1.jfif",
      whatsapp: "529711429395",
    },
    {
      tipo: "taller",
      titulo: "Teatro de sombras",
      resumen:
        "Taller gratuito. Aprende a diseñar y construir tus propias figuras, elaborar personajes y crear elementos de la escenografía que den vida a las historias sobre la pantalla. ¡Cupo limitado!",
      inicio: "2026-09-21",
      cuando: "Inicio: 21 de septiembre · 12 semanas",
      horario: "Lunes, miércoles y viernes · 4:30 a 6:30 p.m.",
      edades: "Público en general, desde 12 años",
      imagen: "img/cartelera/taller3.jfif",
      whatsapp: "529514165874",
    },
    {
      tipo: "taller",
      titulo: "Taller de lectoescritura del Didxazá",
      resumen:
        "Espacio dedicado a aprender, escribir y valorar nuestra lengua materna, sin importar si ya la hablas o estás comenzando desde cero.",
      inicio: "2026-09-18",
      cuando: "Inicio: 18 de septiembre",
      horario: "Mié y vie · 5:00 a 7:00 p.m. | Sáb · 11:30 a.m. a 2:00 p.m.",
      edades: "De 12 años en adelante",
      imagen: "img/cartelera/taller4.jfif",
      whatsapp: "529711429395",
    },
    {
      tipo: "taller",
      titulo: "Taller de preparación de gises pastel",
      resumen:
        "Aprenderás a elaborar tu propia gama cromática de barras pastel y a aplicarlas correctamente sobre el soporte.",
      inicio: "2026-09-17",
      fin: "2026-09-26",
      cuando: "Del 17 al 19 y del 24 al 26 de septiembre",
      horario: "10:00 a.m. a 2:00 p.m.",
      edades: "De 15 años en adelante",
      imagen: "img/cartelera/taller1.jfif",
      whatsapp: "529711422970",
    },
  ];

  /* ------------------------------------------------------------------ */
  const NOMBRE_TIPO = {
    noticia: "Noticia",
    taller: "Taller",
    exposicion: "Exposición",
    presentacion: "Presentación",
    curso: "Curso",
  };
  const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  const feed = document.getElementById("cartelera-feed");
  const filtros = document.querySelectorAll(".cartelera-filtro");
  const contFiltros = document.querySelector(".cartelera-filtros");
  const flechaIzq = document.getElementById("cartelera-flecha-izq");
  const flechaDer = document.getElementById("cartelera-flecha-der");
  const lightbox = document.getElementById("cartelera-lightbox");
  const lightboxImg = document.getElementById("cartelera-lightbox-img");
  if (!feed) return;

  let tipoActivo = "todos";
  let verPasadas = false;
  let ultimoDisparador = null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const aFecha = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const slug = (t) =>
    t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  /* Estado calculado con la fecha de hoy: nadie tiene que actualizarlo a mano */
  function estadoDe(p) {
    if (p.permanente) return { clave: "permanente", texto: "Permanente", rango: 2 };
    const ini = aFecha(p.inicio), fin = aFecha(p.fin);
    if (fin && fin < hoy) return { clave: "finalizado", texto: "Finalizado", rango: 3 };
    if (ini && ini > hoy) {
      const n = Math.round((ini - hoy) / 864e5);
      return { clave: "proximo", texto: n === 1 ? "Inicia mañana" : `Inicia en ${n} días`, rango: 0 };
    }
    return { clave: "curso", texto: "En curso", rango: 1 };
  }

  function ordenar(lista) {
    return [...lista].sort((a, b) => {
      if (a.estado.rango !== b.estado.rango) return a.estado.rango - b.estado.rango;
      const ia = aFecha(a.inicio), ib = aFecha(b.inicio), fa = aFecha(a.fin), fb = aFecha(b.fin);
      switch (a.estado.clave) {
        case "proximo": return ia - ib;                                  // el que empieza primero
        case "finalizado": return fb - fa;                               // el más reciente primero
        case "curso":
          if (fa && fb) return fa - fb;                                  // el que termina antes, primero
          if (fa) return -1;
          if (fb) return 1;
          return ib - ia;                                                // sin fecha de fin: el más nuevo primero
        default: return 0;
      }
    });
  }

  /* Cinta de fecha */
  function cintaHtml(p) {
    if (p.permanente) return `<i class="bi bi-infinity" aria-hidden="true"></i><span class="chico">Todo el año</span>`;
    const ini = aFecha(p.inicio), fin = aFecha(p.fin);
    if (!ini) return `<i class="bi bi-calendar3" aria-hidden="true"></i>`;
    const mismoMes = fin && ini.getMonth() === fin.getMonth() && ini.getFullYear() === fin.getFullYear();
    if (mismoMes && ini.getDate() !== fin.getDate())
      return `<b class="largo">${ini.getDate()}–${fin.getDate()}</b><span>${MES[ini.getMonth()]}</span>`;
    if (fin) return `<em>Del</em><b>${ini.getDate()}</b><span>${MES[ini.getMonth()]}</span>`;
    return `<em>Desde</em><b>${ini.getDate()}</b><span>${MES[ini.getMonth()]}</span>`;
  }

  function crearTarjeta(p) {
    const id = slug(p.titulo);
    const card = document.createElement("article");
    card.className = "car-card" + (p.estado.clave === "finalizado" ? " pasada" : "");
    card.id = `publicacion-${id}`;
    card.dataset.tipo = p.tipo;

    const filas = [
      p.cuando && `<li><i class="bi bi-calendar3" aria-hidden="true"></i><span>${esc(p.cuando)}</span></li>`,
      p.horario && `<li><i class="bi bi-clock" aria-hidden="true"></i><span>${esc(p.horario)}</span></li>`,
      p.edades && `<li><i class="bi bi-people" aria-hidden="true"></i><span>${esc(p.edades)}</span></li>`,
    ].filter(Boolean).join("");

    const poster = p.imagen
      ? `<button type="button" class="car-poster" aria-label="Ver el cartel de ${esc(p.titulo)} en grande">
           <img src="${esc(p.imagen)}" alt="Cartel: ${esc(p.titulo)}" loading="lazy">
           <span class="car-poster-lupa" aria-hidden="true"><i class="bi bi-arrows-fullscreen"></i></span>
         </button>`
      : `<div class="car-poster" style="cursor:default"><span class="car-sin-cartel">${esc(p.titulo)}</span></div>`;

    const urlWa = p.whatsapp
      ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent("Hola, me gustaría recibir información sobre: " + p.titulo)}`
      : "";
    const principal = urlWa && p.estado.clave !== "finalizado"
      ? `<a class="car-btn" href="${urlWa}" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i>Informes por WhatsApp</a>`
      : p.imagen
        ? `<button type="button" class="car-btn car-btn--ver"><i class="bi bi-image" aria-hidden="true"></i>Ver cartel</button>`
        : "";

    card.innerHTML = `
      ${poster}
      <div class="car-cuerpo">
        <div class="car-top">
          <div class="car-cinta" aria-hidden="true">${cintaHtml(p)}</div>
          <div class="car-head">
            <div class="car-meta">
              <span class="car-tipo">${esc(NOMBRE_TIPO[p.tipo] || p.tipo)}</span>
              <span class="car-estado" data-e="${p.estado.clave}">${esc(p.estado.texto)}</span>
            </div>
            <h3 class="car-titulo">${esc(p.titulo)}</h3>
          </div>
        </div>
        ${filas ? `<ul class="car-info">${filas}</ul>` : ""}
        ${p.resumen ? `<p class="car-resumen">${esc(p.resumen)}</p>` : ""}
        <div class="car-acciones">
          ${principal}
          <button type="button" class="car-compartir" aria-label="Compartir ${esc(p.titulo)}" title="Compartir"><i class="bi bi-share" aria-hidden="true"></i></button>
          <div class="car-menu" role="menu">
            <a class="car-wa" target="_blank" rel="noopener" role="menuitem"><i class="bi bi-whatsapp" aria-hidden="true"></i>WhatsApp</a>
            <a class="car-fb" target="_blank" rel="noopener" role="menuitem"><i class="bi bi-facebook" aria-hidden="true"></i>Facebook</a>
            <button type="button" class="car-copiar" role="menuitem"><i class="bi bi-link-45deg" aria-hidden="true"></i>Copiar enlace</button>
          </div>
        </div>
      </div>`;

    if (p.imagen) {
      card.querySelectorAll(".car-poster, .car-btn--ver").forEach((b) =>
        b.addEventListener("click", (ev) => abrirLightbox(p, ev.currentTarget))
      );
      const img = card.querySelector(".car-poster img");
      img.addEventListener("error", () => {
        const btn = card.querySelector(".car-poster");
        img.remove();
        btn.insertAdjacentHTML("beforeend", `<span class="car-sin-cartel">${esc(p.titulo)}</span>`);
      });
    }
    activarCompartir(card, p, id);
    return card;
  }

  /* ---------------- Lightbox ---------------- */
  function abrirLightbox(p, disparador) {
    ultimoDisparador = disparador;
    lightboxImg.src = p.imagen;
    lightboxImg.alt = "Cartel: " + p.titulo;
    lightbox.classList.add("abierto");
    document.getElementById("cartelera-lightbox-cerrar").focus({ preventScroll: true });
  }
  function cerrarLightbox() {
    if (!lightbox.classList.contains("abierto")) return;
    lightbox.classList.remove("abierto");
    lightboxImg.src = "";
    if (ultimoDisparador) ultimoDisparador.focus({ preventScroll: true });
  }
  document.getElementById("cartelera-lightbox-cerrar").addEventListener("click", cerrarLightbox);
  lightbox.addEventListener("click", (ev) => { if (ev.target !== lightboxImg) cerrarLightbox(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") cerrarLightbox(); });

  /* ---------------- Compartir ---------------- */
  function activarCompartir(card, p, id) {
    const btn = card.querySelector(".car-compartir");
    const menu = card.querySelector(".car-menu");
    const url = `${location.origin}${location.pathname}#publicacion-${id}`;
    const texto = `${p.titulo} — Casa de la Cultura de Juchitán`;

    btn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      if (navigator.share) {
        try { await navigator.share({ title: texto, url }); } catch (_) { /* cerró el menú */ }
        return;
      }
      document.querySelectorAll(".car-menu.abierto").forEach((m) => { if (m !== menu) m.classList.remove("abierto"); });
      menu.classList.toggle("abierto");
    });

    card.querySelector(".car-wa").href = `https://wa.me/?text=${encodeURIComponent(texto + " " + url)}`;
    card.querySelector(".car-fb").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    const copiar = card.querySelector(".car-copiar");
    copiar.addEventListener("click", () => {
      const listo = () => {
        copiar.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i>¡Enlace copiado!';
        setTimeout(() => {
          copiar.innerHTML = '<i class="bi bi-link-45deg" aria-hidden="true"></i>Copiar enlace';
          menu.classList.remove("abierto");
        }, 1200);
      };
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(listo, () => window.prompt("Copia el enlace:", url));
    });
  }
  document.addEventListener("click", () =>
    document.querySelectorAll(".car-menu.abierto").forEach((m) => m.classList.remove("abierto"))
  );

  /* ---------------- Render ---------------- */
  const todas = publicaciones.map((p) => ({ ...p, estado: estadoDe(p) }));
  const pasadas = todas.filter((p) => p.estado.clave === "finalizado");

  // Enlace para ver actividades anteriores (solo aparece si existen)
  let enlacePasadas = null;
  if (pasadas.length) {
    const wrap = document.createElement("div");
    wrap.className = "car-pasadas-wrap";
    enlacePasadas = document.createElement("button");
    enlacePasadas.type = "button";
    enlacePasadas.className = "car-pasadas";
    enlacePasadas.addEventListener("click", () => {
      verPasadas = !verPasadas;
      render();
    });
    wrap.appendChild(enlacePasadas);
    feed.closest(".cartelera-feed-wrap").after(wrap);
  }

  // Accesibilidad de los filtros (son botones de selección, no pestañas)
  if (contFiltros) { contFiltros.setAttribute("role", "group"); }

  function render() {
    const visibles = todas.filter((p) => verPasadas || p.estado.clave !== "finalizado");

    // Oculta los filtros que no tienen nada que mostrar (se reactivan solos al publicar algo)
    filtros.forEach((f) => {
      const t = f.dataset.tipo;
      f.hidden = t !== "todos" && !visibles.some((p) => p.tipo === t);
    });
    if (tipoActivo !== "todos" && !visibles.some((p) => p.tipo === tipoActivo)) tipoActivo = "todos";
    filtros.forEach((f) => {
      const on = f.dataset.tipo === tipoActivo;
      f.classList.toggle("activo", on);
      f.setAttribute("aria-pressed", on);
    });

    const lista = ordenar(visibles.filter((p) => tipoActivo === "todos" || p.tipo === tipoActivo));
    feed.innerHTML = "";
    feed.scrollLeft = 0;

    if (!lista.length) {
      feed.classList.add("cartelera-feed--centrado");
      feed.innerHTML = '<p class="cartelera-vacio">Por ahora no hay actividades publicadas. ¡Pronto compartiremos la siguiente programación!</p>';
    } else {
      feed.classList.toggle("cartelera-feed--centrado", lista.length < 3);
      lista.forEach((p) => feed.appendChild(crearTarjeta(p)));
    }

    if (enlacePasadas) {
      enlacePasadas.textContent = verPasadas
        ? "Ocultar actividades anteriores"
        : `Ver actividades anteriores (${pasadas.length})`;
    }
    requestAnimationFrame(actualizarFlechas);
  }

  /* ---------------- Navegación del carrusel ---------------- */
  function pasoTarjeta() {
    const c = feed.querySelector(".car-card");
    return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(feed).columnGap || 24) : 360;
  }
  function actualizarFlechas() {
    const max = feed.scrollWidth - feed.clientWidth;
    flechaIzq.hidden = feed.scrollLeft <= 4;
    flechaDer.hidden = max <= 4 || feed.scrollLeft >= max - 4;
  }
  flechaIzq.addEventListener("click", () => feed.scrollBy({ left: -pasoTarjeta(), behavior: "smooth" }));
  flechaDer.addEventListener("click", () => feed.scrollBy({ left: pasoTarjeta(), behavior: "smooth" }));
  feed.addEventListener("scroll", actualizarFlechas, { passive: true });
  window.addEventListener("resize", actualizarFlechas);

  filtros.forEach((f) =>
    f.addEventListener("click", () => {
      tipoActivo = f.dataset.tipo;
      render();
    })
  );

  render();
})();
