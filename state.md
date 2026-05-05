# Notation Lib — State

## System

- **Stack:** TypeScript vanilla, esbuild, zero runtime deps
- **Entry points:** `src/index.ts` (public entry), `src/fretboard.ts`, `src/piano.ts`, `src/types.ts`, `src/utils.ts`
- **POC:** `poc/index.html` + `poc/poc.ts` — open with `file://`, build with `npm run dev`
- **Build:** `node build.js` (watch) / `node build.js --once` (one-shot)
- **Package name:** `notae`
- **UMT path:** `C:\Users\mykl\OneDrive\Scriptorium\DOCS\CODING GIT\UNIVERSAL MUSIC LIBRARY\universal-music-theory-library`

---

## API surface actual

### Tipos de chord
```ts
FretboardChord {
  name, frets: (number|number[])[], fingers?,
  colors?: (string|null)[],   // per-string dot color override
  baseFret?, barres?, tuning?, root?
}
PianoChord {
  name, keys[], fingers?,
  colors?: (string|null)[],   // per-key dot color override
  range?, root?
}
```

### Funciones exportadas
```ts
renderFretboard(chord: FretboardChord, style?: StyleOptions): string
renderPiano(chord: PianoChord, style?: StyleOptions): string
```

### StyleOptions completo (todos los valores configurables por el usuario)
Ver sección Defaults validados.

---

## Patterns

- [string-numbering] En barres: `startString/endString` 1-indexed desde low E. Confirmed 2026-05.
- [piano-scaling] Todo en fracciones de wW/wH, sin Math.round. `pianoBlackKeyShift` es fracción de wW. Confirmed 2026-05.
- [barre-clip] El renderer recorta barres si cuerdas exteriores son mudas (-1). No es responsabilidad del caller. Confirmed 2026-05.
- [svg-text-center] Usar `dy="0.35em"` para centrar texto en círculos SVG. Confirmed 2026-05.
- [nut-zindex] El nut se dibuja DESPUÉS de las cuerdas (SVG paint order). Confirmed 2026-05.
- [nut-height-fixed] `nutH = s.nutWidth` siempre — garantiza altura consistente entre diagramas. Confirmed 2026-05.
- [fret-lines] Extensión ±0.5px en líneas horizontales + strings ±0.5px vertical. Confirmed 2026-05.
- [svg-border-outward] Border crece hacia fuera: `viewBox="-bw -bw totalW+2bw totalH+2bw"`. Confirmed 2026-05.
- [tuning-api] `chord.tuning` es musical (no visual) — sirve para labels Y cálculo de notas. Confirmed 2026-05.
- [consistent-sizes] Padding siempre reserva espacio para fret label (vertical: padLeft asimétrico; horizontal: fretLabelH siempre). Confirmed 2026-05.
- [scale-frets] `frets: (number|number[])[]` — array para múltiples notas por cuerda (escalas). Confirmed 2026-05.
- [horizontal-strings] En orientación horizontal, string 0 (low) va abajo para diestros. Confirmed 2026-05.
- [chord-name-centered] En vertical con padding asimétrico, chord name se centra sobre el GRID (`padLeft + gridW/2`), no sobre totalW. Confirmed 2026-05.
- [filter-piano] Filters apply only to dots group (not keys). Chord name and note labels also inside filter group. Keys always unfiltered. Confirmed 2026-05.
- [nut-follows-string-width] Nut extends `stringWidth/2` on each side to cover outer strings at any thickness. Confirmed 2026-05.
- [label-position] `stringLabelPosition` and `pianoNoteLabelPosition` redistribute padding — total diagram size stays constant. Confirmed 2026-05.
- [transparent-poc] `backgroundColor`/`borderColor` accept `'transparent'` (valid SVG). POC uses checkbox to handle this since `<input type="color">` doesn't support it. Confirmed 2026-05.
- [banjo-string-order] Drone (5ª cuerda) va en index 0 (izquierda). frets[] usa valores absolutos. frets[i]===stringOffset[i] = al aire, sin dot. Confirmed 2026-05.
- [fret-label-padleft] Fret label con baseFret siempre en `padLeft` — no relativo a x1 de la línea de traste, para que quede fuera del grid aunque haya cuerdas con offset. Confirmed 2026-05.
- [peg-indicator] Círculo abierto centrado en el slot justo encima de donde empieza la cuerda offset: `fretY(relOff) - fretSpacing/2`. Confirmed 2026-05.

