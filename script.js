const DESTINO_EMAIL = "ofrpremios@gmail.com";

const sectionInicio = document.getElementById("inicio");
const sectionFormulario = document.getElementById("formulario");
const btnPropuesta = document.getElementById("btnPropuesta");
const btnNavInicio = document.getElementById("btnNavInicio");
const proposalForm = document.getElementById("proposalForm");
const statusMessage = document.getElementById("statusMessage");
const sectionCarruselInicio = document.getElementById("carruselInicio");
const carouselViewport = document.querySelector(".carousel-viewport");
const carouselTrack = document.querySelector("[data-carousel-track]");
const carouselDotsContainer = document.querySelector("[data-carousel-dots]");
const btnCarouselPrev = document.querySelector(".carousel-arrow-prev");
const btnCarouselNext = document.querySelector(".carousel-arrow-next");

const CAROUSEL_MEDIA_FILES = [
  "f1.jpg",
  "f2.jpeg",
  "f3.jpeg",
  "f4.jpg",
  "f5.jpeg",
  "f6.jpeg",
  "f7.jpeg",
  "f8.jpeg",
  "f9.jpeg",
  "f10.jpeg",
  "f11.jpeg",
  "f12.jpeg",
  "f13.jpeg",
  "f14.jpeg",
  "f15.jpeg",
  "f16.jpeg",
  "f17.jpeg",
  "v18.mp4",
  "v19.mp4",
  "v20.mp4",
];

let carouselIndex = 0;
let carouselTrackIndex = 0;
let carouselRealSlidesCount = 0;
let carouselTimer = null;
let carouselDots = [];
let carouselSlides = [];
let videoEnPantallaCompleta = null;

function poblarCarruselConMedios() {
  if (!carouselTrack) return;

  carouselTrack.innerHTML = "";

  CAROUSEL_MEDIA_FILES.forEach((nombreArchivo, index) => {
    const slide = document.createElement("figure");
    slide.className = "carousel-slide";

    const ruta = `img/carrusel/${nombreArchivo}`;
    const esVideo = /\.mp4$/i.test(nombreArchivo);

    if (esVideo) {
      const video = document.createElement("video");
      video.src = ruta;
      video.muted = true;
      video.loop = true;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", `Video destacado ${index + 1}`);
      slide.appendChild(video);
    } else {
      const imagen = document.createElement("img");
      imagen.src = ruta;
      imagen.alt = `Imagen destacada ${index + 1}`;
      slide.appendChild(imagen);
    }

    carouselTrack.appendChild(slide);
  });

  carouselSlides = Array.from(carouselTrack.querySelectorAll(".carousel-slide"));
  carouselRealSlidesCount = carouselSlides.length;

  if (carouselRealSlidesCount > 1) {
    const primerClone = carouselSlides[0].cloneNode(true);
    const ultimoClone = carouselSlides[carouselRealSlidesCount - 1].cloneNode(true);

    primerClone.dataset.clone = "primer";
    ultimoClone.dataset.clone = "ultimo";

    carouselTrack.appendChild(primerClone);
    carouselTrack.insertBefore(ultimoClone, carouselTrack.firstChild);

    carouselSlides = Array.from(carouselTrack.querySelectorAll(".carousel-slide"));
    carouselTrackIndex = 1;
  } else {
    carouselTrackIndex = 0;
  }

  carouselIndex = 0;
}

function solicitarPantallaCompleta(elemento) {
  if (!elemento) return;

  if (typeof elemento.requestFullscreen === "function") {
    elemento.requestFullscreen().catch(() => {});
    return;
  }

  if (typeof elemento.webkitRequestFullscreen === "function") {
    elemento.webkitRequestFullscreen();
  }
}

