export const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
export const CHROMATIC_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

interface FilterOptions {
  glowColor?: string
  glowBlur?: number
  glowOpacity?: number
  shadowX?: number
  shadowY?: number
  shadowBlur?: number
  shadowOpacity?: number
  shadowColor?: string
}

export function buildFilter(style: string, opts: FilterOptions = {}): string {
  const {
    glowColor = '#5aaa5a', glowBlur = 2.5, glowOpacity = 0.8,
    shadowX = 2, shadowY = 3, shadowBlur = 2, shadowOpacity = 0.25, shadowColor = '#000000',
  } = opts
  switch (style) {
    case 'shadow':
      return `<filter id="notae-f"><feDropShadow dx="${shadowX}" dy="${shadowY}" stdDeviation="${shadowBlur}" flood-color="${shadowColor}" flood-opacity="${shadowOpacity}"/></filter>`
    case 'glow':
      return `<filter id="notae-f" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur in="SourceGraphic" stdDeviation="${glowBlur}" result="blur"/><feFlood flood-color="${glowColor}" flood-opacity="${glowOpacity}" result="color"/><feComposite in="color" in2="blur" operator="in" result="coloredGlow"/><feMerge><feMergeNode in="coloredGlow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    default: return ''
  }
}

export const NOTE_MAP: Record<string, number> = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,
  'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,
  'Ab':8,'A':9,'A#':10,'Bb':10,'B':11
}

export const DEGREE_LABELS = ['R','b2','2','b3','3','4','b5','5','b6','6','b7','7']

const LETTER_SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Semitones above the C of the letter's own octave, accidentals included and not folded:
 * "B#" → 12, "Cb" → -1, "F##" → 7. Any number of accidentals. Null when it is not a note name.
 */
export function letterSemitone(name: string): number | null {
  const m = name.match(/^([A-Ga-g])([#b]*)$/)
  if (!m) return null
  let n = LETTER_SEMITONE[m[1].toUpperCase()]
  for (const acc of m[2]) n += acc === '#' ? 1 : -1
  return n
}

/** Pitch class 0–11 of a note name without octave ("E#" → 5, "Cb" → 11); 0 when it is not one. */
export function semitone(note: string): number {
  const n = letterSemitone(note)
  return n === null ? 0 : ((n % 12) + 12) % 12
}

export function noteAtFret(openNote: string, fret: number, preferFlats = false): string {
  if (fret < 0) return ''
  return (preferFlats ? CHROMATIC_FLAT : CHROMATIC)[(semitone(openNote) + fret) % 12]
}

export function degreeLabel(rootNote: string, note: string): string {
  const interval = (semitone(note) - semitone(rootNote) + 12) % 12
  return DEGREE_LABELS[interval]
}
