(() => {
  /* ===================== DATOS ===================== */
  // TODO: reemplaza PRENDAS por las prendas reales del usuario (API / base de datos).
  // "equipada: true" deja esa prenda preseleccionada.
  const PRENDAS = [
    {
      id: "chaqueta-monteverde",
      nombre: "Chaqueta Impermeable Monteverde Negra",
      categoria: "Chaqueta",
      etiqueta: "GORE-TEX PRO",
      imagen: "assets/chaqueta-placeholder.webp",
      equipada: true,
    },
    {
      id: "camiseta-amazonas",
      nombre: "Camiseta Amazonas Terreo",
      categoria: "Camisa táctica pesca",
      etiqueta: "",
      imagen: "assets/camisa-placeholder.webp",
      equipada: false,
    },
  ];
  const PRENDA_FALLBACK = "assets/chaqueta-placeholder.svg";

  // Escala de esfuerzo percibido (RPE 1-5). Los iconos son anillos que se completan.
  const RPE = [
    { valor: 1, etiqueta: "Agotado" },
    { valor: 2, etiqueta: "Cansado" },
    { valor: 3, etiqueta: "Bien" },
    { valor: 4, etiqueta: "Fuerte" },
    { valor: 5, etiqueta: "Increíble" },
  ];

  /* ===================== UTILIDADES ===================== */
  const $ = (id) => document.getElementById(id);
  const form = $("registro-form");
  const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Solo permite números (y coma/punto con 2 decimales si decimal = true) y respeta un máximo.
  function soloNumeros(el, { decimal = false, max = null, pad = false } = {}) {
    el.addEventListener("input", () => {
      let v = el.value.replace(decimal ? /[^\d.,]/g : /\D/g, "");
      if (decimal) {
        v = v.replace(",", ".");
        const [ent, ...dec] = v.split(".");
        v = dec.length ? `${ent}.${dec.join("").slice(0, 2)}` : ent;
      }
      if (max !== null && v !== "" && Number(v) > max) v = String(max);
      el.value = v;
    });
    if (pad) el.addEventListener("blur", () => { if (el.value) el.value = el.value.padStart(2, "0"); });
  }

  soloNumeros($("distancia"), { decimal: true, max: 1000 });
  soloNumeros($("horas"), { max: 99 });
  soloNumeros($("minutos"), { max: 59, pad: true });
  soloNumeros($("desnivel"), { max: 9999 });
  soloNumeros($("altitud"), { max: 8849 });
  soloNumeros($("calorias"), { max: 20000 });

  // Fecha: no permite fechas futuras.
  const hoy = new Date();
  $("fecha").max = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /* ===================== UNIDAD DE DISTANCIA ===================== */
  let unidad = "km";
  $("unidad").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-unit]");
    if (!btn) return;
    unidad = btn.dataset.unit;
    $("unidad").querySelectorAll("button").forEach((b) => {
      const activo = b === btn;
      b.classList.toggle("is-active", activo);
      b.setAttribute("aria-pressed", String(activo));
    });
  });

  /* ===================== PRENDAS ===================== */
  function renderPrendas() {
    const html = PRENDAS.map((p) => `
      <label class="gear">
        <input type="radio" name="prenda" value="${escapar(p.id)}" class="sr-only" ${p.equipada ? "checked" : ""} />
        <span class="gear__card">
          <span class="gear__photo">
            <img class="gear__img" src="${escapar(p.imagen)}" alt="" loading="lazy" />
            ${p.etiqueta ? `<span class="gear__tag">${escapar(p.etiqueta)}</span>` : ""}
            <span class="gear__check"><img src="assets/icons/check-white.svg" alt="" width="14" height="14" /></span>
          </span>
          <span class="gear__body">
            <span class="gear__eyebrow">${escapar(p.categoria)}</span>
            <span class="gear__eyebrow gear__eyebrow--on">Equipado</span>
            <span class="gear__name">${escapar(p.nombre)}</span>
          </span>
        </span>
      </label>`).join("");

    $("prendas").innerHTML = `${html}
      <button type="button" class="gear-add" id="btn-add-prenda">
        <img src="assets/icons/plus-gray.svg" alt="" width="24" height="24" />
        Añadir prenda
      </button>`;

    // Si la foto real no carga, muestra el placeholder.
    $("prendas").querySelectorAll(".gear__img").forEach((img) =>
      img.addEventListener("error", () => { img.src = PRENDA_FALLBACK; }, { once: true })
    );
    $("btn-add-prenda").addEventListener("click", () => {
      // TODO: abre tu pantalla/modal para agregar una prenda.
      console.log("Añadir prenda");
    });
  }

  /* ===================== ESCALA RPE ===================== */
  function renderRpe() {
    $("rpe").innerHTML = RPE.map((r) => `
      <label class="rpe__opt">
        <input type="radio" name="rpe" value="${r.valor}" class="sr-only" />
        <span class="rpe__body">
          <img src="assets/icons/rpe-${r.valor}-black.svg" alt="" data-n="${r.valor}" />
          <span class="rpe__label">${r.etiqueta}</span>
        </span>
      </label>`).join("");
  }

  // Cambia el icono a naranja cuando la opción está seleccionada.
  $("rpe").addEventListener("change", () => {
    $("rpe").querySelectorAll("input").forEach((input) => {
      const img = input.nextElementSibling.querySelector("img");
      img.src = `assets/icons/rpe-${img.dataset.n}-${input.checked ? "orange" : "black"}.svg`;
    });
  });

  /* ===================== EXPERIENCIA ===================== */
  $("experiencia").addEventListener("input", (e) => {
    $("contador").textContent = `${e.target.value.length} / 300`;
  });

  /* ===================== SINCRONIZACIÓN ===================== */
  function marcarSincronizado(si) {
    $("sync").dataset.state = si ? "synced" : "manual";
    $("sync-text").textContent = si ? "Sincronizado" : "Ingreso manual";
    $("sync-icon").src = `assets/icons/refresh-${si ? "green" : "gray"}.svg`;
  }

  // Úsalo cuando recibas datos de un reloj, Strava, Garmin, etc.:
  // registro.cargarDatos({ distancia: 14.8, horas: 3, minutos: 45, desnivel: 1240, altitud: 2428, calorias: 1850 })
  function cargarDatos(d = {}) {
    const poner = (id, v) => { if (v !== undefined && v !== null) $(id).value = String(v); };
    poner("distancia", d.distancia);
    poner("horas", d.horas);
    poner("minutos", d.minutos !== undefined ? String(d.minutos).padStart(2, "0") : undefined);
    poner("desnivel", d.desnivel);
    poner("altitud", d.altitud);
    poner("calorias", d.calorias);
    if (d.fecha) $("fecha").value = d.fecha; // formato AAAA-MM-DD
    marcarSincronizado(true);
  }
  window.registro = { cargarDatos };

  /* ===================== VALIDACIÓN Y ENVÍO ===================== */
  function limpiarErrores() {
    form.querySelectorAll(".error").forEach((p) => { p.hidden = true; p.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  }
  function error(id, mensaje, campo) {
    const p = $(`err-${id}`);
    p.textContent = mensaje;
    p.hidden = false;
    if (campo) campo.setAttribute("aria-invalid", "true");
    return campo || p;
  }

  function validar() {
    limpiarErrores();
    const fallos = [];
    if (!$("nombre").value.trim()) fallos.push(error("nombre", "Escribe el nombre de la cima.", $("nombre")));
    if (!form.tipo.value) fallos.push(error("tipo", "Elige el tipo de actividad.", $("tipos")));
    const dist = parseFloat($("distancia").value);
    if (!(dist > 0)) fallos.push(error("distancia", "Ingresa la distancia recorrida.", $("distancia")));
    if (!$("fecha").value) fallos.push(error("fecha", "Selecciona la fecha de la actividad.", $("fecha")));
    return fallos;
  }

  const num = (id) => ($(id).value === "" ? null : Number($(id).value));

  function recolectar() {
    return {
      nombre: $("nombre").value.trim(),
      tipo: form.tipo.value,
      distancia: { valor: parseFloat($("distancia").value), unidad },
      fecha: $("fecha").value, // AAAA-MM-DD
      tiempo: { horas: num("horas") ?? 0, minutos: num("minutos") ?? 0 },
      desnivel: num("desnivel"),
      altitudMaxima: num("altitud"),
      calorias: num("calorias"),
      sincronizado: $("sync").dataset.state === "synced",
      prenda: form.prenda ? form.prenda.value || null : null,
      esfuerzo: form.rpe.value ? Number(form.rpe.value) : null,
      experiencia: $("experiencia").value.trim(),
    };
  }

  let toastTimer;
  function aviso(texto) {
    const t = $("toast");
    t.textContent = texto;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fallos = validar();
    if (fallos.length) {
      const primero = fallos[0];
      primero.scrollIntoView({ behavior: "smooth", block: "center" });
      if (primero.focus && primero.tagName === "INPUT") primero.focus({ preventScroll: true });
      return;
    }
    const datos = recolectar();
    // TODO: envía "datos" a tu backend: fetch("/api/cimas", { method: "POST", body: JSON.stringify(datos) })
    console.log("Cima a guardar:", datos);
    aviso("Cima guardada");
    // setTimeout(() => (location.href = "inicio.html"), 1200);
  });

  $("btn-volver").addEventListener("click", () => {
    document.querySelector(".screen").classList.add("salir");
    setTimeout(() => {
      if (history.length > 1) history.back();
      else location.href = "inicio.html";
    }, 300);
  });

  window.addEventListener("pageshow", () => {
    const scr = document.querySelector(".screen");
    if (scr) scr.classList.remove("salir");
  });

  /* ===================== INICIO ===================== */
  renderPrendas();
  renderRpe();
})();
