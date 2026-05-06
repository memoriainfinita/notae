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

  // Tuning map
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

  // Build StyleOptions from tweaks
  function getStyleOptions() {
    const opts = {};

    // General
    const chordNameSize = parseFloat(document.getElementById('chordNameSize').value);
    const orientation = document.getElementById('orientation').value;
    const numFrets = parseInt(document.getElementById('numFrets').value);
    const showFingerNumbers = document.getElementById('showFingerNumbers').checked;
    const showDegrees = document.getElementById('showDegrees').checked;
    const leftHanded = document.getElementById('leftHanded').checked;

    if (chordNameSize !== 17) opts.chordNameSize = chordNameSize;
    if (orientation !== 'vertical') opts.orientation = orientation;
    if (numFrets !== 5) opts.numFrets = numFrets;
    if (!showFingerNumbers) opts.showFingerNumbers = false;
    if (showDegrees) opts.showDegrees = true;
    if (leftHanded) opts.leftHanded = true;

    // Display
    const stringSpacing = parseFloat(document.getElementById('stringSpacing').value);
    const fretSpacing = parseFloat(document.getElementById('fretSpacing').value);
    const dotRadius = parseFloat(document.getElementById('dotRadius').value);
    const stringWidth = parseFloat(document.getElementById('stringWidth').value);
    const pianoWhiteKeyW = parseFloat(document.getElementById('pianoWhiteKeyW').value);
    const showStringLabels = document.getElementById('showStringLabels').checked;
    const showPianoNoteLabels = document.getElementById('showPianoNoteLabels').checked;

    if (stringSpacing !== 19) opts.stringSpacing = stringSpacing;
    if (fretSpacing !== 23) opts.fretSpacing = fretSpacing;
    if (dotRadius !== 9) opts.dotRadius = dotRadius;
    if (stringWidth !== 1) opts.stringWidth = stringWidth;
    if (pianoWhiteKeyW !== 28) opts.pianoWhiteKeyW = pianoWhiteKeyW;
    if (!showStringLabels) opts.showStringLabels = false;
    if (!showPianoNoteLabels) opts.showPianoNoteLabels = false;

    // Colors
    const chordNameColor = document.getElementById('chordNameColor').value;
    const dotColor = document.getElementById('dotColor').value;
    const stringColor = document.getElementById('stringColor').value;
    const fretColor = document.getElementById('fretColor').value;
    const pianoWhiteKeyColor = document.getElementById('pianoWhiteKeyColor').value;
    const nutColor = document.getElementById('nutColor').value;

    if (chordNameColor !== '#000000') opts.chordNameColor = chordNameColor;
    if (dotColor !== '#5aaa5a') opts.dotColor = dotColor;
    if (stringColor !== '#aaaaaa') opts.stringColor = stringColor;
    if (fretColor !== '#cccccc') opts.fretColor = fretColor;
    if (pianoWhiteKeyColor !== '#ffffff') opts.pianoWhiteKeyColor = pianoWhiteKeyColor;
    if (nutColor !== '#333333') opts.nutColor = nutColor;

    // Box
    const backgroundColor = document.getElementById('backgroundColor').value;
    const borderColor = document.getElementById('borderColor').value;
    const borderWidth = parseInt(document.getElementById('borderWidth').value);
    const borderRadius = parseInt(document.getElementById('borderRadius').value);
    const diagramPadding = parseInt(document.getElementById('diagramPadding').value);

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
    const filterStyle = document.getElementById('filterStyle').value;
    const shadowColor = document.getElementById('shadowColor').value;
    const shadowX = parseFloat(document.getElementById('shadowX').value);
    const shadowY = parseFloat(document.getElementById('shadowY').value);
    const shadowBlur = parseFloat(document.getElementById('shadowBlur').value);
    const glowColor = document.getElementById('glowColor').value;
    const glowBlur = parseFloat(document.getElementById('glowBlur').value);

    if (filterStyle !== 'clean') opts.filterStyle = filterStyle;
    if (shadowColor !== '#000000') opts.shadowColor = shadowColor;
    if (shadowX !== 2) opts.shadowX = shadowX;
    if (shadowY !== 3) opts.shadowY = shadowY;
    if (shadowBlur !== 2) opts.shadowBlur = shadowBlur;
    if (glowColor !== '#5aaa5a') opts.glowColor = glowColor;
    if (glowBlur !== 2.5) opts.glowBlur = glowBlur;

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
      } else if (renderer === 'bowed') {
        // For bowed, just show error for now — more complex
        showError('Bowed renderer requires strings array. Use fretboard or piano.');
        return;
      } else {
        // Fretboard
        const tuning = getFretboardTuning(tuningKey);
        if (isScale) {
          const full = UMT.getFretboardScale(parsed, tuning);
          const scaleData = Object.assign({ name: symbol.trim() }, full);
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
          diagramEl.innerHTML = Notae.renderFretboard(chordData, opts);
          codeEl.textContent = fmtCode('renderFretboard', chordData, opts);
        }
      }

      clearError();
    } catch (e) {
      showError('Could not parse "' + symbol.trim() + '". Try: Cmaj7, D dorian, Am7, G blues...');
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
    'chordNameSize', 'numFrets', 'stringSpacing', 'fretSpacing', 'dotRadius',
    'stringWidth', 'pianoWhiteKeyW', 'borderWidth', 'borderRadius', 'diagramPadding',
    'shadowX', 'shadowY', 'shadowBlur', 'glowBlur'
  ].forEach(syncInputs);

  // Event listeners
  symbolInput.addEventListener('input', function () {
    render(this.value);
  });

  rendererSelect.addEventListener('change', function () {
    tuningSelect.style.display = this.value === 'fretboard' ? '' : 'none';
    render(symbolInput.value);
  });

  tuningSelect.addEventListener('change', function () {
    render(symbolInput.value);
  });

  // All other input changes trigger re-render
  [
    'showFingerNumbers', 'showDegrees', 'leftHanded', 'showStringLabels', 'showPianoNoteLabels',
    'orientation', 'filterStyle', 'chordNameColor', 'dotColor', 'stringColor', 'fretColor',
    'pianoWhiteKeyColor', 'nutColor', 'borderColor', 'shadowColor', 'glowColor', 'backgroundColor'
  ].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', function () {
        render(symbolInput.value);
      });
    }
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

  // Show tuning select only for fretboard renderer
  tuningSelect.style.display = rendererSelect.value === 'fretboard' ? '' : 'none';

  // Initial render
  symbolInput.value = 'Cmaj7';
  render('Cmaj7');
})();
