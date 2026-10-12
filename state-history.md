# notae — history

Lo que salió de `state.md`. Se escribe solo si explica por qué las cosas son como son.

Más reciente arriba. Las entradas hasta 2026-09-25 se copiaron tal cual del `History` de `state.md`; algunas de mayo están fuera de orden, como estaban.

### 2026-10-12 — renderWind fuera del TODO

**Qué cambió:** el TODO decía "renderWind — descartado por ahora"; sale de la lista.
**Por qué:** ya estaba descartado (entrada del 2026-05-02): bretpimentel.com cubre el viento con un nivel difícil de superar. Una tarea descartada no es pendiente.

### 2026-09-25 — Publicación al día

- LICENSE GPL-3.0 (2026-06-27), sección Credits (2026-06-28), `.archive/` ignorado (2026-08-27), captura de la galería en el README (2026-09-21)
- Historial reescrito: una ruta local absoluta de versiones antiguas de este archivo sustituida por el nombre de la carpeta

### 2026-06-16 — Auditoría de limpieza (post sesión LLM problemática)

- Revisión solicitada tras sesión previa de un LLM que añadió slop / cosas a medio implementar
- Verificado contra estado real, no contra state.md:
  - Tests: 63/63 pasan (`npm test`, vitest) — fretboard, piano, bowed
  - `tsc --noEmit`: limpio, 0 errores
  - `build:lib`: OK, `dist/notae.js` 22.8kb
  - Grep slop en `src/` (TODO/FIXME/console.log/debugger/@ts-ignore): ninguno
  - Grep slop en `docs/`: ninguno (solo `placeholder=` legítimos de inputs)
  - API pública (`index.ts`): solo 3 renderers + tipos + `DEFAULT_STYLE`; utils internos no expuestos
- Borrado: `src/NOTATION LIB - ok - Acceso directo.lnk` (acceso directo de Windows colado en src/, basura)
- `.gitignore`: añadidos `.playwright-mcp/` y `*.lnk`
- Conclusión: código limpio, sin slop real. Lo único sucio era basura untracked
- Resuelta inconsistencia banjo: UMT @master SÍ exporta `BANJO_OPEN_G` (verificado en CDN). Playground tiene banjo funcional (`playground.js:42,369,457`). La entrada 05-06 "Auditoría post mala sesión" quedó obsoleta (afirmaba que UMT no lo tenía); su TODO de añadir `BANJO_OPEN_G` a UMT ya está hecho. Commit `d5bec43` (banjo chip → 5-string bass) es un cambio correcto, no slop

### 2026-05-01 — POC completo
- Tres renderers: `renderGuitar`, `renderUkulele`, `renderPiano`
- POC con panel de tweaks en vivo + botón "Copy tweaks"
- Defaults validados

### 2026-05-01 — Sesión de refinamiento visual y API
- Nombre: **notae**
- `chord.tuning` reemplaza `stringLabels`
- Box API: backgroundColor, border, radius, padding, chordNameY
- Border crece hacia afuera, radius correcto
- Panel de tweaks ocultable

### 2026-05-02 — Architecture and new features
- `renderGuitar` + `renderUkulele` → **`renderFretboard` genérico** (cualquier número de cuerdas)
- `frets: (number|number[])[]` — soporta escalas con múltiples notas por cuerda
- `orientation: 'vertical' | 'horizontal'` — ambas orientaciones validadas
- `numFrets` configurable — permite mástiles completos (ej: 12 trastes)
- `root` en chord types — habilita `showDegrees` (R, 3, b3, 5, b7…)
- Grados en cuerdas al aire: se muestran en labels de abajo (vertical) o derecha (horizontal)
- `showPianoNoteLabels` — notas activas bajo el teclado
- `pianoWhiteKeyColor` — color de teclas blancas configurable
- `showDegrees` — aplica a piano y fretboard
- Escalas: A minor blues en posición 5 y mástil completo hasta traste 12
- Consistencia de tamaños: todos los diagramas del mismo instrumento tienen mismas dimensiones
- `fretLabelGap: 20` — margen derecho del grid validado
- `src/index.ts` — punto de entrada público de la librería
- Arquitectura revisada: POC y librería completamente separados

