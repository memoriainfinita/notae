(function () {
  // Dark mode
  const themeToggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('notae-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('notae-theme', next);
    renderExamples();
    runDemo(demoInput.value);
  });

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

  // UMT piano range helper — snap black key boundaries to adjacent white key
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

  // Tuning map — same key names as the POC
  const TUNING_MAP = {
    guitar: 'GUITAR_STANDARD',
    dropD: 'GUITAR_DROPPED_D',
    openG: 'GUITAR_OPEN_G',
    ukulele: 'UKULELE_STANDARD',
    bass: 'BASS_STANDARD',
  };

  function getFretboardTuning(key) {
    return UMT[TUNING_MAP[key]] ?? UMT.GUITAR_STANDARD;
  }

  // Static examples
  function renderExamples() {
    const ts = themeStyle();

    // Fretboard — barre chord
    document.getElementById('ex-fret-barre').innerHTML = Notae.renderFretboard({
      name: 'F major',
      frets: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fret: 1, startString: 1, endString: 6 }],
      tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      root: 'F',
    }, ts);

    // Fretboard — per-dot colors
    document.getElementById('ex-fret-colors').innerHTML = Notae.renderFretboard({
      name: 'G major',
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      root: 'G',
      colors: ['#cc2244', '#4466cc', null, null, '#4466cc', '#cc2244'],
    }, ts);

    // Fretboard — scale position horizontal
    document.getElementById('ex-fret-scale-h').innerHTML = Notae.renderFretboard(
      {
        name: 'Am pentatonic pos.5',
        frets: [[5, 8], [5, 7], [5, 7], [5, 7], [5, 8], [5, 8]],
        tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        baseFret: 5,
        root: 'A',
      },
      Object.assign({ numFrets: 4, orientation: 'horizontal' }, ts)
    );

    // Fretboard — high position with baseFret
    document.getElementById('ex-fret-basefret').innerHTML = Notae.renderFretboard({
      name: 'Dm7',
      frets: [-1, 5, 7, 5, 6, 5],
      fingers: [0, 1, 3, 1, 2, 1],
      baseFret: 5,
      barres: [{ fret: 5, startString: 2, endString: 6 }],
      tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      root: 'D',
    }, ts);

    // Fretboard — banjo (stringOffset drone string)
    document.getElementById('ex-fret-banjo').innerHTML = Notae.renderFretboard({
      name: 'G',
      frets: [5, 0, 0, 0, 0],
      fingers: [0, 0, 0, 0, 0],
      tuning: ['G', 'D', 'G', 'B', 'D'],
      stringOffset: [5, 0, 0, 0, 0],
      root: 'G',
    }, ts);

    // Fretboard — bass
    document.getElementById('ex-fret-bass').innerHTML = Notae.renderFretboard({
      name: 'E5',
      frets: [0, 2, 2, -1],
      fingers: [0, 1, 2, 0],
      tuning: ['E', 'A', 'D', 'G'],
      root: 'E',
    }, ts);

    // Fretboard — 7-string with shadow filter
    document.getElementById('ex-fret-7string').innerHTML = Notae.renderFretboard({
      name: 'F major',
      frets: [-1, 1, 3, 3, 2, 1, 1],
      fingers: [0, 1, 3, 4, 2, 1, 1],
      barres: [{ fret: 1, startString: 2, endString: 7 }],
      tuning: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
      root: 'F',
    }, Object.assign({ filterStyle: 'shadow', shadowX: 2, shadowY: 3, shadowBlur: 3, shadowOpacity: 0.3 }, ts));

    // Piano — basic chord with fingers
    const pianoMed = Object.assign({ pianoWhiteKeyW: 24, pianoWhiteKeyH: 115, pianoDotRadius: 7, pianoNoteLabelSize: 10 }, ts);
    document.getElementById('ex-piano-basic').innerHTML = Notae.renderPiano({
      name: 'Cmaj7',
      keys: ['C4', 'E4', 'G4', 'B4'],
      fingers: [1, 2, 3, 5],
      root: 'C',
    }, pianoMed);

    // Piano — scale 2 octaves
    document.getElementById('ex-piano-scale').innerHTML = Notae.renderPiano(
      {
        name: 'Am blues',
        keys: ['A3', 'C4', 'D4', 'Eb4', 'E4', 'G4', 'A4', 'C5', 'D5', 'Eb5', 'E5', 'G5'],
        root: 'A',
        range: { from: 'A3', to: 'G5' },
      },
      pianoMed
    );

    // Piano — per-key colors with degrees
    document.getElementById('ex-piano-colors').innerHTML = Notae.renderPiano(
      {
        name: 'F# harm. minor',
        keys: [
          'F#3', 'G#3', 'A3', 'B3', 'C#4', 'D4', 'F4',
          'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D5', 'F5',
        ],
        colors: [
          '#cc2244', null, '#4466cc', null, '#5aaa5a', null, null,
          '#cc2244', null, '#4466cc', null, '#5aaa5a', null, null,
        ],
        root: 'F#',
        range: { from: 'F3', to: 'F#5' },
      },
      Object.assign({ showDegrees: true }, pianoMed)
    );

    // Bowed — G major scale violin
    document.getElementById('ex-bowed-scale').innerHTML = Notae.renderBowed({
      name: 'G major',
      strings: [[0, 2, 4, 5], [0, 2, 4, 5], [0, 2, 3, 5], [0, 2, 3, 5]],
      numSlots: 5,
      tuning: ['G', 'D', 'A', 'E'],
      position: 1,
      root: 'G',
    }, ts);

    // Bowed — position chord horizontal
    document.getElementById('ex-bowed-pos-h').innerHTML = Notae.renderBowed(
      {
        name: 'D',
        strings: [3, 2, 1, null],
        fingers: [3, 2, 1, null],
        tuning: ['G', 'D', 'A', 'E'],
        position: 3,
        root: 'D',
      },
      Object.assign({ orientation: 'horizontal' }, ts)
    );

    // Bowed — cello
    document.getElementById('ex-bowed-cello').innerHTML = Notae.renderBowed({
      name: 'C',
      strings: [0, 0, 1, null],
      fingers: [null, null, 1, null],
      tuning: ['C', 'G', 'D', 'A'],
      position: 1,
      root: 'C',
    }, ts);
  }

  // Interactive demo
  const demoInput = document.getElementById('demo-input');
  const rendererSel = document.getElementById('demo-renderer');
  const tuningSel = document.getElementById('demo-tuning');
  const diagramEl = document.getElementById('demo-diagram');
  const codeEl = document.getElementById('demo-code');
  const errorEl = document.getElementById('demo-error');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    diagramEl.innerHTML = '';
    codeEl.textContent = '// Fix the input above to see the code';
  }

  function clearError() {
    errorEl.hidden = true;
  }

  function fmtCode(fn, data, opts) {
    const dataStr = JSON.stringify(data, null, 2);
    if (opts) {
      return 'const svg = Notae.' + fn + '(\n' + dataStr + ',\n' + JSON.stringify(opts, null, 2) + '\n);';
    }
    return 'const svg = Notae.' + fn + '(' + dataStr + ');';
  }

  function runDemo(symbol) {
    if (!symbol.trim()) {
      diagramEl.innerHTML = '';
      codeEl.textContent = '// Type a symbol above';
      clearError();
      return;
    }

    const renderer = rendererSel.value;
    const tuningKey = tuningSel.value;

    try {
      let parsed = null;
      let isScale = false;

      // Try chord first, fall back to scale
      try {
        parsed = UMT.parseChordSymbol(symbol.trim());
      } catch (_) {
        parsed = UMT.parseScaleSymbol(symbol.trim());
        isScale = true;
      }

      const rootName = parsed.getNotes()[0]?.name.replace(/\d+$/, '') ?? '';

      const ts = themeStyle();
      if (renderer === 'piano') {
        const notes = parsed.getNotes();
        const keys = notes.map(function (n) { return n.name; });
        const range = umtRange(notes);
        const chordData = { name: symbol.trim(), keys: keys, root: rootName, range: range };
        diagramEl.innerHTML = Notae.renderPiano(chordData, ts);
        codeEl.textContent = fmtCode('renderPiano', chordData);
      } else {
        // Fretboard
        const tuning = getFretboardTuning(tuningKey);
        if (isScale) {
          const full = UMT.getFretboardScale(parsed, tuning);
          const scaleData = Object.assign({ name: symbol.trim() }, full);
          diagramEl.innerHTML = Notae.renderFretboard(scaleData, Object.assign({ numFrets: 12 }, ts));
          codeEl.textContent = fmtCode('renderFretboard', scaleData, { numFrets: 12 });
        } else {
          const voicings = UMT.getFretboardVoicings(parsed, tuning);
          if (!voicings || voicings.length === 0) {
            showError('No voicings found for "' + symbol.trim() + '".');
            return;
          }
          const chordData = Object.assign({ name: symbol.trim() }, voicings[0]);
          diagramEl.innerHTML = Notae.renderFretboard(chordData, ts);
          codeEl.textContent = fmtCode('renderFretboard', chordData);
        }
      }

      clearError();
    } catch (e) {
      showError('Could not parse "' + symbol.trim() + '". Try: Cmaj7, D dorian, Am7, G blues...');
    }
  }

  // Hide/show tuning select based on renderer
  function syncTuningVisibility() {
    tuningSel.style.display = rendererSel.value === 'fretboard' ? '' : 'none';
  }

  let debounceTimer = null;
  function scheduleRender() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { runDemo(demoInput.value); }, 380);
  }

  demoInput.addEventListener('input', scheduleRender);
  rendererSel.addEventListener('change', function () {
    syncTuningVisibility();
    runDemo(demoInput.value);
  });
  tuningSel.addEventListener('change', function () { runDemo(demoInput.value); });

  // Copy CDN button
  document.getElementById('copy-cdn').addEventListener('click', function () {
    const code = document.getElementById('cdn-code').textContent;
    const btn = this;
    navigator.clipboard.writeText(code).then(function () {
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
    });
  });

  // Init
  renderExamples();
  syncTuningVisibility();
  demoInput.value = 'Cmaj7';
  runDemo('Cmaj7');
})();
