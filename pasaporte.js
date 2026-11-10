(() => {
  /* ===================== DATOS DE EJEMPLO ===================== */
  // TODO: reemplaza este objeto por la respuesta de tu API.
  //
  // estado del registro:  "sin-verificar" | "en-revision" | "verificada" | "rechazada"
  // parche.estado:        "ninguno" | "disponible" | "solicitado" | "enviado" | "entregado"
  //                       (solo se puede pedir cuando la actividad está "verificada")
  const DATA = {
    usuario: { nombre: "David" },
    registros: [
      { id: "r1", nombre: "Caminata por el Parque", fecha: "2026-11-07", tipo: "senderismo", distancia: "5 km", tiempo: "50 min",
        estado: "sin-verificar", parche: { estado: "ninguno" } },
      { id: "r2", nombre: "Cerro de San Cristóbal", fecha: "2026-11-03", tipo: "ciclismo", distancia: "4,6 km", tiempo: "24 min",
        estado: "en-revision", fechaSolicitud: "2026-11-04", parche: { estado: "ninguno" } },
      { id: "r3", nombre: "Paseo por el Sendero", fecha: "2026-10-24", tipo: "trail-run", distancia: "2.2 km", tiempo: "45 min",
        estado: "verificada", fechaSolicitud: "2026-10-25", fechaSello: "2026-10-28", parche: { estado: "disponible" } },
      { id: "r4", nombre: "Montaña Siete Picos", fecha: "2026-10-18", tipo: "montanismo", distancia: "12.4 km", tiempo: "1 h 50 min",
        estado: "verificada", fechaSolicitud: "2026-10-19", fechaSello: "2026-10-22",
        parche: { estado: "solicitado", fechaSolicitud: "2026-10-23", entrega: "envio" } },
      { id: "r5", nombre: "Sendero de la Felicidad", fecha: "2026-10-10", tipo: "senderismo", distancia: "11.2 km", tiempo: "1 h 24 min",
        estado: "rechazada", fechaSolicitud: "2026-10-11", fechaRevision: "2026-10-14",
        motivo: "No pudimos validar el recorrido con los datos enviados. Completa la información y vuelve a solicitar el sello.",
        parche: { estado: "ninguno" } },
      { id: "r6", nombre: "Alto de los Patios", fecha: "2026-09-27", tipo: "ciclismo", distancia: "9.8 km", tiempo: "35 min",
        estado: "verificada", fechaSolicitud: "2026-09-28", fechaSello: "2026-09-30",
        parche: { estado: "enviado", fechaSolicitud: "2026-10-02", fechaEnvio: "2026-10-06", entrega: "envio" } },
      { id: "r7", nombre: "Escalada por Chicaque", fecha: "2026-09-19", tipo: "montanismo", distancia: "4.5 km", tiempo: "3 h 27 min",
        estado: "verificada", fechaSolicitud: "2026-09-20", fechaSello: "2026-09-22",
        parche: { estado: "entregado", fechaSolicitud: "2026-09-24", fechaEnvio: "2026-09-27", fechaEntrega: "2026-10-01", entrega: "envio" } },
      { id: "r8", nombre: "Caminata por el Mar", fecha: "2026-09-06", tipo: "senderismo", distancia: "2.8 km", tiempo: "28 min",
        estado: "verificada", fechaSolicitud: "2026-09-07", fechaSello: "2026-09-09",
        parche: { estado: "entregado", fechaSolicitud: "2026-09-10", fechaEnvio: "2026-09-14", fechaEntrega: "2026-09-19", entrega: "envio" } },
    ],
  };

  // La naturaleza de la actividad define el sello (tinta) y el parche bordado que se otorga.
  const TIPOS = {
    senderismo: { nombre: "Senderismo", parche: "Parche Senderista", desc: "Bordado con el emblema de senderismo." },
    ciclismo:   { nombre: "Ciclismo",   parche: "Parche Rodador",    desc: "Bordado con el emblema de ciclismo." },
    montanismo: { nombre: "Montañismo", parche: "Parche Montañista", desc: "Bordado con el emblema de montañismo." },
    "trail-run": { nombre: "Trail Run", parche: "Parche Trail",      desc: "Bordado con el emblema de trail running." },
  };

  const BADGES = {
    "sin-verificar": `<span class="badge badge--gray">Sin verificar</span>`,
    "en-revision":   `<span class="badge badge--wait"><img src="assets/icons/clock-orange.svg" alt="" width="12" height="12" />En revisión</span>`,
    verificada:      `<span class="badge badge--ok"><img src="assets/icons/check-white.svg" alt="" width="11" height="11" />Sellada</span>`,
    rechazada:       `<span class="badge badge--bad"><img src="assets/icons/alert-red.svg" alt="" width="12" height="12" />No aprobada</span>`,
  };

  const FILTROS = [
    { id: "todas",   texto: "Todas",       ok: () => true },
    { id: "sin-sello", texto: "Sin sello", ok: (r) => r.estado === "sin-verificar" || r.estado === "rechazada" },
    { id: "revision", texto: "En revisión", ok: (r) => r.estado === "en-revision" },
    { id: "selladas", texto: "Selladas",   ok: (r) => r.estado === "verificada" },
    { id: "parche",  texto: "Parche por pedir", ok: (r) => puedePedirParche(r) },
  ];

  /* ===================== UTILIDADES ===================== */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const fecha = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "");
  const hoyISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const porId = (id) => DATA.registros.find((r) => r.id === id);
  const puedePedirParche = (r) => r.estado === "verificada" && r.parche.estado === "disponible";

  let toastTimer;
  function aviso(texto) {
    const t = $("toast");
    t.textContent = texto;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  let filtro = "todas";
  let busqueda = "";
  let hojaActual = null; // { tipo: "detalle" | "parche", id }

  /* ===================== PORTADA ===================== */
  function renderPortada() {
    const regs = DATA.registros;
    $("titular").textContent = DATA.usuario.nombre;
    $("st-sellos").textContent = regs.filter((r) => r.estado === "verificada").length;
    $("st-parches").textContent = regs.filter((r) => r.parche.estado === "entregado").length;
    $("st-pendientes").textContent = regs.filter((r) => r.estado !== "verificada").length;
  }

  /* ===================== FILTROS ===================== */
  function renderTabs() {
    $("tabs").innerHTML = FILTROS.map((f) => `
      <button type="button" class="tab" data-filtro="${f.id}" aria-pressed="${f.id === filtro}">
        ${f.texto} <em>${DATA.registros.filter(f.ok).length}</em>
      </button>`).join("");
  }

  /* ===================== ACCIONES (compartidas por tarjeta y hoja) ===================== */
  function accionesHTML(r, enHoja = false) {
    const wide = enHoja ? "btn--block" : "";
    switch (r.estado) {
      case "sin-verificar":
        return `<button type="button" class="btn ${wide}" data-accion="sello" data-id="${r.id}">Solicitar sello</button>`;
      case "en-revision":
        return `<p class="rec__act-text"><strong>Sello en revisión</strong>Estamos verificando tu actividad. Te avisaremos cuando esté lista.</p>`;
      case "rechazada":
        return `<button type="button" class="btn ${wide}" data-accion="sello" data-id="${r.id}">Volver a solicitar sello</button>`;
      case "verificada": {
        const p = r.parche.estado;
        if (p === "disponible") return `<button type="button" class="btn btn--dark ${wide}" data-accion="parche" data-id="${r.id}">Pedir parche</button>`;
        return `<span class="status-line ${p === "entregado" ? "status-line--ok" : ""}">${{
          solicitado: "Parche solicitado",
          enviado: "Parche en camino",
          entregado: "Parche entregado",
        }[p]}</span>`;
      }
    }
    return "";
  }

  /* ===================== LISTA ===================== */
  function filaAccionHTML(r) {
    const t = TIPOS[r.tipo];
    if (r.estado === "verificada") {
      return `
        <div class="rec__act">
          <span class="patch-mini"><img src="assets/parche-${r.tipo}.svg" alt="" /></span>
          <p class="rec__act-text"><strong>${t.parche}</strong>Sellada el ${fecha(r.fechaSello)}</p>
          ${accionesHTML(r)}
        </div>`;
    }
    if (r.estado === "rechazada") {
      return `
        <div class="rec__act" style="flex-wrap:wrap">
          <p class="rec__act-text rec__act-text--bad">${esc(r.motivo)}</p>
          <div class="rec__act-text" style="flex-basis:100%">${accionesHTML(r).replace('class="btn', 'class="btn btn--wide')}</div>
        </div>`;
    }
    if (r.estado === "en-revision") {
      return `<div class="rec__act">${accionesHTML(r)}</div>`;
    }
    return `<div class="rec__act">
      <p class="rec__act-text">Aún sin sello. Solicítalo para que revisemos tu actividad.</p>
      ${accionesHTML(r)}
    </div>`;
  }

  function registroHTML(r) {
    const t = TIPOS[r.tipo];
    const sello = r.estado === "verificada" ? `assets/sello-${r.tipo}.svg` : "assets/sello-vacio.svg";
    return `
      <article class="rec ${r.estado === "verificada" ? "rec--ok" : ""}">
        <button type="button" class="rec__top" data-detalle="${r.id}" aria-label="Ver detalle de ${esc(r.nombre)}">
          <span class="rec__stamp"><img src="${sello}" alt="" /></span>
          <span class="rec__main">
            <span class="rec__type"><i class="dot bg-${r.tipo}"></i>${t.nombre}</span>
            <span class="rec__name" style="display:block">${esc(r.nombre)}</span>
            <span class="rec__meta">
              <span><img src="assets/icons/calendar-gray.svg" alt="" width="14" height="14" />${fecha(r.fecha)}</span>
              <span><img src="assets/icons/route-gray.svg" alt="" width="14" height="14" />${esc(r.distancia)}</span>
              <span><img src="assets/icons/timer-gray.svg" alt="" width="14" height="14" />${esc(r.tiempo)}</span>
            </span>
          </span>
          ${BADGES[r.estado]}
        </button>
        ${filaAccionHTML(r)}
      </article>`;
  }

  function renderLista() {
    renderTabs();
    const f = FILTROS.find((x) => x.id === filtro);
    const q = norm(busqueda);
    const lista = DATA.registros
      .filter((r) => f.ok(r) && (!q || norm(r.nombre).includes(q)))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    if (!lista.length) {
      $("lista").innerHTML = `<p class="empty">${q ? `No encontramos actividades que coincidan con “${esc(busqueda)}”.` : "No tienes registros en esta categoría todavía."}</p>`;
      return;
    }

    // Agrupa por mes (ya vienen ordenados de más reciente a más antiguo)
    const grupos = [];
    lista.forEach((r) => {
      const clave = r.fecha.slice(0, 7);
      let g = grupos.find((x) => x.clave === clave);
      if (!g) { g = { clave, items: [] }; grupos.push(g); }
      g.items.push(r);
    });

    $("lista").innerHTML = grupos.map((g) => {
      const d = new Date(`${g.clave}-15T12:00:00`);
      const mes = d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
      const selladas = g.items.filter((r) => r.estado === "verificada").length;
      return `
        <div class="month">
          <span class="month__name">${mes.charAt(0).toUpperCase() + mes.slice(1)}</span>
          <span class="month__line"></span>
          <span class="month__sum">${selladas}/${g.items.length} selladas</span>
        </div>
        ${g.items.map(registroHTML).join("")}`;
    }).join("");
  }

  /* ===================== HOJA: DETALLE ===================== */
  function pasosDe(r) {
    const verificada = r.estado === "verificada";
    const rechazada = r.estado === "rechazada";
    const p = r.parche.estado;
    const lista = [
      { t: "Actividad registrada", d: fecha(r.fecha), ok: true },
      { t: "Sello solicitado", d: r.fechaSolicitud ? fecha(r.fechaSolicitud) : "Aún no solicitado", ok: !!r.fechaSolicitud },
      rechazada
        ? { t: "Actividad no aprobada", d: r.motivo, bad: true }
        : { t: "Actividad verificada y sellada", d: verificada ? fecha(r.fechaSello) : "Pendiente de revisión", ok: verificada },
      { t: "Parche solicitado", d: r.parche.fechaSolicitud ? fecha(r.parche.fechaSolicitud) : verificada ? "Disponible para pedir" : "Se desbloquea al sellar", ok: ["solicitado", "enviado", "entregado"].includes(p) },
      { t: "Parche en camino", d: r.parche.fechaEnvio ? fecha(r.parche.fechaEnvio) : "—", ok: ["enviado", "entregado"].includes(p) },
      { t: "Parche entregado", d: r.parche.fechaEntrega ? fecha(r.parche.fechaEntrega) : "—", ok: p === "entregado" },
    ];
    const actual = lista.findIndex((x) => !x.ok && !x.bad);
    return lista.map((x, i) => ({ ...x, clase: x.bad ? "bad" : x.ok ? "ok" : i === actual && !rechazada ? "now" : "pending" }));
  }

  function detalleHTML(r) {
    const t = TIPOS[r.tipo];
    const verificada = r.estado === "verificada";
    return `
      <div class="sheet__in">
        <div class="sheet__grab"></div>
        <div class="sheet__head">
          <div>
            <p class="rec__type"><i class="dot bg-${r.tipo}"></i>${t.nombre}</p>
            <h2 class="sheet__title" id="sheet-title">${esc(r.nombre)}</h2>
            <p class="rec__meta" style="margin-top:8px">
              <span><img src="assets/icons/calendar-gray.svg" alt="" width="14" height="14" />${fecha(r.fecha)}</span>
              <span><img src="assets/icons/route-gray.svg" alt="" width="14" height="14" />${esc(r.distancia)}</span>
              <span><img src="assets/icons/timer-gray.svg" alt="" width="14" height="14" />${esc(r.tiempo)}</span>
            </p>
          </div>
          <button type="button" class="sheet__close" data-cerrar aria-label="Cerrar"><img src="assets/icons/x-black.svg" alt="" width="18" height="18" /></button>
        </div>

        <div class="duo">
          <figure class="${verificada ? "" : "is-locked"}">
            <img src="${verificada ? `assets/sello-${r.tipo}.svg` : "assets/sello-vacio.svg"}" alt="" />
            <figcaption>Sello<small>${verificada ? `Sellada el ${fecha(r.fechaSello)}` : "Sin sello todavía"}</small></figcaption>
          </figure>
          <figure class="${verificada ? "" : "is-locked"}">
            <img src="assets/parche-${r.tipo}.svg" alt="" />
            <figcaption>${t.parche}<small>${verificada ? "Parche bordado" : "Se desbloquea al sellar"}</small></figcaption>
          </figure>
        </div>

        <ol class="timeline">
          ${pasosDe(r).map((s) => `
            <li class="step step--${s.clase}">
              <span class="step__dot">${s.clase === "ok" ? `<img src="assets/icons/check-white.svg" alt="" width="12" height="12" />` : s.clase === "bad" ? `<img src="assets/icons/x-black.svg" alt="" width="10" height="10" style="filter:invert(1)" />` : ""}</span>
              <div><p class="step__t">${s.t}</p><p class="step__d">${esc(s.d)}</p></div>
            </li>`).join("")}
        </ol>

        <div class="sheet__actions">${r.estado === "en-revision" || (verificada && r.parche.estado !== "disponible") ? "" : accionesHTML(r, true)}</div>
      </div>`;
  }

  /* ===================== HOJA: PEDIR PARCHE ===================== */
  function parcheHTML(r) {
    const t = TIPOS[r.tipo];
    return `
      <div class="sheet__in">
        <div class="sheet__grab"></div>
        <div class="sheet__head">
          <h2 class="sheet__title" id="sheet-title">Pedir parche</h2>
          <button type="button" class="sheet__close" data-cerrar aria-label="Cerrar"><img src="assets/icons/x-black.svg" alt="" width="18" height="18" /></button>
        </div>

        <div class="pick">
          <img src="assets/parche-${r.tipo}.svg" alt="" />
          <h3>${t.parche}</h3>
          <p>${t.desc} Lo recibes por haber verificado “${esc(r.nombre)}”.</p>
        </div>

        <form id="form-parche" novalidate>
          <div class="opts" role="radiogroup" aria-label="Cómo quieres recibirlo">
            <label class="opt">
              <input type="radio" name="entrega" value="envio" class="sr-only" checked />
              <span class="opt__body"><img src="assets/icons/package-black.svg" alt="" width="24" height="24" /><span><b>Envío a domicilio</b><span>Te lo enviamos a tu dirección</span></span></span>
            </label>
            <label class="opt">
              <input type="radio" name="entrega" value="evento" class="sr-only" />
              <span class="opt__body"><img src="assets/icons/map-pin-black.svg" alt="" width="24" height="24" /><span><b>Recoger en un evento Topara</b><span>Te lo entregamos en el próximo evento</span></span></span>
            </label>
          </div>

          <div class="field" id="campo-direccion">
            <label for="direccion">Dirección de envío</label>
            <textarea class="textarea" id="direccion" rows="3" placeholder="Barrio, calle, número, ciudad y referencias"></textarea>
            <p class="error" id="err-direccion" role="alert" hidden></p>
          </div>

          <div class="sheet__actions">
            <button type="submit" class="btn btn--dark btn--block">Confirmar pedido</button>
            <button type="button" class="btn btn--ghost btn--block" data-cerrar>Cancelar</button>
          </div>
        </form>
      </div>`;
  }

  /* ===================== CONTROL DE LA HOJA ===================== */
  const sheet = $("sheet");

  function abrirHoja(tipo, id) {
    const r = porId(id);
    if (!r) return;
    hojaActual = { tipo, id };
    $("sheet-body").innerHTML = tipo === "detalle" ? detalleHTML(r) : parcheHTML(r);
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
  }
  function cerrarHoja() { if (sheet.open) sheet.close(); hojaActual = null; }

  sheet.addEventListener("click", (e) => { if (e.target === sheet) cerrarHoja(); }); // clic en el fondo
  sheet.addEventListener("close", () => { hojaActual = null; });

  $("sheet-body").addEventListener("click", (e) => {
    if (e.target.closest("[data-cerrar]")) return cerrarHoja();
    const b = e.target.closest("[data-accion]");
    if (b) ejecutar(b.dataset.accion, b.dataset.id);
  });

  $("sheet-body").addEventListener("change", (e) => {
    if (e.target.name === "entrega") $("campo-direccion").hidden = e.target.value !== "envio";
  });

  $("sheet-body").addEventListener("submit", (e) => {
    e.preventDefault();
    const r = porId(hojaActual.id);
    const entrega = e.target.entrega.value;
    const direccion = $("direccion").value.trim();
    if (entrega === "envio" && !direccion) {
      $("err-direccion").textContent = "Escribe la dirección donde quieres recibirlo.";
      $("err-direccion").hidden = false;
      $("direccion").setAttribute("aria-invalid", "true");
      $("direccion").focus();
      return;
    }
    // TODO: envía el pedido a tu API: POST /api/registros/:id/parche { entrega, direccion }
    r.parche = { ...r.parche, estado: "solicitado", fechaSolicitud: hoyISO(), entrega, direccion: entrega === "envio" ? direccion : null };
    cerrarHoja();
    refrescar();
    aviso("Parche solicitado");
  });

  /* ===================== ACCIONES ===================== */
  function ejecutar(accion, id) {
    const r = porId(id);
    if (!r) return;

    if (accion === "sello") {
      // TODO: envía la solicitud a tu API: POST /api/registros/:id/sello
      r.estado = "en-revision";
      r.fechaSolicitud = hoyISO();
      delete r.motivo;
      refrescar();
      if (hojaActual && hojaActual.tipo === "detalle") abrirHoja("detalle", id);
      aviso("Sello solicitado. Revisaremos tu actividad.");
    }

    if (accion === "parche") {
      if (!puedePedirParche(r)) return aviso("Primero necesitas el sello de esta actividad.");
      abrirHoja("parche", id);
    }
  }

  /* ===================== EVENTOS DE LA PANTALLA ===================== */
  $("lista").addEventListener("click", (e) => {
    const accion = e.target.closest("[data-accion]");
    if (accion) return ejecutar(accion.dataset.accion, accion.dataset.id);
    const det = e.target.closest("[data-detalle]");
    if (det) abrirHoja("detalle", det.dataset.detalle);
  });

  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filtro]");
    if (!b) return;
    filtro = b.dataset.filtro;
    renderLista();
  });

  $("buscar").addEventListener("input", (e) => {
    busqueda = e.target.value;
    renderLista();
  });

  $("btn-volver").addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "inicio.html";
  });

  function refrescar() { renderPortada(); renderLista(); }

  /* ===================== INICIO ===================== */
  refrescar();
})();
