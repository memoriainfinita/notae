# notae

[![jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-orange)](https://cdn.jsdelivr.net/gh/memoriainfinita/notae@master/dist/notae.js)
[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://memoriainfinita.github.io/notae/)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

SVG chord and scale diagram renderer for fretted, keyboard, and bowed instruments.
Zero runtime dependencies. 23 kb compiled bundle.

**[Live demo](https://memoriainfinita.github.io/notae/)** · **[Playground](https://memoriainfinita.github.io/notae/playground.html)**

---

## What it does

notae renders publication-quality SVG diagrams directly from a chord or scale description.
No canvas, no DOM manipulation, no dependencies — just a function that returns an SVG string.

```javascript
// Guitar — barre chord with finger numbers
Notae.renderFretboard({
  name: 'F major',
  frets: [1, 3, 3, 2, 1, 1],
  fingers: [1, 3, 4, 2, 1, 1],
  barres: [{ fret: 1, startString: 1, endString: 6 }],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
})

// Banjo — drone string offset, scale with multiple notes per string
Notae.renderFretboard({
  name: 'G major',
  frets: [[5, 7], [0, 2, 4, 5], [0, 2, 4, 5], [0, 1, 3, 5], [0, 2, 4]],
  tuning: ['G', 'D', 'G', 'B', 'D'],
  stringOffset: [5, 0, 0, 0, 0],
  root: 'G',
}, { numFrets: 7 })

// Piano — chord with per-key colors
Notae.renderPiano({
  name: 'G major',
  keys: ['G3', 'B3', 'D4'],
  colors: ['#cc2244', '#5aaa5a', '#4466cc'],
  root: 'G',
})

// Violin — G major scale, 1st position
Notae.renderBowed({
  name: 'G major',
  strings: [[0, 2, 4, 5], [0, 2, 4, 5], [0, 2, 3, 5], [0, 2, 3, 5]],
  numSlots: 5,
  tuning: ['G', 'D', 'A', 'E'],
  position: 1,
  root: 'G',
})
```

---

## Installation

**Browser — CDN (jsDelivr)**
```html
<script src="https://cdn.jsdelivr.net/gh/memoriainfinita/notae@master/dist/notae.js"></script>
```

**TypeScript / ESM**
```typescript
import { renderFretboard, renderPiano, renderBowed } from './src/index'
```

**Build from source**
```bash
npm install
npm run build:lib   # src/index.ts → dist/notae.js (IIFE, global Notae)
npm run dev         # watch mode for the demo
```

---

## Renderers

### Fretboard

Any fretted instrument: guitar, bass, ukulele, banjo, mandolin.

```typescript
renderFretboard(chord: FretboardChord, style?: StyleOptions): string
```

```typescript
// Barre chord with finger numbers
renderFretboard({
  name: 'F major',
  frets: [1, 3, 3, 2, 1, 1],
  fingers: [1, 3, 4, 2, 1, 1],
  barres: [{ fret: 1, startString: 1, endString: 6 }],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  root: 'F',
})

// Scale position with per-dot colors (root · third · fifth)
renderFretboard({
  name: 'G major',
  frets: [3, 2, 0, 0, 0, 3],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  root: 'G',
  colors: ['#cc2244', '#4466cc', null, null, '#4466cc', '#cc2244'],
})

// Scale — multiple notes per string
renderFretboard({
  name: 'Am pentatonic',
  frets: [[5, 8], [5, 7], [5, 7], [5, 7], [5, 8], [5, 8]],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  baseFret: 5,
  root: 'A',
}, { numFrets: 4, orientation: 'horizontal' })

// Banjo — drone string with offset
renderFretboard({
  name: 'G',
  frets: [5, 0, 0, 0, 0],
  tuning: ['G', 'D', 'G', 'B', 'D'],
  stringOffset: [5, 0, 0, 0, 0],
  root: 'G',
})
```

**`FretboardChord`**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Chord or scale name (shown above diagram) |
| `frets` | `(number \| number[])[]` | Fret per string; -1 = muted, 0 = open. Array for multiple notes (scales). |
| `fingers?` | `number[]` | Finger number per string (0 = none) |
| `barres?` | `{ fret, startString, endString }[]` | Barre indicators. Strings are 1-indexed from low. |
| `tuning?` | `string[]` | Open-string names, used as labels |
| `baseFret?` | `number` | First fret shown — triggers fret label |
| `stringOffset?` | `number[]` | Fret where each string starts (banjo drone) |
| `root?` | `string` | Root note — enables `showDegrees` |
| `colors?` | `(string \| null)[]` | Per-dot color override |

---

### Piano

```typescript
renderPiano(chord: PianoChord, style?: StyleOptions): string
```

```typescript
// Chord with finger numbers
renderPiano({
  name: 'Cmaj7',
  keys: ['C4', 'E4', 'G4', 'B4'],
  fingers: [1, 2, 3, 5],
  root: 'C',
})

// Scale over 2 octaves
renderPiano({
  name: 'Am blues',
  keys: ['A3', 'C4', 'D4', 'Eb4', 'E4', 'G4', 'A4', 'C5', 'D5', 'Eb5', 'E5', 'G5'],
  root: 'A',
  range: { from: 'A3', to: 'G5' },
})

// Per-key colors with scale degrees
renderPiano({
  name: 'F# harmonic minor',
  keys: ['F#3', 'G#3', 'A3', 'B3', 'C#4', 'D4', 'F4', 'F#4'],
  colors: ['#cc2244', null, '#4466cc', null, '#5aaa5a', null, null, '#cc2244'],
  root: 'F#',
}, { showDegrees: true })
```

**`PianoChord`**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Chord or scale name |
| `keys` | `string[]` | Active keys, e.g. `'C4'`, `'Bb3'`, `'F#5'` |
| `fingers?` | `number[]` | Finger number per key |
| `root?` | `string` | Root note — enables `showDegrees` |
| `range?` | `{ from: string, to: string }` | Visible range of the keyboard |
| `colors?` | `(string \| null)[]` | Per-key color override |

---

### Bowed strings

Violin, viola, cello — slot-based (semitones from open string).

```typescript
renderBowed(chord: BowedChord, style?: StyleOptions): string
```

```typescript
// G major scale, violin, 1st position
renderBowed({
  name: 'G major',
  strings: [[0, 2, 4, 5], [0, 2, 4, 5], [0, 2, 3, 5], [0, 2, 3, 5]],
  numSlots: 5,
  tuning: ['G', 'D', 'A', 'E'],
  position: 1,
  root: 'G',
})

// Position chord, horizontal layout
renderBowed({
  name: 'D',
  strings: [3, 2, 1, null],
  fingers: [3, 2, 1, null],
  tuning: ['G', 'D', 'A', 'E'],
  position: 3,
}, { orientation: 'horizontal' })
```

**`BowedChord`**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Chord or scale name |
| `strings` | `(number \| number[] \| null)[]` | Slot per string (semitones from open). null = not played. |
| `fingers?` | `(number \| null)[]` | Finger number per string |
| `tuning?` | `string[]` | Open-string names |
| `position?` | `number` | Position indicator shown left of diagram |
| `numSlots?` | `number` | Number of slots to display (default: 4) |
| `root?` | `string` | Root note — enables `showDegrees` |

---

## StyleOptions

All renderers accept an optional second argument. Every field is optional.

```typescript
renderFretboard(chord, {
  // Colors
  dotColor: '#5aaa5a',
  dotTextColor: '#ffffff',
  chordNameColor: '#000000',
  nutColor: '#333333',
  stringColor: '#aaaaaa',
  fretColor: '#cccccc',
  barreColor: '#5aaa5a',

  // Sizes
  dotRadius: 9,
  stringSpacing: 19,
  fretSpacing: 23,
  numFrets: 5,
  nutWidth: 4,

  // Layout
  orientation: 'vertical',    // 'vertical' | 'horizontal'
  leftHanded: false,
  showFingerNumbers: true,
  showDegrees: false,         // requires chord.root
  showStringLabels: true,
  stringLabelMode: 'tuning',  // 'tuning' | 'notes'

  // Filter effects
  filterStyle: 'clean',       // 'clean' | 'shadow' | 'glow'
  shadowColor: '#000000',
  shadowX: 2, shadowY: 3, shadowBlur: 2, shadowOpacity: 0.25,
  glowColor: '#5aaa5a', glowBlur: 2.5, glowOpacity: 0.8,

  // Box
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 0,
  diagramPadding: 0,
})
```

Full list of defaults in [`src/types.ts`](src/types.ts).

---

## Integration with UMT

notae pairs with [UMT](https://github.com/memoriainfinita/UMT) for music theory computation.
UMT generates the note data; notae renders the diagram.

```html
<script src="https://cdn.jsdelivr.net/gh/memoriainfinita/notae@master/dist/notae.js"></script>
<script src="https://cdn.jsdelivr.net/gh/memoriainfinita/UMT@main/dist/umt.js"></script>
<script>
  // Chord → piano
  const chord = UMT.parseChordSymbol('Cmaj9');
  const keys = chord.getNotes().map(n => n.name);
  document.getElementById('piano').innerHTML = Notae.renderPiano({ name: 'Cmaj9', keys });

  // Chord → fretboard voicings
  const voicings = UMT.getFretboardVoicings(chord, UMT.GUITAR_STANDARD);
  document.getElementById('fret').innerHTML = Notae.renderFretboard({ name: 'Cmaj9', ...voicings[0] });

  // Scale → fretboard positions
  const scale = UMT.parseScaleSymbol('D dorian');
  const boxes = UMT.getFretboardScalePositions(scale, UMT.GUITAR_STANDARD);
  boxes.slice(0, 5).forEach((box, i) => {
    document.getElementById('box-' + i).innerHTML = Notae.renderFretboard(
      { name: 'D dorian', ...box },
      { numFrets: 4 }
    );
  });
</script>
```

---

## Tests

```bash
npm test   # 63 unit tests via vitest (fretboard, piano, bowed)
```

---

## License

GPL-3.0. See `LICENSE`.
