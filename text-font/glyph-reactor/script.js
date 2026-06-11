const stage = document.getElementById('reactorStage');
const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');
const glyphField = document.getElementById('glyphField');
const cursorCore = document.getElementById('cursorCore');
const phraseInput = document.getElementById('phraseInput');
const glyphCount = document.getElementById('glyphCount');
const systemStatus = document.getElementById('systemStatus');
const modeReadout = document.getElementById('modeReadout');
const energyReadout = document.getElementById('energyReadout');
const pointerReadout = document.getElementById('pointerReadout');
const selectedGlyph = document.getElementById('selectedGlyph');
const selectedIndex = document.getElementById('selectedIndex');
const codePoint = document.getElementById('codePoint');
const selectedMass = document.getElementById('selectedMass');
const selectedWidth = document.getElementById('selectedWidth');
const selectedAngle = document.getElementById('selectedAngle');
const cssOutput = document.getElementById('cssOutput');
const copyStatus = document.getElementById('copyStatus');
const copyCssButton = document.getElementById('copyCssButton');
const miniMap = document.getElementById('miniMap');
const freezeButton = document.getElementById('freezeButton');
const igniteButton = document.getElementById('igniteButton');

const axisInputs = {
  size: document.getElementById('sizeAxis'),
  weight: document.getElementById('weightAxis'),
  width: document.getElementById('widthAxis'),
  tracking: document.getElementById('trackingAxis'),
  gravity: document.getElementById('gravityAxis'),
  turbulence: document.getElementById('turbulenceAxis'),
  rhythm: document.getElementById('rhythmAxis'),
};

const axisOutputs = {
  size: document.getElementById('sizeAxisValue'),
  weight: document.getElementById('weightAxisValue'),
  width: document.getElementById('widthAxisValue'),
  tracking: document.getElementById('trackingAxisValue'),
  gravity: document.getElementById('gravityAxisValue'),
  turbulence: document.getElementById('turbulenceAxisValue'),
  rhythm: document.getElementById('rhythmAxisValue'),
};

const fontStacks = {
  grotesk: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  editorial: 'Didot, "Bodoni 72", Georgia, serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  system: 'ui-sans-serif, system-ui, sans-serif',
};

const state = {
  text: phraseInput.value,
  font: 'grotesk',
  mode: 'orbit',
  size: 46,
  weight: 720,
  width: 108,
  tracking: 6,
  gravity: 68,
  turbulence: 44,
  rhythm: 58,
  selected: 0,
  frozen: false,
  pointer: { x: 0.5, y: 0.5, active: false, flux: 0 },
};

const metrics = {
  width: 1,
  height: 1,
  dpr: 1,
};

let glyphs = [];
let miniDots = [];
let positions = [];
let lastTime = 0;
let energy = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function padNumber(value, size = 2) {
  return String(value).padStart(size, '0');
}

function normalizeAngle(angle) {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

function setCanvasSize() {
  const rect = stage.getBoundingClientRect();
  metrics.width = Math.max(1, rect.width);
  metrics.height = Math.max(1, rect.height);
  metrics.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(metrics.width * metrics.dpr);
  canvas.height = Math.round(metrics.height * metrics.dpr);
  canvas.style.width = `${metrics.width}px`;
  canvas.style.height = `${metrics.height}px`;
  ctx.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
  if (!state.pointer.active) {
    state.pointer.x = metrics.width * 0.56;
    state.pointer.y = metrics.height * 0.48;
  }
  updateCursorCore();
}

function getVisibleGlyphs(text) {
  const source = Array.from(text.replace(/\s+$/g, ''));
  const fallback = Array.from('Glyph Reactor');
  return (source.length ? source : fallback).slice(0, 160);
}

function renderGlyphs() {
  glyphField.replaceChildren();
  miniMap.replaceChildren();
  glyphs = [];
  miniDots = [];
  positions = [];

  const chars = getVisibleGlyphs(state.text);
  chars.forEach((char, index) => {
    const glyph = document.createElement('span');
    glyph.className = 'glyph';
    glyph.textContent = char === ' ' ? '·' : char === '\n' ? '↵' : char;
    glyph.dataset.index = String(index);
    glyph.setAttribute('role', 'button');
    glyph.setAttribute('aria-label', `Glyph ${index + 1}: ${glyph.textContent}`);
    if (char === ' ' || char === '\n') glyph.classList.add('is-space');
    glyph.addEventListener('click', () => selectGlyph(index));
    glyphField.appendChild(glyph);

    const dot = document.createElement('span');
    dot.className = 'mini-dot';
    miniMap.appendChild(dot);

    glyphs.push({ el: glyph, char, x: 0, y: 0, angle: 0, weight: state.weight, width: state.width });
    miniDots.push(dot);
    positions.push({ x: 0, y: 0, hue: 0 });
  });

  state.selected = clamp(state.selected, 0, glyphs.length - 1);
  glyphCount.textContent = `${padNumber(glyphs.length)} glyphs`;
  selectGlyph(state.selected);
}

function selectGlyph(index) {
  if (!glyphs.length) return;
  state.selected = clamp(index, 0, glyphs.length - 1);
  glyphs.forEach((glyph, glyphIndex) => {
    glyph.el.classList.toggle('is-selected', glyphIndex === state.selected);
  });
  miniDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-selected', dotIndex === state.selected);
  });
  updateInspector();
}

