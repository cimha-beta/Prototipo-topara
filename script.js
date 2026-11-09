const T = {
  logo: 0.5,
  duracionLogo: 0.9,
  esperaLogoTexto: 0.3,
  porLetra: 0.16,
  esperaRegistro: 2.0
};

const MODO_TEXTO = "maquina";

const CORTES = [0, 0.149, 0.3333, 0.5139, 0.6935, 0.8357, 1];

const $ = (id) => document.getElementById(id);
const logo = $("logo"), montana = $("montana"), estrella = $("estrella"), texto = $("texto");

const MS = (s) => s * 1000;
const tLogo       = MS(T.logo);
const tDuracion   = MS(T.duracionLogo);
const tTexto      = tLogo + tDuracion + MS(T.esperaLogoTexto);
const tTotalTexto = MS(T.porLetra) * (CORTES.length - 1);
const tRegistro   = tTexto + tTotalTexto + MS(T.esperaRegistro);

function escribirTexto() {
  if (MODO_TEXTO === "fundido") {
    texto.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" });
    return;
  }
  const frames = [{ offset: 0, clipPath: "inset(0 100% 0 0)", opacity: 1 }];
  for (let i = 1; i < CORTES.length; i++) {
    const ini = (i - 1) / (CORTES.length - 1);
    const fin = ini + (0.7 / (CORTES.length - 1));
    frames.push({ offset: fin, clipPath: `inset(0 ${(1 - CORTES[i]) * 100}% 0 0)`, opacity: 1 });
  }
  frames.push({ offset: 1, clipPath: "inset(0 0% 0 0)", opacity: 1 });
  texto.animate(frames, { duration: tTotalTexto, easing: "ease-out", fill: "forwards" });
}

function iniciar() {
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  logo.style.animationDuration = reducir ? "0.01s" : tDuracion + "ms";
  setTimeout(() => logo.classList.add("anim"), tLogo);
  setTimeout(escribirTexto, tTexto);
  setTimeout(() => { window.location.href = "login.html"; }, tRegistro);
}

Promise.all([montana, estrella, texto].map((img) => img.decode().catch(() => {})))
  .then(iniciar);
