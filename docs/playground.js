(function () {
  // Dark mode
  const saved = localStorage.getItem('notae-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('notae-theme', next);
      render(symbolInput.value);
    });
  }

  // Elements
  const symbolInput = document.getElementById('symbol-input');
  const rendererSelect = document.getElementById('renderer-select');
  const tuningSelect = document.getElementById('tuning-select');
  const diagramEl = document.getElementById('diagram');
  const codeEl = document.getElementById('code');
  const errorEl = document.getElementById('error');
  const copyCodeBtn = document.getElementById('copy-code');

  // Tuning map (UMT keys or local arrays; semitones from A4=0)
  const BOWED_TUNINGS = {
    violin: { tuning: [-14, -7, 0, 7],  labels: ['G', 'D', 'A', 'E'] },
    viola:  { tuning: [-21, -14, -7, 0], labels: ['C', 'G', 'D', 'A'] },
    cello:  { tuning: [-33, -26, -19, -12], labels: ['C', 'G', 'D', 'A'] },
  };

  const TUNING_MAP = {
    guitar: 'GUITAR_STANDARD',
    dropD: 'GUITAR_DROPPED_D',
    openG: 'GUITAR_OPEN_G',
    ukulele: 'UKULELE_STANDARD',
    bass: 'BASS_STANDARD',
    banjo: 'BANJO_OPEN_G',
  };

  function getFretboardTuning(key) {
    return UMT[TUNING_MAP[key]] ?? UMT.GUITAR_STANDARD;
  }

  function isBowedTuning(key) {
    return key in BOWED_TUNINGS;
  }

  // Custom tuning parser: "E2 A2 D3 G3 B3 E4" -> semitone offsets from A4=0
  const NOTE_CLASSES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteToSemitone(name) {
    const m = name.match(/^([A-G])(#|b)?(\d+)$/i);
    if (!m) return null;
    const base = NOTE_CLASSES[m[1].toUpperCase()];
    const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    const midi = base + acc + (parseInt(m[3]) + 1) * 12;
    return midi - 69;
  }
  function parseCustomTuning(str) {
    const notes = str.trim().split(/\s+/);
    const semitones = notes.map(noteToSemitone);
    return semitones.every(function (s) { return s !== null; }) ? semitones : null;
  }

  // UMT piano range helper
  const BLACK_SEMI = new Set([1, 3, 6, 8, 10]);
  function isBlack(note) {
    return BLACK_SEMI.has(((57 + note.stepsFromBase) % 12 + 12) % 12);
  }
  function umtRange(notes) {
    const first = notes[0];
    const last = notes[notes.length - 1];
    return {
      from: isBlack(first) ? first.transpose(-1).name : first.name,
      to: isBlack(last) ? last.transpose(1).name : last.name,
    };
  }

  // Theme style
  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function themeStyle() {
    if (!isDark()) return {};
    return {
      chordNameColor: '#e0e0e0',
      nutColor: '#aaaaaa',
      fretLabelColor: '#999999',
      stringLabelColor: '#888888',
      pianoWhiteKeyStrokeColor: '#555555',
      shadowColor: '#888888',
    };
  }

  function v(id) { return document.getElementById(id).value; }
  function vf(id) { return parseFloat(v(id)); }
  function vi(id) { return parseInt(v(id)); }
  function vb(id) { return document.getElementById(id).checked; }

  // Build StyleOptions from tweaks
  function getStyleOptions() {
    const opts = {};

    // General
    if (vf('chordNameSize') !== 17) opts.chordNameSize = vf('chordNameSize');
    if (v('orientation') !== 'vertical') opts.orientation = v('orientation');
    if (vi('chordNameY') !== 30) opts.chordNameY = vi('chordNameY');
    if (vi('chordNameGap') !== 11) opts.chordNameGap = vi('chordNameGap');
    if (vi('chordNameGapH') !== 32) opts.chordNameGapH = vi('chordNameGapH');
    if (vi('chordNameGapP') !== 17) opts.chordNameGapP = vi('chordNameGapP');
    if (!vb('showFingerNumbers')) opts.showFingerNumbers = false;
    if (vb('showDegrees')) opts.showDegrees = true;
    if (vb('leftHanded')) opts.leftHanded = true;

    // Fretboard
    if (vi('numFrets') !== 5) opts.numFrets = vi('numFrets');
    if (vf('stringSpacing') !== 19) opts.stringSpacing = vf('stringSpacing');
    if (vf('fretSpacing') !== 23) opts.fretSpacing = vf('fretSpacing');
    if (vf('dotRadius') !== 9) opts.dotRadius = vf('dotRadius');
    if (vf('stringWidth') !== 1) opts.stringWidth = vf('stringWidth');
    if (vf('fretWidth') !== 1) opts.fretWidth = vf('fretWidth');
    if (vi('nutWidth') !== 4) opts.nutWidth = vi('nutWidth');
    if (vi('indicatorSize') !== 4) opts.indicatorSize = vi('indicatorSize');
    if (vi('indicatorZoneSize') !== 18) opts.indicatorZoneSize = vi('indicatorZoneSize');
    if (vi('fretLabelSize') !== 11) opts.fretLabelSize = vi('fretLabelSize');
    if (vi('fretLabelGap') !== 20) opts.fretLabelGap = vi('fretLabelGap');
    if (vi('fretLabelGapH') !== 8) opts.fretLabelGapH = vi('fretLabelGapH');
    if (vi('stringLabelSize') !== 11) opts.stringLabelSize = vi('stringLabelSize');
    if (vi('stringLabelGap') !== 4) opts.stringLabelGap = vi('stringLabelGap');
    if (v('stringLabelMode') !== 'tuning') opts.stringLabelMode = v('stringLabelMode');
    if (v('stringLabelPosition') !== 'bottom') opts.stringLabelPosition = v('stringLabelPosition');
    if (vi('bowedTickSize') !== 5) opts.bowedTickSize = vi('bowedTickSize');
    if (!vb('showStringLabels')) opts.showStringLabels = false;

    // Piano
    if (vf('pianoWhiteKeyW') !== 28) opts.pianoWhiteKeyW = vf('pianoWhiteKeyW');
    if (vi('pianoWhiteKeyH') !== 137) opts.pianoWhiteKeyH = vi('pianoWhiteKeyH');
    if (vi('pianoWhiteKeyRadius') !== 3) opts.pianoWhiteKeyRadius = vi('pianoWhiteKeyRadius');
    if (vf('pianoBlackKeyWidthRatio') !== 0.58) opts.pianoBlackKeyWidthRatio = vf('pianoBlackKeyWidthRatio');
    if (vf('pianoBlackKeyHeightRatio') !== 0.62) opts.pianoBlackKeyHeightRatio = vf('pianoBlackKeyHeightRatio');
    if (vf('pianoBlackKeyShift') !== 0.22) opts.pianoBlackKeyShift = vf('pianoBlackKeyShift');
    if (vi('pianoBlackKeyRadius') !== 2) opts.pianoBlackKeyRadius = vi('pianoBlackKeyRadius');
    if (vf('pianoKeyStrokeWidth') !== 1) opts.pianoKeyStrokeWidth = vf('pianoKeyStrokeWidth');
    if (vi('pianoDotRadius') !== 7) opts.pianoDotRadius = vi('pianoDotRadius');
    if (vi('pianoWhiteDotOffset') !== 5) opts.pianoWhiteDotOffset = vi('pianoWhiteDotOffset');
    if (vi('pianoBlackDotOffset') !== 4) opts.pianoBlackDotOffset = vi('pianoBlackDotOffset');
    if (vi('pianoNoteLabelSize') !== 11) opts.pianoNoteLabelSize = vi('pianoNoteLabelSize');
    if (vi('pianoNoteLabelOffset') !== 6) opts.pianoNoteLabelOffset = vi('pianoNoteLabelOffset');
    if (vi('pianoNoteLabelGap') !== 4) opts.pianoNoteLabelGap = vi('pianoNoteLabelGap');
    if (v('pianoNoteLabelPosition') !== 'bottom') opts.pianoNoteLabelPosition = v('pianoNoteLabelPosition');
    if (!vb('showPianoNoteLabels')) opts.showPianoNoteLabels = false;

    // Colors
    if (v('chordNameColor') !== '#000000') opts.chordNameColor = v('chordNameColor');
    if (v('dotColor') !== '#5aaa5a') opts.dotColor = v('dotColor');
    if (v('dotTextColor') !== '#ffffff') opts.dotTextColor = v('dotTextColor');
    if (v('barreColor') !== '#5aaa5a') opts.barreColor = v('barreColor');
    if (v('activeKeyColor') !== '#5aaa5a') opts.activeKeyColor = v('activeKeyColor');
    if (v('stringColor') !== '#aaaaaa') opts.stringColor = v('stringColor');
    if (v('fretColor') !== '#cccccc') opts.fretColor = v('fretColor');
    if (v('nutColor') !== '#333333') opts.nutColor = v('nutColor');
    if (v('indicatorColor') !== '#555555') opts.indicatorColor = v('indicatorColor');
    if (v('fretLabelColor') !== '#555555') opts.fretLabelColor = v('fretLabelColor');
    if (v('stringLabelColor') !== '#999999') opts.stringLabelColor = v('stringLabelColor');
    if (v('pianoWhiteKeyColor') !== '#ffffff') opts.pianoWhiteKeyColor = v('pianoWhiteKeyColor');
    if (v('pianoBlackKeyColor') !== '#222222') opts.pianoBlackKeyColor = v('pianoBlackKeyColor');
    if (v('pianoWhiteKeyStrokeColor') !== '#bbbbbb') opts.pianoWhiteKeyStrokeColor = v('pianoWhiteKeyStrokeColor');
    if (v('pianoBlackKeyStrokeColor') !== '#222222') opts.pianoBlackKeyStrokeColor = v('pianoBlackKeyStrokeColor');
    if (v('pianoBlackKeyLabelColor') !== '#555555') opts.pianoBlackKeyLabelColor = v('pianoBlackKeyLabelColor');

    // Box
    const backgroundColor = v('backgroundColor');
    const borderColor = v('borderColor');
    const borderWidth = vi('borderWidth');
    const borderRadius = vi('borderRadius');
    const diagramPadding = vi('diagramPadding');

    if (backgroundColor !== 'transparent') opts.backgroundColor = backgroundColor;
    if (borderWidth !== 0) {
      opts.borderWidth = borderWidth;
      opts.borderColor = borderColor;
    } else if (borderColor !== '#000000') {
      opts.borderColor = borderColor;
    }
    if (borderRadius !== 0) opts.borderRadius = borderRadius;
    if (diagramPadding !== 0) opts.diagramPadding = diagramPadding;

    // Filter
    if (v('filterStyle') !== 'clean') opts.filterStyle = v('filterStyle');
    if (v('shadowColor') !== '#000000') opts.shadowColor = v('shadowColor');
    if (vf('shadowX') !== 2) opts.shadowX = vf('shadowX');
    if (vf('shadowY') !== 3) opts.shadowY = vf('shadowY');
    if (vf('shadowBlur') !== 2) opts.shadowBlur = vf('shadowBlur');
    if (vf('shadowOpacity') !== 0.25) opts.shadowOpacity = vf('shadowOpacity');
    if (v('glowColor') !== '#5aaa5a') opts.glowColor = v('glowColor');
    if (vf('glowBlur') !== 2.5) opts.glowBlur = vf('glowBlur');
    if (vf('glowOpacity') !== 0.8) opts.glowOpacity = vf('glowOpacity');

    // Merge theme overrides
    return Object.assign(opts, themeStyle());
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    diagramEl.innerHTML = '';
    codeEl.textContent = '// Error above';
  }

  function clearError() {
    errorEl.hidden = true;
  }

  function fmtCode(fn, data, opts) {
    const dataStr = JSON.stringify(data, null, 2);
    if (Object.keys(opts).length === 0) {
      return 'const svg = Notae.' + fn + '(\n' + dataStr + '\n);';
    }
    return 'const svg = Notae.' + fn + '(\n' + dataStr + ',\n' + JSON.stringify(opts, null, 2) + '\n);';
  }

  function render(symbol) {
    if (!symbol.trim()) {
      diagramEl.innerHTML = '';
      codeEl.textContent = '// Type a symbol above';
      clearError();
      return;
    }

    const renderer = rendererSelect.value;
    const tuningKey = tuningSelect.value;
    const styleOpts = getStyleOptions();

    try {
      let parsed = null;
      let isScale = false;

      try {
        parsed = UMT.parseChordSymbol(symbol.trim());
      } catch (_) {
        parsed = UMT.parseScaleSymbol(symbol.trim());
        isScale = true;
      }

      const rootName = parsed.getNotes()[0]?.name.replace(/\d+$/, '') ?? '';
      const opts = Object.assign({}, styleOpts);

      if (renderer === 'piano') {
        const notes = parsed.getNotes();
        const keys = notes.map(function (n) { return n.name; });
        const range = umtRange(notes);
        const chordData = { name: symbol.trim(), keys: keys, root: rootName, range: range };
        diagramEl.innerHTML = Notae.renderPiano(chordData, opts);
        codeEl.textContent = fmtCode('renderPiano', chordData, opts);
      } else if (renderer === 'bowed' || isBowedTuning(tuningKey)) {
        // Bowed: use bowed tuning selected in the dropdown (or violin if renderer forced)
        const bowedKey = isBowedTuning(tuningKey) ? tuningKey : 'violin';
        let tuning, labels;
        if (tuningKey === 'custom') {
          tuning = parseCustomTuning(customTuningInput.value);
          if (!tuning || tuning.length < 2) {
            showError('Enter a valid custom tuning, e.g. G3 D4 A4 E5');
            return;
          }
          labels = tuning.map(function (_, i) { return customTuningInput.value.trim().split(/\s+/)[i].replace(/\d+$/, ''); });
        } else {
          tuning = BOWED_TUNINGS[bowedKey].tuning;
          labels = BOWED_TUNINGS[bowedKey].labels;
        }
        function fretsToStrings(frets) {
          return frets.map(function (f) { return f === -1 ? null : f; });
        }
        if (isScale) {
          const full = UMT.getFretboardScale(parsed, tuning);
          const chordData = { name: symbol.trim(), strings: fretsToStrings(full.frets), tuning: labels, root: rootName };
          opts.numFrets = 12;
          diagramEl.innerHTML = Notae.renderBowed(chordData, opts);
          codeEl.textContent = fmtCode('renderBowed', chordData, opts);
        } else {
          const voicings = UMT.getFretboardVoicings(parsed, tuning);
          if (!voicings || voicings.length === 0) {
            showError('No voicings found for "' + symbol.trim() + '".');
            return;
          }
          const v = voicings[0];
          const chordData = { name: symbol.trim(), strings: fretsToStrings(v.frets), tuning: labels, root: rootName, position: v.baseFret > 1 ? v.baseFret : undefined };
          diagramEl.innerHTML = Notae.renderBowed(chordData, opts);
          codeEl.textContent = fmtCode('renderBowed', chordData, opts);
        }
      } else {
        // Fretboard
        let tuning;
        if (tuningKey === 'custom') {
          tuning = parseCustomTuning(customTuningInput.value);
          if (!tuning || tuning.length < 2) {
            showError('Enter a valid custom tuning, e.g. E2 A2 D3 G3 B3 E4');
            return;
          }
        } else {
          tuning = getFretboardTuning(tuningKey);
        }
        const banjoOffset = tuningKey === 'banjo' ? [5, 0, 0, 0, 0] : null;
        const numStrings = tuning.length;
        if (isScale) {
          const full = UMT.getFretboardScale(parsed, tuning);
          const scaleData = Object.assign({ name: symbol.trim() }, full);
          scaleData.frets = scaleData.frets.slice(0, numStrings);
          if (banjoOffset) scaleData.stringOffset = banjoOffset;
          opts.numFrets = 12;
          diagramEl.innerHTML = Notae.renderFretboard(scaleData, opts);
          codeEl.textContent = fmtCode('renderFretboard', scaleData, opts);
        } else {
          const voicings = UMT.getFretboardVoicings(parsed, tuning);
          if (!voicings || voicings.length === 0) {
            showError('No voicings found for "' + symbol.trim() + '".');
            return;
          }
          const chordData = Object.assign({ name: symbol.trim() }, voicings[0]);
          chordData.frets = chordData.frets.slice(0, numStrings);
          if (banjoOffset) chordData.stringOffset = banjoOffset;
          diagramEl.innerHTML = Notae.renderFretboard(chordData, opts);
          codeEl.textContent = fmtCode('renderFretboard', chordData, opts);
        }
      }

      clearError();
    } catch (e) {
      showError('Could not parse "' + symbol.trim() + '". Try: Cmaj7, Am7, G · C major, D dorian, F# blues, Bb harmonic minor');
    }
  }

  // Sync range ↔ number inputs
  function syncInputs(baseId) {
    const rangeEl = document.getElementById(baseId);
    const numEl = document.getElementById(baseId + '-num');

    if (rangeEl && numEl) {
      rangeEl.addEventListener('input', function () {
        numEl.value = rangeEl.value;
        render(symbolInput.value);
      });
      numEl.addEventListener('change', function () {
        rangeEl.value = numEl.value;
        render(symbolInput.value);
      });
    }
  }

  [
    // General
    'chordNameSize', 'chordNameY', 'chordNameGap', 'chordNameGapH', 'chordNameGapP',
    // Fretboard
    'numFrets', 'stringSpacing', 'fretSpacing', 'dotRadius', 'stringWidth', 'fretWidth',
    'nutWidth', 'indicatorSize', 'indicatorZoneSize',
    'fretLabelSize', 'fretLabelGap', 'fretLabelGapH',
    'stringLabelSize', 'stringLabelGap', 'bowedTickSize',
    // Piano
    'pianoWhiteKeyW', 'pianoWhiteKeyH', 'pianoWhiteKeyRadius',
    'pianoBlackKeyWidthRatio', 'pianoBlackKeyHeightRatio', 'pianoBlackKeyShift', 'pianoBlackKeyRadius',
    'pianoKeyStrokeWidth', 'pianoDotRadius', 'pianoWhiteDotOffset', 'pianoBlackDotOffset',
    'pianoNoteLabelSize', 'pianoNoteLabelOffset', 'pianoNoteLabelGap',
    // Box
    'borderWidth', 'borderRadius', 'diagramPadding',
    // Filter
    'shadowX', 'shadowY', 'shadowBlur', 'shadowOpacity', 'glowBlur', 'glowOpacity',
  ].forEach(syncInputs);

  // Event listeners
  symbolInput.addEventListener('input', function () {
    render(this.value);
  });

  const customTuningInput = document.getElementById('custom-tuning-input');

  const FRETBOARD_OPTIONS = [
    { value: 'guitar', label: 'Guitar (standard)' },
    { value: 'dropD',  label: 'Guitar (drop D)' },
    { value: 'openG',  label: 'Guitar (open G)' },
    { value: 'ukulele', label: 'Ukulele' },
    { value: 'bass',   label: 'Bass' },
    { value: 'banjo',  label: 'Banjo (open G)' },
    { value: 'custom', label: 'Custom...' },
  ];
  const BOWED_OPTIONS = [
    { value: 'violin', label: 'Violin' },
    { value: 'viola',  label: 'Viola' },
    { value: 'cello',  label: 'Cello' },
    { value: 'custom', label: 'Custom...' },
  ];

  function updateTuningOptions(renderer) {
    const opts = renderer === 'bowed' ? BOWED_OPTIONS : FRETBOARD_OPTIONS;
    tuningSelect.innerHTML = opts.map(function (o) {
      return '<option value="' + o.value + '">' + o.label + '</option>';
    }).join('');
    const hide = renderer === 'piano';
    tuningSelect.style.display = hide ? 'none' : '';
    customTuningInput.style.display = 'none';
  }

  rendererSelect.addEventListener('change', function () {
    updateTuningOptions(this.value);
    render(symbolInput.value);
  });

  tuningSelect.addEventListener('change', function () {
    customTuningInput.style.display = this.value === 'custom' ? '' : 'none';
    render(symbolInput.value);
  });

  customTuningInput.addEventListener('input', function () {
    render(symbolInput.value);
  });

  // All other input changes trigger re-render
  [
    // Checkboxes
    'showFingerNumbers', 'showDegrees', 'leftHanded', 'showStringLabels', 'showPianoNoteLabels',
    // Selects
    'orientation', 'filterStyle', 'stringLabelMode', 'stringLabelPosition',
    'pianoNoteLabelPosition',
    // Colors
    'chordNameColor', 'dotColor', 'dotTextColor', 'barreColor', 'activeKeyColor',
    'stringColor', 'fretColor', 'nutColor', 'indicatorColor', 'fretLabelColor', 'stringLabelColor',
    'pianoWhiteKeyColor', 'pianoBlackKeyColor', 'pianoWhiteKeyStrokeColor',
    'pianoBlackKeyStrokeColor', 'pianoBlackKeyLabelColor',
    'borderColor', 'shadowColor', 'glowColor',
    // Text inputs
    'backgroundColor',
  ].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', function () {
        render(symbolInput.value);
      });
    }
  });

  // Example chips
  document.querySelectorAll('.example-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      symbolInput.value = this.dataset.symbol;
      render(this.dataset.symbol);
    });
  });

  // Tweaks tabs
  document.querySelectorAll('.tweaks-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      const tabName = this.dataset.tab;
      document.querySelectorAll('.tweaks-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      document.querySelectorAll('.tweaks-content').forEach(function (content) {
        content.classList.remove('active');
      });
      this.classList.add('active');
      document.getElementById('tweaks-' + tabName).classList.add('active');
    });
  });

  // Copy code
  copyCodeBtn.addEventListener('click', function () {
    const code = codeEl.textContent;
    navigator.clipboard.writeText(code).then(function () {
      const oldText = copyCodeBtn.textContent;
      copyCodeBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyCodeBtn.textContent = oldText;
      }, 1500);
    });
  });

  updateTuningOptions(rendererSelect.value);

  // Initial render
  symbolInput.value = 'Cmaj7';
  render('Cmaj7');
})();