function codePointLabel(char) {
  const normalized = char === '\n' ? '↵' : char;
  const point = normalized.codePointAt(0) || 0;
  return `U+${point.toString(16).toUpperCase().padStart(4, '0')}`;
}

function updateInspector() {
  const glyph = glyphs[state.selected];
  if (!glyph) return;
  const visible = glyph.char === ' ' ? '·' : glyph.char === '\n' ? '↵' : glyph.char;
  selectedGlyph.textContent = visible;
  selectedIndex.textContent = `#${padNumber(state.selected + 1, 3)}`;
  codePoint.textContent = codePointLabel(glyph.char);
  selectedMass.textContent = String(Math.round(glyph.weight));
  selectedWidth.textContent = `${Math.round(glyph.width)}%`;
  const displayAngle = normalizeAngle(glyph.angle);
  selectedAngle.textContent = `${Math.round(displayAngle)}°`;
  selectedGlyph.style.setProperty('--selected-width', `${glyph.width / 100}`);
  selectedGlyph.style.setProperty('--selected-angle', `${displayAngle}deg`);
}

function updateOutputs() {
  axisOutputs.size.textContent = axisInputs.size.value;
  axisOutputs.weight.textContent = axisInputs.weight.value;
  axisOutputs.width.textContent = `${axisInputs.width.value}%`;
  axisOutputs.tracking.textContent = `${axisInputs.tracking.value}px`;
  axisOutputs.gravity.textContent = axisInputs.gravity.value;
  axisOutputs.turbulence.textContent = axisInputs.turbulence.value;
  axisOutputs.rhythm.textContent = axisInputs.rhythm.value;

  const fontFamily = fontStacks[state.font];
  document.documentElement.style.setProperty('--reactor-font', fontFamily);
  cssOutput.textContent = `.glyph-reactor {
  font-family: ${fontFamily};
  font-size: ${state.size}px;
  font-weight: ${state.weight};
  letter-spacing: ${state.tracking}px;
  transform: scaleX(${(state.width / 100).toFixed(2)});
}`;
}

function syncStateFromInputs() {
  state.size = Number(axisInputs.size.value);
  state.weight = Number(axisInputs.weight.value);
  state.width = Number(axisInputs.width.value);
  state.tracking = Number(axisInputs.tracking.value);
  state.gravity = Number(axisInputs.gravity.value);
  state.turbulence = Number(axisInputs.turbulence.value);
  state.rhythm = Number(axisInputs.rhythm.value);
  updateOutputs();
}

function updateModeButtons() {
  document.querySelectorAll('.mode-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === state.mode);
  });
  modeReadout.textContent = `${state.mode[0].toUpperCase()}${state.mode.slice(1)} mode`;
}

function updateVoiceButtons() {
  document.querySelectorAll('.voice-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.font === state.font);
  });
  updateOutputs();
}

function updateCursorCore() {
  cursorCore.style.left = `${state.pointer.x}px`;
  cursorCore.style.top = `${state.pointer.y}px`;
}

