import { describe, it, expect } from 'vitest'
import { renderPiano } from '../../src/piano'
import type { PianoChord } from '../../src/types'

const CMAJ7: PianoChord = {
  name: 'Cmaj7',
  keys: ['C4', 'E4', 'G4', 'B4'],
  fingers: [1, 2, 3, 4],
  root: 'C',
}

const BBM: PianoChord = {
  name: 'Bbm',
  keys: ['Bb3', 'Db4', 'F4'],
  root: 'Bb',
}

const WIDE: PianoChord = {
  name: 'F# harmonic minor',
  keys: ['F#2', 'A2', 'C#3', 'F#3', 'A3', 'C#4', 'F#4'],
  root: 'F#',
  range: { from: 'C2', to: 'B4' },  // 3 full octaves > default 2-octave range
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function svgAttr(svg: string, attr: string): string | null {
  return svg.match(new RegExp(`${attr}="([^"]+)"`))?.[1] ?? null
}

function textContents(svg: string): string[] {
  return Array.from(svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g), m => m[1])
}

// ── SVG structure ─────────────────────────────────────────────────────────────

describe('renderPiano — SVG structure', () => {
  it('returns a valid SVG string', () => {
    const svg = renderPiano(CMAJ7)
    expect(svg).toMatch(/^<svg /)
    expect(svg).toMatch(/<\/svg>$/)
  })

  it('contains the chord name as text', () => {
    const svg = renderPiano(CMAJ7)
    expect(textContents(svg)).toContain('Cmaj7')
  })

  it('renders one dot per active key', () => {
    const svg = renderPiano(CMAJ7)
    // Dots are circles with a fill color (not fill="none")
    const allCircles = svg.match(/<circle[^>]+>/g) ?? []
    const dots = allCircles.filter(c => !c.includes('fill="none"'))
    expect(dots.length).toBeGreaterThanOrEqual(4)
  })

  it('renders white key rects', () => {
    const svg = renderPiano(CMAJ7)
    expect(svg).toContain(`fill="${'#ffffff'}"`)
  })

  it('renders black key rects for chords with black keys', () => {
    const svg = renderPiano(BBM)
    expect(svg).toContain(`fill="${'#222222'}"`)
  })

  it('renders note labels below keyboard by default', () => {
    const svg = renderPiano(CMAJ7, { showPianoNoteLabels: true })
    const texts = textContents(svg)
    expect(texts).toContain('C')
    expect(texts).toContain('E')
  })

  it('hides note labels when showPianoNoteLabels is false', () => {
    const svg = renderPiano(CMAJ7, { showPianoNoteLabels: false })
    const texts = textContents(svg)
    // Only chord name; no single-letter note labels
    const noteLabels = texts.filter(t => /^[A-G][#b]?$/.test(t))
    expect(noteLabels).toHaveLength(0)
  })

  it('renders finger numbers inside dots', () => {
    const svg = renderPiano(CMAJ7)
    const texts = textContents(svg)
    expect(texts).toContain('1')
    expect(texts).toContain('2')
  })

  it('renders degree labels when showDegrees is true', () => {
    const svg = renderPiano(CMAJ7, { showDegrees: true })
    const texts = textContents(svg)
    expect(texts).toContain('R')
  })

  it('note labels respect flat spelling (Bb not A#)', () => {
    const svg = renderPiano(BBM, { showPianoNoteLabels: true })
    const texts = textContents(svg)
    expect(texts).toContain('Bb')
    expect(texts).not.toContain('A#')
  })
})

// ── Geometry ──────────────────────────────────────────────────────────────────

describe('renderPiano — geometry', () => {
  it('wider range → wider diagram', () => {
    const narrow = Number(svgAttr(renderPiano(CMAJ7), 'width'))
    const wide = Number(svgAttr(renderPiano(WIDE), 'width'))
    expect(wide).toBeGreaterThan(narrow)
  })

  it('larger pianoWhiteKeyW → wider diagram', () => {
    const w1 = Number(svgAttr(renderPiano(CMAJ7, { pianoWhiteKeyW: 24 }), 'width'))
    const w2 = Number(svgAttr(renderPiano(CMAJ7, { pianoWhiteKeyW: 36 }), 'width'))
    expect(w2).toBeGreaterThan(w1)
  })

  it('larger pianoWhiteKeyH → taller diagram', () => {
    const h1 = Number(svgAttr(renderPiano(CMAJ7, { pianoWhiteKeyH: 100 }), 'height'))
    const h2 = Number(svgAttr(renderPiano(CMAJ7, { pianoWhiteKeyH: 160 }), 'height'))
    expect(h2).toBeGreaterThan(h1)
  })

  it('diagramPadding increases both dimensions', () => {
    const w0 = Number(svgAttr(renderPiano(CMAJ7, { diagramPadding: 0 }), 'width'))
    const h0 = Number(svgAttr(renderPiano(CMAJ7, { diagramPadding: 0 }), 'height'))
    const w1 = Number(svgAttr(renderPiano(CMAJ7, { diagramPadding: 10 }), 'width'))
    const h1 = Number(svgAttr(renderPiano(CMAJ7, { diagramPadding: 10 }), 'height'))
    expect(w1).toBeGreaterThan(w0)
    expect(h1).toBeGreaterThan(h0)
  })

  it('hiding note labels reduces height', () => {
    const hWith = Number(svgAttr(renderPiano(CMAJ7, { showPianoNoteLabels: true }), 'height'))
    const hWithout = Number(svgAttr(renderPiano(CMAJ7, { showPianoNoteLabels: false }), 'height'))
    expect(hWithout).toBeLessThan(hWith)
  })
})

// ── Style options ─────────────────────────────────────────────────────────────

describe('renderPiano — style options', () => {
  it('custom activeKeyColor appears in SVG', () => {
    const svg = renderPiano(CMAJ7, { activeKeyColor: '#ff0000' })
    expect(svg).toContain('#ff0000')
  })

  it('filterStyle glow adds filter element', () => {
    const svg = renderPiano(CMAJ7, { filterStyle: 'glow' })
    expect(svg).toContain('<filter')
  })

  it('filterStyle clean has no filter element', () => {
    const svg = renderPiano(CMAJ7, { filterStyle: 'clean' })
    expect(svg).not.toContain('<filter')
  })

  it('per-key colors appear in SVG', () => {
    const svg = renderPiano({ ...CMAJ7, colors: ['#ff0000', null, null, null] })
    expect(svg).toContain('#ff0000')
  })
})
