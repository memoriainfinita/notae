import { renderFretboard } from '../src/fretboard'
import { renderPiano } from '../src/piano'
import { renderBowed } from '../src/bowed'
import { StyleOptions, DEFAULT_STYLE } from '../src/types'

declare const UMT: any

const CHORDS = {
  // Guitar — standard tuning
  guitarOpen: {
    name: 'G major',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    tuning: ['E','A','D','G','B','E'],
    root: 'G',
  },
  guitarBarre: {
    name: 'F major',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barres: [{ fret: 1, startString: 1, endString: 6 }],
    tuning: ['E','A','D','G','B','E'],
    root: 'F',
  },
  guitarDm7: {
    name: 'Dm7',
    frets: [-1, 5, 7, 5, 6, 5],
    fingers: [0, 1, 3, 1, 2, 1],
    baseFret: 5,
    barres: [{ fret: 5, startString: 2, endString: 6 }],
    tuning: ['E','A','D','G','B','E'],
    root: 'D',
  },
  guitarDropD: {
    name: 'D major (drop D)',
    frets: [0, 0, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    tuning: ['D','A','D','G','B','E'],
    root: 'D',
  },

  // Ukulele — GCEA
  ukuleleOpen: {
    name: 'C major',
    frets: [0, 0, 0, 3],
    fingers: [0, 0, 0, 3],
    tuning: ['G','C','E','A'],
    root: 'C',
  },
  ukuleleBarre: {
    name: 'Bb major',
    frets: [3, 2, 1, 1],
    fingers: [3, 2, 1, 1],
    tuning: ['G','C','E','A'],
    root: 'Bb',
  },

  // Bass — EADG (4 strings)
  bassE5: {
    name: 'E5',
    frets: [0, 2, 2, -1],
    fingers: [0, 1, 2, 0],
    tuning: ['E','A','D','G'],
    root: 'E',
  },
  bassDm: {
    name: 'D5',
    frets: [-1, 0, 0, 2],
    fingers: [0, 0, 0, 3],
    tuning: ['E','A','D','G'],
    root: 'D',
  },

  // Guitar 7 strings — BEADGBE
  guitar7Am: {
    name: 'Am',
    frets: [-1, 0, 0, 2, 2, 1, 0],
    fingers: [0, 0, 0, 2, 3, 1, 0],
    tuning: ['B','E','A','D','G','B','E'],
    root: 'A',
  },
  guitar7Barre: {
    name: 'F major',
    frets: [-1, 1, 3, 3, 2, 1, 1],
    fingers: [0, 1, 3, 4, 2, 1, 1],
    barres: [{ fret: 1, startString: 2, endString: 7 }],
    tuning: ['B','E','A','D','G','B','E'],
    root: 'F',
  },

  // Per-dot colors — G major: R=#e05, 3rd=#55a, 5th=#5a5
  guitarColors: {
    name: 'G major',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    tuning: ['E','A','D','G','B','E'],
    root: 'G',
    colors: ['#cc2244', '#4466cc', null, null, '#4466cc', '#cc2244'],
  },

  // Scales
  // A minor blues — position 5 (box pattern, 4 frets shown)
  scaleAmBluesPos5: {
    name: 'Am blues pos.5',
    frets: [[5,8], [5,6,7], [5,7], [5,7], [5,8], [5,8]],
    tuning: ['E','A','D','G','B','E'],
    baseFret: 5,
    root: 'A',
  },
  // A minor blues — full neck to fret 12
  scaleAmBluesFull: {
    name: 'Am blues full',
    frets: [
      [0,3,5,8,10,12],
      [0,2,3,5,7,10,12],
      [0,2,3,5,7,9,10,12],
      [0,2,3,5,7,9,10,12],
      [0,1,3,5,8,10,12],
      [0,3,5,8,10,12],
    ],
    tuning: ['E','A','D','G','B','E'],
    baseFret: 1,
    root: 'A',
  },

  // Banjo — open G tuning (G D G B D), drone (5th string) at index 0
  banjoG: {
    name: 'G',
    frets: [5, 0, 0, 0, 0],
    fingers: [0, 0, 0, 0, 0],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'G',
  },
  banjoC: {
    name: 'C',
    frets: [5, 2, 0, 1, 2],
    fingers: [0, 2, 0, 1, 3],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'C',
  },
  banjoD7: {
    name: 'D7',
    frets: [5, 0, 2, 1, 0],
    fingers: [0, 0, 2, 1, 0],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'D',
  },
  banjoCHighPos: {
    name: 'C (V)',
    frets: [5, 5, 5, 5, 5],
    fingers: [0, 1, 2, 3, 4],
    baseFret: 4,
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'C',
  },
  banjoGScale: {
    name: 'G major',
    frets: [
      [5, 7],
      [0, 2, 4, 5],
      [0, 2, 4, 5],
      [0, 1, 3, 5],
      [0, 2, 4],
    ],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'G',
  },

  // Piano scale — A minor blues over 2 octaves
  pianoAmBlues: {
    name: 'Am blues',
    keys: ['A3','C4','D4','Eb4','E4','G4','A4','C5','D5','Eb5','E5','G5'],
    root: 'A',
    range: { from: 'A3', to: 'G5' },
  },

  // F# harmonic minor — 4 octaves, tonic/third/fifth colored
  // F#(1) G#(2) A(3) B(4) C#(5) D(6) F=E#(7)
  pianoFsharpHarmonicMinor: {
    name: 'F# harmonic minor',
    keys: [
      'F#2','G#2','A2','B2','C#3','D3','F3',
      'F#3','G#3','A3','B3','C#4','D4','F4',
      'F#4','G#4','A4','B4','C#5','D5','F5',
      'F#5','G#5','A5','B5','C#6','D6','F6',
    ],
    colors: [
      '#cc2244', null, '#4466cc', null, '#5aaa5a', null, null,
      '#cc2244', null, '#4466cc', null, '#5aaa5a', null, null,
      '#cc2244', null, '#4466cc', null, '#5aaa5a', null, null,
      '#cc2244', null, '#4466cc', null, '#5aaa5a', null, null,
    ],
    fingers: [
      2,3,1,2,3,1,2,
      3,1,2,3,1,2,3,
      1,2,3,1,2,3,1,
      2,3,1,2,3,1,2,
    ],
    root: 'F#',
    range: { from: 'F2', to: 'F6' },
  },

  // Bowed strings
  bowedViolinG: {
    name: 'G',
    strings: [0, 0, 1, null],
    fingers: [null, null, 1, null],
    tuning: ['G', 'D', 'A', 'E'],
    position: 1,
    root: 'G',
  },
  bowedViolinD3: {
    name: 'D',
    strings: [3, 2, 1, null],
    fingers: [3, 2, 1, null],
    tuning: ['G', 'D', 'A', 'E'],
    position: 3,
    root: 'D',
  },
  bowedCelloC: {
    name: 'C',
    strings: [0, 0, 1, null],
    fingers: [null, null, 1, null],
    tuning: ['C', 'G', 'D', 'A'],
    position: 1,
    root: 'C',
  },
  bowedViolinA: {
    name: 'A',
    strings: [null, 4, 0, 0],
    fingers: [null, 4, null, null],
    tuning: ['G', 'D', 'A', 'E'],
    position: 1,
    root: 'A',
  },
  bowedViolinScale: {
    name: 'G major',
    strings: [[0,2,4,5], [0,2,4,5], [0,2,3,5], [0,2,3,5]],
    numSlots: 5,
    tuning: ['G', 'D', 'A', 'E'],
    position: 1,
    root: 'G',
  },

  // Piano
  pianoWhite: {
    name: 'Cmaj7',
    keys: ['C4', 'E4', 'G4', 'B4'],
    fingers: [1, 2, 3, 4],
    root: 'C',
  },
  pianoBlack: {
    name: 'Bbm11',
    keys: ['Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'Ab4'],
    fingers: [1, 2, 3, 4, 3, 2],
    root: 'Bb',
  },
}

let currentStyle: StyleOptions = { ...DEFAULT_STYLE }

function renderAll(): void {
  document.getElementById('guitar-open')!.innerHTML    = renderFretboard(CHORDS.guitarOpen, currentStyle)
  document.getElementById('guitar-barre')!.innerHTML   = renderFretboard(CHORDS.guitarBarre, currentStyle)
  document.getElementById('guitar-dm7')!.innerHTML     = renderFretboard(CHORDS.guitarDm7, currentStyle)
  document.getElementById('guitar-dropd')!.innerHTML   = renderFretboard(CHORDS.guitarDropD, currentStyle)
  document.getElementById('ukulele-open')!.innerHTML   = renderFretboard(CHORDS.ukuleleOpen, currentStyle)
  document.getElementById('ukulele-barre')!.innerHTML  = renderFretboard(CHORDS.ukuleleBarre, currentStyle)
  document.getElementById('bass-e5')!.innerHTML        = renderFretboard(CHORDS.bassE5, currentStyle)
  document.getElementById('bass-dm')!.innerHTML        = renderFretboard(CHORDS.bassDm, currentStyle)
  document.getElementById('guitar7-am')!.innerHTML     = renderFretboard(CHORDS.guitar7Am, currentStyle)
  document.getElementById('guitar7-barre')!.innerHTML  = renderFretboard(CHORDS.guitar7Barre, currentStyle)
  document.getElementById('guitar-colors')!.innerHTML = renderFretboard(CHORDS.guitarColors, currentStyle)
  const h = { ...currentStyle, orientation: 'horizontal' as const }
  document.getElementById('guitar-open-h')!.innerHTML  = renderFretboard(CHORDS.guitarOpen, h)
  document.getElementById('guitar-barre-h')!.innerHTML = renderFretboard(CHORDS.guitarBarre, h)
  document.getElementById('guitar-dm7-h')!.innerHTML   = renderFretboard(CHORDS.guitarDm7, h)
  document.getElementById('banjo-g')!.innerHTML      = renderFretboard(CHORDS.banjoG,         currentStyle)
  document.getElementById('banjo-c')!.innerHTML      = renderFretboard(CHORDS.banjoC,         currentStyle)
  document.getElementById('banjo-d7')!.innerHTML     = renderFretboard(CHORDS.banjoD7,        currentStyle)
  document.getElementById('banjo-highG')!.innerHTML  = renderFretboard(CHORDS.banjoCHighPos,  currentStyle)
  document.getElementById('banjo-scale')!.innerHTML  = renderFretboard(CHORDS.banjoGScale, { ...currentStyle, numFrets: 7 })
  const bh = { ...currentStyle, orientation: 'horizontal' as const }
  document.getElementById('banjo-g-h')!.innerHTML    = renderFretboard(CHORDS.banjoG,  bh)
  document.getElementById('banjo-c-h')!.innerHTML    = renderFretboard(CHORDS.banjoC,  bh)
  document.getElementById('banjo-d7-h')!.innerHTML   = renderFretboard(CHORDS.banjoD7, bh)
  document.getElementById('bowed-violinG')!.innerHTML     = renderBowed(CHORDS.bowedViolinG,     currentStyle)
  document.getElementById('bowed-violinD3')!.innerHTML    = renderBowed(CHORDS.bowedViolinD3,    currentStyle)
  document.getElementById('bowed-celloC')!.innerHTML      = renderBowed(CHORDS.bowedCelloC,      currentStyle)
  document.getElementById('bowed-violinA')!.innerHTML     = renderBowed(CHORDS.bowedViolinA,     currentStyle)
  document.getElementById('bowed-violinScale')!.innerHTML = renderBowed(CHORDS.bowedViolinScale,  currentStyle)
  const bowH = { ...currentStyle, orientation: 'horizontal' as const }
  document.getElementById('bowed-violinG-h')!.innerHTML     = renderBowed(CHORDS.bowedViolinG,     bowH)
  document.getElementById('bowed-violinD3-h')!.innerHTML    = renderBowed(CHORDS.bowedViolinD3,    bowH)
  document.getElementById('bowed-violinScale-h')!.innerHTML = renderBowed(CHORDS.bowedViolinScale, bowH)
  document.getElementById('scale-amblues-pos5')!.innerHTML   = renderFretboard(CHORDS.scaleAmBluesPos5, { ...currentStyle, numFrets: 4 })
  document.getElementById('scale-amblues-full')!.innerHTML   = renderFretboard(CHORDS.scaleAmBluesFull, { ...currentStyle, numFrets: 12 })
  document.getElementById('scale-amblues-pos5-h')!.innerHTML = renderFretboard(CHORDS.scaleAmBluesPos5, { ...currentStyle, numFrets: 4, orientation: 'horizontal' })
  document.getElementById('scale-amblues-full-h')!.innerHTML = renderFretboard(CHORDS.scaleAmBluesFull, { ...currentStyle, numFrets: 12, orientation: 'horizontal' })
  document.getElementById('piano-amblues')!.innerHTML  = renderPiano(CHORDS.pianoAmBlues, currentStyle)
  document.getElementById('piano-fsharp-minor')!.innerHTML = renderPiano(CHORDS.pianoFsharpHarmonicMinor, currentStyle)
  document.getElementById('piano-white')!.innerHTML    = renderPiano(CHORDS.pianoWhite, currentStyle)
  document.getElementById('piano-black')!.innerHTML    = renderPiano(CHORDS.pianoBlack, currentStyle)
}

function bindTweaks(): void {
  const panel = document.getElementById('tweaks-panel')!

  function bindSlider(id: string, key: keyof StyleOptions, min: number, max: number, step = 1): void {
    const input = panel.querySelector<HTMLInputElement>(`#tweak-${id}`)!
    const label = panel.querySelector<HTMLSpanElement>(`#tweak-${id}-val`)!
    input.min = String(min)
    input.max = String(max)
    input.step = String(step)
    input.value = String((currentStyle as Record<string, unknown>)[key])
    label.textContent = input.value
    input.addEventListener('input', () => {
      ;(currentStyle as Record<string, unknown>)[key] = Number(input.value)
      label.textContent = input.value
      renderAll()
    })
  }

  function bindColor(id: string, key: keyof StyleOptions): void {
    const input = panel.querySelector<HTMLInputElement>(`#tweak-${id}`)!
    input.value = String((currentStyle as Record<string, unknown>)[key])
    input.addEventListener('input', () => {
      ;(currentStyle as Record<string, unknown>)[key] = input.value
      renderAll()
    })
  }

  function bindColorWithTransparent(id: string, key: keyof StyleOptions, fallback: string): void {
    const input = panel.querySelector<HTMLInputElement>(`#tweak-${id}`)!
    const checkbox = panel.querySelector<HTMLInputElement>(`#tweak-${id}-transparent`)!
    const current = String((currentStyle as Record<string, unknown>)[key])
    const isTransparent = current === 'transparent'
    checkbox.checked = isTransparent
    input.disabled = isTransparent
    input.value = isTransparent ? fallback : current
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        ;(currentStyle as Record<string, unknown>)[key] = 'transparent'
        input.disabled = true
      } else {
        ;(currentStyle as Record<string, unknown>)[key] = input.value
        input.disabled = false
      }
      renderAll()
    })
    input.addEventListener('input', () => {
      ;(currentStyle as Record<string, unknown>)[key] = input.value
      renderAll()
    })
  }

  function bindText(id: string, key: keyof StyleOptions): void {
    const input = panel.querySelector<HTMLInputElement>(`#tweak-${id}`)!
    input.value = String((currentStyle as Record<string, unknown>)[key])
    input.addEventListener('input', () => {
      ;(currentStyle as Record<string, unknown>)[key] = input.value
      renderAll()
    })
  }

  function bindToggle(id: string, key: keyof StyleOptions): void {
    const input = panel.querySelector<HTMLInputElement>(`#tweak-${id}`)!
    input.checked = Boolean((currentStyle as Record<string, unknown>)[key])
    input.addEventListener('change', () => {
      ;(currentStyle as Record<string, unknown>)[key] = input.checked
      renderAll()
    })
  }

  bindSlider('dotRadius', 'dotRadius', 4, 20)
  bindSlider('stringSpacing', 'stringSpacing', 12, 36)
  bindSlider('fretSpacing', 'fretSpacing', 16, 40)
  bindSlider('nutWidth', 'nutWidth', 2, 10)
  bindSlider('numFrets', 'numFrets', 4, 15)
  bindColor('chordNameColor', 'chordNameColor')
  bindColor('fretLabelColor', 'fretLabelColor')
  bindColor('nutColor', 'nutColor')
  bindSlider('chordNameSize', 'chordNameSize', 10, 22)
  bindSlider('chordNameY', 'chordNameY', 10, 48)
  bindSlider('chordNameGap', 'chordNameGap', 4, 40)
  bindSlider('chordNameGapH', 'chordNameGapH', 4, 40)
  bindSlider('chordNameGapP', 'chordNameGapP', 4, 40)
  bindSlider('fingerNumberSize', 'fingerNumberSize', 7, 16)
  bindSlider('pianoFingerNumberSize', 'pianoFingerNumberSize', 7, 16)
  bindSlider('fretLabelSize', 'fretLabelSize', 7, 16)
  bindSlider('fretLabelGap', 'fretLabelGap', 4, 40)
  bindSlider('stringLabelSize', 'stringLabelSize', 6, 14)
  bindColor('stringLabelColor', 'stringLabelColor')
  bindSlider('pianoWhiteKeyW', 'pianoWhiteKeyW', 18, 48)
  bindSlider('pianoWhiteKeyH', 'pianoWhiteKeyH', 48, 240)
  bindSlider('pianoBlackKeyShift', 'pianoBlackKeyShift', -0.5, 0.5, 0.01)
  bindSlider('pianoBlackKeyWidthRatio', 'pianoBlackKeyWidthRatio', 0.3, 0.8, 0.01)
  bindSlider('pianoBlackKeyHeightRatio', 'pianoBlackKeyHeightRatio', 0.4, 0.85, 0.01)
  bindSlider('pianoWhiteKeyRadius', 'pianoWhiteKeyRadius', 0, 12)
  bindSlider('pianoBlackKeyRadius', 'pianoBlackKeyRadius', 0, 10)
  bindSlider('pianoWhiteDotOffset', 'pianoWhiteDotOffset', 0, 20)
  bindSlider('pianoBlackDotOffset', 'pianoBlackDotOffset', 0, 20)
  bindSlider('pianoKeyStrokeWidth', 'pianoKeyStrokeWidth', 0, 4, 0.5)
  bindSlider('pianoDotRadius', 'pianoDotRadius', 3, 12)
  bindSlider('pianoNoteLabelSize', 'pianoNoteLabelSize', 6, 16)
  bindSlider('pianoNoteLabelOffset', 'pianoNoteLabelOffset', 0, 16)
  bindColor('dotColor', 'dotColor')
  bindColor('dotTextColor', 'dotTextColor')
  bindColor('stringColor', 'stringColor')
  bindColor('fretColor', 'fretColor')
  bindColor('barreColor', 'barreColor')
  bindColor('activeKeyColor', 'activeKeyColor')
  bindColor('pianoBlackKeyLabelColor', 'pianoBlackKeyLabelColor')
  bindColor('pianoWhiteKeyStrokeColor', 'pianoWhiteKeyStrokeColor')
  bindColor('pianoBlackKeyStrokeColor', 'pianoBlackKeyStrokeColor')
  bindColor('pianoWhiteKeyColor', 'pianoWhiteKeyColor')
  bindColor('pianoBlackKeyColor', 'pianoBlackKeyColor')
  bindSlider('diagramPadding', 'diagramPadding', 0, 32)
  bindSlider('borderWidth', 'borderWidth', 0, 10)
  bindSlider('borderRadius', 'borderRadius', 0, 24)
  bindColorWithTransparent('backgroundColor', 'backgroundColor', '#ffffff')
  bindColorWithTransparent('borderColor', 'borderColor', '#cccccc')
  bindSlider('stringWidth', 'stringWidth', 0.5, 4, 0.5)
  bindSlider('fretWidth', 'fretWidth', 0.5, 4, 0.5)
  bindSlider('indicatorZoneSize', 'indicatorZoneSize', 8, 36)
  bindSlider('indicatorSize', 'indicatorSize', 3, 12)
  bindSlider('indicatorStrokeWidth', 'indicatorStrokeWidth', 0.5, 5, 0.5)
  bindColor('indicatorColor', 'indicatorColor')
  bindText('fontFamily', 'fontFamily')
  bindToggle('showDegrees', 'showDegrees')
  bindToggle('showPianoNoteLabels', 'showPianoNoteLabels')
  bindToggle('showFingerNumbers', 'showFingerNumbers')
  bindToggle('showStringLabels', 'showStringLabels')
  bindToggle('leftHanded', 'leftHanded')

  const pianoLabelPosInput = panel.querySelector<HTMLInputElement>('#tweak-pianoNoteLabelPosition')!
  pianoLabelPosInput.checked = currentStyle.pianoNoteLabelPosition === 'top'
  pianoLabelPosInput.addEventListener('change', () => {
    currentStyle.pianoNoteLabelPosition = pianoLabelPosInput.checked ? 'top' : 'bottom'
    renderAll()
  })

  const labelPosInput = panel.querySelector<HTMLInputElement>('#tweak-stringLabelPosition')!
  labelPosInput.checked = currentStyle.stringLabelPosition === 'top'
  labelPosInput.addEventListener('change', () => {
    currentStyle.stringLabelPosition = labelPosInput.checked ? 'top' : 'bottom'
    renderAll()
  })

  const noteModeInput = panel.querySelector<HTMLInputElement>('#tweak-stringLabelMode')!
  noteModeInput.checked = currentStyle.stringLabelMode === 'notes'
  noteModeInput.addEventListener('change', () => {
    currentStyle.stringLabelMode = noteModeInput.checked ? 'notes' : 'tuning'
    renderAll()
  })

  bindColor('glowColor', 'glowColor')
  bindSlider('glowBlur', 'glowBlur', 0.5, 8, 0.5)
  bindSlider('glowOpacity', 'glowOpacity', 0.1, 1, 0.05)
  bindSlider('shadowX', 'shadowX', -8, 8)
  bindSlider('shadowY', 'shadowY', -8, 8)
  bindSlider('shadowBlur', 'shadowBlur', 0, 10)
  bindSlider('shadowOpacity', 'shadowOpacity', 0.05, 1, 0.05)
  const orientationSelect = panel.querySelector<HTMLSelectElement>('#tweak-orientation')!
  orientationSelect.value = currentStyle.orientation ?? 'vertical'
  orientationSelect.addEventListener('change', () => {
    currentStyle.orientation = orientationSelect.value as StyleOptions['orientation']
    renderAll()
  })

  const filterSelect = panel.querySelector<HTMLSelectElement>('#tweak-filterStyle')!
  filterSelect.value = currentStyle.filterStyle ?? 'clean'
  filterSelect.addEventListener('change', () => {
    currentStyle.filterStyle = filterSelect.value as StyleOptions['filterStyle']
    renderAll()
  })

  panel.querySelector('#copy-tweaks')!.addEventListener('click', () => {
    const json = JSON.stringify(currentStyle, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      const btn = panel.querySelector<HTMLButtonElement>('#copy-tweaks')!
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = 'Copy tweaks' }, 1500)
    })
  })
}

