import { renderFretboard } from '../src/fretboard'
import { StyleOptions, DEFAULT_STYLE } from '../src/types'

// ── Banjo chords (open G tuning) ──────────────────────────────────────────────
// String index left→right: 0=G(drone, starts at fret 5), 1=D(4th), 2=G(3rd), 3=B(2nd), 4=D(1st)
// frets[0] = absolute fret number (5 = open/peg position for drone)

const BANJO = {
  g: {
    name: 'G',
    frets: [5, 0, 0, 0, 0],
    fingers: [0, 0, 0, 0, 0],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'G',
  },
  c: {
    name: 'C',
    frets: [5, 2, 0, 1, 2],
    fingers: [0, 2, 0, 1, 3],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'C',
  },
  d7: {
    // D7 = D-F#-A-C. Drone G tolerated (common banjo compromise)
    // string4(D)=open D, string3(G)+2=A, string2(B)+1=C, string1(D)=open D
    name: 'D7',
    frets: [5, 0, 2, 1, 0],
    fingers: [0, 0, 2, 1, 0],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'D',
  },
  cHighPos: {
    // C chord at V position: string4(D)+5=G(5th), string3(G)+5=C(root), string2(B)+5=E(3rd), string1(D)+5=G(5th)
    name: 'C (V)',
    frets: [5, 5, 5, 5, 5],
    fingers: [0, 1, 2, 3, 4],
    baseFret: 4,
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'C',
  },
  gScale: {
    // G major scale, first position (open to fret 5), drone shows A at fret 7
    name: 'G major',
    frets: [
      [5, 7],        // drone G: open (skipped), A
      [0, 2, 4, 5],  // str4 D: D E F# G
      [0, 2, 4, 5],  // str3 G: G A B C
      [0, 1, 3, 5],  // str2 B: B C D E
      [0, 2, 4],     // str1 D: D E F#
    ],
    tuning: ['G', 'D', 'G', 'B', 'D'],
    stringOffset: [5, 0, 0, 0, 0],
    root: 'G',
  },
}

// ── Style state ───────────────────────────────────────────────────────────────

const style: StyleOptions = {}

function getStyle(): StyleOptions {
  return { ...style }
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const s = getStyle()
  const d = document.getElementById.bind(document)

  d('banjo-g')!.innerHTML      = renderFretboard(BANJO.g,         s)
  d('banjo-c')!.innerHTML      = renderFretboard(BANJO.c,         s)
  d('banjo-d7')!.innerHTML     = renderFretboard(BANJO.d7,        s)
  d('banjo-highG')!.innerHTML  = renderFretboard(BANJO.cHighPos,  s)
  d('banjo-scale')!.innerHTML  = renderFretboard(BANJO.gScale, { ...s, numFrets: 7 })
}

// ── Tweaks wiring ─────────────────────────────────────────────────────────────

type SliderDef = {
  id: string
  key: keyof StyleOptions
  min: number
  max: number
  step: number
  val: number
}

