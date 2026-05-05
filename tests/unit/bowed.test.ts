import { describe, it, expect } from 'vitest'
import { renderBowed } from '../../src/bowed'
import type { BowedChord } from '../../src/types'

const VIOLIN_G: BowedChord = {
  name: 'G',
  strings: [0, 0, 1, null],
  fingers: [null, null, 1, null],
  tuning: ['G', 'D', 'A', 'E'],
  position: 1,
  root: 'G',
}

const VIOLIN_POS3: BowedChord = {
  name: 'D',
  strings: [3, 2, 1, null],
  fingers: [3, 2, 1, null],
  tuning: ['G', 'D', 'A', 'E'],
  position: 3,
  root: 'D',
}

const SCALE: BowedChord = {
  name: 'G major',
  strings: [[0, 2, 4, 5], [0, 2, 4, 5], [0, 2, 3, 5], [0, 2, 3, 5]],
  numSlots: 5,
  tuning: ['G', 'D', 'A', 'E'],
  position: 1,
  root: 'G',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function svgAttr(svg: string, attr: string): string | null {
  return svg.match(new RegExp(`${attr}="([^"]+)"`))?.[1] ?? null
}

function textContents(svg: string): string[] {
  return Array.from(svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g), m => m[1])
}

// ── SVG structure ─────────────────────────────────────────────────────────────

describe('renderBowed — SVG structure', () => {
  it('returns a valid SVG string', () => {
    const svg = renderBowed(VIOLIN_G)
    expect(svg).toMatch(/^<svg /)
    expect(svg).toMatch(/<\/svg>$/)
  })

  it('contains the chord name as text', () => {
    expect(textContents(renderBowed(VIOLIN_G))).toContain('G')
  })

  it('renders a nut rect at position 1', () => {
    const svg = renderBowed(VIOLIN_G)
    expect(svg).toContain('fill="#333333"') // nutColor default
  })

  it('renders position label instead of nut at position > 1', () => {
    const svg = renderBowed(VIOLIN_POS3)
    const texts = textContents(svg)
    expect(texts).toContain('3')
  })

  it('renders open string indicators (circle fill=none)', () => {
    const svg = renderBowed(VIOLIN_G)
    expect(svg).toContain('fill="none"')
  })

  it('renders muted string indicators (×) for null strings', () => {
    const svg = renderBowed(VIOLIN_G) // string[3] is null → × indicator
    // Mute × lines have stroke-linecap="round"; string lines do not
    expect(svg).toContain('stroke-linecap="round"')
  })

  it('renders dots for fingered positions', () => {
    const svg = renderBowed(VIOLIN_POS3)
    const dots = (svg.match(/<circle[^>]*r="[^"]*"/g) ?? []).filter(c => !c.includes('fill="none"'))
    expect(dots.length).toBeGreaterThan(0)
  })

  it('renders tuning labels when showStringLabels is true', () => {
    const texts = textContents(renderBowed(VIOLIN_G))
    expect(texts).toContain('G')
    expect(texts).toContain('D')
  })

  it('renders multiple dots per string for scale diagrams', () => {
    const svg = renderBowed(SCALE)
    const circles = (svg.match(/<circle/g) ?? []).length
    expect(circles).toBeGreaterThan(4)
  })

  it('renders slot tick marks', () => {
    const svg = renderBowed(VIOLIN_G)
    const lines = (svg.match(/<line/g) ?? []).length
    expect(lines).toBeGreaterThan(0) // ticks + mute lines + string lines
  })
})

// ── Geometry ──────────────────────────────────────────────────────────────────

describe('renderBowed — geometry', () => {
  it('same style + numStrings produces same width regardless of content', () => {
    const w1 = svgAttr(renderBowed(VIOLIN_G), 'width')
    const w2 = svgAttr(renderBowed(VIOLIN_POS3), 'width')
    expect(w1).toBe(w2)
  })

  it('more slots → taller diagram', () => {
    const h4 = Number(svgAttr(renderBowed({ ...VIOLIN_G, numSlots: 4 }), 'height'))
    const h6 = Number(svgAttr(renderBowed({ ...VIOLIN_G, numSlots: 6 }), 'height'))
    expect(h6).toBeGreaterThan(h4)
  })

  it('diagramPadding increases both dimensions', () => {
    const w0 = Number(svgAttr(renderBowed(VIOLIN_G, { diagramPadding: 0 }), 'width'))
    const h0 = Number(svgAttr(renderBowed(VIOLIN_G, { diagramPadding: 0 }), 'height'))
    const w1 = Number(svgAttr(renderBowed(VIOLIN_G, { diagramPadding: 10 }), 'width'))
    const h1 = Number(svgAttr(renderBowed(VIOLIN_G, { diagramPadding: 10 }), 'height'))
    expect(w1).toBeGreaterThan(w0)
    expect(h1).toBeGreaterThan(h0)
  })
})

// ── Horizontal orientation ────────────────────────────────────────────────────

describe('renderBowed — horizontal orientation', () => {
  it('returns valid SVG', () => {
    const svg = renderBowed(VIOLIN_G, { orientation: 'horizontal' })
    expect(svg).toMatch(/^<svg /)
  })

  it('horizontal diagram is wider than tall', () => {
    const svg = renderBowed(VIOLIN_G, { orientation: 'horizontal' })
    const w = Number(svgAttr(svg, 'width'))
    const h = Number(svgAttr(svg, 'height'))
    expect(w).toBeGreaterThan(h)
  })
})
