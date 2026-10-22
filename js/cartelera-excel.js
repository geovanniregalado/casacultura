/* ==========================================================================
   CARTELERA · Casa de la Cultura de Juchitán
   Lee data/cartelera.csv (que se guarda desde data/cartelera.xlsx) y arma las
   tarjetas. Para agregar o quitar actividades NO se toca este archivo: se edita
   el Excel, se guarda como CSV UTF-8 y se sube a la carpeta data/.
   Carteles: img/cartelera/
   ========================================================================== */
(function () {
  const CSV_URL = "data/cartelera.csv";
  const CARPETA_CARTELES = "img/cartelera/";
  /* ------------------------------------------------------------------ */
  const NOMBRE_TIPO = {
    noticia: "Noticia",
    taller: "Taller",
    exposicion: "Exposición",
    presentacion: "Presentación",
    curso: "Curso",
    actividad: "Actividad",
  };
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
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
    s = (s || "").toString().trim();
    if (!s) return null;
    let y, m, d, r;
    if ((r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +r[1]; m = +r[2]; d = +r[3]; }
    else if ((r = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/))) { d = +r[1]; m = +r[2]; y = +r[3]; if (y < 100) y += 2000; }
    else return null;
    const f = new Date(y, m - 1, d);
    return isNaN(f) || f.getMonth() !== m - 1 ? null : f;
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
    if (fin && +ini !== +fin) return `<em>Del</em><b>${ini.getDate()}</b><span>${MES[ini.getMonth()]}</span>`;
    if (fin) return `<b>${ini.getDate()}</b><span>${MES[ini.getMonth()]}</span>`;     // actividad de un solo día
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
  let todas = [];
  let pasadas = [];
  let enlacePasadas = null;

  // Recibe las actividades ya leídas del CSV y arma la lista y el enlace de "anteriores"
  function construir(publicaciones) {
    todas = publicaciones.map((p) => ({ ...p, estado: estadoDe(p) }));
    pasadas = todas.filter((p) => p.estado.clave === "finalizado");
    if (!pasadas.length) return;
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

  /* ---------------- Lectura del CSV (Excel guardado como CSV) ---------------- */
  const norm = (t) => (t || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

  function leerCSV(t) {                       // detecta coma o punto y coma (Excel en español a veces usa ;)
    t = t.replace(/^\uFEFF/, "");
    const h = t.split(/\r?\n/)[0], sep = (h.match(/;/g) || []).length > (h.match(/,/g) || []).length ? ";" : ",";
    const filas = []; let fila = [], campo = "", q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; }
      else if (c === '"') q = true;
      else if (c === sep) { fila.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; fila.push(campo); filas.push(fila); fila = []; campo = ""; }
      else campo += c;
    }
    if (campo || fila.length) { fila.push(campo); filas.push(fila); }
    return filas;
  }

  const fechaLarga = (d) => `${d.getDate()} de ${MESES[d.getMonth()]}`;

  // Si la columna "Fecha (texto)" va vacía, la fecha se arma sola con Inicio y Fin
  function textoFecha(permanente, ini, fin) {
    if (permanente) return "Todo el año";
    if (ini && fin && +ini !== +fin) {
      if (ini.getMonth() === fin.getMonth() && ini.getFullYear() === fin.getFullYear())
        return `Del ${ini.getDate()} al ${fechaLarga(fin)}`;
      return `Del ${fechaLarga(ini)} al ${fechaLarga(fin)}`;
    }
    if (ini && fin) return fechaLarga(ini);
    if (ini) return `Inicio: ${fechaLarga(ini)}`;
    return "";
  }

  // 10 dígitos -> agrega 52; acepta 52..., 521... o con espacios y guiones
  function limpiarWhatsapp(v) {
    let n = (v || "").replace(/\D/g, "");
    if (n.length === 13 && n.startsWith("521")) n = "52" + n.slice(3);
    if (n.length === 10) n = "52" + n;
    return n.length >= 11 ? n : "";
  }

  function aPublicaciones(filas) {
    if (!filas.length) return [];
    const cab = filas[0].map(norm), col = (k) => cab.findIndex((h) => h.startsWith(k));
    const ix = {
      tipo: col("tipo"), titulo: col("titulo"), resumen: col("descripcion"), inicio: col("inicio"), fin: col("fin"),
      cuando: col("fecha"), horario: col("horario"), edades: col("edad"), imagen: col("cartel"),
      whatsapp: col("whatsapp"), perm: col("permanente"), pub: col("publicar"),
    };
    return filas.slice(1).map((r) => {
      const v = (k) => (ix[k] > -1 ? (r[ix[k]] || "").trim() : "");
      const t = norm(v("tipo"));
      const ini = aFecha(v("inicio")), fin = aFecha(v("fin"));
      const permanente = ["si", "sí", "x", "1", "true", "yes"].includes(norm(v("perm")));
      const img = v("imagen");
      return {
        tipo: NOMBRE_TIPO[t] ? t : "actividad",
        titulo: v("titulo"),
        resumen: v("resumen"),
        inicio: ini ? `${ini.getFullYear()}-${ini.getMonth() + 1}-${ini.getDate()}` : "",
        fin: fin ? `${fin.getFullYear()}-${fin.getMonth() + 1}-${fin.getDate()}` : "",
        permanente,
        cuando: v("cuando") || textoFecha(permanente, ini, fin),
        horario: v("horario"),
        edades: v("edades"),
        imagen: img && (/[\/:]/.test(img) ? img : CARPETA_CARTELES + img),
        whatsapp: limpiarWhatsapp(v("whatsapp")),
        _pub: norm(v("pub")),
      };
    }).filter((p) => p.titulo && p._pub !== "no");
  }

  async function cargar() {
    try { const r = await fetch(CSV_URL, { cache: "no-cache" }); if (!r.ok) throw 0; return await r.text(); }
    catch (_) { const b = document.getElementById("cartelera-respaldo"); if (b) return b.textContent.trim(); throw new Error("No se pudo cargar " + CSV_URL); }
  }

  flechaIzq.hidden = flechaDer.hidden = true;
  feed.classList.add("cartelera-feed--centrado");
  feed.innerHTML = '<p class="cartelera-vacio">Cargando cartelera…</p>';

  cargar()
    .then((t) => { construir(aPublicaciones(leerCSV(t))); render(); })
    .catch(() => {
      feed.classList.add("cartelera-feed--centrado");
      feed.innerHTML = '<p class="cartelera-vacio">No pudimos cargar la cartelera. Intenta de nuevo más tarde.</p>';
    });
})();