function basePosition(index, count, time) {
  const w = metrics.width;
  const h = metrics.height;
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const t = count <= 1 ? 0 : index / (count - 1);
  const spin = time * 0.00012 * state.rhythm;
  const rhythm = state.rhythm / 100;
  const turbulence = state.turbulence / 100;

  if (state.mode === 'fault') {
    const cols = Math.max(4, Math.floor(w / Math.max(52, state.size + state.tracking)));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const rows = Math.max(1, Math.ceil(count / cols));
    const cellW = w / (cols + 1);
    const cellH = Math.min(82, Math.max(40, h / (rows + 1)));
    const fracture = Math.sin(index * 2.13 + time * 0.002 * rhythm) * 46 * turbulence;
    return {
      x: cellW * (col + 1) + fracture,
      y: centerY - ((rows - 1) * cellH) / 2 + row * cellH + Math.cos(col * 1.7 + time * 0.001) * 20 * turbulence,
      angle: (col - cols / 2) * 2.8 + fracture * 0.25,
    };
  }

  if (state.mode === 'wave') {
    const margin = Math.max(52, state.size);
    const wave = Math.sin(t * Math.PI * 8 + time * 0.002 * rhythm);
    const counter = Math.cos(t * Math.PI * 5 - time * 0.0016 * rhythm);
    return {
      x: margin + t * (w - margin * 2),
      y: centerY + wave * h * 0.22 + counter * h * 0.08 * turbulence,
      angle: wave * 26 + counter * 10,
    };
  }

  if (state.mode === 'totem') {
    const lane = (index % 5) - 2;
    const stack = Math.floor(index / 5);
    const phase = Math.sin(time * 0.0012 * rhythm + stack * 0.72);
    return {
      x: centerX + lane * (state.size * 0.78 + state.tracking) + phase * 32 * turbulence,
      y: 72 + stack * Math.max(34, state.size * 0.72) - ((count / 5) * state.size * 0.3) % Math.max(h, 1),
      angle: lane * 7 + phase * 18,
    };
  }

  const rings = 2.55 + count / 78;
  const angle = t * Math.PI * 2 * rings + spin + index * 0.03;
  const radius = Math.min(w, h) * (0.12 + 0.36 * t) + Math.sin(index * 1.41 + time * 0.0017) * 28 * turbulence;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius * 0.74,
    angle: (angle * 180) / Math.PI + 90,
  };
}

