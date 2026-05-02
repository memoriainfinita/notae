import { FretboardChord, StyleOptions, DEFAULT_STYLE } from './types'
import { noteAtFret, degreeLabel, buildFilter } from './utils'

export function renderFretboard(chord: FretboardChord, style?: StyleOptions): string {
  const s = { ...DEFAULT_STYLE, ...style }
  const numStrings = chord.frets.length
  const numFrets = s.numFrets
  const baseFret = chord.baseFret ?? 1
  const tuning = chord.tuning ?? []

  const fretArrays: number[][] = chord.frets.map(f => Array.isArray(f) ? f : [f])
  const singleFret = (i: number): number | null => {
    const arr = fretArrays[i]
    return arr.length === 1 ? arr[0] : null
  }

  const labels = s.stringLabelMode === 'notes'
    ? chord.frets.map((f, i) => {
        const sf = Array.isArray(f) ? null : f
        return tuning[i] && sf !== null && sf >= 0 ? noteAtFret(tuning[i], sf) : ''
      })
    : tuning

  const p = s.diagramPadding

  return s.orientation === 'horizontal'
    ? renderHorizontal(chord, s, numStrings, numFrets, baseFret, tuning, fretArrays, singleFret, labels, p)
    : renderVertical(chord, s, numStrings, numFrets, baseFret, tuning, fretArrays, singleFret, labels, p)
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function dotLabel(
  s: Required<StyleOptions>,
  chord: FretboardChord,
  tuning: string[],
  stringIdx: number,
  fret: number
): string {
  if (s.showDegrees && chord.root && tuning[stringIdx]) {
    return degreeLabel(chord.root, noteAtFret(tuning[stringIdx], fret))
  }
  return ''
}

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

// ── Vertical renderer ───────────────────────────────────────────────────────

function renderVertical(
  chord: FretboardChord, s: Required<StyleOptions>,
  numStrings: number, numFrets: number, baseFret: number,
  tuning: string[], fretArrays: number[][], singleFret: (i: number) => number | null,
  labels: string[], p: number
): string {
  const labelH = s.showStringLabels ? s.stringLabelSize + 6 : 0
  const labelsAtTop = s.stringLabelPosition === 'top'
  const padLeft = s.fretLabelSize + s.dotRadius + 10 + p
  const padRight = s.dotRadius + s.fretLabelGap + p
  const padTop = s.chordNameY + s.chordNameGap + (labelsAtTop ? labelH : 0) + p
  const padBottom = 16 + (labelsAtTop ? 0 : labelH) + p
  const indicatorH = s.indicatorZoneSize
  const nutH = s.nutWidth
  const gridW = (numStrings - 1) * s.stringSpacing
  const gridH = numFrets * s.fretSpacing
  const totalW = gridW + padLeft + padRight
  const totalH = padTop + indicatorH + nutH + gridH + padBottom

  const stringX = (i: number) => {
    const idx = s.leftHanded ? (numStrings - 1 - i) : i
    return padLeft + idx * s.stringSpacing
  }
  const fretY = (f: number) => padTop + indicatorH + nutH + f * s.fretSpacing

  let inner = ''
  const gridCenterX = padLeft + gridW / 2
  inner += `<text x="${gridCenterX}" y="${s.chordNameY + p}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.chordNameSize}" font-weight="bold" fill="${s.chordNameColor}">${chord.name}</text>`

  // Indicators
  const strOffsets = chord.stringOffset ?? []
  for (let i = 0; i < numStrings; i++) {
    const sf = singleFret(i)
    if (sf === null) continue
    if ((strOffsets[i] ?? 0) > 0) continue  // peg marker drawn with string line
    const x = stringX(i)
    const cy = padTop + indicatorH / 2
    if (sf === -1) {
      const hs = s.indicatorSize
      inner += `<line x1="${x-hs}" y1="${cy-hs}" x2="${x+hs}" y2="${cy+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
      inner += `<line x1="${x+hs}" y1="${cy-hs}" x2="${x-hs}" y2="${cy+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
    } else if (sf === 0) {
      inner += `<circle cx="${x}" cy="${cy}" r="${s.indicatorSize}" fill="none" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}"/>`
    }
  }

  // Helper: x extent of fret line f — only spans strings present at that depth
  const fretLineX = (f: number): [number, number] => {
    let minX = Infinity, maxX = -Infinity
    for (let i = 0; i < numStrings; i++) {
      const off = strOffsets[i] ?? 0
      const relOff = off > 0 ? off - baseFret : 0
      if (f >= relOff) { const x = stringX(i); if (x < minX) minX = x; if (x > maxX) maxX = x }
    }
    return [minX, maxX]
  }

  // Base fret label
  if (baseFret !== 1) {
    const [x1, x2] = fretLineX(0)
    inner += `<line x1="${x1-0.5}" y1="${fretY(0)}" x2="${x2+0.5}" y2="${fretY(0)}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
    inner += `<text x="${padLeft-s.dotRadius-4}" y="${fretY(0)+s.fretSpacing/2}" text-anchor="end" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fretLabelSize}" fill="${s.fretLabelColor}">${baseFret}</text>`
  }

  // Fret lines
  for (let f = 1; f <= numFrets; f++) {
    const [x1, x2] = fretLineX(f)
    inner += `<line x1="${x1-0.5}" y1="${fretY(f)}" x2="${x2+0.5}" y2="${fretY(f)}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
  }

  // String lines
  for (let i = 0; i < numStrings; i++) {
    const x = stringX(i)
    const off = strOffsets[i] ?? 0
    if (off > 0 && off >= baseFret) {
      const relOff = off - baseFret
      inner += `<line x1="${x}" y1="${fretY(relOff)}" x2="${x}" y2="${fretY(numFrets)+0.5}" stroke="${s.stringColor}" stroke-width="${s.stringWidth}"/>`
      inner += `<circle cx="${x}" cy="${fretY(relOff) - s.fretSpacing / 2}" r="${s.indicatorSize}" fill="none" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}"/>`
    } else {
      inner += `<line x1="${x}" y1="${fretY(0)-0.5}" x2="${x}" y2="${fretY(numFrets)+0.5}" stroke="${s.stringColor}" stroke-width="${s.stringWidth}"/>`
    }
  }

  // Nut — segmented to skip offset strings
  if (baseFret === 1) {
    let runStart: number | null = null
    for (let i = 0; i <= numStrings; i++) {
      const hasOffset = i < numStrings && (strOffsets[i] ?? 0) > 0
      if (!hasOffset && i < numStrings) {
        if (runStart === null) runStart = i
      } else if (runStart !== null) {
        const x1 = Math.min(stringX(runStart), stringX(i - 1)) - s.stringWidth / 2
        const x2 = Math.max(stringX(runStart), stringX(i - 1)) + s.stringWidth / 2
        inner += `<rect x="${x1}" y="${padTop+indicatorH}" width="${x2-x1}" height="${nutH}" fill="${s.nutColor}"/>`
        runStart = null
      }
    }
  }

  // String labels
  if (s.showStringLabels) {
    const labelY = labelsAtTop
      ? s.chordNameY + s.chordNameGap + p + s.stringLabelSize
      : fretY(numFrets) + 4 + s.stringLabelSize
    for (let i = 0; i < numStrings; i++) {
      const sf = singleFret(i)
      let label: string
      if (s.showDegrees && chord.root && tuning[i]) {
        label = sf === 0 ? degreeLabel(chord.root, tuning[i]) : ''
      } else {
        label = labels[i] ?? ''
      }
      if (!label) continue
      const x = stringX(i)
      inner += `<text x="${x}" y="${labelY}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.stringLabelSize}" fill="${s.stringLabelColor}">${label}</text>`
    }
  }

  // Barres
  if (chord.barres) {
    for (const barre of chord.barres) {
      let start = barre.startString - 1, end = barre.endString - 1
      while (start <= end && singleFret(start) === -1) start++
      while (end >= start && singleFret(end) === -1) end--
      if (start >= end) continue
      const relativeFret = barre.fret - baseFret + 1
      const cx = stringX(start), cxEnd = stringX(end)
      const cy = fretY(relativeFret - 1) + s.fretSpacing / 2
      const r = s.dotRadius
      const x1 = Math.min(cx, cxEnd), x2 = Math.max(cx, cxEnd)
      inner += `<rect x="${x1-r}" y="${cy-r}" width="${x2-x1+r*2}" height="${r*2}" rx="${r}" fill="${s.barreColor}"/>`
    }
  }

  // Dots
  for (let i = 0; i < numStrings; i++) {
    const off = strOffsets[i] ?? 0
    for (const fret of fretArrays[i]) {
      if (fret <= 0) continue
      if (off > 0 && fret === off) continue  // open at peg — no dot needed
      const relativeFret = fret - baseFret + 1
      if (relativeFret < 1 || relativeFret > numFrets) continue
      const cx = stringX(i)
      const cy = fretY(relativeFret - 1) + s.fretSpacing / 2
      const fill = chord.colors?.[i] ?? s.dotColor
      inner += `<circle cx="${cx}" cy="${cy}" r="${s.dotRadius}" fill="${fill}"/>`
      const deg = dotLabel(s, chord, tuning, i, fret)
      if (deg) {
        inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${deg}</text>`
      } else if (s.showFingerNumbers && chord.fingers && fretArrays[i].length === 1) {
        const finger = chord.fingers[i]
        if (finger > 0) inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${finger}</text>`
      }
    }
  }

  return svgWrap(totalW, totalH, s, inner)
}

