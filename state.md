---
created: 2026-05-01
last_updated: 2026-10-12
---

# Notation Lib — State

## System

- **Stack:** TypeScript vanilla, esbuild, zero runtime deps
- **Fuentes:** `src/index.ts` (entrada pública), `src/fretboard.ts`, `src/piano.ts`, `src/bowed.ts`, `src/types.ts`, `src/utils.ts`
- **Tests:** vitest, `npm test`; 70 tests en `tests/unit/` (fretboard, piano, bowed)
- **Build:** `npm run build:lib` → `dist/notae.js` (IIFE, global `Notae`, 23 kb), versionado. `npm run dev` (watch) / `npm run build` (una vez) compilan la demo local
- **Demo local:** `demo/` (`index.html` + `demo.ts`, `sandbox.html` + `sandbox.ts`), sin versionar
- **Web:** `docs/` (`index.html`, `playground.html`) en GitHub Pages desde `/docs` en `master`: https://memoriainfinita.github.io/notae/. Carga notae por CDN desde `@master` (sin tags) y UMT fijado
- **Package name:** `notae`
- **UMT repo:** `github.com/memoriainfinita/UMT`, fijado a `v0.5.0` en docs y README (CDN `UMT@v0.5.0`). Subir de versión a mano
- **Publicado:** repo público `memoriainfinita/notae`, GPL-3.0

---

## API surface actual

### Tipos de chord
```ts
FretboardChord {
  name, frets: (number|number[])[], fingers?,
  colors?: (string|null)[],   // per-string dot color override
  baseFret?, barres?, tuning?, root?,
  stringOffset?: number[]     // fret where each string starts (banjo drone)
}
BowedChord {
  name, strings: (number|number[]|null)[], fingers?,
  colors?, position?, numSlots?, tuning?, root?
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
renderBowed(chord: BowedChord, style?: StyleOptions): string
```

### StyleOptions completo (todos los valores configurables por el usuario)
Ver sección Defaults validados.

---

## Patterns

- [string-numbering] En barres: `startString/endString` 1-indexed desde low E. Confirmed 2026-05.
- [piano-scaling] Todo en fracciones de wW/wH, sin Math.round. `pianoBlackKeyShift` es fracción de wW. Confirmed 2026-05.
- [note-names] Nombres de nota con cualquier número de alteraciones (`E#4`, `Cb4`, `F##4`), interpretados por `letterSemitone` en `utils.ts`; la octava es la de la letra (Cb4 = el Si bajo C4, B#3 = C4). La etiqueta conserva el nombre recibido. Confirmed 2026-10.
- [barre-clip] El renderer recorta barres si cuerdas exteriores son mudas (-1). No es responsabilidad del caller. Confirmed 2026-05.
- [svg-text-center] Usar `dy="0.35em"` para centrar texto en círculos SVG. Confirmed 2026-05.
- [nut-zindex] El nut se dibuja DESPUÉS de las cuerdas (SVG paint order). Confirmed 2026-05.
- [nut-height-fixed] `nutH = s.nutWidth` siempre — garantiza altura consistente entre diagramas. Confirmed 2026-05.
- [fret-lines] Extensión ±0.5px en líneas horizontales + strings ±0.5px vertical. Confirmed 2026-05.
- [svg-border-outward] Border crece hacia fuera: `viewBox="-bw -bw totalW+2bw totalH+2bw"`. Confirmed 2026-05.
- [tuning-api] `chord.tuning` es musical (no visual) — sirve para labels Y cálculo de notas. Confirmed 2026-05.
- [consistent-sizes] Padding siempre reserva espacio para fret label (vertical: padLeft asimétrico; horizontal: fretLabelH siempre). Confirmed 2026-05.
- [scale-frets] `frets: (number|number[])[]` — array para múltiples notas por cuerda (escalas). Confirmed 2026-05.
- [data-note] Cada tecla del piano lleva `data-note` (sostenidos + octava): el host engancha clicks por atributo, nunca por el orden de pintado (blancas y luego negras). Confirmed 2026-10.
- [horizontal-strings] En orientación horizontal, string 0 (low) va abajo para diestros. Confirmed 2026-05.
- [chord-name-centered] En vertical con padding asimétrico, chord name se centra sobre el GRID (`padLeft + gridW/2`), no sobre totalW. Confirmed 2026-05.
- [filter-piano] Filters apply only to dots group (not keys). Chord name and note labels also inside filter group. Keys always unfiltered. Confirmed 2026-05.
- [nut-follows-string-width] Nut extends `stringWidth/2` on each side to cover outer strings at any thickness. Confirmed 2026-05.
- [label-position] `stringLabelPosition` and `pianoNoteLabelPosition` redistribute padding — total diagram size stays constant. Confirmed 2026-05.
- [transparent-poc] `backgroundColor`/`borderColor` accept `'transparent'` (valid SVG). POC uses checkbox to handle this since `<input type="color">` doesn't support it. Confirmed 2026-05.
- [banjo-string-order] Drone (5ª cuerda) va en index 0 (izquierda). frets[] usa valores absolutos. frets[i]===stringOffset[i] = al aire, sin dot. Confirmed 2026-05.
- [umt-note-to-string] `PianoChord.keys` acepta strings, no objetos Note de UMT. Conversión: `notes.map(n => n.name)`. notae es zero deps — no acoplar al tipo Note. Confirmed 2026-05.
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
  "stringLabelGap": 4, "pianoNoteLabelGap": 4, "bowedTickSize": 5,
  "fretLabelGapH": 8,
  "showNoteNames": false, "preferFlats": false,
  "leftHanded": false, "orientation": "vertical",
  "filterStyle": "clean",
  "glowColor": "#5aaa5a", "glowBlur": 2.5, "glowOpacity": 0.8,
  "shadowX": 2, "shadowY": 3, "shadowBlur": 2, "shadowOpacity": 0.25,
  "shadowColor": "#000000"
}
```

---

## TODO

- [ ] renderHarmonica — layout horizontal de agujeros numerados, blow/draw, bends. Sin librerías de referencia. Retomar con caso de uso concreto.
- [ ] renderVibraphone — alias visual de renderPiano, defaults metálicos, proporciones propias
- [ ] renderHexGrid — renderer genérico de rejilla hexagonal isomórfica
  - Arquitectura: renderer puro (dibuja celdas) + generadores de layout separados
  - `HexGrid { cols, rows, cells[][], orientation: 'flat-top'|'pointy-top' }`
  - `HexCell { col, row, note?, label?, color?, active? }`
  - Generadores: `wickiHayden()`, `bosanquetWilson(edo)`, `harmonicTable()` → HexGrid
- [ ] SVGuitar (npm) — revisar como referencia/competidor
- [ ] Playground: múltiples voicings en la misma posición — `getFretboardVoicings` puede devolver varios acordes con el mismo `baseFret`. Decidir cómo exponerlos: flechas prev/next, grid de miniaturas, o selector numérico. Actualmente se muestra solo el primero que coincide con la posición.
- [ ] Fret layout variants — variantes visuales del grid de trastes (minor, no cambio de API):
  - Fan frets (multiscale): cada traste es una línea diagonal, ángulo variable por cuerda
  - True temperament frets: trastes en zigzag por cuerda para entonación pura
  - Microtonal frets: trastes adicionales entre los cromáticos estándar (EDO 24, 31, 53…)

Lo pasado: `state-history.md`.
