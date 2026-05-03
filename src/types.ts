/**
 * Visual style overrides for any renderer. All size/spacing/offset values are in pixels
 * unless explicitly noted as a ratio or fraction. All fields are optional — omit to use
 * the built-in defaults (see `DEFAULT_STYLE`).
 */
export type StyleOptions = {
  fontFamily?: string
  chordNameSize?: number
  /** Vertical distance from the top of the SVG to the chord name baseline (px). */
  chordNameY?: number
  /** Gap between chord name and the fretboard grid in vertical orientation (px). */
  chordNameGap?: number
  /** Gap between chord name and the fretboard grid in horizontal orientation (px). */
  chordNameGapH?: number
  /** Gap between chord name and the piano keyboard (px). */
  chordNameGapP?: number
  fingerNumberSize?: number
  pianoFingerNumberSize?: number
  fretLabelSize?: number
  dotRadius?: number
  /** Distance between string center lines (px). */
  stringSpacing?: number
  /** Distance between fret lines (px). */
  fretSpacing?: number
  /** Number of frets to display. */
  numFrets?: number
  nutWidth?: number
  chordNameColor?: string
  fretLabelColor?: string
  nutColor?: string
  dotColor?: string
  dotTextColor?: string
  stringColor?: string
  fretColor?: string
  barreColor?: string
  /** Fill color for active piano keys. */
  activeKeyColor?: string
  /** Width of one white key (px). All piano dimensions scale from this. */
  pianoWhiteKeyW?: number
  pianoWhiteKeyH?: number
  pianoWhiteKeyStrokeColor?: string
  pianoBlackKeyStrokeColor?: string
  pianoWhiteKeyColor?: string
  pianoBlackKeyColor?: string
  /**
   * Horizontal offset of black keys as a fraction of white key width.
   * Positive values shift right. Typical range: -0.2 to +0.3. Default: 0.22.
   */
  pianoBlackKeyShift?: number
  /** Black key width as a fraction of white key width (e.g. 0.58 = 58%). */
  pianoBlackKeyWidthRatio?: number
  /** Black key height as a fraction of white key height (e.g. 0.62 = 62%). */
  pianoBlackKeyHeightRatio?: number
  pianoWhiteKeyRadius?: number
  pianoBlackKeyRadius?: number
  pianoWhiteDotOffset?: number
  pianoBlackDotOffset?: number
  pianoDotRadius?: number
  pianoNoteLabelSize?: number
  pianoNoteLabelOffset?: number
  stringWidth?: number
  fretWidth?: number
  /** Radius of the open/muted string indicator circle (px). */
  indicatorSize?: number
  indicatorStrokeWidth?: number
  indicatorColor?: string
  /** Height of the zone above the nut reserved for open/muted indicators (px). */
  indicatorZoneSize?: number
  pianoKeyStrokeWidth?: number
  /** SVG background fill. Accepts any CSS color or `'transparent'`. */
  backgroundColor?: string
  /** SVG border color. Accepts any CSS color or `'transparent'`. */
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  /** Inner padding between the SVG border and the diagram content (px). */
  diagramPadding?: number
  showPianoNoteLabels?: boolean
  pianoNoteLabelPosition?: 'top' | 'bottom'
  /** Show scale degrees (R, 3, b7…) instead of finger numbers. Requires `chord.root`. */
  showDegrees?: boolean
  showFingerNumbers?: boolean
  showStringLabels?: boolean
  /** `'tuning'` shows the open-string note from `chord.tuning`; `'notes'` shows the fretted note. */
  stringLabelMode?: 'tuning' | 'notes'
  stringLabelPosition?: 'top' | 'bottom'
  stringLabelSize?: number
  stringLabelColor?: string
  pianoBlackKeyLabelColor?: string
  /** Space between the right edge of the fret grid and the baseFret label (px). */
  fretLabelGap?: number
  leftHanded?: boolean
  orientation?: 'vertical' | 'horizontal'
  /** `'clean'` = no filter, `'shadow'` = drop shadow, `'glow'` = color glow on dots. */
  filterStyle?: 'clean' | 'shadow' | 'glow'
  glowColor?: string
  glowBlur?: number
  glowOpacity?: number
  shadowX?: number
  shadowY?: number
  shadowBlur?: number
  shadowOpacity?: number
}

