export const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

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

export function semitone(note: string): number {
  return NOTE_MAP[note] ?? 0
}

export function noteAtFret(openNote: string, fret: number): string {
  if (fret < 0) return ''
  return CHROMATIC[(semitone(openNote) + fret) % 12]
}

export function degreeLabel(rootNote: string, note: string): string {
  const interval = (semitone(note) - semitone(rootNote) + 12) % 12
  return DEGREE_LABELS[interval]
}