function habilitarVistaCompletaVideos() {
  if (carouselSlides.length === 0) return;

  carouselSlides.forEach((slide) => {
    const video = slide.querySelector("video");
    if (!video || video.dataset.fullscreenReady === "true") return;

    video.dataset.fullscreenReady = "true";
    video.addEventListener("click", () => {
      videoEnPantallaCompleta = video;
      video.muted = false;
      video.loop = false;
      const promesaPlay = video.play();
      if (promesaPlay && typeof promesaPlay.catch === "function") {
        promesaPlay.catch(() => {});
      }
      detenerAutoplayCarrusel();
      solicitarPantallaCompleta(video);
    });
  });
}

function aplicarFaviconCircular() {
  const favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) return;

  const imagen = new Image();
  imagen.src = favicon.getAttribute("href") || "img/logo.png";

  imagen.onload = () => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const contexto = canvas.getContext("2d");
    if (!contexto) return;

    contexto.clearRect(0, 0, size, size);
    contexto.beginPath();
    contexto.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    contexto.closePath();
    contexto.clip();

    contexto.drawImage(imagen, 0, 0, size, size);

    favicon.setAttribute("type", "image/png");
    favicon.setAttribute("href", canvas.toDataURL("image/png"));
  };
}

aplicarFaviconCircular();

function mostrarSeccion(seccion) {
  [sectionInicio, sectionFormulario].forEach((item) => {
    item.classList.remove("active");
  });
  seccion.classList.add("active");

  if (sectionCarruselInicio) {
    sectionCarruselInicio.classList.toggle("is-hidden", seccion !== sectionInicio);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarError(texto) {
  statusMessage.textContent = texto;
  statusMessage.classList.remove("ok");
}

function mostrarOk(texto) {
  statusMessage.textContent = texto;
  statusMessage.classList.add("ok");
}

function actualizarCarrusel(animar = true) {
  if (!carouselTrack || !carouselViewport || carouselSlides.length === 0) return;

  const slideActiva = carouselSlides[carouselTrackIndex];
  const desplazamiento = slideActiva.offsetLeft - (carouselViewport.clientWidth - slideActiva.clientWidth) / 2;

  if (!animar) {
    carouselTrack.style.transition = "none";
  } else {
    carouselTrack.style.transition = "";
  }

  carouselTrack.style.transform = `translateX(-${desplazamiento}px)`;

  if (!animar) {
    carouselTrack.getBoundingClientRect();
    carouselTrack.style.transition = "";
  }

  carouselSlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === carouselTrackIndex);

    const video = slide.querySelector("video");
    if (!video) return;

    if (index === carouselTrackIndex) {
      const promesaPlay = video.play();
      if (promesaPlay && typeof promesaPlay.catch === "function") {
        promesaPlay.catch(() => {});
      }
      return;
    }

    video.pause();
    video.currentTime = 0;
  });

  carouselDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === carouselIndex);
    dot.setAttribute("aria-current", index === carouselIndex ? "true" : "false");
  });
}

function siguienteSlide() {
  if (carouselSlides.length === 0) return;
  if (carouselRealSlidesCount <= 1) {
    actualizarCarrusel();
    return;
  }

  carouselIndex = (carouselIndex + 1) % carouselRealSlidesCount;
  carouselTrackIndex += 1;
  actualizarCarrusel();
}

function anteriorSlide() {
  if (carouselSlides.length === 0) return;
  if (carouselRealSlidesCount <= 1) {
    actualizarCarrusel();
    return;
  }

  carouselIndex = (carouselIndex - 1 + carouselRealSlidesCount) % carouselRealSlidesCount;
  carouselTrackIndex -= 1;
  actualizarCarrusel();
}

function detenerAutoplayCarrusel() {
  if (!carouselTimer) return;
  clearInterval(carouselTimer);
  carouselTimer = null;
}

function iniciarAutoplayCarrusel() {
  if (carouselRealSlidesCount < 2) return;
  detenerAutoplayCarrusel();
  carouselTimer = setInterval(siguienteSlide, 4000);
}

