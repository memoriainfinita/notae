import { BowedChord, StyleOptions, DEFAULT_STYLE } from './types'
import { buildFilter, noteAtFret, degreeLabel } from './utils'

function svgWrap(totalW: number, totalH: number, s: Required<StyleOptions>, inner: string): string {
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
  svg += `<g${fAttr}>${inner}</g>`
  svg += '</svg>'
  return svg
}

function renderBowedH(chord: BowedChord, s: Required<StyleOptions>): string {
  const p = s.diagramPadding
  const numStrings = chord.strings.length
  const numSlots = chord.numSlots ?? 4
  const position = chord.position ?? 1
  const showNut = position === 1
  const tuning = chord.tuning ?? []

  const stringArrays: number[][] = chord.strings.map(v =>
    v === null ? [] : Array.isArray(v) ? v : [v]
  )

  const labelW = s.showStringLabels && tuning.length > 0 ? s.stringLabelSize + 6 : 0
  const indicatorW = s.indicatorZoneSize
  const nutW = showNut ? s.nutWidth : 0

  const padLeft  = p + indicatorW + (!showNut ? s.fretLabelSize + 6 : 0)
  const padRight = s.dotRadius + labelW + p
  const padTop    = s.chordNameY + s.chordNameGapH + p
  const padBottom = 16 + p

  const gridW = numSlots * s.fretSpacing
  const gridH = (numStrings - 1) * s.stringSpacing
  const totalW = padLeft + nutW + gridW + padRight
  const totalH = padTop + gridH + padBottom

  const gridLeft = padLeft + nutW
  const stringY = (i: number) => padTop + (s.leftHanded ? i : (numStrings - 1 - i)) * s.stringSpacing
  const slotX = (slot: number) => gridLeft + slot * s.fretSpacing

  let inner = ''

  // Chord name
  inner += `<text x="${gridLeft + gridW / 2}" y="${s.chordNameY + p}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.chordNameSize}" font-weight="bold" fill="${s.chordNameColor}">${chord.name}</text>`

  // String labels (right of strings)
  if (s.showStringLabels && tuning.length > 0) {
    const lx = gridLeft + gridW + s.dotRadius + 4
    for (let i = 0; i < numStrings; i++) {
      if (!tuning[i]) continue
      let label = tuning[i]
      if (s.stringLabelMode === 'notes') {
        const vals = stringArrays[i]
        if (vals.length === 1 && vals[0] >= 0) label = noteAtFret(tuning[i], vals[0])
      }
      inner += `<text x="${lx}" y="${stringY(i)}" text-anchor="start" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.stringLabelSize}" fill="${s.stringLabelColor}">${label}</text>`
    }
  }

  // Indicators (left, per string)
  for (let i = 0; i < numStrings; i++) {
    const cy = stringY(i)
    const cx = p + indicatorW / 2
    if (chord.strings[i] === null) {
      const hs = s.indicatorSize
      inner += `<line x1="${cx-hs}" y1="${cy-hs}" x2="${cx+hs}" y2="${cy+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
      inner += `<line x1="${cx+hs}" y1="${cy-hs}" x2="${cx-hs}" y2="${cy+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
    } else if (stringArrays[i].includes(0)) {
      inner += `<circle cx="${cx}" cy="${cy}" r="${s.indicatorSize}" fill="none" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}"/>`
    }
  }

  // Nut or position line + label
  if (showNut) {
    inner += `<rect x="${padLeft}" y="${padTop - s.stringWidth / 2}" width="${s.nutWidth}" height="${gridH + s.stringWidth}" fill="${s.nutColor}"/>`
  } else {
    inner += `<line x1="${gridLeft}" y1="${padTop - 0.5}" x2="${gridLeft}" y2="${padTop + gridH + 0.5}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
    inner += `<text x="${padLeft - s.dotRadius - 4}" y="${padTop + gridH / 2}" text-anchor="end" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fretLabelSize}" fill="${s.fretLabelColor}">${position}</text>`
  }

  // Slot ticks (top and bottom edges)
  const tick = 5
  for (let slot = 1; slot <= numSlots; slot++) {
    const x = slotX(slot)
    inner += `<line x1="${x}" y1="${padTop - tick}" x2="${x}" y2="${padTop}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
    inner += `<line x1="${x}" y1="${padTop + gridH}" x2="${x}" y2="${padTop + gridH + tick}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
  }

  // String lines
  for (let i = 0; i < numStrings; i++) {
    const y = stringY(i)
    inner += `<line x1="${gridLeft - 0.5}" y1="${y}" x2="${gridLeft + gridW + 0.5}" y2="${y}" stroke="${s.stringColor}" stroke-width="${s.stringWidth}"/>`
  }

  // Dots
  for (let i = 0; i < numStrings; i++) {
    const isSingle = chord.strings[i] !== null && !Array.isArray(chord.strings[i])
    for (const slot of stringArrays[i]) {
      if (slot <= 0 || slot > numSlots) continue
      const cx = slotX(slot)
      const cy = stringY(i)
      const fill = chord.colors?.[i] ?? s.dotColor
      inner += `<circle cx="${cx}" cy="${cy}" r="${s.dotRadius}" fill="${fill}"/>`
      const deg = s.showDegrees && chord.root && tuning[i]
        ? degreeLabel(chord.root, noteAtFret(tuning[i], slot))
        : ''
      if (deg) {
        inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${deg}</text>`
      } else if (s.showFingerNumbers && isSingle && chord.fingers?.[i]) {
        const finger = chord.fingers[i]!
        if (finger > 0) inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${finger}</text>`
      }
    }
  }

  return svgWrap(totalW, totalH, s, inner)
}