const SLIDERS: SliderDef[] = [
  { id: 'tweak-chordNameSize',      key: 'chordNameSize',      min: 8,  max: 30, step: 1,    val: DEFAULT_STYLE.chordNameSize },
  { id: 'tweak-chordNameY',         key: 'chordNameY',         min: 10, max: 50, step: 1,    val: DEFAULT_STYLE.chordNameY },
  { id: 'tweak-chordNameGap',       key: 'chordNameGap',       min: 0,  max: 40, step: 1,    val: DEFAULT_STYLE.chordNameGap },
  { id: 'tweak-dotRadius',          key: 'dotRadius',          min: 4,  max: 16, step: 1,    val: DEFAULT_STYLE.dotRadius },
  { id: 'tweak-stringSpacing',      key: 'stringSpacing',      min: 12, max: 32, step: 1,    val: DEFAULT_STYLE.stringSpacing },
  { id: 'tweak-fretSpacing',        key: 'fretSpacing',        min: 14, max: 40, step: 1,    val: DEFAULT_STYLE.fretSpacing },
  { id: 'tweak-nutWidth',           key: 'nutWidth',           min: 1,  max: 10, step: 1,    val: DEFAULT_STYLE.nutWidth },
  { id: 'tweak-numFrets',           key: 'numFrets',           min: 4,  max: 15, step: 1,    val: DEFAULT_STYLE.numFrets },
  { id: 'tweak-stringWidth',        key: 'stringWidth',        min: 1,  max: 4,  step: 0.5,  val: DEFAULT_STYLE.stringWidth },
  { id: 'tweak-fretWidth',          key: 'fretWidth',          min: 1,  max: 4,  step: 0.5,  val: DEFAULT_STYLE.fretWidth },
  { id: 'tweak-indicatorZoneSize',  key: 'indicatorZoneSize',  min: 8,  max: 32, step: 1,    val: DEFAULT_STYLE.indicatorZoneSize },
  { id: 'tweak-indicatorSize',      key: 'indicatorSize',      min: 2,  max: 10, step: 1,    val: DEFAULT_STYLE.indicatorSize },
  { id: 'tweak-fretLabelSize',      key: 'fretLabelSize',      min: 8,  max: 16, step: 1,    val: DEFAULT_STYLE.fretLabelSize },
  { id: 'tweak-fretLabelGap',       key: 'fretLabelGap',       min: 4,  max: 40, step: 1,    val: DEFAULT_STYLE.fretLabelGap },
  { id: 'tweak-stringLabelSize',    key: 'stringLabelSize',    min: 8,  max: 16, step: 1,    val: DEFAULT_STYLE.stringLabelSize },
  { id: 'tweak-diagramPadding',     key: 'diagramPadding',     min: 0,  max: 24, step: 1,    val: DEFAULT_STYLE.diagramPadding },
  { id: 'tweak-borderWidth',        key: 'borderWidth',        min: 0,  max: 8,  step: 1,    val: DEFAULT_STYLE.borderWidth },
  { id: 'tweak-borderRadius',       key: 'borderRadius',       min: 0,  max: 20, step: 1,    val: DEFAULT_STYLE.borderRadius },
  { id: 'tweak-glowBlur',           key: 'glowBlur',           min: 0,  max: 10, step: 0.5,  val: DEFAULT_STYLE.glowBlur },
  { id: 'tweak-glowOpacity',        key: 'glowOpacity',        min: 0,  max: 1,  step: 0.05, val: DEFAULT_STYLE.glowOpacity },
  { id: 'tweak-shadowX',            key: 'shadowX',            min: 0,  max: 8,  step: 0.5,  val: DEFAULT_STYLE.shadowX },
  { id: 'tweak-shadowY',            key: 'shadowY',            min: 0,  max: 8,  step: 0.5,  val: DEFAULT_STYLE.shadowY },
  { id: 'tweak-shadowBlur',         key: 'shadowBlur',         min: 0,  max: 10, step: 0.5,  val: DEFAULT_STYLE.shadowBlur },
  { id: 'tweak-shadowOpacity',      key: 'shadowOpacity',      min: 0,  max: 1,  step: 0.05, val: DEFAULT_STYLE.shadowOpacity },
]

type ColorDef = { id: string; key: keyof StyleOptions; transparentId?: string }

const COLORS: ColorDef[] = [
  { id: 'tweak-dotColor',          key: 'dotColor' },
  { id: 'tweak-dotTextColor',      key: 'dotTextColor' },
  { id: 'tweak-barreColor',        key: 'barreColor' },
  { id: 'tweak-chordNameColor',    key: 'chordNameColor' },
  { id: 'tweak-fretLabelColor',    key: 'fretLabelColor' },
  { id: 'tweak-nutColor',          key: 'nutColor' },
  { id: 'tweak-indicatorColor',    key: 'indicatorColor' },
  { id: 'tweak-stringColor',       key: 'stringColor' },
  { id: 'tweak-fretColor',         key: 'fretColor' },
  { id: 'tweak-stringLabelColor',  key: 'stringLabelColor' },
  { id: 'tweak-backgroundColor',   key: 'backgroundColor',  transparentId: 'tweak-backgroundColor-transparent' },
  { id: 'tweak-borderColor',       key: 'borderColor',      transparentId: 'tweak-borderColor-transparent' },
  { id: 'tweak-glowColor',         key: 'glowColor' },
]