---

## Preferences

- Estilo visual de referencia: musicca.com — limpio, minimalista, dots verdes, sin sombras
- Color por defecto: `#5aaa5a` para dots, barre y teclas activas de piano
- Nut a ras de las cuerdas (sin sobresalir lateralmente)
- `pianoBlackKeyShift: 0.22` (fracción validada visualmente)
- Labels de cuerda en mayúsculas (E no e)
- Panel de tweaks ocultable — solo es una herramienta POC. Los usuarios configuran con valores reales en StyleOptions.

---

## History

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

### 2026-05-05 — UMT → Fretboard integrado en POC

- Nueva sección "UMT → Fretboard (chord)": `parseChordSymbol` → `getFretboardVoicings` → muestra hasta 4 voicings con select de afinación (guitar/dropD/openG/ukulele/bass)
- Nueva sección "UMT → Fretboard (scale)": `parseScaleSymbol` → `getFretboardScale` (mástil completo, 12 trastes) + `getFretboardScalePositions` (hasta 5 position boxes de 4 trastes)
- Todos los ejemplos UMT (piano chord, piano scale, fretboard chord, fretboard scale) añadidos a `renderAll()` — ahora reaccionan a tweaks
- `getFretboardTuning()` lazy — evita evaluar presets UMT al cargar el módulo
- CDN: `@main` con Shift+F5 necesario si UMT se actualiza (jsDelivr cache agresivo, max-age=1 año)

### 2026-05-05 — API cleanup, StyleOptions audit, vitest

- Eliminados utils internos de la API pública (`noteAtFret`, `degreeLabel`, `semitone`, `CHROMATIC`, `NOTE_MAP`)
- Expuestos `stringLabelGap` (default 4), `pianoNoteLabelGap` (default 4), `bowedTickSize` (default 5)
- `stringLabelGap` aplicado consistentemente en fretboard H y bowed H (reemplaza hardcoded 8 y 4)
- `bowed` horizontal `padRight` normalizado 12→16
- POC limpio: `.input-row`, `.poc-input`, `.poc-select`, `.poc-error`, `.poc-empty`, `.tweak-select`
- Vitest setup: 63 tests en `tests/unit/` — fretboard (29), piano (19), bowed (15)
- Audit confirmado: ningún valor visual hardcodeado sin exponer queda en los renderers

### 2026-05-03 — Banjo y bowed movidos al POC principal

- BANJO y BOWED integrados en `poc/poc.ts` y `poc/index.html`
- `renderBowed` importado en poc principal
- Nuevas secciones Banjo y Bowed en el HTML
- Build limpio, sandbox conservado
- Investigación renderHexGrid: layouts Wicki-Hayden, Harmonic Table, Bosanquet-Wilson documentados — fuera de scope por ahora
- renderHarmonica: sin librerías equivalentes, modelo de datos propio — TODO futuro con nota

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

---

## Defaults validados

```json
{
  "fontFamily": "Arial, sans-serif",
  "chordNameSize": 17, "chordNameY": 30,
  "chordNameGap": 11, "chordNameGapH": 32, "chordNameGapP": 17,
  "chordNameColor": "#000000",
  "fingerNumberSize": 11, "pianoFingerNumberSize": 11,
  "fretLabelSize": 11, "fretLabelGap": 20, "fretLabelColor": "#555555",
  "dotRadius": 9, "stringSpacing": 19, "fretSpacing": 23,
  "numFrets": 5, "nutWidth": 4, "nutColor": "#333333",
  "stringWidth": 1, "fretWidth": 1,
  "dotColor": "#5aaa5a", "dotTextColor": "#ffffff",
  "stringColor": "#aaaaaa", "fretColor": "#cccccc",
  "barreColor": "#5aaa5a",
  "indicatorSize": 4, "indicatorStrokeWidth": 1.5,
  "indicatorColor": "#555555", "indicatorZoneSize": 18,
  "activeKeyColor": "#5aaa5a",
  "pianoWhiteKeyW": 28, "pianoWhiteKeyH": 137,
  "pianoWhiteKeyColor": "#ffffff", "pianoBlackKeyColor": "#222222",
  "pianoWhiteKeyStrokeColor": "#bbbbbb", "pianoBlackKeyStrokeColor": "#222222",
  "pianoKeyStrokeWidth": 1,
  "pianoBlackKeyShift": 0.22,
  "pianoBlackKeyWidthRatio": 0.58, "pianoBlackKeyHeightRatio": 0.62,
  "pianoWhiteKeyRadius": 3, "pianoBlackKeyRadius": 2,
  "pianoWhiteDotOffset": 5, "pianoBlackDotOffset": 4,
  "pianoDotRadius": 7,
  "pianoNoteLabelSize": 11, "pianoNoteLabelOffset": 6,
  "pianoNoteLabelPosition": "bottom",
  "pianoBlackKeyLabelColor": "#555555",
  "backgroundColor": "transparent", "borderColor": "transparent",
  "borderWidth": 0, "borderRadius": 0, "diagramPadding": 0,
  "showPianoNoteLabels": true, "showDegrees": false,
  "showFingerNumbers": true, "showStringLabels": true,
  "stringLabelMode": "tuning", "stringLabelPosition": "bottom",
  "stringLabelSize": 11, "stringLabelColor": "#999999",
  "leftHanded": false, "orientation": "vertical",
  "filterStyle": "clean",
  "glowColor": "#5aaa5a", "glowBlur": 2.5, "glowOpacity": 0.8,
  "shadowX": 2, "shadowY": 3, "shadowBlur": 2, "shadowOpacity": 0.25
}
```

