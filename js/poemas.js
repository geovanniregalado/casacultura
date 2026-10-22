(function () {
  /* =========================================================
       CONFIGURACIÓN — AJUSTA AQUÍ
    ========================================================= */
  const API_KEY = "AIzaSyDL92hbqX-MTQJI_AIic8Mm4uyeU8cr8fQ"; // AJUSTA AQUÍ: pega tu API key de YouTube Data API v3
  const PLAYLIST_ID = "PLUVtiWasxSXQ"; // AJUSTA AQUÍ: pega el ID de tu playlist (lo sacas de la URL de la playlist en YouTube)
  const MAX_VIDEOS = 12; // cuántos videos mostrar como máximo
  const POR_PAGINA = 2; // cuántas cápsulas de la grilla se ven antes de dar clic en "Cargar más" (destacada + 2 = 3 visibles al inicio)

  let cantidadVisible = POR_PAGINA; // se va incrementando cada vez que se da clic en "Cargar más"

  /* =========================================================
     Convención opcional para el título de cada video en YouTube:
     "Nombre del poeta — Título del poema"
     (con guion largo " — "). Si tus títulos no siguen este
     formato, el código simplemente muestra el título completo
     y no separa autor/poema.
  ========================================================= */
  function separarAutorYTitulo(tituloCompleto) {
    const partes = tituloCompleto.split(" — ");
    if (partes.length === 2) {
      return { autor: partes[0].trim(), titulo: partes[1].trim() };
    }
    return { autor: "", titulo: tituloCompleto };
  }

  function formatearDuracion(isoDuration) {
    // Convierte formato ISO 8601 (ej. "PT2M14S") a "2:14"
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const horas = parseInt(match[1] || 0, 10);
    const minutos = parseInt(match[2] || 0, 10);
    const segundos = parseInt(match[3] || 0, 10);
    const mm = horas > 0 ? String(minutos).padStart(2, "0") : String(minutos);
    const ss = String(segundos).padStart(2, "0");
    return horas > 0 ? `${horas}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function crearIframe(videoId) {
    const iframe = document.createElement("iframe");
    // modestbranding reduce el logo de YouTube; rel=0 evita sugerencias de otros canales al terminar;
    // iv_load_policy=3 desactiva anotaciones. YouTube no permite quitar el 100% de su marca
    // (por ejemplo, el nombre del canal puede asomar brevemente al pausar), pero esto la minimiza.
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    return iframe;
  }

  async function cargarPlaylist() {
    const contenedor = document.getElementById("didxaguie-contenido");

    try {
      // 1. Obtener los videos de la playlist
      const urlPlaylist = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_VIDEOS}&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
      const resPlaylist = await fetch(urlPlaylist);
      const dataPlaylist = await resPlaylist.json();

      if (!dataPlaylist.items || dataPlaylist.items.length === 0) {
        contenedor.innerHTML =
          '<div class="dg-error">Todavía no hay cápsulas publicadas.</div>';
        return;
      }

      const videoIds = dataPlaylist.items.map(
        (item) => item.snippet.resourceId.videoId,
      );

      // 2. Obtener duración de cada video (playlistItems no la incluye)
      const urlDetalles = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}&key=${API_KEY}`;
      const resDetalles = await fetch(urlDetalles);
      const dataDetalles = await resDetalles.json();

      const duraciones = {};
      dataDetalles.items.forEach((item) => {
        duraciones[item.id] = formatearDuracion(item.contentDetails.duration);
      });

      // 3. Armar la lista de videos con todo lo que necesitamos
      const videos = dataPlaylist.items.map((item) => {
        const videoId = item.snippet.resourceId.videoId;
        const { autor, titulo } = separarAutorYTitulo(item.snippet.title);
        return {
          videoId,
          autor,
          titulo,
          miniatura: item.snippet.thumbnails.high
            ? item.snippet.thumbnails.high.url
            : item.snippet.thumbnails.default.url,
          duracion: duraciones[videoId] || "",
          fechaAgregado: item.snippet.publishedAt, // fecha en que se agregó a la playlist, para poder ordenar por "más reciente"
        };
      });

      // 4. Ordenar: el más reciente agregado a la playlist va primero (será la cápsula destacada)
      videos.sort(
        (a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado),
      );

      renderizar(videos);
    } catch (error) {
      console.error("Error al cargar Diidxaguie':", error);
      contenedor.innerHTML =
        '<div class="dg-error">No se pudieron cargar las cápsulas en este momento.</div>';
    }
  }

  let todosLosVideos = []; // se guarda aquí para poder "cargar más" sin volver a llamar a la API
  let elementoActivo = null; // la tarjeta/destacada que está reproduciendo un video ahorita
  let contenidoOriginalActivo = ""; // cómo se veía esa tarjeta antes de reproducirse, para poder restaurarla

  function renderizar(videos) {
    todosLosVideos = videos;
    dibujar();
  }

  function dibujar() {
    const contenedor = document.getElementById("didxaguie-contenido");
    contenedor.innerHTML = "";
    elementoActivo = null; // al reconstruir la sección (ej. "Cargar más"), ya no hay ningún video reproduciéndose

    const [destacado, ...resto] = todosLosVideos;
    const visibles = resto.slice(0, cantidadVisible);

    // --- Cápsula destacada ---
    const destacada = document.createElement("div");
    destacada.className = "dg-destacada";
    destacada.innerHTML = `
      <div class="dg-destacada-visual" data-video-id="${destacado.videoId}">
        <img src="${destacado.miniatura}" alt="${destacado.titulo}">
        <div class="dg-degradado"></div>
        <div class="dg-play-grande">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.15)" stroke="#fff" stroke-width="1.5"/>
            <polygon points="27,23 27,41 43,32" fill="#fff"/>
          </svg>
        </div>
        <div class="dg-info-destacada">
          <span class="dg-badge">Última cápsula</span>
          <div class="dg-titulo-destacada">${destacado.titulo}</div>
          <div class="dg-meta-destacada">${destacado.autor ? destacado.autor + " · " : ""}${destacado.duracion} min</div>
        </div>
      </div>
    `;
    contenedor.appendChild(destacada);

    // --- Grilla de las demás cápsulas (solo las que tocan según cantidadVisible) ---
    if (visibles.length > 0) {
      const grid = document.createElement("div");
      grid.className = "dg-grid";

      visibles.forEach((video) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "dg-tarjeta";
        tarjeta.dataset.videoId = video.videoId;
        tarjeta.innerHTML = `
          <img src="${video.miniatura}" alt="${video.titulo}">
          <span class="dg-duracion">${video.duracion}</span>
          <div class="dg-play-chico"></div>
          <div class="dg-info-tarjeta">
            <div class="dg-titulo-tarjeta">${video.titulo}</div>
            ${video.autor ? `<div class="dg-autor-tarjeta">${video.autor}</div>` : ""}
          </div>
        `;
        grid.appendChild(tarjeta);
      });

      contenedor.appendChild(grid);
    }

    // --- Botón "Cargar más cápsulas", solo si quedan videos por mostrar ---
    if (resto.length > cantidadVisible) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "dg-cargar-mas";
      boton.textContent = "Cargar más cápsulas";
      boton.addEventListener("click", () => {
        cantidadVisible += POR_PAGINA;
        dibujar();
      });
      contenedor.appendChild(boton);
    }

    // --- Reproducir al hacer clic (solo un video a la vez) ---
    contenedor.querySelectorAll("[data-video-id]").forEach((el) => {
      el.addEventListener("click", () => {
        // Si ya había otro video reproduciéndose, lo regresamos a su miniatura
        if (elementoActivo && elementoActivo !== el) {
          elementoActivo.innerHTML = contenidoOriginalActivo;
        }

        const videoId = el.dataset.videoId;
        contenidoOriginalActivo = el.innerHTML; // guardamos cómo se veía para poder restaurarlo después
        elementoActivo = el;

        el.innerHTML = "";
        el.appendChild(crearIframe(videoId));
      });
    });
  }

  cargarPlaylist();
})();
