import { PianoChord, StyleOptions, DEFAULT_STYLE } from './types'
import { degreeLabel, buildFilter } from './utils'

// X position of each semitone in white-key-width units from the left of the octave.
// All values are pure fractions — no pixel rounding — so positions scale correctly with wW.
const SEMITONE_POS = [
  0,     // C  white
  0.72,  // C# black
  1,     // D  white
  1.82,  // D# black
  2,     // E  white
  3,     // F  white
  3.72,  // F# black
  4,     // G  white
  4.65,  // G# black
  5,     // A  white
  5.72,  // A# black
  6,     // B  white
]
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_MAP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
}

function parseNote(str: string): number | null {
  const m = str.match(/^([A-Ga-g][#b]?)(\d+)$/)
  if (!m) return null
  let name = m[1].charAt(0).toUpperCase() + m[1].slice(1)
  name = FLAT_MAP[name] ?? name
  const semi = NOTE_NAMES.indexOf(name)
  if (semi === -1) return null
  return parseInt(m[2]) * 12 + semi
}

export function renderPiano(chord: PianoChord, style?: StyleOptions): string {
  const s = { ...DEFAULT_STYLE, ...style }

  const fromAbs = parseNote(chord.range?.from ?? 'C3') ?? 36
  const toAbs   = parseNote(chord.range?.to   ?? 'B4') ?? 59

  const fromOctave = Math.floor(fromAbs / 12)
  const fromSemi   = fromAbs % 12
  const fromOffset = SEMITONE_POS[fromSemi]

  const activeSet = new Set(
    chord.keys.map(k => parseNote(k)).filter((n): n is number => n !== null)
  )

  const wW = s.pianoWhiteKeyW
  const wH = s.pianoWhiteKeyH
  // All dimensions are fractions of wW/wH — no rounding — so scaling is always correct
  const bW = wW * s.pianoBlackKeyWidthRatio
  const bH = wH * s.pianoBlackKeyHeightRatio
  // pianoBlackKeyShift is a fraction of wW (range ~-0.2 to +0.2)
  const shift = s.pianoBlackKeyShift * wW

  let whiteCount = 0
  for (let abs = fromAbs; abs <= toAbs; abs++) {
    if (!IS_BLACK[abs % 12]) whiteCount++
  }

  const dotR = s.pianoDotRadius
  const p = s.diagramPadding
  const labelsAtTop = s.pianoNoteLabelPosition === 'top'
  const padLeft = 10 + p
  const noteLabelH = s.showPianoNoteLabels ? s.pianoNoteLabelSize + 6 + s.pianoNoteLabelOffset : 0
  const padTop = s.chordNameY + s.chordNameGapP + (labelsAtTop ? noteLabelH : 0) + p
  const padBottom = 16 + p + (labelsAtTop ? 0 : noteLabelH)
  const totalW = padLeft * 2 + whiteCount * wW
  const totalH = padTop + wH + padBottom

  function keyX(abs: number): number {
    const oct = Math.floor(abs / 12)
    const semi = abs % 12
    const pos = (oct - fromOctave) * 7 + SEMITONE_POS[semi] - fromOffset
    if (IS_BLACK[semi]) {
      return pos * wW - bW / 2 + shift
    }
    return pos * wW
  }

  let whites = ''
  let blacks = ''
  let dots   = ''

  for (let abs = fromAbs; abs <= toAbs; abs++) {
    const semi = abs % 12
    const black = IS_BLACK[semi]
    const active = activeSet.has(abs)
    const x = padLeft + keyX(abs)

    if (!black) {
      whites += `<rect x="${x}" y="${padTop}" width="${wW}" height="${wH}" rx="${s.pianoWhiteKeyRadius}" fill="${s.pianoWhiteKeyColor}" stroke="${s.pianoWhiteKeyStrokeColor}" stroke-width="${s.pianoKeyStrokeWidth}"/>`
      if (active) {
        const idx = chord.keys.findIndex(k => parseNote(k) === abs)
        const finger = chord.fingers?.[idx] ?? 0
        const dotColor = chord.colors?.[idx] ?? s.activeKeyColor
        const cx = x + wW / 2
        const cy = padTop + wH - dotR - s.pianoWhiteDotOffset
        dots += `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${dotColor}"/>`
        if (s.showDegrees && chord.root) {
          const deg = degreeLabel(chord.root, NOTE_NAMES[abs % 12])
          dots += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.pianoFingerNumberSize}" fill="${s.dotTextColor}">${deg}</text>`
        } else if (s.showFingerNumbers && finger > 0) {
          dots += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.pianoFingerNumberSize}" fill="${s.dotTextColor}">${finger}</text>`
        }
      }
    } else {
      blacks += `<rect x="${x}" y="${padTop}" width="${bW}" height="${bH}" rx="${s.pianoBlackKeyRadius}" fill="${s.pianoBlackKeyColor}" stroke="${s.pianoBlackKeyStrokeColor}" stroke-width="${s.pianoKeyStrokeWidth}"/>`
      if (active) {
        const idx = chord.keys.findIndex(k => parseNote(k) === abs)
        const finger = chord.fingers?.[idx] ?? 0
        const dotColor = chord.colors?.[idx] ?? s.activeKeyColor
        const cx = x + bW / 2
        const cy = padTop + bH - dotR - s.pianoBlackDotOffset
        dots += `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${dotColor}"/>`
        if (s.showDegrees && chord.root) {
          const deg = degreeLabel(chord.root, NOTE_NAMES[abs % 12])
          dots += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.pianoFingerNumberSize}" fill="${s.dotTextColor}">${deg}</text>`
        } else if (s.showFingerNumbers && finger > 0) {
          dots += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.pianoFingerNumberSize}" fill="${s.dotTextColor}">${finger}</text>`
        }
      }
    }
  }

  const bw = s.borderWidth
  const half = bw / 2
  const svgW = totalW + 2 * bw
  const svgH = totalH + 2 * bw
  const def = buildFilter(s.filterStyle, s)
  const fAttr = def ? ' filter="url(#notae-f)"' : ''
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-bw} ${-bw} ${svgW} ${svgH}" width="${svgW}" height="${svgH}">`
  if (def) svg += `<defs>${def}</defs>`

  if (s.backgroundColor !== 'transparent' || bw > 0) {
    svg += `<rect x="${-half}" y="${-half}" width="${totalW + bw}" height="${totalH + bw}" rx="${s.borderRadius}" fill="${s.backgroundColor}" stroke="${s.borderColor}" stroke-width="${bw}"/>`
  }

  // Note labels below keyboard
  let noteLabels = ''
  if (s.showPianoNoteLabels) {
    const labelYBase = labelsAtTop
      ? s.chordNameY + s.chordNameGapP + p + s.pianoNoteLabelSize
      : padTop + wH + 4 + s.pianoNoteLabelSize
    for (const key of chord.keys) {
      const abs = parseNote(key)
      if (abs === null) continue
      const semi = abs % 12
      const black = IS_BLACK[semi]
      const x = padLeft + keyX(abs)
      const cx = black ? x + bW / 2 : x + wW / 2
      const labelY = labelsAtTop
        ? (black ? labelYBase - s.pianoNoteLabelOffset : labelYBase)
        : (black ? labelYBase : labelYBase + s.pianoNoteLabelOffset)
      const labelColor = black ? s.pianoBlackKeyLabelColor : s.stringLabelColor
      const noteName = NOTE_NAMES[semi]
      noteLabels += `<text x="${cx}" y="${labelY}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.pianoNoteLabelSize}" fill="${labelColor}">${noteName}</text>`
    }
  }

  const chordName = `<text x="${totalW / 2}" y="${s.chordNameY + p}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.chordNameSize}" font-weight="bold" fill="${s.chordNameColor}">${chord.name}</text>`
  svg += `${whites}${blacks}<g${fAttr}>${chordName}${dots}${noteLabels}</g>`
  svg += '</svg>'
  return svg
}
