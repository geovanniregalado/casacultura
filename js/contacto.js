(function () {
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xljdpzve";

  const form = document.getElementById("form-contacto");
  const btnEnviar = document.getElementById("btn-enviar");
  const estado = document.getElementById("estado-formulario");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando…";
    estado.className = "contacto-mensaje-estado";
    estado.textContent = "";

    try {
      const respuesta = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (respuesta.ok) {
        estado.textContent = "¡Mensaje enviado! Te responderemos pronto.";
        estado.className = "contacto-mensaje-estado exito";
        form.reset();
      } else {
        throw new Error("Error en el envío");
      }
    } catch (error) {
      estado.textContent =
        "No se pudo enviar el mensaje. Intenta de nuevo o escríbenos por WhatsApp.";
      estado.className = "contacto-mensaje-estado error";
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar mensaje";
    }
  });
})();
