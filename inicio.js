(() => {
  /* ===================== DATOS ===================== */
  // Cada tipo de actividad define su color (clase CSS) y su icono.
  const TIPOS = {
    senderismo: { clase: "bg-senderismo", icono: "assets/icons/footprints-white.svg" },
    ciclismo:   { clase: "bg-ciclismo",   icono: "assets/icons/bike-white.svg" },
    montanismo: { clase: "bg-montanismo", icono: "assets/icons/mountain-black.svg" },
    escalada:   { clase: "bg-escalada",   icono: "assets/icons/pulse-white.svg" },
  };

  // Posición de cada pin en el mapa (porcentaje). "grande" = pin destacado.
  const MARCADORES = [
    { tipo: "senderismo", x: 20, y: 22 },
    { tipo: "montanismo", x: 45, y: 17 },
    { tipo: "escalada",   x: 75, y: 18 },
    { tipo: "ciclismo",   x: 99, y: 27 },
    { tipo: "ciclismo",   x: 31, y: 41 },
    { tipo: "montanismo", x: 86, y: 41 },
    { tipo: "senderismo", x: 60, y: 53, grande: true },
    { tipo: "escalada",   x: 15, y: 66 },
    { tipo: "senderismo", x: 38, y: 65 },
    { tipo: "ciclismo",   x: 93, y: 68 },
  ];

  // TODO: reemplaza este arreglo por los datos que lleguen de tu API.
  const HISTORIAL = [
    { mes: "Noviembre", anio: 2026, items: [
      { nombre: "Caminata por el Parque",  tipo: "senderismo", fecha: "7 nov 2026",  distancia: "5 km",    tiempo: "50 Min" },
      { nombre: "Cerro de San Cristobal",  tipo: "ciclismo",   fecha: "3 nov 2026",  distancia: "4,6 Km",  tiempo: "24 Min" },
    ]},
    { mes: "Octubre", anio: 2026, items: [
      { nombre: "Paseo por el Sendero",    tipo: "montanismo", fecha: "24 oct 2026", distancia: "2.2 Km",  tiempo: "45 Min" },
      { nombre: "Montaña Siete Picos",     tipo: "escalada",   fecha: "18 oct 2026", distancia: "12.4 Km", tiempo: "1 h 50 min" },
      { nombre: "Sendero de la Felicidad", tipo: "senderismo", fecha: "10 oct 2026", distancia: "11.2 km", tiempo: "1 h 24 min" },
    ]},
    { mes: "Septiembre", anio: 2026, items: [
      { nombre: "Alto de los Patios",      tipo: "ciclismo",   fecha: "27 sep 2026", distancia: "9.8 km",  tiempo: "35 min" },
      { nombre: "Escalada por Chicaque",   tipo: "escalada",   fecha: "19 sep 2026", distancia: "4.5 km",  tiempo: "3 h 27 min" },
      { nombre: "Caminata por el Mar",     tipo: "senderismo", fecha: "6 sep 2026",  distancia: "2.8 km",  tiempo: "28 min" },
    ]},
  ];

  /* ===================== ELEMENTOS ===================== */
  const $chips = document.getElementById("chips");
  const $markers = document.getElementById("markers");
  const $historial = document.getElementById("historial");
  const $meses = document.getElementById("meses");
  let filtro = "todas";
  let mesSeleccionado = "todas";

  /* ===================== RENDER ===================== */
  function renderMarcadores() {
    $markers.innerHTML = MARCADORES.map((m) => {
      const t = TIPOS[m.tipo];
      const size = m.grande ? 54 : 36;
      return `<span class="marker ${t.clase}" data-tipo="${m.tipo}"
                style="left:${m.x}%;top:${m.y}%;--s:${size}px">
                <img src="${t.icono}" alt="" />
              </span>`;
    }).join("");
  }

  function aplicarFiltroMarcadores() {
    $markers.querySelectorAll(".marker").forEach((el) => {
      el.classList.toggle("is-hidden", filtro !== "todas" && el.dataset.tipo !== filtro);
    });
  }

  function renderHistorial() {
    const grupos = HISTORIAL
      .map((g) => ({ ...g, items: g.items.filter((i) => filtro === "todas" || i.tipo === filtro) }))
      .filter((g) => g.items.length)
      .filter((g) => mesSeleccionado === "todas" || `${g.mes} ${g.anio}` === mesSeleccionado);

    if (!grupos.length) {
      $historial.innerHTML = `<p class="empty">Aún no tienes cimas${filtro !== "todas" ? " de esta actividad" : ""}${mesSeleccionado !== "todas" ? " en este mes" : ""}.</p>`;
      return;
    }

    $historial.innerHTML = grupos.map((g) => `
      <div class="month">
        <span class="month__name">${g.mes}</span>
        <span class="month__line"></span>
        <span class="month__year">${g.anio}</span>
      </div>
      ${g.items.map((i) => {
        const t = TIPOS[i.tipo];
        return `
        <button type="button" class="item" data-nombre="${i.nombre}">
          <span class="badge ${t.clase}"><img src="${t.icono}" alt="" /></span>
          <span class="item__main">
            <span class="item__name">${i.nombre}</span>
            <span class="item__date">
              <img src="assets/icons/calendar-gray.svg" alt="" width="14" height="14" />${i.fecha}
            </span>
          </span>
          <span class="item__data">
            <span class="item__row"><img src="assets/icons/pin-black.svg" alt="" width="18" height="18" />${i.distancia}</span>
            <span class="item__row"><img src="assets/icons/clock-black.svg" alt="" width="18" height="18" />${i.tiempo}</span>
          </span>
          <img class="item__chev" src="assets/icons/chevron-right-black.svg" alt="" width="22" height="22" />
        </button>`;
      }).join("")}
    `).join("");
  }

  function renderMeses() {
    const vistos = [];
    HISTORIAL.forEach((g) => {
      const items = g.items.filter((i) => filtro === "todas" || i.tipo === filtro);
      const clave = `${g.mes} ${g.anio}`;
      if (items.length && !vistos.includes(clave)) vistos.push(clave);
    });

    if (mesSeleccionado !== "todas" && !vistos.includes(mesSeleccionado)) mesSeleccionado = "todas";

    const botones = [`<button type="button" class="chip${mesSeleccionado === "todas" ? " is-active" : ""}" data-mes="todas">Todas</button>`]
      .concat(vistos.map((clave) =>
        `<button type="button" class="chip${mesSeleccionado === clave ? " is-active" : ""}" data-mes="${clave}">${clave}</button>`
      ));

    $meses.innerHTML = botones.join("");
  }

  /* ===================== EVENTOS ===================== */
  $chips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filtro = chip.dataset.filter;
    $chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    aplicarFiltroMarcadores();
    renderMeses();
    renderHistorial();
  });

  $historial.addEventListener("click", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    // TODO: navega al detalle, p. ej. location.href = "detalle.html?cima=...";
    console.log("Abrir cima:", item.dataset.nombre);
  });

  document.getElementById("ultima-cima").addEventListener("click", () => console.log("Abrir última cima"));
  document.getElementById("btn-registrar").addEventListener("click", () => {
    const s = document.querySelector(".screen");
    s.classList.add("salir");
    setTimeout(() => { window.location.href = "registro.html"; }, 300);
  });
  document.getElementById("btn-recompensas").addEventListener("click", () => {
    const s = document.querySelector(".screen");
    s.classList.add("salir");
    setTimeout(() => { window.location.href = "recompensas.html"; }, 300);
  });

  window.addEventListener("pageshow", () => {
    const scr = document.querySelector(".screen");
    if (scr) scr.classList.remove("salir");
  });
  document.getElementById("btn-notificaciones").addEventListener("click", () => console.log("Abrir notificaciones"));

  /* ===================== INICIO ===================== */
  $meses.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    mesSeleccionado = chip.dataset.mes;
    $meses.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    renderHistorial();
  });

  /* ===================== CONTADOR DE ESTADÍSTICAS (ODÓMETRO) ===================== */
  const $stats = document.getElementById("stats");

  function instalarOdometro(elm, formatear) {
    const valor = parseInt(elm.textContent.replace(/[^\d-]/g, ""), 10) || 0;
    const mostrar = formatear ? formatear(valor) : String(valor);
    elm.classList.add("odo");
    elm.innerHTML = mostrar.split("").map((ch) =>
      /\d/.test(ch)
        ? `<span class="odo__wheel"><span class="odo__list">${"0123456789".split("").map((n) => `<span class="odo__digit">${n}</span>`).join("")}</span></span>`
        : `<span class="odo__sep">${ch}</span>`
    ).join("");
    return { elm, digitos: mostrar.split("").filter((c) => /\d/.test(c)) };
  }

  function rodar(odo) {
    const wheels = odo.elm.querySelectorAll(".odo__wheel");
    const n = odo.digitos.length;
    wheels.forEach((w, i) => {
      const list = w.querySelector(".odo__list");
      const digito = odo.digitos[n - 1 - i];
      list.style.transition = "transform 1.2s cubic-bezier(.2, .8, .2, 1) 0ms";
      void list.offsetWidth;
      list.style.transform = `translateY(-${digito}em)`;
    });
  }

  const contadores = [
    { el: document.getElementById("stat-cimas") },
    { el: document.getElementById("stat-distancia") },
    { el: document.getElementById("stat-horas") },
    { el: document.getElementById("stat-minutos") },
    { el: document.getElementById("stat-desnivel"), formatear: (v) => v.toLocaleString("es") },
  ].map((c) => ({ ...c, odo: instalarOdometro(c.el, c.formatear) }));

  function animarContadores() {
    contadores.forEach((c) => rodar(c.odo));
  }

  if (window.IntersectionObserver && $stats) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          animarContadores();
          obs.disconnect();
        }
      });
    }, { threshold: 1 });
    obs.observe($stats);
  } else {
    animarContadores();
  }

  renderMarcadores();
  renderMeses();
  renderHistorial();
})();