### 2026-05-02 — Sesión final de ajustes y git
- `chordNameGapP` — gap independiente para piano
- `nutColor` — color del nut configurable (antes hardcoded #333)
- `numFrets` — slider en tweaks panel (rango 4–15)
- Escala Am blues en piano (2 octavas) añadida al POC
- `project.md` archivado en `docs/project-archived.md` e ignorado por git
- `git init` + `.gitignore` (node_modules, poc/dist, dist, *.js.map, project archivado)
- Primer commit realizado — docs/ y state.md incluidos

### 2026-05-02 — Sesión de filtros, colores y ajustes visuales
- `filterStyle: 'clean' | 'shadow' | 'glow'` — filtros SVG en fretboard y piano
- `glowColor`, `glowBlur`, `glowOpacity` — control completo del glow
- `shadowX`, `shadowY`, `shadowBlur`, `shadowOpacity` — control completo de la sombra
- `colors?: (string|null)[]` en `FretboardChord` — color por dot individual
- `chordNameGap` y `chordNameGapH` — distancia chord name→diagrama, separados por orientación
- `padTop` derivado de `chordNameY + chordNameGap` en los tres renderers
- Defaults finales validados por el usuario (ver sección Defaults)
- Revisión svguitar y chords-db: arquitectura notae confirmada como superior en features
- Decisión: notae = SVG puro, UMT añadirá lógica de voicing → genera FretboardChord/PianoChord

### 2026-05-02 — Full StyleOptions audit and POC polish
- All hardcoded colors exposed: `chordNameColor`, `fretLabelColor`, `nutColor`, `pianoWhiteKeyStrokeColor`, `pianoBlackKeyStrokeColor`, `pianoBlackKeyLabelColor`
- Piano geometry exposed: `pianoBlackKeyWidthRatio`, `pianoBlackKeyHeightRatio`, `pianoWhiteKeyRadius`, `pianoBlackKeyRadius`, `pianoWhiteDotOffset`, `pianoBlackDotOffset`, `pianoKeyStrokeWidth`
- Fretboard geometry exposed: `stringWidth`, `fretWidth`, `indicatorZoneSize`
- Piano note labels: `pianoNoteLabelSize`, `pianoNoteLabelOffset`, `pianoNoteLabelPosition: 'top'|'bottom'`, `pianoBlackKeyLabelColor`
- `stringLabelPosition: 'top'|'bottom'` — vertical and horizontal fretboard
- `colors?: (string|null)[]` added to `PianoChord` (parallel to keys)
- Fixed piano filter: only dots + chord name + note labels get filter; keys unfiltered
- Fixed nut width to extend `stringWidth/2` on each side
- Fixed horizontal fretboard left padding (20→16, now symmetric)
- Fixed piano bottom padding (10→16, matches fretboard)
- POC: transparent checkbox for `backgroundColor`/`borderColor`
- POC: reorganized layout (compact, fewer sections)
- POC: F# harmonic minor 4-octave example with per-key colors and finger numbers

### 2026-05-02 — renderBowed implementado y validado

- `BowedChord` añadido a `types.ts`
- `src/bowed.ts` — renderer para cuerdas frotadas (violín, viola, cello)
- Paradigma: 4 cuerdas verticales, ticks laterales (no líneas completas), dots ON las líneas
- Posición 1 = nut; posición > 1 = línea de traste + número a la izquierda
- Slots = distancias en semitonos desde cuerda al aire
- Soporta: `stringLabelMode`, `stringLabelPosition`, `showDegrees`, `showFingerNumbers`
- Escala G mayor con semitonos reales validada (numSlots=5, G-A-B-C=[0,2,4,5])
- renderWind descartado por ahora — bretpimentel.com demasiado específico, queda como TODO
- Exportado desde `src/index.ts`

### 2026-05-02 — Sandbox POC + Banjo renderer

- `poc-sandbox/` creado — sandbox independiente para nuevos instrumentos
- `build.js` actualizado con segundo entry point para `poc-sandbox/`
- `FretboardChord.stringOffset?: number[]` añadido — fret donde empieza cada cuerda
- `renderFretboard` actualizado: nut segmentado, líneas de traste recortadas, peg indicator, sin dot en posición abierta del offset
- Peg indicator: círculo abierto centrado en el slot justo encima de donde empieza la cuerda
- Fret label con baseFret: posición fija a la izquierda del grid completo (`padLeft`)
- Banjo en open G (G D G B D): acordes G, C, D7, C(V) con baseFret, escala G major (7 trastes)
- Acordes musicalmente correctos validados
- Patterns confirmados: `[banjo-string-order]` drone a la izquierda (index 0), frets absolutos, frets[i]===offset[i] = al aire

### 2026-05-03 — Tweaks panel, bowed horizontal, consistencia renderers

- `renderBowed` soporta `orientation: 'horizontal'` — nueva función `renderBowedH`
- Banjo horizontal añadido al POC (3 acordes)
- Bowed horizontal añadido al POC (violín G, pos.3, escala G)
- Tweaks panel reorganizado: General → Chord name → Fretboard → Piano → Box → Filter
- `orientation` expuesto como select en el panel de tweaks
- `chordNameColor` movido de "Colors fretboard" a sección "Chord name"
- Fix bowed horizontal: nut posicionado en `x = padLeft` (no centrado) — elimina hueco con cuerdas
- Fix fretboard horizontal peg indicator: `fretX(relOff) - fretSpacing/2` (consistente con vertical)
- Consistencia renderers: `stringLabelSize + 6` en todos (era `+8` en fretboard horizontal), `padBottom = 16` en todos (era `s.dotRadius + 10` en bowed vertical, `s.dotRadius` en bowed horizontal)
- JSDoc completo en `note.ts` de UMT (name getter, getName, constructor _name) — incluye octava
- CDN UMT actualizado a `dist/umt.js` en poc/index.html (UMT migrado de docs/ a dist/)

### 2026-05-03 — UMT → Piano integration + documentación API

- Integración UMT en POC: `parseChordSymbol(symbol)` → `getNotes()` → `renderPiano`
- CDN: `https://cdn.jsdelivr.net/gh/memoriainfinita/UMT@main/dist/umt.js` (global `UMT`)
- `note.name` en UMT ya incluye octava (ej. `"C4"`) — documentado en `Note.name` JSDoc
- Auto-range: calculado desde `stepsFromBase` de cada nota (`piano_abs = 57 + steps`)
- JSDoc completo en notae: tres renderers (`@param`, `@returns`, `@example`), tipos `FretboardChord`/`PianoChord`/`BowedChord`, `StyleOptions` con unidades y comentarios en props no obvias
- Decisión: no base de datos de acordes — para piano UMT genera notas directamente; para fretboard, voicing algorítmico futuro en UMT

### 2026-05-03 — UMT scale integration + piano range fixes

- `renderUmtScale`: nueva función en POC — `parseScaleSymbol` → `renderPiano`, 1 octava
- Nueva sección "UMT → Piano (scale)" en `poc/index.html` con input interactivo
- Fix chord range: de snap a octave boundaries (C…B) a usar `notes[0].name` / `notes[last].name` directamente
- Fix black key boundaries: helper `umtRange` — si nota límite es negra, snap a blanca adyacente (−1 para from, +1 para to)
- Fix piano note labels: usar nombre original del key string (no `NOTE_NAMES[semi]`) — respeta `Bb` vs `A#` según lo que llega

### 2026-05-03 — Fixes márgenes bowed + fretLabelGapH expuesto

- Fix bowed vertical `padBottom`: añadido `+ dotRadius + 2` cuando labels abajo → 18px bajo label (igual que fretboard)
- Fix bowed horizontal `padRight`: añadido `+12` → 25px desde grid a borde, igual que fretboard
- Fix bowed horizontal `padLeft`: añadido `+16` base margin → indicadores alineados con fretboard horizontal
- Fix bowed horizontal `padBottom`: `16 + dotRadius` → 16px bajo cuerda inferior
- `fretLabelGapH?: number` (default 8) añadido a `StyleOptions` y `DEFAULT_STYLE` — controla el gap entre cuerda inferior y fret label en modo horizontal (determina el padding reservado siempre en banjo/fretboard horizontal)
- Slider `fretLabelGapH` añadido al tweaks panel
- Auditoría POC/librería: todo limpio — lógica de rendering exclusivamente en `src/*.ts`

### 2026-05-03 — Banjo y bowed movidos al POC principal

- BANJO y BOWED integrados en `poc/poc.ts` y `poc/index.html`
- `renderBowed` importado en poc principal
- Nuevas secciones Banjo y Bowed en el HTML
- Build limpio, sandbox conservado
- Investigación renderHexGrid: layouts Wicki-Hayden, Harmonic Table, Bosanquet-Wilson documentados — fuera de scope por ahora
- renderHarmonica: sin librerías equivalentes, modelo de datos propio — TODO futuro con nota

### 2026-05-05 — Reorganización, fixes playground, push inicial

- Estructura reorganizada: `poc/` + `poc-sandbox/` → `demo/` (flat), sin dist/ anidados
- `dist/notae.js` trackeado (igual que UMT), `dist/demo.js` y `dist/sandbox.js` ignorados
- `docs/` sin copia local de notae.js — usa CDN en producción
- `build:lib` simplificado, sin paso de copia
- Playground fixes: tuning select visible al init, borderColor incluido con borderWidth>0, dark mode toggle añadido
- Repo público creado: `github.com/memoriainfinita/notae`, push inicial hecho
- Pendiente: activar GitHub Pages en Settings (source: docs/)

### 2026-05-06 — Playground completo: tweaks, tuning editor, custom tuning

- Playground reestructurado: 6 tabs (General, Fretboard, Piano, Colors, Box, Filter) — toda la API StyleOptions expuesta
- `demo/` desvinculado del repo (local only), `docs/superpowers/` movido a `archive/`
- Banjo habilitado en playground: `BANJO_OPEN_G` disponible en UMT CDN, `stringOffset:[5,0,0,0,0]` añadido en playground
- Bowed renderer en playground via tunings locales (violin/viola/cello); UMT no tiene tunings de cuerdas frotadas
- Custom tuning: text input + string pins (▲▼ por cuerda) centrados bajo el diagrama; límite 12 strings, voicings bloqueados >8
- Presets custom: 8 ejemplos 1–8 cuerdas
- Chord position slider: inline junto al tuning select, selecciona voicing por posición en el mástil
- `numFrets` ya no sobreescribe escalas — slider funciona para ambos
- Example chips: texto plano clickable, disparan `input` event (fix chips no renderizaban)
- Colores: grid 3 columnas; sliders: thumb verde `#5aaa5a`
- Header playground: logo `notae` + "Playground", footer idéntico al index
- Logo: `var(--accent)` siempre, `:visited` con valor literal (CSS vars no resuelven en :visited)
- Input row: 3 columnas iguales (chord | renderer | tuning), chips dentro del input column
- TODO añadido: múltiples voicings en la misma posición

### 2026-05-06 — Auditoría post mala sesión, CDN, state.md

- CDN URL corregida de `@main` a `@master` — jsDelivr no encontraba el repo, todo fallaba en cascada
- `—` eliminado de todos los HTML en docs/
- state.md: path personal eliminado, skip-worktree activo (cambios locales no se pushean)
- `.gitignore` limpio: `dist/demo.js`, `dist/sandbox.js` ya estaban correctos
- History de state.md reordenado — mala sesión había desplazado entradas 05-02/05-03 al final
- System section actualizada: `poc/` → `demo/`
- API surface: añadido `renderBowed` a funciones exportadas
- Defaults: añadidos `stringLabelGap`, `pianoNoteLabelGap`, `bowedTickSize`, `fretLabelGapH`, `shadowColor`
- README: StyleOptions completado con las mismas 5 propiedades; eliminado import ESM interno
- `build:lib`: quitado `--sourcemap` (el .map era ignorado por git)
- GitHub Pages activado y funcionando: `https://memoriainfinita.github.io/notae/`

### 2026-05-05 — CDN fix, gitignore cleanup

- CDN URL corregida de `@main` a `@master` en docs/index.html, docs/playground.html, README.md
- `state.md` añadido a .gitignore y removido del tracking git (solo local)
- `.gitignore` corregido: `dist/demo.js` y `dist/sandbox.js` ya estaban ignorados (verificado)
- `—` eliminado de todos los HTML en docs/
- GitHub Pages activado: `https://memoriainfinita.github.io/notae/`

### 2026-05-05 — CDN audit y limpieza build

- Quitado `--sourcemap` de `build:lib` — el .map era ignorado por git, referencia inútil en notae.js
- Borrado `dist/notae.js.map` local
- Corregidas entradas contradictorias en state.md sobre copia docs/dist/

### 2026-05-05 — UMT → Fretboard integrado en POC

- Nueva sección "UMT → Fretboard (chord)": `parseChordSymbol` → `getFretboardVoicings` → muestra hasta 4 voicings con select de afinación (guitar/dropD/openG/ukulele/bass)
- Nueva sección "UMT → Fretboard (scale)": `parseScaleSymbol` → `getFretboardScale` (mástil completo, 12 trastes) + `getFretboardScalePositions` (hasta 5 position boxes de 4 trastes)
- Todos los ejemplos UMT (piano chord, piano scale, fretboard chord, fretboard scale) añadidos a `renderAll()` — ahora reaccionan a tweaks
- `getFretboardTuning()` lazy — evita evaluar presets UMT al cargar el módulo
- CDN: `@main` con Shift+F5 necesario si UMT se actualiza (jsDelivr cache agresivo, max-age=1 año)

### 2026-05-05 — build:lib setup (IIFE, igual que UMT)

- `package.json`: nombre `notae`, sin `private`, descripción y keywords
- `build:lib`: esbuild IIFE → `dist/notae.js` (22.8kb min), global `Notae`. Mismo patrón que UMT.
- `build.js` (POC) sin cambios — salida en `poc/dist/`, independiente
- Distribución: GitHub + GitHub Pages + jsDelivr CDN. Mismo patrón que UMT. npm descartado.

### 2026-05-05 — API cleanup, StyleOptions audit, vitest

- Eliminados utils internos de la API pública (`noteAtFret`, `degreeLabel`, `semitone`, `CHROMATIC`, `NOTE_MAP`)
- Expuestos `stringLabelGap` (default 4), `pianoNoteLabelGap` (default 4), `bowedTickSize` (default 5)
- `stringLabelGap` aplicado consistentemente en fretboard H y bowed H (reemplaza hardcoded 8 y 4)
- `bowed` horizontal `padRight` normalizado 12→16
- POC limpio: `.input-row`, `.poc-input`, `.poc-select`, `.poc-error`, `.poc-empty`, `.tweak-select`
- Vitest setup: 68 tests en `tests/unit/` — fretboard (32), piano (21), bowed (15)
- Audit confirmado: ningún valor visual hardcodeado sin exponer queda en los renderers

### 2026-05-05 — GitHub Pages landing page + README + shadowColor

- **Landing page** (`docs/`): hero, UMT-powered live demo (chord/scale input), 7 fretboard examples (barre, colors, scale horizontal, baseFret, banjo, bass, 7-string+shadow) + 3 piano + 3 bowed examples
- **Styling**: dark mode toggle (localStorage), CSS custom properties, responsive grid (`minmax(180px, 1fr)` default, `minmax(280px, 1fr)` for piano)
- **JS**: `themeStyle()` returns color overrides for dark mode, debounced demo input, API preview code block, copy-to-clipboard CDN snippet, re-render on theme toggle
- **README.md**: full API reference with all three renderers, chord types (FretboardChord/PianoChord/BowedChord), StyleOptions table, UMT integration examples, installation (CDN), build/test commands
- **Library improvement**: `shadowColor` property added to StyleOptions (default `#000000`) + DEFAULT_STYLE + FilterOptions. Enables visible shadows in dark mode.
- **Coverage**: all instruments in examples (guitar barre/colors/scale/baseFret, banjo drone/scale, bass 4-string, 7-string+shadow, piano chord/scale/colors+degrees, violin/cello scales+positions). All renderers and major StyleOptions features demonstrated on landing page
- Commit: `14c1bbb`

### 2026-05-05 — Interactive playground

- **Playground page** (`docs/playground.html` + `docs/playground.js`): standalone editor with tweaks panel
- **Layout**: 2 columns (controls left, output right) — responsive to 1 column on mobile
- **Input**: chord/scale symbol, renderer selector (fretboard/piano), fretboard tuning selector
- **Tweaks panel**: 5 tabs (General, Display, Colors, Box, Filter) with sliders, color pickers, checkboxes
- **Features**: live re-render on every tweak, dark mode support, API code preview with copy button, error handling
- **Landing page**: "Open playground →" button now points to `playground.html` (was GitHub)
- No precanned examples — all interaction driven by user input + tweaks
- **Folder structure**: `docs/` usa CDN en producción — no hay copia local de notae.js. HTML en docs/ carga desde jsDelivr.
- Commits: `c998cab` (playground), `157ce10` + `a0ad930` (structure), reverted for final setup