function wireSliders() {
  for (const def of SLIDERS) {
    const el = document.getElementById(def.id) as HTMLInputElement | null
    if (!el) continue
    el.min = String(def.min)
    el.max = String(def.max)
    el.step = String(def.step)
    el.value = String(def.val)
    const valEl = document.getElementById(`${def.id}-val`)
    if (valEl) valEl.textContent = String(def.val)
    el.addEventListener('input', () => {
      const v = parseFloat(el.value)
      ;(style as Record<string, unknown>)[def.key] = v
      if (valEl) valEl.textContent = String(v)
      render()
    })
  }
}

function wireColors() {
  for (const def of COLORS) {
    const el = document.getElementById(def.id) as HTMLInputElement | null
    if (!el) continue
    const defaultVal = (DEFAULT_STYLE as Record<string, unknown>)[def.key] as string
    const isTransparent = defaultVal === 'transparent'

    if (def.transparentId) {
      const cb = document.getElementById(def.transparentId) as HTMLInputElement | null
      if (cb) {
        cb.checked = isTransparent
        el.disabled = isTransparent
        if (!isTransparent) el.value = defaultVal
        cb.addEventListener('change', () => {
          el.disabled = cb.checked
          ;(style as Record<string, unknown>)[def.key] = cb.checked ? 'transparent' : el.value
          render()
        })
      }
    } else {
      el.value = defaultVal
    }

    el.addEventListener('input', () => {
      ;(style as Record<string, unknown>)[def.key] = el.value
      render()
    })
  }
}

function wireToggles() {
  const toggles: Array<{ id: string; key: keyof StyleOptions; invert?: boolean; altValue?: string }> = [
    { id: 'tweak-showFingerNumbers',  key: 'showFingerNumbers' },
    { id: 'tweak-showStringLabels',   key: 'showStringLabels' },
    { id: 'tweak-showDegrees',        key: 'showDegrees' },
    { id: 'tweak-leftHanded',         key: 'leftHanded' },
    { id: 'tweak-stringLabelMode',    key: 'stringLabelMode',   altValue: 'notes' },
    { id: 'tweak-stringLabelPosition',key: 'stringLabelPosition', altValue: 'top' },
  ]
  for (const def of toggles) {
    const el = document.getElementById(def.id) as HTMLInputElement | null
    if (!el) continue
    const defaultVal = (DEFAULT_STYLE as Record<string, unknown>)[def.key]
    if (def.altValue) {
      el.checked = defaultVal === def.altValue
    } else {
      el.checked = defaultVal as boolean
    }
    el.addEventListener('change', () => {
      if (def.altValue) {
        ;(style as Record<string, unknown>)[def.key] = el.checked ? def.altValue : (def.key === 'stringLabelMode' ? 'tuning' : 'bottom')
      } else {
        ;(style as Record<string, unknown>)[def.key] = el.checked
      }
      render()
    })
  }
}

function wireFilterStyle() {
  const sel = document.getElementById('tweak-filterStyle') as HTMLSelectElement | null
  if (!sel) return
  sel.value = DEFAULT_STYLE.filterStyle
  sel.addEventListener('change', () => {
    style.filterStyle = sel.value as 'clean' | 'shadow' | 'glow'
    render()
  })
}

function wireCopyTweaks() {
  const btn = document.getElementById('copy-tweaks')
  if (!btn) return
  btn.addEventListener('click', () => {
    const out = JSON.stringify({ ...DEFAULT_STYLE, ...style }, null, 2)
    navigator.clipboard.writeText(out).then(() => {
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = 'Copy tweaks' }, 1500)
    })
  })
}

function wireSections() {
  document.querySelectorAll<HTMLElement>('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.target
      if (!targetId) return
      const content = document.getElementById(targetId)
      if (!content) return
      const isHidden = content.style.display === 'none'
      content.style.display = isHidden ? '' : 'none'
      const icon = header.querySelector('.collapse-icon')
      if (icon) icon.textContent = isHidden ? '▲' : '▼'
    })
  })
}

// ── Init ──────────────────────────────────────────────────────────────────────

wireSliders()
wireColors()
wireToggles()
wireFilterStyle()
wireCopyTweaks()
wireSections()
render()
