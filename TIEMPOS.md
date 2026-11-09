# Topara · Documentación del proyecto

## Configuración de los tiempos

Todos los tiempos se controlan en **`script.js`**, dentro del objeto `T` (valores en **segundos**). El resto se calcula solo.

| Qué quieres cambiar | Campo en `T` | Valor actual |
|---|---|---|
| Cuándo **empieza** el logo | `logo` | `0.5` |
| Cuánto **dura** el logo | `duracionLogo` | `0.9` |
| Pausa logo -> "topara" | `esperaLogoTexto` | `0.3` |
| Duración por letra | `porLetra` | `0.16` |
| Pausa texto -> Registro | `esperaRegistro` | `2.0` |

> Todos los valores van en **segundos**. Ej.: `15` = 15 segundos.

### Cómo se calculan (no hace falta tocarlos)
- El logo **termina** → `logo + duracionLogo`
- "topara" **empieza** → `logo + duracionLogo + esperaLogoTexto`
- "topara" **dura** → `porLetra × 6` (t-o-p-a-r-a = 6 letras)
- El **Registro** entra → inicio de "topara" + duración de "topara" + `esperaRegistro`

### Modo del texto y cortes de letra
- `MODO_TEXTO` en `script.js`: `"fundido"` (toda la palabra de golpe) o `"maquina"` (letra por letra).
- `CORTES` define dónde termina cada letra de "topara" (fracción del ancho de la imagen).

---

## Diseño y comportamiento

- El fondo es **siempre blanco** y el logo **siempre negro**: nada cambia de color en la animación.
- El logo (**montaña + estrella**) es **una sola pieza** que crece desde su base; su duración la controla `T.duracionLogo` en `script.js`.
- Pantalla 1 (`#splash`): el logo y el texto "topara".
- Pantalla 2 (`#registro`): aparece **deslizándose desde abajo** (transición `translateY(100%) → 0`).
- Con preferencias de movimiento reducidas (`prefers-reduced-motion`), el logo se acorta y el Registro entra casi instantáneo.

---

## Responsive

- Contenedor `.app`: ancho de teléfono (**máx. 430 px**), centrado en escritorio.
- Se usa `cqw` (= % del ancho de la app) para que todo escale con el ancho.
- Las imágenes del logo se precargan con `preload` y se espera su decodificación antes de empezar la animación, para que nunca se pierda la entrada por culpa de la carga.