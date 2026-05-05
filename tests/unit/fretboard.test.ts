import { describe, it, expect } from 'vitest'
import { renderFretboard } from '../../src/fretboard'
import { DEFAULT_STYLE } from '../../src/types'
import type { FretboardChord } from '../../src/types'

const GUITAR: FretboardChord = {
  name: 'G',
  frets: [3, 2, 0, 0, 0, 3],
  fingers: [2, 1, 0, 0, 0, 3],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  root: 'G',
}

const BARRE: FretboardChord = {
  name: 'F',
  frets: [1, 3, 3, 2, 1, 1],
  fingers: [1, 3, 4, 2, 1, 1],
  barres: [{ fret: 1, startString: 1, endString: 6 }],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  root: 'F',
}

const HIGH_POS: FretboardChord = {
  name: 'Dm7',
  frets: [-1, 5, 7, 5, 6, 5],
  fingers: [0, 1, 3, 1, 2, 1],
  baseFret: 5,
  barres: [{ fret: 5, startString: 2, endString: 6 }],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  root: 'D',
}

const UKULELE: FretboardChord = {
  name: 'C',
  frets: [0, 0, 0, 3],
  tuning: ['G', 'C', 'E', 'A'],
  root: 'C',
}

const SCALE: FretboardChord = {
  name: 'Am blues',
  frets: [[5, 8], [5, 6, 7], [5, 7], [5, 7], [5, 8], [5, 8]],
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  baseFret: 5,
  root: 'A',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function svgAttr(svg: string, attr: string): string | null {
  return svg.match(new RegExp(`${attr}="([^"]+)"`))?.[1] ?? null
}

function countTag(svg: string, tag: string): number {
  return (svg.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length
}

function textContents(svg: string): string[] {
  return Array.from(svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g), m => m[1])
}

// ── SVG structure ─────────────────────────────────────────────────────────────

describe('renderFretboard — SVG structure', () => {
  it('returns a valid SVG string', () => {
    const svg = renderFretboard(GUITAR)
    expect(svg).toMatch(/^<svg /)
    expect(svg).toMatch(/<\/svg>$/)
  })

  it('contains the chord name as text', () => {
    const svg = renderFretboard(GUITAR)
    expect(textContents(svg)).toContain('G')
  })

  it('contains one circle per fretted note', () => {
    // G major: frets [3,2,0,0,0,3] — 3 fretted non-open notes (strings 0, 1, 5)
    const svg = renderFretboard(GUITAR)
    const circles = svg.match(/<circle[^/]*fill="[^"]*"/g) ?? []
    const dots = circles.filter(c => !c.includes('fill="none"'))
    expect(dots.length).toBe(3)
  })

  it('contains open-string indicators (circle fill=none)', () => {
    const svg = renderFretboard(GUITAR)
    const openCircles = (svg.match(/fill="none"/g) ?? []).length
    expect(openCircles).toBeGreaterThanOrEqual(3) // 3 open strings
  })

  it('contains muted-string indicators (×) for muted strings', () => {
    const svg = renderFretboard(HIGH_POS)
    const lines = countTag(svg, 'line')
    expect(lines).toBeGreaterThan(0) // mute × uses 2 lines
  })

  it('renders a nut rect when baseFret is 1', () => {
    const svg = renderFretboard(GUITAR)
    expect(svg).toContain(`fill="${DEFAULT_STYLE.nutColor}"`)
  })

  it('renders fret label text when baseFret > 1', () => {
    const svg = renderFretboard(HIGH_POS)
    expect(textContents(svg)).toContain('5')
  })

  it('does not render nut when baseFret > 1', () => {
    const svg = renderFretboard(HIGH_POS)
    expect(svg).not.toContain(`fill="${DEFAULT_STYLE.nutColor}"`)
  })

  it('renders a barre rect', () => {
    const svg = renderFretboard(BARRE)
    const rects = svg.match(/<rect[^/]*/g) ?? []
    const barres = rects.filter(r => r.includes(`fill="${DEFAULT_STYLE.barreColor}"`))
    expect(barres.length).toBe(1)
  })

  it('renders tuning labels when showStringLabels is true', () => {
    const svg = renderFretboard(GUITAR)
    const texts = textContents(svg)
    expect(texts).toContain('E')
    expect(texts).toContain('A')
  })

  it('does not render string labels when showStringLabels is false', () => {
    // Use BARRE (name 'F') so chord name doesn't collide with tuning labels
    const svg = renderFretboard(BARRE, { showStringLabels: false })
    const texts = textContents(svg)
    expect(texts.filter(t => ['E','A','D','G','B'].includes(t))).toHaveLength(0)
  })

  it('renders finger numbers inside dots', () => {
    const svg = renderFretboard(GUITAR)
    const texts = textContents(svg)
    expect(texts).toContain('2') // finger 2
    expect(texts).toContain('3') // finger 3
  })

  it('renders multiple dots per string for scale diagrams', () => {
    const svg = renderFretboard(SCALE, { numFrets: 4 })
    const dots = (svg.match(/fill="[^"]*"[^/]*\/>/g) ?? []).filter(c => c.startsWith('fill=') === false)
    // Scale with array frets should produce multiple circles
    const circles = countTag(svg, 'circle')
    expect(circles).toBeGreaterThan(6)
  })
})

// ── Geometry ──────────────────────────────────────────────────────────────────

describe('renderFretboard — geometry', () => {
  it('same style + numStrings produces same width regardless of content', () => {
    const w1 = svgAttr(renderFretboard(GUITAR), 'width')
    const w2 = svgAttr(renderFretboard(BARRE), 'width')
    expect(w1).toBe(w2)
  })

  it('same style + numStrings produces same height regardless of content', () => {
    const h1 = svgAttr(renderFretboard(GUITAR), 'height')
    const h2 = svgAttr(renderFretboard(HIGH_POS), 'height')
    expect(h1).toBe(h2)
  })

  it('ukulele (4 strings) is narrower than guitar (6 strings)', () => {
    const wG = Number(svgAttr(renderFretboard(GUITAR), 'width'))
    const wU = Number(svgAttr(renderFretboard(UKULELE), 'width'))
    expect(wU).toBeLessThan(wG)
  })

  it('more frets → taller diagram', () => {
    const h5 = Number(svgAttr(renderFretboard(GUITAR, { numFrets: 5 }), 'height'))
    const h8 = Number(svgAttr(renderFretboard(GUITAR, { numFrets: 8 }), 'height'))
    expect(h8).toBeGreaterThan(h5)
  })

  it('larger fretSpacing → taller diagram', () => {
    const h1 = Number(svgAttr(renderFretboard(GUITAR, { fretSpacing: 20 }), 'height'))
    const h2 = Number(svgAttr(renderFretboard(GUITAR, { fretSpacing: 30 }), 'height'))
    expect(h2).toBeGreaterThan(h1)
  })

  it('larger stringSpacing → wider diagram', () => {
    const w1 = Number(svgAttr(renderFretboard(GUITAR, { stringSpacing: 18 }), 'width'))
    const w2 = Number(svgAttr(renderFretboard(GUITAR, { stringSpacing: 26 }), 'width'))
    expect(w2).toBeGreaterThan(w1)
  })

  it('diagramPadding increases both width and height', () => {
    const w0 = Number(svgAttr(renderFretboard(GUITAR, { diagramPadding: 0 }), 'width'))
    const h0 = Number(svgAttr(renderFretboard(GUITAR, { diagramPadding: 0 }), 'height'))
    const w1 = Number(svgAttr(renderFretboard(GUITAR, { diagramPadding: 10 }), 'width'))
    const h1 = Number(svgAttr(renderFretboard(GUITAR, { diagramPadding: 10 }), 'height'))
    expect(w1).toBeGreaterThan(w0)
    expect(h1).toBeGreaterThan(h0)
  })
})

// ── Horizontal orientation ────────────────────────────────────────────────────

describe('renderFretboard — horizontal orientation', () => {
  it('returns valid SVG', () => {
    const svg = renderFretboard(GUITAR, { orientation: 'horizontal' })
    expect(svg).toMatch(/^<svg /)
  })

  it('horizontal full-neck is wider than tall', () => {
    // numFrets:12 makes width dominate over the tall chord-name area
    const svg = renderFretboard(GUITAR, { orientation: 'horizontal', numFrets: 12 })
    const w = Number(svgAttr(svg, 'width'))
    const h = Number(svgAttr(svg, 'height'))
    expect(w).toBeGreaterThan(h)
  })

  it('horizontal and vertical produce different dimensions', () => {
    const svgV = renderFretboard(GUITAR, { orientation: 'vertical' })
    const svgH = renderFretboard(GUITAR, { orientation: 'horizontal' })
    expect(svgAttr(svgV, 'width')).not.toBe(svgAttr(svgH, 'width'))
  })
})

// ── Style options ─────────────────────────────────────────────────────────────

describe('renderFretboard — style options', () => {
  it('custom dotColor appears in SVG', () => {
    const svg = renderFretboard(GUITAR, { dotColor: '#ff0000' })
    expect(svg).toContain('#ff0000')
  })

  it('backgroundColor appears in SVG when set', () => {
    const svg = renderFretboard(GUITAR, { backgroundColor: '#123456', borderWidth: 1 })
    expect(svg).toContain('#123456')
  })

  it('borderWidth adds border rect to SVG', () => {
    const svg = renderFretboard(GUITAR, { borderWidth: 2, borderColor: '#aabbcc' })
    expect(svg).toContain('#aabbcc')
  })

  it('showDegrees replaces finger numbers with degree labels', () => {
    const svg = renderFretboard(GUITAR, { showDegrees: true })
    const texts = textContents(svg)
    expect(texts).toContain('R') // root degree
  })

  it('filterStyle shadow adds filter element', () => {
    const svg = renderFretboard(GUITAR, { filterStyle: 'shadow' })
    expect(svg).toContain('<filter')
  })

  it('filterStyle clean has no filter element', () => {
    const svg = renderFretboard(GUITAR, { filterStyle: 'clean' })
    expect(svg).not.toContain('<filter')
  })
})
