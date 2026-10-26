import { describe, it, expect } from 'vitest'
import { hexGrid, renderHexGrid, HEX_LAYOUTS } from '../../src/hexgrid'
import type { HexGrid } from '../../src/types'

// The cell one lattice step from `c` in a direction, if the grid has it
function neighbour(g: HexGrid, c: { x: number; y: number }, dx: number, dy: number) {
  return g.cells.find(o => Math.abs(o.x - c.x - dx) < 0.01 && Math.abs(o.y - c.y - dy) < 0.01)
}
const centreCell = (g: HexGrid) => g.cells.find(c => c.q === 0 && c.p === 0)!

describe('hexGrid: layouts', () => {
  const s = 20, w = Math.sqrt(3) * s

  it('the centre cell plays `center`, 60 by default', () => {
    expect(centreCell(hexGrid({ layout: 'harmonic', width: 400, height: 300, cellSize: s })).note).toBe(60)
    expect(centreCell(hexGrid({ layout: 'harmonic', width: 400, height: 300, cellSize: s, center: 55 })).note).toBe(55)
  })

  it('harmonic table in columns: fifth up, major third up-right, minor third up-left', () => {
    const g = hexGrid({ layout: 'harmonic', width: 400, height: 300, cellSize: s, orientation: 'columns' })
    const c = centreCell(g)
    expect(neighbour(g, c, 0, -w)!.note - c.note).toBe(7)
    expect(neighbour(g, c, 1.5 * s, -w / 2)!.note - c.note).toBe(4)
    expect(neighbour(g, c, -1.5 * s, -w / 2)!.note - c.note).toBe(3)
  })

  it('Wicki-Hayden in rows: whole tone right, fifth up-right, fourth up-left', () => {
    const g = hexGrid({ layout: 'wicki', width: 400, height: 300, cellSize: s })
    const c = centreCell(g)
    expect(neighbour(g, c, w, 0)!.note - c.note).toBe(2)
    expect(neighbour(g, c, w / 2, -1.5 * s)!.note - c.note).toBe(7)
    expect(neighbour(g, c, -w / 2, -1.5 * s)!.note - c.note).toBe(5)
  })

  it('takes any two intervals, and an unknown name falls back to the harmonic table', () => {
    const g = hexGrid({ layout: { right: 5, upRight: 2 }, width: 400, height: 300, cellSize: s })
    const c = centreCell(g)
    expect(neighbour(g, c, w, 0)!.note - c.note).toBe(5)
    const h = hexGrid({ layout: 'nope', width: 400, height: 300, cellSize: s })
    expect(neighbour(h, centreCell(h), w, 0)!.note - 60).toBe(HEX_LAYOUTS.harmonic.right)
  })

  it('keeps only whole cells inside the area, and notes 0–127', () => {
    const g = hexGrid({ layout: 'harmonic', width: 300, height: 200, cellSize: s, orientation: 'columns' })
    for (const c of g.cells) {
      expect(c.x - s).toBeGreaterThanOrEqual(-0.01)
      expect(c.x + s).toBeLessThanOrEqual(300.01)
      expect(c.y - w / 2).toBeGreaterThanOrEqual(-0.01)
      expect(c.y + w / 2).toBeLessThanOrEqual(200.01)
    }
    const low = hexGrid({ layout: 'wicki', width: 600, height: 400, cellSize: 10, center: 2 })
    expect(low.cells.every(c => c.note >= 0 && c.note <= 127)).toBe(true)
  })

  it('smaller cells give more of them', () => {
    const big = hexGrid({ layout: 'harmonic', width: 500, height: 300, cellSize: 30 })
    const small = hexGrid({ layout: 'harmonic', width: 500, height: 300, cellSize: 15 })
    expect(small.cells.length).toBeGreaterThan(big.cells.length * 3)
  })
})

describe('renderHexGrid', () => {
  const g = hexGrid({ layout: 'harmonic', width: 400, height: 300, cellSize: 20, orientation: 'columns' })

  it('one polygon per cell, each with its data-midi', () => {
    const svg = renderHexGrid(g)
    expect(svg).toMatch(/^<svg /)
    expect(svg.match(/<polygon /g)!.length).toBe(g.cells.length)
    expect(svg).toContain('data-midi="60"')
  })

  it('labels each cell with its note name, flats with preferFlats', () => {
    expect(renderHexGrid(g)).toContain('>C#</text>')
    expect(renderHexGrid(g, {}, { preferFlats: true })).toContain('>Db</text>')
  })

  it('a note style wins over its pitch class, which wins over the style', () => {
    const svg = renderHexGrid(g, {
      classes: [{ fill: '#111111', label: 'Do' }],
      notes: { 60: { fill: '#f87171', label: 'Do4', bold: true } },
    }, { hexCellColor: '#222222' })
    expect(svg).toMatch(/data-midi="60" points="[^"]+" fill="#f87171"/)
    expect(svg).toMatch(/data-midi="72" points="[^"]+" fill="#111111"/)
    expect(svg).toMatch(/data-midi="61" points="[^"]+" fill="#222222"/)
    expect(svg).toContain('font-weight="600" fill="#555555" pointer-events="none">Do4</text>')
    expect(svg).toContain('>Do</text>')
  })

  it("an empty label shows no text; a stroke outlines the cell", () => {
    const svg = renderHexGrid(g, { classes: Array(12).fill({ label: '' }), notes: { 60: { stroke: '#d9c9a3' } } })
    expect(svg).not.toContain('<text')
    expect(svg).toContain('stroke="#d9c9a3"')
  })

  it('links join only neighbouring cells of the chord', () => {
    // G7 G3 B3 D4 F4: G–B, B–D, G–D and D–F are neighbours in the harmonic table, B–F is not
    const svg = renderHexGrid(g, { links: [55, 59, 62, 65] }, { hexLinkColor: '#ffffff' })
    const d = svg.match(/<path d="([^"]+)" fill="none" stroke="#ffffff"/)![1]
    const segs = d.split('M').filter(Boolean)
    const at = (n: number) => g.cells.filter(c => c.note === n)
    const linked = (a: number, b: number) => segs.some(sg => at(a).some(ca => at(b).some(cb => {
      const [p, q] = sg.split('L').map(t => t.split(' ').map(Number))
      const same = (pt: number[], c: { x: number; y: number }) => Math.abs(pt[0] - c.x) < 0.01 && Math.abs(pt[1] - c.y) < 0.01
      return (same(p, ca) && same(q, cb)) || (same(p, cb) && same(q, ca))
    })))
    expect(linked(55, 59)).toBe(true)
    expect(linked(59, 62)).toBe(true)
    expect(linked(55, 62)).toBe(true)
    expect(linked(62, 65)).toBe(true)
    expect(linked(59, 65)).toBe(false)
  })

  it('no links, no path', () => {
    expect(renderHexGrid(g)).not.toContain('<path')
  })
})