function renderUmtChord(symbol: string): void {
  const el = document.getElementById('umt-piano')!
  if (!symbol.trim()) { el.innerHTML = ''; return }
  try {
    const chord = UMT.parseChordSymbol(symbol.trim())
    const notes = chord.getNotes()
    // note.name already includes octave (e.g. "C4", "Bb3") — use directly
    const keys = notes.map((n: any) => n.name)
    const rootName = notes[0]?.name.replace(/\d+$/, '') ?? ''
    // auto-detect range: snap to octave boundaries (C…B) from actual note positions
    // piano_abs = 57 + stepsFromBase (piano.ts internal scale, verified: C4=48, B4=59)
    const steps = notes.map((n: any) => n.stepsFromBase as number)
    const fromOctave = Math.floor((57 + Math.min(...steps)) / 12)
    const toOctave   = Math.floor((57 + Math.max(...steps)) / 12)
    const range = { from: `C${fromOctave}`, to: `B${toOctave}` }
    el.innerHTML = renderPiano({ name: symbol.trim(), keys, root: rootName, range }, currentStyle)
  } catch {
    el.innerHTML = '<span style="color:#c44;font-size:11px">?</span>'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindTweaks()
  renderAll()
  const umtInput = document.getElementById('umt-input') as HTMLInputElement
  umtInput.value = 'Cmaj7'
  renderUmtChord('Cmaj7')
  umtInput.addEventListener('input', () => renderUmtChord(umtInput.value))
})
