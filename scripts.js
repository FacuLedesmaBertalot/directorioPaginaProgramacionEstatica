document.addEventListener("DOMContentLoaded", function () {
  actualizarInfoContacto();
  iniciarEncuestaPasoAPaso();

  // --- BOTÓN BUSCAR ---
  function filtrarPropiedades() {
    const selectTipo = document.getElementById("tipo-propiedad");
    const selectPrecio = document.getElementById("filtro-precio");
    const selectUbicacion = document.getElementById("filtro-ubicacion");
    const tarjetas = document.querySelectorAll(".tarjeta-propiedad");

    if (!selectTipo.value || !selectPrecio.value || !selectUbicacion.value) {
      mostrarModal("Por favor completá todos los filtros");
      return;
    }

    const tipoFiltro = selectTipo.value.toLowerCase().trim();
    const ubicacionFiltro = selectUbicacion.value.toLowerCase().trim();
    const [precioMin, precioMax] = selectPrecio.value.split("-").map(Number);

    let algunaCoincidencia = false;

    tarjetas.forEach((tarjeta) => {
      const tipo = (tarjeta.dataset.tipo || "").toLowerCase().trim();
      const ubicacion = (tarjeta.dataset.ubicacion || "").toLowerCase().trim();
      const precio = Number(tarjeta.dataset.precio || 0);

      const cumpleTipo = tipo === tipoFiltro;
      const cumpleUbicacion = ubicacion === ubicacionFiltro;
      const cumplePrecio = precio >= precioMin && precio <= precioMax;

      if (cumpleTipo && cumplePrecio && cumpleUbicacion) {
        tarjeta.style.display = "flex";
        algunaCoincidencia = true;
      } else {
        tarjeta.style.display = "none";
      }
    });

    if (!algunaCoincidencia) {
      mostrarModal(
        "No se encontraron propiedades que coincidan con los filtros."
      );
    }
  }

  const btnBuscar = document.getElementById("btn-buscar");
  if (btnBuscar) {
    btnBuscar.addEventListener("click", () => {
      filtrarPropiedades();
    });
  }

  // --- TOGGLE MONEDA ---
  const filtroSeccion = document.querySelector(".seccion-filtro");

  if (filtroSeccion) {
    const toggleMonedaBtn = document.createElement("button");
    toggleMonedaBtn.classList.add("btn-general");
    toggleMonedaBtn.style.marginLeft = "1em";
    toggleMonedaBtn.style.display = "inline-flex";
    toggleMonedaBtn.style.alignItems = "center";
    toggleMonedaBtn.style.gap = "0.5em";

    const imgIcono = document.createElement("img");
    imgIcono.src = "img/iconos/usa.png";
    imgIcono.alt = "Icono moneda";
    imgIcono.style.width = "20px";
    imgIcono.style.height = "20px";

    const textoBoton = document.createTextNode("Mostrar en USD");

    toggleMonedaBtn.appendChild(imgIcono);
    toggleMonedaBtn.appendChild(textoBoton);
    filtroSeccion.appendChild(toggleMonedaBtn);

    const tipoCambio = 350;
    let enPesos = true;

    function textoAPrecio(texto) {
      return Number(texto.replace(/[^0-9]/g, ""));
    }

    function formatearPesos(num) {
      return "$" + num.toLocaleString("es-AR");
    }

    function formatearDolares(num) {
      return (
        "US$" +
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }

    function cambiarMoneda() {
      const tarjetas = document.querySelectorAll(".tarjeta-propiedad");
      tarjetas.forEach((tarjeta) => {
        const precioElem = tarjeta.querySelector(".precio");
        const expensas = tarjeta.querySelector(".expensas");

        if (!precioElem || !precioElem.textContent) return;

        if (!precioElem.dataset.pesos) {
          precioElem.dataset.pesos = textoAPrecio(precioElem.textContent);
        }
        if (expensas && !expensas.dataset.pesos) {
          expensas.dataset.pesos = textoAPrecio(expensas.textContent);
        }

        if (enPesos) {
          const precioUSD = precioElem.dataset.pesos / tipoCambio;
          precioElem.textContent = formatearDolares(precioUSD);
          if (expensas) {
            const expensasUSD = expensas.dataset.pesos / tipoCambio;
            expensas.textContent = `Expensas: ${formatearDolares(expensasUSD)}`;
          }
          imgIcono.src = "img/iconos/argentina.png";
          textoBoton.textContent = "Mostrar en Pesos";
        } else {
          precioElem.textContent = formatearPesos(
            Number(precioElem.dataset.pesos)
          );
          if (expensas) {
            expensas.textContent = `Expensas: ${formatearPesos(
              Number(expensas.dataset.pesos)
            )}`;
          }
          imgIcono.src = "img/iconos/usa.png";
          textoBoton.textContent = "Mostrar en USD";
        }
      });

      enPesos = !enPesos;
    }

    toggleMonedaBtn.addEventListener("click", cambiarMoneda);
  }

  /* MODAL */
  function mostrarModal(mensaje) {
    const modal = document.getElementById("modal-alerta");
    const mensajeModal = document.getElementById("mensaje-modal");
    if (!modal || !mensajeModal) return;

    mensajeModal.textContent = mensaje;
    modal.classList.remove("oculto");
  }

  window.cerrarModal = function () {
    const modal = document.getElementById("modal-alerta");
    if (!modal) return;
    modal.classList.add("oculto");
  };

  /* ACORDEON */
  window.acordeon = function (boton) {
    const item = boton.parentElement;
    const contenido = boton.nextElementSibling;

    const todosLosItems = document.querySelectorAll(".acordeon-item");
    todosLosItems.forEach((i) => {
      const btn = i.querySelector(".acordeon-boton");
      const cont = btn.nextElementSibling;

      if (i !== item) {
        i.classList.remove("activo");
        btn.classList.remove("active");
        cont.style.maxHeight = null;
      }
    });

    item.classList.toggle("activo");
    boton.classList.toggle("active");

    if (contenido.style.maxHeight) {
      contenido.style.maxHeight = null;
    } else {
      contenido.style.maxHeight = contenido.scrollHeight + "px";
    }
  };

  /* CARRUSEL */
  const carrusel = document.getElementById("carruselPropiedades");
  const contenido = carrusel.querySelector(".carrusel-contenido");
  const btnPrev = carrusel.querySelector(".anterior");
  const btnNext = carrusel.querySelector(".siguiente");
  const diapositivas = contenido.querySelectorAll(".diapositiva");
  const totalSlides = diapositivas.length;

  let indiceActual = 1;
  let enTransicion = false;

  function getSlideWidth() {
    return carrusel.offsetWidth;
  }

  function moverCarrusel() {
    contenido.style.transition = "transform 0.5s ease-in-out";
    contenido.style.transform = `translateX(-${
      getSlideWidth() * indiceActual
    }px)`;
  }

  function irASlide(index) {
    if (enTransicion) return;
    enTransicion = true;
    indiceActual = index;
    moverCarrusel();
  }

  contenido.addEventListener("transitionend", () => {
    contenido.style.transition = "none";

    if (indiceActual === totalSlides - 1) {
      indiceActual = 1;
      contenido.style.transform = `translateX(-${
        getSlideWidth() * indiceActual
      }px)`;
    }
    if (indiceActual === 0) {
      indiceActual = totalSlides - 2;
      contenido.style.transform = `translateX(-${
        getSlideWidth() * indiceActual
      }px)`;
    }

    setTimeout(() => {
      contenido.style.transition = "transform 0.5s ease-in-out";
      enTransicion = false;
    }, 20);
  });

  btnNext.addEventListener("click", () => {
    if (!enTransicion) irASlide(indiceActual + 1);
  });

  btnPrev.addEventListener("click", () => {
    if (!enTransicion) irASlide(indiceActual - 1);
  });

  window.addEventListener("resize", () => {
    contenido.style.transition = "none";
    contenido.style.transform = `translateX(-${
      getSlideWidth() * indiceActual
    }px)`;
  });

  setTimeout(() => {
    contenido.style.transition = "none";
    contenido.style.transform = `translateX(-${
      getSlideWidth() * indiceActual
    }px)`;
  }, 50);

  /* ENCUESTA */

  function iniciarEncuestaPasoAPaso() {
    const formulario = document.getElementById("form-encuesta");
    if (!formulario) return;

    const bloques = Array.from(formulario.querySelectorAll(".grupo-campo"));
    let pasoActual = 0;

    // Precargar encuestas simuladas si hay menos de 40
    function precargarEncuestasSimuladas() {
      let encuestasGuardadas =
        JSON.parse(localStorage.getItem("encuestasGuardadas")) || [];
      if (encuestasGuardadas.length < 40) {
        const faltantes = 40 - encuestasGuardadas.length;
        const simuladas = Array.from(
          { length: faltantes },
          () => Math.floor(Math.random() * 10) + 1
        );
        encuestasGuardadas = encuestasGuardadas.concat(simuladas);
        localStorage.setItem(
          "encuestasGuardadas",
          JSON.stringify(encuestasGuardadas)
        );
      }
      return encuestasGuardadas;
    }

    // Cargar encuestas guardadas desde localStorage al iniciar (precargadas si necesario)
    let encuestasGuardadas = precargarEncuestasSimuladas();

    // Ocultar todos los bloques al inicio
    bloques.forEach((bloque) => (bloque.style.display = "none"));

    // Crear botón siguiente
    const botonSiguiente = document.createElement("button");
    botonSiguiente.type = "button";
    botonSiguiente.textContent = "Siguiente";
    botonSiguiente.className = "btn-general";
    formulario.appendChild(botonSiguiente);

    // Mostrar primer paso
    mostrarPaso(bloques, pasoActual);

    botonSiguiente.addEventListener("click", () => {
      if (!validarCampo(bloques[pasoActual])) {
        mostrarModal("Por favor, completa este campo antes de continuar.");
        return;
      }

      bloques[pasoActual].style.display = "none";
      pasoActual++;

      if (pasoActual < bloques.length) {
        mostrarPaso(bloques, pasoActual);
      } else {
        botonSiguiente.remove();
        mostrarMensajeFinal(formulario, encuestasGuardadas);
      }
    });
  }

  function mostrarPaso(bloques, indice) {
    bloques[indice].style.display = "block";
    const campo = bloques[indice].querySelector("input, select, textarea");
    if (campo) campo.focus();
  }

  function validarCampo(bloque) {
    const radios = bloque.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
      return Array.from(radios).some((radio) => radio.checked);
    }
    const campo = bloque.querySelector("input, select, textarea");
    return campo ? campo.checkValidity() : true;
  }

  function mostrarMensajeFinal(formulario, encuestasGuardadas) {
    const experienciaElem = document.getElementById("experiencia");
    const comentariosElem = document.getElementById("comentarios");

    const experienciaActual = experienciaElem
      ? parseInt(experienciaElem.value)
      : null;
    const comentarioActual = comentariosElem
      ? comentariosElem.value.trim()
      : "";

    // Guardar nueva nota
    if (experienciaActual !== null && !isNaN(experienciaActual)) {
      encuestasGuardadas.push(experienciaActual);
      localStorage.setItem(
        "encuestasGuardadas",
        JSON.stringify(encuestasGuardadas)
      );
    }

    // Guardar comentario
    if (comentarioActual !== "") {
      let comentariosGuardados =
        JSON.parse(localStorage.getItem("comentariosGuardados")) || [];
      comentariosGuardados.push(comentarioActual);
      localStorage.setItem(
        "comentariosGuardados",
        JSON.stringify(comentariosGuardados)
      );
    }

    // Calcular promedio
    const suma = encuestasGuardadas.reduce((acc, val) => acc + val, 0);
    const promedio = (suma / encuestasGuardadas.length).toFixed(1);

    // Mostrar mensaje final
    formulario.innerHTML = `
    <p style="
      font-size: 1.5rem;
      color: var(--secundario);
      text-align: center;
    ">
      Muchas gracias por tomarse el tiempo de responder esta encuesta.<br>
      <strong>Promedio histórico de satisfacción:</strong> ${promedio}/10<br>
      <strong>Total de encuestas realizadas:</strong> ${encuestasGuardadas.length}
    </p>
  `;

    setTimeout(() => {
      window.location.href = "index.html";
    }, 4000);
  }

  /* ACTUALIZAR SEGUN CIUDAD */
  function actualizarInfoContacto() {
    const selectCiudad = document.getElementById("select-ciudad");
    const mapaIframe = document.getElementById("mapa-oficina");

    const datosCiudades = {
      neuquen: {
        whatsapp: "+5491122334455",
        direccion: "Av. Argentina 1100, Neuquén, Argentina",
        mapaSrc:
          "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12411.52472528442!2d-68.058784977771!3d-38.949542742503425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sar!4v1718380993105!5m2!1ses-419!2sar",
      },
      "buenos-aires": {
        whatsapp: "+5491555555555",
        direccion: "Av. Buenos Aires 123, Buenos Aires, Argentina",
        mapaSrc:
          "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12411.52472528442!2d-58.385984977771!3d-34.615542742503425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sar!4v1718380993105!5m2!1ses-419!2sar",
      },
      cordoba: {
        whatsapp: "+5491666666666",
        direccion: "Av. Córdoba 456, Córdoba, Argentina",
        mapaSrc:
          "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12411.52472528442!2d-64.181784977771!3d-31.416542742503425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sar!4v1718380993105!5m2!1ses-419!2sar",
      },
      rosario: {
        whatsapp: "+5491777777777",
        direccion: "Av. Rosario 789, Rosario, Argentina",
        mapaSrc:
          "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12411.52472528442!2d-60.665784977771!3d-32.951542742503425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sar!4v1718380993105!5m2!1ses-419!2sar",
      },
    };

    function actualizarDatosCiudad(ciudad) {
      const data = datosCiudades[ciudad];
      if (data) {
        document.getElementById("whatsapp").textContent = data.whatsapp;
        document.getElementById("direccion").textContent = data.direccion;
        mapaIframe.src = data.mapaSrc;
      }
    }

    if (selectCiudad) {
      selectCiudad.addEventListener("change", function () {
        actualizarDatosCiudad(this.value);
      });

      actualizarDatosCiudad(selectCiudad.value);
    }
  }


});