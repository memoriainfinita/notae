export type StyleOptions = {
  fontFamily?: string
  chordNameSize?: number
  chordNameY?: number
  chordNameGap?: number
  chordNameGapH?: number
  chordNameGapP?: number
  fingerNumberSize?: number
  pianoFingerNumberSize?: number
  fretLabelSize?: number
  dotRadius?: number
  stringSpacing?: number
  fretSpacing?: number
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
  activeKeyColor?: string
  pianoWhiteKeyW?: number
  pianoWhiteKeyH?: number
  pianoWhiteKeyStrokeColor?: string
  pianoBlackKeyStrokeColor?: string
  pianoWhiteKeyColor?: string
  pianoBlackKeyColor?: string
  pianoBlackKeyShift?: number
  pianoBlackKeyWidthRatio?: number
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
  indicatorSize?: number
  indicatorStrokeWidth?: number
  indicatorColor?: string
  indicatorZoneSize?: number
  pianoKeyStrokeWidth?: number
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  diagramPadding?: number
  showPianoNoteLabels?: boolean
  pianoNoteLabelPosition?: 'top' | 'bottom'
  showDegrees?: boolean
  showFingerNumbers?: boolean
  showStringLabels?: boolean
  stringLabelMode?: 'tuning' | 'notes'
  stringLabelPosition?: 'top' | 'bottom'
  stringLabelSize?: number
  stringLabelColor?: string
  pianoBlackKeyLabelColor?: string
  fretLabelGap?: number
  leftHanded?: boolean
  orientation?: 'vertical' | 'horizontal'
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

export type FretboardChord = {
  name: string
  frets: (number | number[])[]  // number = single fret/mute, number[] = multiple (scale)
  fingers?: number[]
  colors?: (string | null)[]    // per-string dot color override, null = use default
  baseFret?: number
  barres?: Array<{ fret: number; startString: number; endString: number }>
  tuning?: string[]     // low→high, e.g. ['E','A','D','G','B','E']
  root?: string         // e.g. 'C', 'F#' — enables degree labels
}

export type PianoChord = {
  name: string
  keys: string[]
  fingers?: number[]          // parallel to keys, 0 = no number
  colors?: (string | null)[]  // parallel to keys, null = use default
  range?: { from: string; to: string }
  root?: string               // e.g. 'C', 'F#' — enables degree labels
}