---

## TODO

- [x] Decidir nombre del paquete npm → **notae**
- [x] Sandbox POC creado con banjo validado
- [x] renderBowed implementado y validado
- [ ] renderHarmonica — pendiente. No hay librerías equivalentes. Modelo de datos propio: agujeros numerados, blow/draw, bends. Retomar cuando haya caso de uso concreto.
- [x] Mover banjo y bowed al POC principal cuando estén listos
- [ ] renderVibraphone — alias visual de renderPiano, defaults metálicos, proporciones propias
- [ ] renderHexGrid — renderer genérico de rejilla hexagonal isomórfica
  - Arquitectura: renderer puro (dibuja celdas) + generadores de layout separados
  - `HexGrid { cols, rows, cells[][], orientation: 'flat-top'|'pointy-top' }`
  - `HexCell { col, row, note?, label?, color?, active? }`
  - Generadores: `wickiHayden()`, `bosanquetWilson(edo)`, `harmonicTable()` → HexGrid
  - Objetivo: un renderer, layouts infinitos
- [x] Revisar API surface antes de publicar — JSDoc completo en types.ts y renderers
- [ ] Evaluar si `PianoChord` debe aceptar objetos `Note` de UMT directamente
- [ ] Decidir relación con demo de UMT (reemplazar o complementar abcjs)
- [x] UMT → Piano: integración básica funcionando en POC (parseChordSymbol → renderPiano, auto-range)
- [x] UMT → Fretboard: voicing algorítmico implementado en UMT. `getFretboardVoicings(chord, tuning)` → array de posiciones ordenadas. También `getFretboardScale` y `getFretboardScalePositions`. Presets: `GUITAR_STANDARD`, `GUITAR_DROPPED_D`, `GUITAR_OPEN_G`, `UKULELE_STANDARD`, `BASS_STANDARD`. Output compatible con `FretboardChord` de notae: `renderFretboard({ name: chord.name, ...voicings[0] })`. UMT commit `9fa8316`. Integrado en POC 2026-05-05.
- [x] Vitest setup — 63 tests en tests/unit/ (fretboard, piano, bowed)
- [ ] Setup npm package (`package.json` público, exports, tipos)

### Pendiente en UMT (repo separado)
- [x] Bundle migrado a `dist/umt.js` (2026-05-03). CDN en `poc/index.html` actualizado.
- [x] `parseChordSymbol` / `parseScaleSymbol` en `parser.ts`: respetar accidental explícito del usuario. Arreglado 2026-05-03 — commit `b32d643`. `A#maj7` ya devuelve root `A#` no `Bb`.

### Instrumentos a explorar
- [ ] `renderWind` — descartado por ahora. bretpimentel.com es referencia difícil de superar. Retomar cuando haya caso de uso concreto.
- [ ] Banjo de 5 cuerdas — requiere `stringOffset?: number[]` (5ª cuerda empieza en traste 5)
- [ ] Violín/viola/cello — posiciones en mástil sin trastes, paradigma diferente
- [ ] Armónica — layout horizontal de agujeros, soplar/aspirar
- [ ] SVGuitar (npm) — revisar como referencia/competidor
