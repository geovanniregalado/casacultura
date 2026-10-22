(function () {
  var seccion = document.getElementById("cifras");
  if (!seccion || !("IntersectionObserver" in window)) return;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  var numeros = Array.prototype.slice.call(
    seccion.querySelectorAll("strong[data-valor]"),
  );

  function formatear(n, el) {
    var texto =
      el.dataset.miles === "si" ? n.toLocaleString("en-US") : String(n);
    return (el.dataset.prefijo || "") + texto + (el.dataset.sufijo || "");
  }

  // Empiezan en cero y suben hasta su valor, frenando suavemente al final
  function contar(el) {
    var meta = parseInt(el.dataset.valor, 10);
    var duracion = 2600;
    var inicio = null;

    function paso(t) {
      if (inicio === null) inicio = t;
      var avance = Math.min((t - inicio) / duracion, 1);
      var suave = 1 - Math.pow(1 - avance, 3);
      el.textContent = formatear(Math.round(meta * suave), el);
      if (avance < 1) requestAnimationFrame(paso);
    }

    el.textContent = formatear(0, el);
    requestAnimationFrame(paso);
  }

  // Arrancan en cero para que no se vea un parpadeo del valor final antes de contar
  numeros.forEach(function (el) {
    el.textContent = formatear(0, el);
  });

  var observador = new IntersectionObserver(
    function (entradas) {
      if (entradas[0].isIntersecting) {
        numeros.forEach(contar);
        observador.disconnect();
      }
    },
    { threshold: 0.4 },
  );

  observador.observe(seccion);
})();