function drawField(time) {
  ctx.clearRect(0, 0, metrics.width, metrics.height);
  ctx.save();

  const w = metrics.width;
  const h = metrics.height;
  const px = state.pointer.x;
  const py = state.pointer.y;
  const pulse = Math.sin(time * 0.002) * 0.5 + 0.5;

  ctx.lineWidth = 1;
  for (let ring = 0; ring < 8; ring += 1) {
    const radius = 44 + ring * 52 + pulse * 8;
    ctx.strokeStyle = ring % 2 === 0 ? 'rgba(0, 184, 200, 0.13)' : 'rgba(255, 174, 0, 0.12)';
    ctx.beginPath();
    for (let point = 0; point <= 180; point += 1) {
      const angle = (point / 180) * Math.PI * 2;
      const wobble = Math.sin(angle * 5 + time * 0.001 + ring) * 8 * (state.turbulence / 100);
      const x = px + Math.cos(angle) * (radius + wobble);
      const y = py + Math.sin(angle) * (radius * 0.68 + wobble);
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.lineWidth = 1.4;
  for (let i = 0; i < positions.length; i += 3) {
    const current = positions[i];
    const next = positions[(i + 5) % positions.length];
    if (!current || !next) continue;
    ctx.strokeStyle = `hsla(${current.hue}, 84%, 65%, 0.16)`;
    ctx.beginPath();
    ctx.moveTo(current.x, current.y);
    ctx.quadraticCurveTo(px, py, next.x, next.y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 248, 231, 0.72)';
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 97 + time * 0.018) % w;
    const y = (i * 53 + Math.sin(time * 0.0008 + i) * 22 + h) % h;
    ctx.fillRect(x, y, i % 7 === 0 ? 8 : 2, 1);
  }

  ctx.restore();
}

function animate(time) {
  if (!lastTime) lastTime = time;
  const delta = Math.min(32, time - lastTime);
  lastTime = time;

  if (!state.frozen) {
    const count = glyphs.length;
    const gravity = state.gravity / 100;
    const turbulence = state.turbulence / 100;
    const rhythm = state.rhythm / 100;
    const maxDistance = Math.max(140, Math.min(metrics.width, metrics.height) * 0.58);
    let fluxTotal = 0;

    glyphs.forEach((glyph, index) => {
      const base = basePosition(index, count, time);
      const dx = state.pointer.x - base.x;
      const dy = state.pointer.y - base.y;
      const distance = Math.hypot(dx, dy);
      const proximity = clamp(1 - distance / maxDistance, 0, 1);
      const pull = proximity * gravity;
      const noiseX = Math.sin(index * 3.77 + time * 0.0017) * turbulence * 28;
      const noiseY = Math.cos(index * 2.91 + time * 0.0013) * turbulence * 24;
      const breath = Math.sin(time * 0.003 * rhythm + index * 0.42);
      const x = base.x + dx * pull * 0.42 + noiseX;
      const y = base.y + dy * pull * 0.42 + noiseY;
      const weight = clamp(state.weight + proximity * 260 + breath * 70 * rhythm, 100, 1000);
      const width = clamp(state.width + proximity * 44 + breath * 10 * turbulence, 48, 190);
      const size = clamp(state.size + proximity * 22 + breath * 5, 14, 128);
      const angle = base.angle + proximity * 38 * Math.sin(index + time * 0.001) + breath * 9 * turbulence;
      const hue = (index * 31 + time * 0.025 + proximity * 96) % 360;

      glyph.x = x;
      glyph.y = y;
      glyph.angle = angle;
      glyph.weight = weight;
      glyph.width = width;

      glyph.el.style.setProperty('--glyph-size', `${size}px`);
      glyph.el.style.setProperty('--glyph-weight', `${Math.round(weight)}`);
      glyph.el.style.setProperty('--glyph-color', `hsl(${hue} 86% ${58 + proximity * 20}%)`);
      glyph.el.style.setProperty('--glyph-glow', `hsla(${hue}, 90%, 62%, ${0.28 + proximity * 0.38})`);
      glyph.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg) scaleX(${width / 100})`;

      positions[index] = { x, y, hue };
      const dot = miniDots[index];
      if (dot) {
        dot.style.left = `${clamp((x / metrics.width) * 100, 2, 98)}%`;
        dot.style.top = `${clamp((y / metrics.height) * 100, 4, 96)}%`;
        dot.style.setProperty('--dot-color', `hsl(${hue} 86% 62%)`);
      }
      fluxTotal += proximity;
    });

    state.pointer.flux += ((fluxTotal / Math.max(1, count)) - state.pointer.flux) * Math.min(1, delta / 140);
    energy = state.size * 0.03 + state.weight * 0.002 + state.width * 0.01 + state.pointer.flux * 8;
    pointerReadout.textContent = `Flux ${Math.round(state.pointer.flux * 100)}%`;
    energyReadout.textContent = `Energy ${energy.toFixed(2)}`;
    updateInspector();
  }

  drawField(time);
  requestAnimationFrame(animate);
}

function setPointerFromEvent(event) {
  const rect = stage.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;
  state.pointer.x = clamp(source.clientX - rect.left, 0, rect.width);
  state.pointer.y = clamp(source.clientY - rect.top, 0, rect.height);
  state.pointer.active = true;
  updateCursorCore();
}

function randomizeAxes() {
  const random = (min, max, step = 1) => Math.round((min + Math.random() * (max - min)) / step) * step;
  axisInputs.size.value = random(28, 84);
  axisInputs.weight.value = random(260, 940, 20);
  axisInputs.width.value = random(64, 154);
  axisInputs.tracking.value = random(0, 22);
  axisInputs.gravity.value = random(20, 100);
  axisInputs.turbulence.value = random(12, 92);
  axisInputs.rhythm.value = random(20, 100);
  syncStateFromInputs();
}

async function copyCss() {
  const text = cssOutput.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Copied';
  } catch {
    copyStatus.textContent = 'Select CSS';
  }
  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 1600);
}

Object.entries(axisInputs).forEach(([, input]) => {
  input.addEventListener('input', syncStateFromInputs);
});

document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    updateModeButtons();
  });
});

document.querySelectorAll('.voice-button').forEach((button) => {
  button.addEventListener('click', () => {
    state.font = button.dataset.font;
    updateVoiceButtons();
  });
});

phraseInput.addEventListener('input', () => {
  state.text = phraseInput.value;
  renderGlyphs();
  updateOutputs();
});

stage.addEventListener('pointermove', setPointerFromEvent);
stage.addEventListener('pointerdown', setPointerFromEvent);
stage.addEventListener('pointerleave', () => {
  state.pointer.active = false;
});

igniteButton.addEventListener('click', randomizeAxes);

freezeButton.addEventListener('click', () => {
  state.frozen = !state.frozen;
  freezeButton.setAttribute('aria-pressed', String(state.frozen));
  freezeButton.textContent = state.frozen ? 'Resume' : 'Freeze';
  systemStatus.textContent = state.frozen ? 'FIELD HELD' : 'LIVE FIELD';
});

copyCssButton.addEventListener('click', copyCss);

window.addEventListener('resize', setCanvasSize);

new ResizeObserver(setCanvasSize).observe(stage);

setCanvasSize();
syncStateFromInputs();
updateModeButtons();
updateVoiceButtons();
renderGlyphs();
requestAnimationFrame(animate);
