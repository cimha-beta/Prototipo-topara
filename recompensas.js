(() => {
  /* ===================== DATOS DE EJEMPLO ===================== */
  // TODO: reemplaza todo este objeto por la respuesta de tu API.
  const DATA = {
    usuario: { cimas: 12 },

    // Próxima recompensa destacada
    proxima: {
      titulo: "Plan Nutricional",
      etiqueta: "Nutrición Personalizada",
      imagen: "assets/plan-nutricional.png",
      actual: 9,
      requerido: 12,
      descripcion: "tu plan completo de alimentación personalizada y recarga de carbohidratos",
    },

    // estado: "conseguida" | "en-curso" | "bloqueada"
    metas: [
      {
        id: "estiramiento", cimas: 5, estado: "conseguida", canjeada: false, fechaLogro: "2026-11-02",
        titulo: "Sesiones de Estiramiento Pre y Post Actividad",
        descripcion: "Guía guiada de movilidad previa y descarga muscular",
        icono: "assets/icons/stretch-blue.svg", tile: "blue",
        actual: 5, requerido: 5,
      },
      {
        id: "bono-chaquetas", cimas: 12, estado: "en-curso",
        titulo: "Bono 10% en Chaquetas",
        descripcion: "Descuento exclusivo en toda la línea de chaquetas Topara",
        icono: "assets/icons/percent-white.svg", tile: "orange",
        actual: 9, requerido: 12,
      },
      {
        id: "plan-deportivo", cimas: 25, estado: "bloqueada",
        titulo: "Plan Nutricional Deportivo (1 semana + seguimiento)",
        descripcion: "Menú semanal adaptado a tu entrenamiento, con acompañamiento",
        icono: "assets/icons/utensils-gray.svg", tile: "gray",
        actual: 9, requerido: 25,
      },
    ],

    // tipo: "reto" (con progreso) | "promo" (con código). tema: "peach" | "blue" | "mint"
    retos: [
      {
        id: "3-en-7", tipo: "reto", tema: "peach", unido: true, estado: "Activo",
        titulo: "3 cimas en 7 días", premio: "Sesión Estiramiento Post-Ruta",
        actual: 2, meta: 3, unidad: "cimas", hasta: "2026-11-30",
      },
      {
        id: "desnivel", tipo: "reto", tema: "blue", unido: true, estado: "Activo",
        titulo: "Desnivel acumulado (+3.000 m)", premio: "Plan Nutricional Express",
        actual: 1840, meta: 3000, unidad: "m", hasta: "2026-12-15",
      },
      {
        id: "promo-calzado", tipo: "promo", tema: "mint", estado: "Promo",
        titulo: "15% en calzado trail", premio: "Válido en tienda Topara, online y física",
        codigo: "TOPARA15", hasta: "2026-12-31",
      },
    ],

    // chip: { texto, color: "pink" | "blue" }  ·  meta[].icono: pin | users | ticket | award
    eventos: [
      {
        fecha: "2026-11-18", titulo: "Quedada Trail Peñalara",
        descripcion: "Ascenso grupal guiado y testeo de material Topara. Regalo sorpresa al finalizar.",
        chip: { texto: "Gratis", color: "pink" },
        meta: [{ icono: "pin", texto: "Puerto de Cotos" }, { icono: "users", texto: "24 plazas" }],
      },
      {
        fecha: "2026-12-02", titulo: "Reto Ciclismo Sierra Norte",
        descripcion: "Ruta de puertos de montaña y sorteo de equipamiento técnico entre finalistas.",
        chip: { texto: "Cupos 50", color: "blue" },
        meta: [{ icono: "pin", texto: "Rascafría" }, { icono: "ticket", texto: "Sorteo directo" }],
      },
      {
        fecha: "2026-12-14", titulo: "Topara Sunset Climbing",
        descripcion: "Sesión de escalada al atardecer y entrega de parches conmemorativos.",
        chip: { texto: "Especial", color: "pink" },
        meta: [{ icono: "pin", texto: "La Pedriza" }, { icono: "award", texto: "Parche conmemorativo" }],
      },
    ],
  };

  /* ===================== UTILIDADES ===================== */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => Number(n).toLocaleString("es-CO");
  const fecha = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", "");
  const diasRestantes = (iso) => Math.ceil((new Date(`${iso}T23:59:59`) - new Date()) / 86400000);
  const pct = (a, b) => Math.max(0, Math.min(100, Math.round((a / b) * 100)));

  let toastTimer;
  function aviso(texto) {
    const t = $("toast");
    t.textContent = texto;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
  }

  /* ===================== ENCABEZADO ===================== */
  $("pill-cimas").textContent = `${DATA.usuario.cimas} cimas`;
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

  /* ===================== PRÓXIMA RECOMPENSA ===================== */
  function renderProxima() {
    const p = DATA.proxima;
    const faltan = Math.max(0, p.requerido - p.actual);
    const porc = pct(p.actual, p.requerido);
    $("next").innerHTML = `
      <div class="next__top">
        <span class="next__icon"><img src="assets/icons/utensils-white.svg" alt="" width="26" height="26" /></span>
        <div>
          <p class="next__eyebrow">TU PRÓXIMA RECOMPENSA</p>
          <h2 class="next__title" id="next-title">${esc(p.titulo)}</h2>
        </div>
      </div>
      <div class="next__photo">
        <img src="${esc(p.imagen)}" alt="" />
        <span class="next__tag"><img src="assets/icons/check-white.svg" alt="" width="14" height="14" />${esc(p.etiqueta)}</span>
      </div>
      <div class="next__count">
        <p><strong>${p.actual}</strong><span>de ${p.requerido} cimas</span></p>
        <span class="next__pct">${porc}%</span>
      </div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${p.requerido}" aria-valuenow="${p.actual}" aria-label="Progreso hacia ${esc(p.titulo)}">
        <span style="--p:${porc}%"></span>
      </div>
      <p class="next__note">
        <img src="assets/icons/flag-orange.svg" alt="" width="18" height="18" />
        <span>${faltan > 0
          ? `Te ${faltan === 1 ? "falta 1 cima" : `faltan ${faltan} cimas`} para desbloquear ${esc(p.descripcion)}.`
          : `¡Lo lograste! Ya puedes canjear ${esc(p.descripcion)}.`}</span>
      </p>`;
  }

  /* ===================== MIS METAS ===================== */
  const FILTROS = [
    { id: "todas", texto: "Todas" },
    { id: "conseguida", texto: "Conseguidas" },
    { id: "en-curso", texto: "En curso" },
    { id: "bloqueada", texto: "Bloqueadas" },
  ];
  let filtroMetas = "todas";

  function renderTabs() {
    const cuenta = (id) => (id === "todas" ? DATA.metas.length : DATA.metas.filter((m) => m.estado === id).length);
    $("metas-tabs").innerHTML = FILTROS.map((f) => `
      <button type="button" class="tab" data-filtro="${f.id}" aria-pressed="${f.id === filtroMetas}">
        ${f.texto} <em>${cuenta(f.id)}</em>
      </button>`).join("");
    const hechas = DATA.metas.filter((m) => m.estado === "conseguida").length;
    $("metas-resumen").textContent = `${hechas} de ${DATA.metas.length} conseguidas`;
  }

  function metaHTML(m) {
    const porc = pct(m.actual, m.requerido);
    const faltan = Math.max(0, m.requerido - m.actual);
    const tile = m.estado === "bloqueada" ? "gray" : m.tile;

    const badge = {
      conseguida: `<span class="badge badge--done"><img src="assets/icons/check-white.svg" alt="" width="11" height="11" />Conseguida</span>`,
      "en-curso": `<span class="badge badge--live">En curso</span>`,
      bloqueada: `<span class="badge badge--lock"><img src="assets/icons/lock-gray.svg" alt="" width="11" height="11" />Bloqueada</span>`,
    }[m.estado];

    let pie = "";
    if (m.estado === "conseguida") {
      pie = `
        <div class="meta__foot meta__row meta__row--done">
          <span>Conseguida el <strong>${fecha(m.fechaLogro)}</strong></span>
          ${m.canjeada
            ? `<button type="button" class="btn" disabled><img src="assets/icons/check-black.svg" alt="" width="14" height="14" />Canjeada</button>`
            : `<button type="button" class="btn" data-canjear="${esc(m.id)}">Canjear</button>`}
        </div>`;
    } else {
      pie = `
        <div class="meta__foot">
          <div class="bar bar--thin ${m.estado === "bloqueada" ? "bar--muted" : ""}" role="progressbar"
               aria-valuemin="0" aria-valuemax="${m.requerido}" aria-valuenow="${m.actual}" aria-label="Progreso de la meta">
            <span style="--p:${porc}%"></span>
          </div>
          <p class="meta__row">
            <span><strong>${m.actual}</strong> de ${m.requerido} cimas</span>
            <span>${faltan === 1 ? "Falta 1 cima" : `Faltan ${faltan} cimas`}</span>
          </p>
        </div>`;
    }

    return `
      <article class="meta meta--${m.estado === "conseguida" ? "done" : m.estado === "bloqueada" ? "lock" : "live"}">
        <div class="meta__top">
          <span class="meta__tile tile--${tile}"><img src="${esc(m.icono)}" alt="" /></span>
          <div class="meta__main">
            <p class="meta__eyebrow">${m.cimas} CIMAS</p>
            <h3 class="meta__title">${esc(m.titulo)}</h3>
          </div>
          ${badge}
        </div>
        <p class="meta__desc">${esc(m.descripcion)}</p>
        ${pie}
      </article>`;
  }

  function renderMetas() {
    renderTabs();
    const lista = DATA.metas.filter((m) => filtroMetas === "todas" || m.estado === filtroMetas);
    $("metas").innerHTML = lista.length
      ? lista.map(metaHTML).join("")
      : `<p class="empty">No tienes metas en esta categoría todavía.</p>`;
  }

  $("metas-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filtro]");
    if (!b) return;
    filtroMetas = b.dataset.filtro;
    renderMetas();
  });

  $("metas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-canjear]");
    if (!b) return;
    const meta = DATA.metas.find((m) => m.id === b.dataset.canjear);
    if (!meta) return;
    // TODO: llama a tu API para canjear: fetch(`/api/metas/${meta.id}/canjear`, { method: "POST" })
    meta.canjeada = true;
    renderMetas();
    aviso("Recompensa canjeada");
  });

  /* ===================== RETOS Y PROMOCIONES ===================== */
  function retoHTML(r) {
    const dias = diasRestantes(r.hasta);
    const quedan = dias < 0 ? "Finalizado" : dias === 0 ? "Último día" : dias === 1 ? "Queda 1 día" : `Quedan ${dias} días`;
    const urgente = dias <= 3;

    const etiqueta = r.tipo === "reto" && !r.unido
      ? `<span class="tag tag--outline">Disponible</span>`
      : `<span class="tag">${esc(r.estado)}</span>`;
    const icono = r.tipo === "reto" ? `<span class="reto__icon"><img src="assets/icons/timer-black.svg" alt="" width="20" height="20" /></span>` : "";

    let cuerpo = "";
    if (r.tipo === "reto") {
      const porc = pct(r.actual, r.meta);
      const progreso = r.meta <= 10
        ? `<div class="segs" role="progressbar" aria-valuemin="0" aria-valuemax="${r.meta}" aria-valuenow="${r.actual}">
             ${Array.from({ length: r.meta }, (_, i) => `<i class="${i < r.actual ? "on" : ""}"></i>`).join("")}
           </div>`
        : `<div class="rbar" role="progressbar" aria-valuemin="0" aria-valuemax="${r.meta}" aria-valuenow="${r.actual}"><span style="--p:${porc}%"></span></div>`;
      const texto = r.meta <= 10
        ? `<b>${r.actual}/${r.meta}</b> ${esc(r.unidad)} listas`
        : `<b>${num(r.actual)}</b> / ${num(r.meta)} ${esc(r.unidad)}`;

      cuerpo = r.unido
        ? `<div class="reto__progress"><div class="reto__nums"><span>${texto}</span><span>${porc}%</span></div>${progreso}</div>`
        : `<div class="reto__progress"><button type="button" class="reto__btn reto__btn--solid" data-unirme="${esc(r.id)}">Unirme al reto</button></div>`;
    } else {
      cuerpo = `
        <div class="reto__code">
          <span>${esc(r.codigo)}</span>
          <button type="button" class="reto__btn" data-copiar="${esc(r.codigo)}">
            <img src="assets/icons/copy-black.svg" alt="" width="15" height="15" />Copiar
          </button>
        </div>`;
    }

    return `
      <article class="reto reto--${r.tema}">
        <div class="reto__top">${etiqueta}${icono}</div>
        <h3 class="reto__title">${esc(r.titulo)}</h3>
        <p class="reto__prize"><img src="assets/icons/gift-black.svg" alt="" width="16" height="16" /><span>${r.tipo === "reto" ? "Premio: " : ""}<b>${esc(r.premio)}</b></span></p>
        ${cuerpo}
        <div class="reto__foot">
          <span class="reto__date"><img src="assets/icons/calendar-black.svg" alt="" width="15" height="15" />Hasta el ${fecha(r.hasta)}</span>
          <span class="reto__left ${urgente ? "is-urgent" : ""}">${quedan}</span>
        </div>
      </article>`;
  }

  function renderRetos() {
    $("retos").innerHTML = DATA.retos.map(retoHTML).join("");
    $("retos-dots").innerHTML = DATA.retos.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("");
    actualizarIndicador();
  }

  function actualizarIndicador() {
    const cont = $("retos");
    const tarjeta = cont.querySelector(".reto");
    if (!tarjeta) return;
    const paso = tarjeta.offsetWidth + 12;
    const i = Math.min(DATA.retos.length - 1, Math.round(cont.scrollLeft / paso));
    $("retos-dots").querySelectorAll("i").forEach((d, n) => d.classList.toggle("on", n === i));
    $("retos-contador").textContent = `${i + 1} / ${DATA.retos.length}`;
  }
  $("retos").addEventListener("scroll", () => requestAnimationFrame(actualizarIndicador), { passive: true });

  $("retos").addEventListener("click", async (e) => {
    const copiar = e.target.closest("[data-copiar]");
    if (copiar) {
      const codigo = copiar.dataset.copiar;
      try { await navigator.clipboard.writeText(codigo); }
      catch {
        const t = document.createElement("textarea");
        t.value = codigo; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
      }
      aviso(`Código ${codigo} copiado`);
      return;
    }
    const unirme = e.target.closest("[data-unirme]");
    if (unirme) {
      const reto = DATA.retos.find((r) => r.id === unirme.dataset.unirme);
      // TODO: llama a tu API para inscribir al usuario en el reto.
      reto.unido = true; reto.estado = "Activo";
      const pos = $("retos").scrollLeft;
      renderRetos();
      $("retos").scrollLeft = pos;
      aviso("Te uniste al reto");
    }
  });

  /* ===================== PRÓXIMOS EVENTOS ===================== */
  function renderEventos() {
    $("eventos").innerHTML = DATA.eventos.map((ev) => {
      const d = new Date(`${ev.fecha}T12:00:00`);
      const dia = String(d.getDate()).padStart(2, "0");
      const mes = d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "").toUpperCase();
      return `
        <article class="event">
          <div class="event__date"><strong>${dia}</strong><span>${mes}</span></div>
          <div class="event__main">
            <div class="event__top">
              <h3 class="event__title">${esc(ev.titulo)}</h3>
              <span class="chip chip--${ev.chip.color}">${esc(ev.chip.texto)}</span>
            </div>
            <p class="event__desc">${esc(ev.descripcion)}</p>
            <div class="event__meta">
              ${ev.meta.map((m) => `<span><img src="assets/icons/${m.icono}-gray.svg" alt="" width="14" height="14" />${esc(m.texto)}</span>`).join("")}
            </div>
          </div>
        </article>`;
    }).join("");
  }
  $("ver-eventos").addEventListener("click", (e) => {
    e.preventDefault();
    // TODO: navega a tu pantalla de eventos.
    console.log("Ver todos los eventos");
  });

  /* ===================== INICIO ===================== */
  renderProxima();
  renderMetas();
  renderRetos();
  renderEventos();
  // Las barras se animan una sola vez al cargar la pantalla.
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-ready")));
})();