export const DEFAULT_STYLE: Required<StyleOptions> = {
  fontFamily: 'Arial, sans-serif',
  chordNameSize: 17,
  chordNameY: 30,
  chordNameGap: 11,
  chordNameGapH: 32,
  chordNameGapP: 17,
  fingerNumberSize: 11,
  pianoFingerNumberSize: 11,
  fretLabelSize: 11,
  dotRadius: 9,
  stringSpacing: 19,
  fretSpacing: 23,
  numFrets: 5,
  nutWidth: 4,
  chordNameColor: '#000000',
  fretLabelColor: '#555555',
  nutColor: '#333333',
  dotColor: '#5aaa5a',
  dotTextColor: '#ffffff',
  stringColor: '#aaaaaa',
  fretColor: '#cccccc',
  barreColor: '#5aaa5a',
  activeKeyColor: '#5aaa5a',
  pianoWhiteKeyW: 28,
  pianoWhiteKeyH: 137,
  pianoWhiteKeyStrokeColor: '#bbbbbb',
  pianoBlackKeyStrokeColor: '#222222',
  pianoWhiteKeyColor: '#ffffff',
  pianoBlackKeyColor: '#222222',
  pianoBlackKeyShift: 0.22,
  pianoBlackKeyWidthRatio: 0.58,
  pianoBlackKeyHeightRatio: 0.62,
  pianoWhiteKeyRadius: 3,
  pianoBlackKeyRadius: 2,
  pianoWhiteDotOffset: 5,
  pianoBlackDotOffset: 4,
  pianoDotRadius: 7,
  pianoNoteLabelSize: 11,
  pianoNoteLabelOffset: 6,
  stringWidth: 1,
  fretWidth: 1,
  indicatorSize: 4,
  indicatorStrokeWidth: 1.5,
  indicatorColor: '#555555',
  indicatorZoneSize: 18,
  pianoKeyStrokeWidth: 1,
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 0,
  diagramPadding: 0,
  showPianoNoteLabels: true,
  pianoNoteLabelPosition: 'bottom',
  showDegrees: false,
  showFingerNumbers: true,
  showStringLabels: true,
  stringLabelMode: 'tuning',
  stringLabelPosition: 'bottom',
  stringLabelSize: 11,
  stringLabelColor: '#999999',
  pianoBlackKeyLabelColor: '#555555',
  fretLabelGap: 20,
  leftHanded: false,
  orientation: 'vertical',
  filterStyle: 'clean',
  glowColor: '#5aaa5a',
  glowBlur: 2.5,
  glowOpacity: 0.8,
  shadowX: 2,
  shadowY: 3,
  shadowBlur: 2,
  shadowOpacity: 0.25,
}

/**
 * A chord or scale diagram for any fretted instrument.
 *
 * @example
 * // G major on guitar
 * const chord: FretboardChord = {
 *   name: 'G',
 *   frets: [3, 2, 0, 0, 0, 3],   // low E → high E; -1 = muted (×), 0 = open (○)
 *   fingers: [2, 1, 0, 0, 0, 3],  // 0 = no finger shown
 *   tuning: ['E','A','D','G','B','E'],
 * }
 * renderFretboard(chord)
 */
export type FretboardChord = {
  name: string
  /**
   * One entry per string, ordered low→high (index 0 = lowest string).
   * - `number`: single fret position. `-1` = muted (×). `0` = open (○).
   * - `number[]`: multiple fret positions on one string (for scale diagrams).
   */
  frets: (number | number[])[]
  /** Finger numbers parallel to `frets`. `0` = no number shown. */
  fingers?: number[]
  /** Per-string dot color override, parallel to `frets`. `null` = use `dotColor` default. */
  colors?: (string | null)[]
  /** Absolute fret number of the first displayed fret (shown as a label). Default: 1. */
  baseFret?: number
  /**
   * Barre definitions. `startString` and `endString` are 1-indexed from the lowest string
   * (e.g. `startString: 1, endString: 6` = full barre across all 6 strings).
   */
  barres?: Array<{ fret: number; startString: number; endString: number }>
  /** Open-string note names, low→high (e.g. `['E','A','D','G','B','E']`). Used for string labels and degree calculation. */
  tuning?: string[]
  /** Root note name (e.g. `'C'`, `'F#'`). Required for `showDegrees`. */
  root?: string
  /**
   * Fret at which each string starts (for instruments with partial strings, e.g. 5-string banjo).
   * Index 0 = lowest string. `0` or omit = string starts at the nut.
   * A string where `frets[i] === stringOffset[i]` is shown as open (no dot).
   *
   * @example
   * // 5-string banjo: drone string (index 0) starts at fret 5
   * stringOffset: [5, 0, 0, 0, 0]
   */
  stringOffset?: number[]
}

export type BowedChord = {
  name: string
  strings: (number | number[] | null)[]  // per string: 0=open, 1-N=finger slot, null=not played
  fingers?: (number | null)[]            // one finger number per string (shown only for single-note strings)
  colors?: (string | null)[]
  position?: number                       // hand position (1=nut shown, >1=position marker + roman numeral)
  numSlots?: number                       // default 4
  tuning?: string[]
  root?: string
}

/**
 * A chord or scale diagram for piano/keyboard.
 *
 * @example
 * // Cmaj7
 * const chord: PianoChord = {
 *   name: 'Cmaj7',
 *   keys: ['C4', 'E4', 'G4', 'B4'],  // scientific pitch: note name + octave number
 *   fingers: [1, 2, 3, 4],
 * }
 * renderPiano(chord)
 */
export type PianoChord = {
  name: string
  /**
   * Active keys in scientific pitch notation: note name followed by octave number.
   * Examples: `'C4'` (middle C), `'Bb3'`, `'F#5'`.
   * Default display range is C3–B4; set `range` to show other octaves.
   */
  keys: string[]
  /** Finger numbers parallel to `keys`. `0` = no number shown. */
  fingers?: number[]
  /** Per-key dot color override, parallel to `keys`. `null` = use `activeKeyColor` default. */
  colors?: (string | null)[]
  /**
   * Visible keyboard range in scientific pitch notation. Defaults to `{ from: 'C3', to: 'B4' }`.
   * Set this if any key in `keys` falls outside that range.
   *
   * @example
   * range: { from: 'A2', to: 'C6' }
   */
  range?: { from: string; to: string }
  /** Root note name without octave (e.g. `'C'`, `'F#'`). Required for `showDegrees`. */
  root?: string
}