/**
 * Renders a bowed string instrument diagram as an SVG string.
 * Designed for violin, viola, cello, double bass (fretless, position-based).
 *
 * @param chord - Position/fingering data. See `BowedChord`.
 * @param style - Optional visual overrides. See `StyleOptions`.
 * @returns A self-contained SVG string. Inject it directly into the DOM via `innerHTML`.
 *
 * @example
 * document.getElementById('diagram').innerHTML = renderBowed({
 *   name: 'G',
 *   strings: [0, 0, 1, null],   // G and D open, A finger 1, E not played
 *   tuning: ['G','D','A','E'],
 *   position: 1,
 * })
 */
export function renderBowed(chord: BowedChord, style?: StyleOptions): string {
  const s = { ...DEFAULT_STYLE, ...style }
  if (s.orientation === 'horizontal') return renderBowedH(chord, s)
  const p = s.diagramPadding
  const numStrings = chord.strings.length
  const numSlots = chord.numSlots ?? 4
  const position = chord.position ?? 1
  const showNut = position === 1
  const tuning = chord.tuning ?? []
  const labelsAtTop = s.stringLabelPosition === 'top'

  const stringArrays: number[][] = chord.strings.map(v =>
    v === null ? [] : Array.isArray(v) ? v : [v]
  )

  const labelH = s.showStringLabels && tuning.length > 0 ? s.stringLabelSize + 6 : 0
  const indicatorH = s.indicatorZoneSize
  const topBarH = showNut ? s.nutWidth : 0

  const padLeft = s.fretLabelSize + s.dotRadius + 10 + p
  const padRight = s.dotRadius + s.fretLabelGap + p
  const padTop = s.chordNameY + s.chordNameGap + (labelsAtTop ? labelH : 0) + p
  const padBottom = 16 + (labelsAtTop ? 0 : labelH) + p

  const gridW = (numStrings - 1) * s.stringSpacing
  const gridH = numSlots * s.fretSpacing
  const totalW = gridW + padLeft + padRight
  const totalH = padTop + indicatorH + topBarH + gridH + padBottom

  const stringX = (i: number) => padLeft + i * s.stringSpacing
  const gridTop = padTop + indicatorH + topBarH
  const slotY = (slot: number) => gridTop + slot * s.fretSpacing

  let inner = ''

  // Chord name
  inner += `<text x="${padLeft + gridW / 2}" y="${s.chordNameY + p}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.chordNameSize}" font-weight="bold" fill="${s.chordNameColor}">${chord.name}</text>`

  // String labels
  if (s.showStringLabels && tuning.length > 0) {
    const labelY = labelsAtTop
      ? s.chordNameY + s.chordNameGap + p + s.stringLabelSize
      : gridTop + gridH + s.dotRadius + 6 + s.stringLabelSize
    for (let i = 0; i < numStrings; i++) {
      if (!tuning[i]) continue
      let label = tuning[i]
      if (s.stringLabelMode === 'notes') {
        const vals = stringArrays[i]
        if (vals.length === 1 && vals[0] >= 0) label = noteAtFret(tuning[i], vals[0])
      }
      inner += `<text x="${stringX(i)}" y="${labelY}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.stringLabelSize}" fill="${s.stringLabelColor}">${label}</text>`
    }
  }

  // Indicators above nut/marker
  for (let i = 0; i < numStrings; i++) {
    const x = stringX(i)
    const cy = padTop + indicatorH / 2
    if (chord.strings[i] === null) {
      const hs = s.indicatorSize
      inner += `<line x1="${x-hs}" y1="${cy-hs}" x2="${x+hs}" y2="${cy+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
      inner += `<line x1="${x+hs}" y1="${cy-hs}" x2="${x-hs}" y2="${cy+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
    } else if (stringArrays[i].includes(0)) {
      inner += `<circle cx="${x}" cy="${cy}" r="${s.indicatorSize}" fill="none" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}"/>`
    }
  }

  // Nut (position 1) or top fret line + position label (positions > 1)
  if (showNut) {
    inner += `<rect x="${padLeft - s.stringWidth/2}" y="${padTop + indicatorH}" width="${gridW + s.stringWidth}" height="${s.nutWidth}" fill="${s.nutColor}"/>`
  } else {
    inner += `<line x1="${padLeft - 0.5}" y1="${gridTop}" x2="${padLeft + gridW + 0.5}" y2="${gridTop}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
    inner += `<text x="${padLeft - s.dotRadius - 4}" y="${gridTop}" text-anchor="end" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fretLabelSize}" fill="${s.fretLabelColor}">${position}</text>`
  }

  // Slot ticks — short marks at the edges only (no physical frets on bowed instruments)
  const tick = 5
  for (let slot = 1; slot <= numSlots; slot++) {
    const y = slotY(slot)
    inner += `<line x1="${padLeft - tick}" y1="${y}" x2="${padLeft}" y2="${y}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
    inner += `<line x1="${padLeft + gridW}" y1="${y}" x2="${padLeft + gridW + tick}" y2="${y}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
  }

  // String lines
  for (let i = 0; i < numStrings; i++) {
    const x = stringX(i)
    inner += `<line x1="${x}" y1="${gridTop - 0.5}" x2="${x}" y2="${gridTop + gridH + 0.5}" stroke="${s.stringColor}" stroke-width="${s.stringWidth}"/>`
  }

  // Dots
  for (let i = 0; i < numStrings; i++) {
    const isSingle = chord.strings[i] !== null && !Array.isArray(chord.strings[i])
    for (const slot of stringArrays[i]) {
      if (slot <= 0 || slot > numSlots) continue
      const cx = stringX(i)
      const cy = slotY(slot)
      const fill = chord.colors?.[i] ?? s.dotColor
      inner += `<circle cx="${cx}" cy="${cy}" r="${s.dotRadius}" fill="${fill}"/>`
      const deg = s.showDegrees && chord.root && tuning[i]
        ? degreeLabel(chord.root, noteAtFret(tuning[i], slot))
        : ''
      if (deg) {
        inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${deg}</text>`
      } else if (s.showFingerNumbers && isSingle && chord.fingers?.[i]) {
        const finger = chord.fingers[i]!
        if (finger > 0) inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${finger}</text>`
      }
    }
  }

  return svgWrap(totalW, totalH, s, inner)
}
