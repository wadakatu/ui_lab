const STORAGE_KEY = 'paradox-oracle-saved-v3';
const MAX_SAVED = 24;

const state = {
  h: 22,
  s: 78,
  v: 95,
  a: 1,
  orbitOn: true,
  orbitPhase: 0,
  orbitNodes: [],
  orbitCenter: null,
  saved: [],
  draggingSV: false,
};

const els = {
  svBox: document.getElementById('sv-box'),
  svCanvas: document.getElementById('sv-canvas'),
  svCursor: document.getElementById('sv-cursor'),
  hueRange: document.getElementById('hue-range'),
  alphaRange: document.getElementById('alpha-range'),
  hueValue: document.getElementById('hue-value'),
  alphaValue: document.getElementById('alpha-value'),
  preview: document.getElementById('preview'),
  hexInput: document.getElementById('hex-input'),
  rgbText: document.getElementById('rgb-text'),
  hslText: document.getElementById('hsl-text'),
  tokenText: document.getElementById('token-text'),
  rInput: document.getElementById('r-input'),
  gInput: document.getElementById('g-input'),
  bInput: document.getElementById('b-input'),
  hInput: document.getElementById('h-input'),
  sInput: document.getElementById('s-input'),
  lInput: document.getElementById('l-input'),
  orbitField: document.getElementById('orbit-field'),
  orbitToggle: document.getElementById('orbit-toggle'),
  saveBtn: document.getElementById('save-btn'),
  shuffleBtn: document.getElementById('shuffle-btn'),
  clearBtn: document.getElementById('clear-btn'),
  savedGrid: document.getElementById('saved-grid'),
  toast: document.getElementById('toast'),
};

const svCtx = els.svCanvas.getContext('2d');
let toastTimer = null;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function wrapHue(v) {
  return ((v % 360) + 360) % 360;
}

function hsvToRgb(h, s, v) {
  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hh >= 0 && hh < 1) {
    r1 = c;
    g1 = x;
  } else if (hh < 2) {
    r1 = x;
    g1 = c;
  } else if (hh < 3) {
    g1 = c;
    b1 = x;
  } else if (hh < 4) {
    g1 = x;
    b1 = c;
  } else if (hh < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = val - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHsv(r, g, b) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === nr) h = ((ng - nb) / d) % 6;
    else if (max === ng) h = (nb - nr) / d + 2;
    else h = (nr - ng) / d + 4;
    h *= 60;
  }

  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

