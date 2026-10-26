import { HexGrid, HexGridOptions, HexCell, HexChord, HexKeyStyle, HexLayout, StyleOptions, DEFAULT_STYLE } from './types'
import { CHROMATIC, CHROMATIC_FLAT } from './utils'

/**
 * Named isomorphic layouts, as the interval (semitones) one step to the right and one step
 * up-right in rows of pointy-top hexagons. In columns the grid turns a quarter left: right
 * becomes up, up-right becomes up-left.
 */
export const HEX_LAYOUTS: Record<string, HexLayout> = {
  // Fifth one way, thirds on the diagonals: a triad is a triangle (C-Thru AXiS, Tonnetz)
  harmonic: { right: 7, upRight: 3 },
  // Whole tone to the right, fifth and fourth on the diagonals (concertina)
  wicki: { right: 2, upRight: 7 },
  // Semitone to the right, thirds on the diagonals
  gerhard: { right: 1, upRight: 4 },
  // Whole tone to the right, semitones on the diagonals
  janko: { right: 2, upRight: 1 },
}

/**
 * Lays out an isomorphic grid of hexagons that fills `width` × `height`: the cell at the
 * centre plays `center` (MIDI, default 60), every other cell follows from the layout's two
 * intervals. Only whole cells inside the area and notes 0–127 are kept.
 *
 * @example
 * const grid = hexGrid({ layout: 'harmonic', width: 600, height: 400, cellSize: 24, orientation: 'columns' })
 */
export function hexGrid(opts: HexGridOptions): HexGrid {
  const layout = typeof opts.layout === 'string' ? HEX_LAYOUTS[opts.layout] ?? HEX_LAYOUTS.harmonic : opts.layout
  const { width, height } = opts
  const s = opts.cellSize
  const center = opts.center ?? 60
  const columns = opts.orientation === 'columns'
  const w = Math.sqrt(3) * s                         // distance between neighbouring centres
  // Lattice steps in rows: right and up-right; columns turn them a quarter left
  let R = { x: w, y: 0 }, U = { x: w / 2, y: -1.5 * s }
  if (columns) { R = { x: R.y, y: -R.x }; U = { x: U.y, y: -U.x } }
  const halfW = columns ? s : w / 2, halfH = columns ? w / 2 : s
  const cx = width / 2, cy = height / 2
  const n = Math.ceil((width + height) / (w / 2)) + 2
  const cells: HexCell[] = []
  for (let q = -n; q <= n; q++) for (let p = -n; p <= n; p++) {
    const x = cx + q * R.x + p * U.x, y = cy + q * R.y + p * U.y
    if (x - halfW < -0.01 || x + halfW > width + 0.01 || y - halfH < -0.01 || y + halfH > height + 0.01) continue
    const note = center + q * layout.right + p * layout.upRight
    if (note < 0 || note > 127) continue
    cells.push({ q, p, x, y, note })
  }
  cells.sort((a, b) => a.y - b.y || a.x - b.x)
  return { cells, cellSize: s, orientation: columns ? 'columns' : 'rows', width, height }
}

function hexPoints(x: number, y: number, r: number, columns: boolean): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 180 * (60 * i + (columns ? 0 : 30))
    pts.push(`${+(x + r * Math.cos(a)).toFixed(2)},${+(y + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Renders a grid from `hexGrid` as an SVG string. Each cell is coloured and labelled from
 * `chord.notes` (by MIDI note), then `chord.classes` (by pitch class), then the style; the
 * default label is the note name. Cells of `chord.links` that are neighbours are joined by a
 * line, so a chord shows its shape. Each cell carries `data-midi` for the host's clicks.
 *
 * @example
 * renderHexGrid(grid, { notes: { 60: { fill: '#5aaa5a' } }, links: [60, 64, 67] })
 */
export function renderHexGrid(grid: HexGrid, chord: HexChord = {}, style?: StyleOptions): string {
  const s = { ...DEFAULT_STYLE, ...style }
  const columns = grid.orientation === 'columns'
  const r = grid.cellSize - s.hexGap / 2
  const fontSize = s.hexLabelSize || Math.max(7, Math.round(grid.cellSize * 0.4))
  const names = s.preferFlats ? CHROMATIC_FLAT : CHROMATIC
  const keyStyle = (note: number): HexKeyStyle => ({ ...chord.classes?.[note % 12], ...chord.notes?.[note] })

  let cells = '', labels = ''
  for (const c of grid.cells) {
    const k = keyStyle(c.note)
    const stroke = k.stroke ? ` stroke="${k.stroke}" stroke-width="${s.hexStrokeWidth}"` : ''
    cells += `<polygon data-midi="${c.note}" points="${hexPoints(c.x, c.y, k.stroke ? r - s.hexStrokeWidth / 2 : r, columns)}" fill="${k.fill ?? s.hexCellColor}"${stroke}/>`
    const label = k.label ?? names[c.note % 12]
    if (label) labels += `<text x="${+c.x.toFixed(2)}" y="${+c.y.toFixed(2)}" dy="0.35em" text-anchor="middle" font-family="${s.fontFamily}" font-size="${fontSize}"${k.bold ? ' font-weight="600"' : ''} fill="${k.text ?? s.hexTextColor}" pointer-events="none">${esc(label)}</text>`
  }

  let path = ''
  if (chord.links?.length) {
    const on = new Set(chord.links)
    const lit = grid.cells.filter(c => on.has(c.note))
    const step = Math.sqrt(3) * grid.cellSize
    for (let i = 0; i < lit.length; i++) for (let j = i + 1; j < lit.length; j++) {
      const a = lit[i], b = lit[j]
      if (Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - step) < 0.5) path += `M${+a.x.toFixed(2)} ${+a.y.toFixed(2)}L${+b.x.toFixed(2)} ${+b.y.toFixed(2)}`
    }
  }
  const lineW = s.hexLinkWidth || Math.max(1.5, grid.cellSize / 10)
  const links = path ? `<path d="${path}" fill="none" stroke="${s.hexLinkColor}" stroke-width="${lineW}" stroke-linecap="round" pointer-events="none"/>` : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${grid.width} ${grid.height}" width="${grid.width}" height="${grid.height}">${cells}${links}${labels}</svg>`
}