function crearDotsCarrusel() {
  if (!carouselDotsContainer || carouselRealSlidesCount === 0) return;

  carouselDotsContainer.innerHTML = "";
  carouselDots = Array.from({ length: carouselRealSlidesCount }, (_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ir al elemento ${index + 1}`);
    dot.addEventListener("click", () => {
      carouselIndex = index;
      carouselTrackIndex = carouselRealSlidesCount > 1 ? index + 1 : index;
      actualizarCarrusel();
      iniciarAutoplayCarrusel();
    });
    carouselDotsContainer.appendChild(dot);
    return dot;
  });
}

function corregirLoopCarrusel() {
  if (carouselRealSlidesCount <= 1) return;

  if (carouselTrackIndex === 0) {
    carouselTrackIndex = carouselRealSlidesCount;
    actualizarCarrusel(false);
    return;
  }

  if (carouselTrackIndex === carouselRealSlidesCount + 1) {
    carouselTrackIndex = 1;
    actualizarCarrusel(false);
  }
}

btnPropuesta.addEventListener("click", () => {
  statusMessage.textContent = "";
  mostrarSeccion(sectionFormulario);
});

btnNavInicio.addEventListener("click", () => {
  statusMessage.textContent = "";
  proposalForm.reset();
  mostrarSeccion(sectionInicio);
});

poblarCarruselConMedios();
habilitarVistaCompletaVideos();

if (carouselSlides.length > 0) {
  crearDotsCarrusel();
  actualizarCarrusel();
  iniciarAutoplayCarrusel();

  if (carouselTrack) {
    carouselTrack.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "transform") return;
      corregirLoopCarrusel();
    });
  }

  if (btnCarouselPrev && btnCarouselNext) {
    btnCarouselPrev.addEventListener("click", () => {
      anteriorSlide();
      iniciarAutoplayCarrusel();
    });

    btnCarouselNext.addEventListener("click", () => {
      siguienteSlide();
      iniciarAutoplayCarrusel();
    });
  }

  window.addEventListener("resize", actualizarCarrusel);
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) return;
  if (!videoEnPantallaCompleta) return;

  videoEnPantallaCompleta.muted = true;
  videoEnPantallaCompleta.loop = true;
  videoEnPantallaCompleta = null;
  iniciarAutoplayCarrusel();
});

function construirUrlCorreo(canal, asunto, cuerpo, toAddress) {
  const to = encodeURIComponent(toAddress || DESTINO_EMAIL);
  const subject = encodeURIComponent(asunto);
  const body = encodeURIComponent(cuerpo);

  if (canal === "mailto") {
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }

  if (canal === "gmail") {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  }

  if (canal === "outlook") {
    return `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
  }

  if (canal === "yahoo") {
    return `https://compose.mail.yahoo.com/?to=${to}&subject=${subject}&body=${body}`;
  }

  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function esDispositivoMovil() {
  const ua = navigator.userAgent || "";
  return /Mobi|Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
}

proposalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const categoria = proposalForm.categoria.value.trim();
  const premiado = proposalForm.premiado.value.trim();
  const justificacion = proposalForm.justificacion.value.trim();
  // Elegir canal: en móvil usar mailto para abrir la app nativa, en escritorio usar Gmail web
  const canalEnvio = esDispositivoMovil() ? "mailto" : "gmail";

  if (!categoria || !premiado || !justificacion) {
    mostrarError("Debes completar todos los campos antes de enviar.");
    return;
  }

  const asunto = categoria;
  const cuerpo = [
    `Premiado: ${premiado}`,
    `Justificación/Motivo: ${justificacion}`,
  ].join("\n");

  const destino = construirUrlCorreo(canalEnvio, asunto, cuerpo);

  if (canalEnvio === "mailto") {
    mostrarOk("Se abrirá la app de correo con un borrador para que puedas enviarlo.");
    // Abrimos mailto para que el móvil lance la app nativa con asunto y cuerpo rellenados
    window.location.href = destino;
    return;
  }

  mostrarOk("Se abrirá Gmail en una pestaña nueva para que puedas enviarlo.");
  const ventana = window.open(destino, "_blank");

  if (ventana) {
    ventana.opener = null;
  } else {
    window.location.href = destino;
  }
});