// ── Horizontal renderer ─────────────────────────────────────────────────────

function renderHorizontal(
  chord: FretboardChord, s: Required<StyleOptions>,
  numStrings: number, numFrets: number, baseFret: number,
  tuning: string[], fretArrays: number[][], singleFret: (i: number) => number | null,
  labels: string[], p: number
): string {
  const labelW = s.showStringLabels ? s.stringLabelSize + 8 : 0
  const labelsAtTop = s.stringLabelPosition === 'top'
  const indicatorW = s.indicatorZoneSize
  const nutW = s.nutWidth
  const padLeft = (labelsAtTop ? labelW : 0) + 16 + p
  const padRight = (labelsAtTop ? 0 : labelW) + 16 + p
  const padTop = s.chordNameY + s.chordNameGapH + p
  const fretLabelH = s.dotRadius + s.fretLabelSize + 8  // always reserved
  const padBottom = 16 + fretLabelH + p
  const gridW = numFrets * s.fretSpacing
  const gridH = (numStrings - 1) * s.stringSpacing
  const totalW = padLeft + indicatorW + nutW + gridW + padRight
  const totalH = padTop + gridH + padBottom

  const stringY = (i: number) => {
    const idx = s.leftHanded ? i : (numStrings - 1 - i)
    return padTop + idx * s.stringSpacing
  }
  const fretX = (f: number) => padLeft + indicatorW + nutW + f * s.fretSpacing

  let inner = ''
  inner += `<text x="${totalW / 2}" y="${s.chordNameY + p}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.chordNameSize}" font-weight="bold" fill="${s.chordNameColor}">${chord.name}</text>`

  // Indicators (left of nut)
  const strOffsetsH = chord.stringOffset ?? []
  for (let i = 0; i < numStrings; i++) {
    const sf = singleFret(i)
    if (sf === null) continue
    if ((strOffsetsH[i] ?? 0) > 0) continue
    const y = stringY(i)
    const cx = padLeft + indicatorW / 2
    if (sf === -1) {
      const hs = s.indicatorSize
      inner += `<line x1="${cx-hs}" y1="${y-hs}" x2="${cx+hs}" y2="${y+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
      inner += `<line x1="${cx+hs}" y1="${y-hs}" x2="${cx-hs}" y2="${y+hs}" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}" stroke-linecap="round"/>`
    } else if (sf === 0) {
      inner += `<circle cx="${cx}" cy="${y}" r="${s.indicatorSize}" fill="none" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}"/>`
    }
  }

  // Helper: y extent of vertical fret line f — only spans strings present at that depth
  const fretLineY = (f: number): [number, number] => {
    let minY = Infinity, maxY = -Infinity
    for (let i = 0; i < numStrings; i++) {
      const off = strOffsetsH[i] ?? 0
      const relOff = off > 0 ? off - baseFret : 0
      if (f >= relOff) { const y = stringY(i); if (y < minY) minY = y; if (y > maxY) maxY = y }
    }
    return [minY, maxY]
  }

  // Base fret label (no nut case)
  if (baseFret !== 1) {
    const [y1, y2] = fretLineY(0)
    inner += `<line x1="${fretX(0)}" y1="${y1-0.5}" x2="${fretX(0)}" y2="${y2+0.5}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
    inner += `<text x="${fretX(0)+s.fretSpacing/2}" y="${y2+s.dotRadius+s.fretLabelSize+4}" text-anchor="middle" font-family="${s.fontFamily}" font-size="${s.fretLabelSize}" fill="${s.fretLabelColor}">${baseFret}</text>`
  }

  // Fret lines (vertical)
  for (let f = 1; f <= numFrets; f++) {
    const [y1, y2] = fretLineY(f)
    inner += `<line x1="${fretX(f)}" y1="${y1-0.5}" x2="${fretX(f)}" y2="${y2+0.5}" stroke="${s.fretColor}" stroke-width="${s.fretWidth}"/>`
  }

  // String lines (horizontal)
  for (let i = 0; i < numStrings; i++) {
    const y = stringY(i)
    const off = strOffsetsH[i] ?? 0
    if (off > 0 && off >= baseFret) {
      const relOff = off - baseFret
      inner += `<line x1="${fretX(relOff)}" y1="${y}" x2="${fretX(numFrets)+0.5}" y2="${y}" stroke="${s.stringColor}" stroke-width="${s.stringWidth}"/>`
      inner += `<circle cx="${fretX(relOff) - s.indicatorSize - 2}" cy="${y}" r="${s.indicatorSize}" fill="none" stroke="${s.indicatorColor}" stroke-width="${s.indicatorStrokeWidth}"/>`
    } else {
      inner += `<line x1="${fretX(0)-0.5}" y1="${y}" x2="${fretX(numFrets)+0.5}" y2="${y}" stroke="${s.stringColor}" stroke-width="${s.stringWidth}"/>`
    }
  }

  // Nut — segmented to skip offset strings
  if (baseFret === 1) {
    let runStart: number | null = null
    for (let i = 0; i <= numStrings; i++) {
      const hasOffset = i < numStrings && (strOffsetsH[i] ?? 0) > 0
      if (!hasOffset && i < numStrings) {
        if (runStart === null) runStart = i
      } else if (runStart !== null) {
        const y1 = Math.min(stringY(runStart), stringY(i - 1)) - s.stringWidth / 2
        const y2 = Math.max(stringY(runStart), stringY(i - 1)) + s.stringWidth / 2
        inner += `<rect x="${padLeft+indicatorW}" y="${y1}" width="${nutW}" height="${y2-y1}" fill="${s.nutColor}"/>`
        runStart = null
      }
    }
  }

  // String labels
  if (s.showStringLabels) {
    const labelX = labelsAtTop ? p + labelW - 4 : fretX(numFrets) + 8
    const anchor = labelsAtTop ? 'end' : 'start'
    for (let i = 0; i < numStrings; i++) {
      const sf = singleFret(i)
      let label: string
      if (s.showDegrees && chord.root && tuning[i]) {
        label = sf === 0 ? degreeLabel(chord.root, tuning[i]) : ''
      } else {
        label = labels[i] ?? ''
      }
      if (!label) continue
      inner += `<text x="${labelX}" y="${stringY(i)}" dy="0.35em" text-anchor="${anchor}" font-family="${s.fontFamily}" font-size="${s.stringLabelSize}" fill="${s.stringLabelColor}">${label}</text>`
    }
  }

  // Barres (vertical rounded rect spanning strings)
  if (chord.barres) {
    for (const barre of chord.barres) {
      let start = barre.startString - 1, end = barre.endString - 1
      while (start <= end && singleFret(start) === -1) start++
      while (end >= start && singleFret(end) === -1) end--
      if (start >= end) continue
      const relativeFret = barre.fret - baseFret + 1
      const cy = stringY(start), cyEnd = stringY(end)
      const cx = fretX(relativeFret - 1) + s.fretSpacing / 2
      const r = s.dotRadius
      const y1 = Math.min(cy, cyEnd), y2 = Math.max(cy, cyEnd)
      inner += `<rect x="${cx-r}" y="${y1-r}" width="${r*2}" height="${y2-y1+r*2}" rx="${r}" fill="${s.barreColor}"/>`
    }
  }

  // Dots
  for (let i = 0; i < numStrings; i++) {
    const offH = strOffsetsH[i] ?? 0
    for (const fret of fretArrays[i]) {
      if (fret <= 0) continue
      if (offH > 0 && fret === offH) continue  // open at peg — no dot needed
      const relativeFret = fret - baseFret + 1
      if (relativeFret < 1 || relativeFret > numFrets) continue
      const cy = stringY(i)
      const cx = fretX(relativeFret - 1) + s.fretSpacing / 2
      const fill = chord.colors?.[i] ?? s.dotColor
      inner += `<circle cx="${cx}" cy="${cy}" r="${s.dotRadius}" fill="${fill}"/>`
      const deg = dotLabel(s, chord, tuning, i, fret)
      if (deg) {
        inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${deg}</text>`
      } else if (s.showFingerNumbers && chord.fingers && fretArrays[i].length === 1) {
        const finger = chord.fingers[i]
        if (finger > 0) inner += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em" font-family="${s.fontFamily}" font-size="${s.fingerNumberSize}" fill="${s.dotTextColor}">${finger}</text>`
      }
    }
  }

  return svgWrap(totalW, totalH, s, inner)
}
