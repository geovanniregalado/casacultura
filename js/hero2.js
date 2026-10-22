(function () {
  var hero = document.querySelector(".hero");
  if (!hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var contenedorPuntos = hero.querySelector(".hero-puntos");
  var DURACION = 4000; // milisegundos que se queda cada diapositiva
  var actual = 0;
  var temporizador = null;
  var reducido =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Un punto por diapositiva
  var puntos = slides.map(function (slide, i) {
    var punto = document.createElement("button");
    punto.type = "button";
    punto.className = "hero-punto";
    punto.setAttribute(
      "aria-label",
      "Ir a la diapositiva " + (i + 1) + " de " + slides.length,
    );
    punto.addEventListener("click", function () {
      ir(i);
      reiniciar();
    });
    contenedorPuntos.appendChild(punto);
    slide.setAttribute("aria-label", i + 1 + " de " + slides.length);
    return punto;
  });

  function ir(n) {
    actual = (n + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("activa", i === actual);
      slide.setAttribute("aria-hidden", i === actual ? "false" : "true");
    });
    puntos.forEach(function (punto, i) {
      punto.classList.toggle("activo", i === actual);
      if (i === actual) {
        punto.setAttribute("aria-current", "true");
      } else {
        punto.removeAttribute("aria-current");
      }
    });
  }

  function iniciar() {
    if (reducido || slides.length < 2 || temporizador) return;
    temporizador = setInterval(function () {
      ir(actual + 1);
    }, DURACION);
  }

  function detener() {
    if (temporizador) {
      clearInterval(temporizador);
      temporizador = null;
    }
  }

  function reiniciar() {
    detener();
    iniciar();
  }

  // Se detiene mientras la persona está encima o navegando con el teclado dentro del héroe
  hero.addEventListener("mouseenter", detener);
  hero.addEventListener("mouseleave", iniciar);
  hero.addEventListener("focusin", detener);
  hero.addEventListener("focusout", iniciar);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      detener();
    } else {
      iniciar();
    }
  });

  // Deslizar con el dedo en celular
  var inicioX = null;
  hero.addEventListener(
    "touchstart",
    function (e) {
      inicioX = e.touches[0].clientX;
    },
    { passive: true },
  );
  hero.addEventListener("touchend", function (e) {
    if (inicioX === null) return;
    var dx = e.changedTouches[0].clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) {
      ir(actual + (dx < 0 ? 1 : -1));
      reiniciar();
    }
  });

  // Flechas del teclado
  hero.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      ir(actual + 1);
      reiniciar();
    }
    if (e.key === "ArrowLeft") {
      ir(actual - 1);
      reiniciar();
    }
  });

  ir(0);
  iniciar();
})();