function rgbToHsl(r, g, b) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
    else if (max === ng) h = (nb - nr) / d + 2;
    else h = (nr - ng) / d + 4;

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h, s, l) {
  const hue = wrapHue(h) / 360;
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;

  if (sat === 0) {
    const gray = Math.round(lig * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;

  const hueToRgb = (t) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  return {
    r: Math.round(hueToRgb(hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(hue) * 255),
    b: Math.round(hueToRgb(hue - 1 / 3) * 255),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function rgbaToHex8(r, g, b, a) {
  return `${rgbToHex(r, g, b)}${clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0').toUpperCase()}`;
}

function hexToRgba(input) {
  const hex = input.trim().replace(/^#/, '');
  if (![3, 4, 6, 8].includes(hex.length)) return null;

  const normalized = hex.length <= 4 ? hex.split('').map((c) => `${c}${c}`).join('') : hex;
  const rgbHex = normalized.slice(0, 6);
  const alphaHex = normalized.slice(6, 8) || 'FF';

  const r = Number.parseInt(rgbHex.slice(0, 2), 16);
  const g = Number.parseInt(rgbHex.slice(2, 4), 16);
  const b = Number.parseInt(rgbHex.slice(4, 6), 16);
  const a = Number.parseInt(alphaHex, 16) / 255;

  if ([r, g, b].some((v) => Number.isNaN(v)) || Number.isNaN(a)) return null;

  return { r, g, b, a, hasAlpha: hex.length === 4 || hex.length === 8 };
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.remove('visible');
  }, 1000);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  const area = document.createElement('textarea');
  area.value = text;
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  return copied;
}

function syncCanvasSize() {
  const rect = els.svBox.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(220, Math.floor(rect.width));
  const h = Math.max(220, Math.floor(rect.height));

  els.svCanvas.width = w * dpr;
  els.svCanvas.height = h * dpr;
  els.svCanvas.style.width = `${w}px`;
  els.svCanvas.style.height = `${h}px`;
  svCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawSV() {
  const w = els.svCanvas.clientWidth;
  const h = els.svCanvas.clientHeight;

  svCtx.clearRect(0, 0, w, h);
  svCtx.fillStyle = `hsl(${state.h} 100% 50%)`;
  svCtx.fillRect(0, 0, w, h);

  const white = svCtx.createLinearGradient(0, 0, w, 0);
  white.addColorStop(0, '#fff');
  white.addColorStop(1, 'rgba(255,255,255,0)');
  svCtx.fillStyle = white;
  svCtx.fillRect(0, 0, w, h);

  const black = svCtx.createLinearGradient(0, 0, 0, h);
  black.addColorStop(0, 'rgba(0,0,0,0)');
  black.addColorStop(1, '#000');
  svCtx.fillStyle = black;
  svCtx.fillRect(0, 0, w, h);
}

function updateCursor() {
  els.svCursor.style.left = `${state.s}%`;
  els.svCursor.style.top = `${100 - state.v}%`;
}

function currentRgb() {
  return hsvToRgb(state.h, state.s, state.v);
}

function currentCssColor() {
  const { r, g, b } = currentRgb();
  return `rgba(${r} ${g} ${b} / ${Number(state.a.toFixed(2))})`;
}

function harmonySet() {
  const base = { h: state.h, s: clamp(state.s, 32, 96), v: clamp(state.v, 30, 98) };

  const raw = [
    { label: 'Base', h: base.h, s: base.s, v: base.v },
    { label: 'Comp', h: base.h + 180, s: base.s, v: base.v },
    { label: 'A+', h: base.h + 28, s: base.s * 0.9, v: base.v },
    { label: 'A-', h: base.h - 28, s: base.s * 0.9, v: base.v },
    { label: 'T+', h: base.h + 120, s: base.s * 0.86, v: base.v * 0.92 },
    { label: 'T-', h: base.h - 120, s: base.s * 0.86, v: base.v * 0.92 },
  ];

  return raw.map((item) => {
    const rgb = hsvToRgb(wrapHue(item.h), clamp(item.s, 0, 100), clamp(item.v, 0, 100));
    return { ...item, h: wrapHue(item.h), hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
  });
}

function ensureOrbitNodes(count) {
  if (state.orbitNodes.length === count && state.orbitCenter) {
    return;
  }

  els.orbitField.innerHTML = '';
  state.orbitNodes = [];

  for (let i = 0; i < count; i += 1) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'orbit-node';
    state.orbitNodes.push(node);
    els.orbitField.appendChild(node);
  }

  const center = document.createElement('div');
  center.className = 'orbit-center';
  state.orbitCenter = center;
  els.orbitField.appendChild(center);
}

function renderOrbit() {
  const harmonies = harmonySet();
  const rect = els.orbitField.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const radius = Math.min(rect.width, rect.height) * 0.34;

  ensureOrbitNodes(harmonies.length);

  harmonies.forEach((item, i) => {
    const angle = state.orbitPhase + (Math.PI * 2 * i) / harmonies.length;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    const node = state.orbitNodes[i];
    node.dataset.hex = item.hex;
    node.dataset.label = item.label;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.background = item.hex;
    node.setAttribute('aria-label', `${item.label} ${item.hex}`);
  });

  state.orbitCenter.style.left = `${cx}px`;
  state.orbitCenter.style.top = `${cy}px`;
  state.orbitCenter.style.background = currentCssColor();
}

function renderSaved() {
  if (!state.saved.length) {
    els.savedGrid.innerHTML = '<button class="saved-chip empty" type="button" disabled>Empty</button>';
    return;
  }

  els.savedGrid.innerHTML = state.saved
    .map((item) => `<button class="saved-chip" type="button" data-color="${item.hex8}" title="${item.hex8}" style="background:${item.css}"></button>`)
    .join('');
}

function persistSaved() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    state.saved = parsed
      .map((item) => ({ hex8: item.hex8, css: item.css }))
      .filter((item) => typeof item.hex8 === 'string' && typeof item.css === 'string')
      .slice(0, MAX_SAVED);
  } catch {
    state.saved = [];
  }
}

function updateUI({ redraw = false } = {}) {
  if (redraw) drawSV();

  const rgb = currentRgb();
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hex8 = rgbaToHex8(rgb.r, rgb.g, rgb.b, state.a);

  updateCursor();

  els.hueValue.textContent = `${Math.round(state.h)}°`;
  els.alphaValue.textContent = `${Math.round(state.a * 100)}%`;
  els.hueRange.value = String(Math.round(state.h));
  els.alphaRange.value = String(Math.round(state.a * 100));

  els.preview.style.background = currentCssColor();

  els.hexInput.value = state.a < 0.999 ? hex8 : hex;
  els.rgbText.textContent = `rgb(${rgb.r} ${rgb.g} ${rgb.b})`;
  els.hslText.textContent = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
  els.tokenText.textContent = `--color-oracle: ${state.a < 0.999 ? hex8 : hex};`;

  els.rInput.value = String(rgb.r);
  els.gInput.value = String(rgb.g);
  els.bInput.value = String(rgb.b);
  els.hInput.value = String(hsl.h);
  els.sInput.value = String(hsl.s);
  els.lInput.value = String(hsl.l);

  const alphaTrack = `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`;
  els.alphaRange.style.backgroundImage = `${alphaTrack}, linear-gradient(45deg, #ced9e5 25%, transparent 25%), linear-gradient(-45deg, #ced9e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ced9e5 75%), linear-gradient(-45deg, transparent 75%, #ced9e5 75%)`;
  els.alphaRange.style.backgroundSize = '100% 100%, 12px 12px, 12px 12px, 12px 12px, 12px 12px';
  els.alphaRange.style.backgroundPosition = '0 0, 0 0, 0 6px, 6px -6px, -6px 0';

  document.documentElement.style.setProperty('--live', hex);
  document.documentElement.style.setProperty('--live-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

  renderOrbit();
}

function pickSV(clientX, clientY) {
  const rect = els.svCanvas.getBoundingClientRect();
  const x = clamp(clientX - rect.left, 0, rect.width);
  const y = clamp(clientY - rect.top, 0, rect.height);

  state.s = clamp((x / rect.width) * 100, 0, 100);
  state.v = clamp(100 - (y / rect.height) * 100, 0, 100);

  updateUI();
}

function applyHex(input, options = {}) {
  const parsed = hexToRgba(input);
  if (!parsed) {
    updateUI();
    return;
  }

  const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
  state.h = hsv.h;
  state.s = hsv.s;
  state.v = hsv.v;

  const preserveAlpha = Boolean(options.preserveAlpha);
  state.a = preserveAlpha && !parsed.hasAlpha ? state.a : parsed.a;

  updateUI({ redraw: true });
}

function applyRgbInputs() {
  const r = clamp(Number(els.rInput.value), 0, 255);
  const g = clamp(Number(els.gInput.value), 0, 255);
  const b = clamp(Number(els.bInput.value), 0, 255);
  const hsv = rgbToHsv(r, g, b);

  state.h = hsv.h;
  state.s = hsv.s;
  state.v = hsv.v;

  updateUI({ redraw: true });
}

function applyHslInputs() {
  const h = clamp(Number(els.hInput.value), 0, 360);
  const s = clamp(Number(els.sInput.value), 0, 100);
  const l = clamp(Number(els.lInput.value), 0, 100);

  const rgb = hslToRgb(h, s, l);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  state.h = hsv.h;
  state.s = hsv.s;
  state.v = hsv.v;

  updateUI({ redraw: true });
}

function saveCurrent() {
  const { r, g, b } = currentRgb();
  const hex8 = rgbaToHex8(r, g, b, state.a);
  const css = currentCssColor();

  state.saved = state.saved.filter((item) => item.hex8 !== hex8);
  state.saved.unshift({ hex8, css });

  if (state.saved.length > MAX_SAVED) state.saved.length = MAX_SAVED;

  persistSaved();
  renderSaved();
  showToast('Saved');
}

function bindEvents() {
  window.addEventListener('resize', () => {
    syncCanvasSize();
    drawSV();
    updateUI();
  });

  els.svBox.addEventListener('pointerdown', (event) => {
    state.draggingSV = true;
    if (typeof els.svBox.setPointerCapture === 'function') {
      try {
        els.svBox.setPointerCapture(event.pointerId);
      } catch {
        // Ignore if pointer capture is unavailable for this event.
      }
    }
    pickSV(event.clientX, event.clientY);
  });

  els.svBox.addEventListener('pointermove', (event) => {
    if (!state.draggingSV) return;
    pickSV(event.clientX, event.clientY);
  });

  const stopDrag = () => {
    state.draggingSV = false;
  };

  els.svBox.addEventListener('pointerup', stopDrag);
  els.svBox.addEventListener('pointercancel', stopDrag);

  els.svBox.addEventListener('wheel', (event) => {
    event.preventDefault();
    state.v = clamp(state.v - event.deltaY * 0.03, 0, 100);
    updateUI();
  }, { passive: false });

  els.svBox.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 4 : 1;
    let handled = true;

    if (event.key === 'ArrowLeft') state.s = clamp(state.s - step, 0, 100);
    else if (event.key === 'ArrowRight') state.s = clamp(state.s + step, 0, 100);
    else if (event.key === 'ArrowUp') state.v = clamp(state.v + step, 0, 100);
    else if (event.key === 'ArrowDown') state.v = clamp(state.v - step, 0, 100);
    else handled = false;

    if (handled) {
      event.preventDefault();
      updateUI();
    }
  });

  els.hueRange.addEventListener('input', () => {
    state.h = clamp(Number(els.hueRange.value), 0, 360);
    updateUI({ redraw: true });
  });

  els.alphaRange.addEventListener('input', () => {
    state.a = clamp(Number(els.alphaRange.value) / 100, 0, 1);
    updateUI();
  });

  els.hexInput.addEventListener('change', () => applyHex(els.hexInput.value));
  els.hexInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyHex(els.hexInput.value);
    }
  });

  [els.rInput, els.gInput, els.bInput].forEach((input) => input.addEventListener('change', applyRgbInputs));
  [els.hInput, els.sInput, els.lInput].forEach((input) => input.addEventListener('change', applyHslInputs));

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.copy;
      let text = '';
      if (type === 'hex') text = els.hexInput.value;
      if (type === 'rgb') text = els.rgbText.textContent;
      if (type === 'hsl') text = els.hslText.textContent;
      if (type === 'token') text = els.tokenText.textContent;

      copyText(text).then(() => showToast('Copied')).catch(() => showToast('Copy failed'));
    });
  });

  els.orbitField.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const node = event.target.closest('.orbit-node');
    if (!node) return;

    const hex = node.dataset.hex;
    if (!hex) return;
    applyHex(hex, { preserveAlpha: true });
  });

  els.orbitToggle.addEventListener('click', () => {
    state.orbitOn = !state.orbitOn;
    els.orbitToggle.textContent = state.orbitOn ? 'Orbit On' : 'Orbit Off';
    if (state.orbitOn) {
      state.orbitPhase += Math.PI / 9;
      renderOrbit();
    }
    showToast(state.orbitOn ? 'Orbit on' : 'Orbit off');
  });

  els.saveBtn.addEventListener('click', saveCurrent);

  els.shuffleBtn.addEventListener('click', () => {
    state.h = Math.random() * 360;
    updateUI({ redraw: true });
    showToast('Hue shuffled');
  });

  els.clearBtn.addEventListener('click', () => {
    state.saved = [];
    persistSaved();
    renderSaved();
    showToast('Saved cleared');
  });

  els.savedGrid.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const chip = event.target.closest('.saved-chip');
    if (!chip) return;

    const value = chip.dataset.color;
    if (!value) return;
    applyHex(value);
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (event.code === 'Space') {
      event.preventDefault();
      saveCurrent();
      return;
    }

    if (key === 'c') {
      copyText(els.hexInput.value).then(() => showToast('Copied'));
    } else if (key === 'a') {
      state.orbitOn = !state.orbitOn;
      els.orbitToggle.textContent = state.orbitOn ? 'Orbit On' : 'Orbit Off';
      if (state.orbitOn) {
        state.orbitPhase += Math.PI / 9;
        renderOrbit();
      }
      showToast(state.orbitOn ? 'Orbit on' : 'Orbit off');
    }
  });
}

function init() {
  loadSaved();
  renderSaved();
  syncCanvasSize();
  drawSV();
  updateUI();
  bindEvents();
}

init();
