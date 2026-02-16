const MAX_MEMORY = 18;

const UNIVERSes = [
  {
    name: 'Universe I',
    hueShift: 24,
    waveA: 3.2,
    waveB: 2.4,
    waveC: 4.1,
    spin: 3.8,
    timeA: 0.19,
    timeB: 0.14,
    timeC: 0.11,
  },
  {
    name: 'Universe II',
    hueShift: 154,
    waveA: 4.5,
    waveB: 1.7,
    waveC: 5.3,
    spin: 5.7,
    timeA: 0.14,
    timeB: 0.21,
    timeC: 0.18,
  },
  {
    name: 'Universe III',
    hueShift: 286,
    waveA: 2.1,
    waveB: 3.8,
    waveC: 6.2,
    spin: 2.9,
    timeA: 0.25,
    timeB: 0.17,
    timeC: 0.16,
  },
];

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  time: 0,
  frame: 0,
  mouse: {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    tx: window.innerWidth * 0.5,
    ty: window.innerHeight * 0.5,
    vx: 0,
    vy: 0,
  },
  trail: [],
  paradox: 0.46,
  drift: 0.58,
  entropy: 0.4,
  luma: 0.52,
  universe: 0,
  memory: [],
  live: {
    h: 0,
    s: 0,
    l: 0,
    r: 0,
    g: 0,
    b: 0,
    hex: '#000000',
  },
  samplePoints: {
    past: { x: 0, y: 0 },
    now: { x: 0, y: 0 },
    future: { x: 0, y: 0 },
  },
  sampleColors: {
    past: { h: 0, s: 0, l: 0, hex: '#000000' },
    now: { h: 0, s: 0, l: 0, hex: '#000000' },
    future: { h: 0, s: 0, l: 0, hex: '#000000' },
  },
  pulses: [],
};

const fieldCanvas = document.getElementById('field-canvas');
const threadsCanvas = document.getElementById('threads-canvas');
const fieldCtx = fieldCanvas.getContext('2d');
const threadsCtx = threadsCanvas.getContext('2d');

const liveSwatch = document.getElementById('live-swatch');
const hexValue = document.getElementById('hex-value');
const rgbValue = document.getElementById('rgb-value');
const hslValue = document.getElementById('hsl-value');
const copyBtn = document.getElementById('copy-btn');
const captureBtn = document.getElementById('capture-btn');
const paradoxInput = document.getElementById('paradox');
const driftInput = document.getElementById('drift');
const entropyInput = document.getElementById('entropy');
const lumaInput = document.getElementById('luma');
const universeBtn = document.getElementById('universe-btn');
const memoryRail = document.getElementById('memory-rail');
const memoryCount = document.getElementById('memory-count');
const chronoLens = document.getElementById('chrono-lens');
const pointPast = document.getElementById('point-past');
const pointNow = document.getElementById('point-now');
const pointFuture = document.getElementById('point-future');
const pointFinal = document.getElementById('point-final');
const toast = document.getElementById('toast');

const ringA = chronoLens.querySelector('.ring-a');
const ringB = chronoLens.querySelector('.ring-b');

const fieldBuffer = document.createElement('canvas');
const fieldBufferCtx = fieldBuffer.getContext('2d', { willReadFrequently: true });

let fieldImageData = null;
let fieldResolution = { width: 0, height: 0 };
let toastTimer = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapHue(hue) {
  return (hue % 360 + 360) % 360;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hslToRgb(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const hh = h / 60;
  const x = chroma * (1 - Math.abs((hh % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hh >= 0 && hh < 1) {
    r1 = chroma;
    g1 = x;
  } else if (hh < 2) {
    r1 = x;
    g1 = chroma;
  } else if (hh < 3) {
    g1 = chroma;
    b1 = x;
  } else if (hh < 4) {
    g1 = x;
    b1 = chroma;
  } else if (hh < 5) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  const match = light - chroma / 2;
  return {
    r: Math.round((r1 + match) * 255),
    g: Math.round((g1 + match) * 255),
    b: Math.round((b1 + match) * 255),
  };
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((value) => clamp(value, 0, 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function mixHue(samples, weights) {
  let x = 0;
  let y = 0;

  for (let i = 0; i < samples.length; i += 1) {
    const rad = (samples[i] * Math.PI) / 180;
    x += Math.cos(rad) * weights[i];
    y += Math.sin(rad) * weights[i];
  }

  return wrapHue((Math.atan2(y, x) * 180) / Math.PI);
}

function colorFieldAt(x, y, phaseOffset) {
  const universe = UNIVERSes[state.universe];
  const nx = x / state.width - 0.5;
  const ny = y / state.height - 0.5;
  const radius = Math.hypot(nx, ny);
  const angle = Math.atan2(ny, nx);

  const time = state.time * 0.001;
  const entropyBoost = 1 + state.entropy * 1.35;

  const wave1 = Math.sin((nx * universe.waveA + time * universe.timeA + phaseOffset) * Math.PI * 2 * entropyBoost);
  const wave2 = Math.cos((ny * universe.waveB - time * universe.timeB - phaseOffset * 0.8) * Math.PI * 2 * entropyBoost);
  const wave3 = Math.sin(((nx + ny) * universe.waveC + Math.sin(angle * universe.spin + time * 0.3)) * Math.PI);
  const spiral = Math.cos((radius * 8.5 - time * universe.timeC * 10 + phaseOffset * 2.2 + angle * universe.spin) * Math.PI);

  const hue = wrapHue(
    universe.hueShift +
      (wave1 * 114 + wave2 * 88 + wave3 * 62 + spiral * 76) +
      state.entropy * 146 +
      (1 - radius) * 40
  );

  const saturation = clamp(28 + Math.abs(wave2) * 42 + radius * 84 + state.entropy * 20, 18, 100);
  const lightness = clamp(22 + wave1 * 15 + spiral * 12 + (1 - radius) * 28, 6, 94);

  return { h: hue, s: saturation, l: lightness };
}

function toColorString(color, alpha = 1) {
  return `hsla(${color.h.toFixed(1)}, ${color.s.toFixed(1)}%, ${color.l.toFixed(1)}%, ${alpha})`;
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);

  fieldCanvas.width = state.width * state.dpr;
  fieldCanvas.height = state.height * state.dpr;
  fieldCanvas.style.width = `${state.width}px`;
  fieldCanvas.style.height = `${state.height}px`;
  fieldCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  threadsCanvas.width = state.width * state.dpr;
  threadsCanvas.height = state.height * state.dpr;
  threadsCanvas.style.width = `${state.width}px`;
  threadsCanvas.style.height = `${state.height}px`;
  threadsCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  const scale = state.width < 760 ? 0.19 : 0.22;
  fieldResolution.width = Math.max(120, Math.floor(state.width * scale));
  fieldResolution.height = Math.max(80, Math.floor(state.height * scale));

  fieldBuffer.width = fieldResolution.width;
  fieldBuffer.height = fieldResolution.height;
  fieldImageData = fieldBufferCtx.createImageData(fieldResolution.width, fieldResolution.height);

  if (!state.trail.length) {
    for (let i = 0; i < 50; i += 1) {
      state.trail.push({ x: state.mouse.x, y: state.mouse.y });
    }
  }
}

function renderField() {
  const width = fieldResolution.width;
  const height = fieldResolution.height;
  const pixels = fieldImageData.data;

  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const worldX = (x / (width - 1)) * state.width;
      const worldY = (y / (height - 1)) * state.height;
      const phase = state.paradox * 1.3 + state.drift * 0.9;
      const color = colorFieldAt(worldX, worldY, phase);
      const rgb = hslToRgb(color.h, color.s, color.l);

      pixels[offset] = rgb.r;
      pixels[offset + 1] = rgb.g;
      pixels[offset + 2] = rgb.b;
      pixels[offset + 3] = 255;
      offset += 4;
    }
  }

  fieldBufferCtx.putImageData(fieldImageData, 0, 0);

  fieldCtx.clearRect(0, 0, state.width, state.height);
  fieldCtx.imageSmoothingEnabled = true;
  fieldCtx.drawImage(fieldBuffer, 0, 0, state.width, state.height);
}

function updatePointerTrail() {
  state.mouse.x = lerp(state.mouse.x, state.mouse.tx, 0.22);
  state.mouse.y = lerp(state.mouse.y, state.mouse.ty, 0.22);

  const dx = state.mouse.tx - state.mouse.x;
  const dy = state.mouse.ty - state.mouse.y;
  state.mouse.vx = lerp(state.mouse.vx, dx, 0.17);
  state.mouse.vy = lerp(state.mouse.vy, dy, 0.17);

  state.trail.push({ x: state.mouse.x, y: state.mouse.y });
  if (state.trail.length > 72) {
    state.trail.shift();
  }
}

function computeLiveColor() {
  const nowPoint = { x: state.mouse.x, y: state.mouse.y };

  const pastOffset = Math.floor(lerp(10, 66, state.paradox));
  const pastIndex = Math.max(0, state.trail.length - 1 - pastOffset);
  const pastPoint = state.trail[pastIndex] || nowPoint;

  const futurePower = lerp(22, 180, state.drift);
  const futurePoint = {
    x: clamp(nowPoint.x + state.mouse.vx * futurePower, 0, state.width),
    y: clamp(nowPoint.y + state.mouse.vy * futurePower, 0, state.height),
  };

  const pastColor = colorFieldAt(pastPoint.x, pastPoint.y, -0.8);
  const nowColor = colorFieldAt(nowPoint.x, nowPoint.y, 0);
  const futureColor = colorFieldAt(futurePoint.x, futurePoint.y, 0.9);

  let weights = [
    0.2 + state.paradox * 0.62,
    0.5 - state.paradox * 0.18,
    0.3 + state.drift * 0.48,
  ];

  const sum = weights[0] + weights[1] + weights[2];
  weights = weights.map((weight) => weight / sum);

  const h = mixHue([pastColor.h, nowColor.h, futureColor.h], weights);
  const s = clamp(
    pastColor.s * weights[0] + nowColor.s * weights[1] + futureColor.s * weights[2] + state.entropy * 13,
    18,
    100
  );

  const lumaCore = lerp(18, 84, state.luma);
  const l = clamp(
    lumaCore +
      (pastColor.l - 50) * 0.13 +
      (nowColor.l - 50) * 0.18 +
      (futureColor.l - 50) * 0.16 +
      Math.sin(state.time * 0.0012 + state.paradox * 3.2) * state.entropy * 7,
    6,
    95
  );

  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  state.live = { h, s, l, ...rgb, hex };
  state.samplePoints = { past: pastPoint, now: nowPoint, future: futurePoint };
  state.sampleColors = {
    past: { ...pastColor, hex: hslToHex(pastColor.h, pastColor.s, pastColor.l) },
    now: { ...nowColor, hex: hslToHex(nowColor.h, nowColor.s, nowColor.l) },
    future: { ...futureColor, hex: hslToHex(futureColor.h, futureColor.s, futureColor.l) },
  };
}

function drawThreadBridge() {
  threadsCtx.clearRect(0, 0, state.width, state.height);

  const { past, now, future } = state.samplePoints;
  const { past: pastColor, now: nowColor, future: futureColor } = state.sampleColors;

  const gradient = threadsCtx.createLinearGradient(past.x, past.y, future.x, future.y);
  gradient.addColorStop(0, toColorString(pastColor, 0.78));
  gradient.addColorStop(0.5, toColorString(nowColor, 0.82));
  gradient.addColorStop(1, toColorString(futureColor, 0.8));

  threadsCtx.lineWidth = 2.2;
  threadsCtx.strokeStyle = gradient;
  threadsCtx.beginPath();
  threadsCtx.moveTo(past.x, past.y);
  threadsCtx.bezierCurveTo(
    lerp(past.x, now.x, 0.45),
    past.y - 42,
    lerp(now.x, future.x, 0.55),
    future.y + 42,
    future.x,
    future.y
  );
  threadsCtx.stroke();

  threadsCtx.lineWidth = 1;
  threadsCtx.setLineDash([6, 8]);
  threadsCtx.strokeStyle = toColorString(state.live, 0.42);
  threadsCtx.beginPath();
  threadsCtx.moveTo(past.x, past.y);
  threadsCtx.lineTo(now.x, now.y);
  threadsCtx.lineTo(future.x, future.y);
  threadsCtx.stroke();
  threadsCtx.setLineDash([]);

  drawSampleDot(past, pastColor, 'P');
  drawSampleDot(now, nowColor, 'N');
  drawSampleDot(future, futureColor, 'F');
  drawFinalHalo(now.x, now.y);
  drawPulses();
}

function drawSampleDot(point, color, label) {
  threadsCtx.fillStyle = toColorString(color, 0.95);
  threadsCtx.beginPath();
  threadsCtx.arc(point.x, point.y, 7.5, 0, Math.PI * 2);
  threadsCtx.fill();

  threadsCtx.strokeStyle = 'rgba(255,255,255,0.8)';
  threadsCtx.lineWidth = 1.4;
  threadsCtx.stroke();

  threadsCtx.fillStyle = 'rgba(6, 20, 24, 0.85)';
  threadsCtx.font = "10px 'IBM Plex Mono'";
  threadsCtx.textAlign = 'center';
  threadsCtx.textBaseline = 'middle';
  threadsCtx.fillText(label, point.x, point.y + 0.2);
}

function drawFinalHalo(x, y) {
  const pulse = 1 + Math.sin(state.time * 0.006) * 0.12;
  const radius = 24 * pulse;

  const gradient = threadsCtx.createRadialGradient(x, y, 1, x, y, radius);
  gradient.addColorStop(0, toColorString(state.live, 0.45));
  gradient.addColorStop(1, toColorString(state.live, 0));

  threadsCtx.fillStyle = gradient;
  threadsCtx.beginPath();
  threadsCtx.arc(x, y, radius, 0, Math.PI * 2);
  threadsCtx.fill();
}

function drawPulses() {
  for (let i = state.pulses.length - 1; i >= 0; i -= 1) {
    const pulse = state.pulses[i];
    pulse.radius += pulse.speed;
    pulse.alpha *= 0.95;

    if (pulse.alpha < 0.015) {
      state.pulses.splice(i, 1);
      continue;
    }

    threadsCtx.beginPath();
    threadsCtx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
    threadsCtx.strokeStyle = `rgba(${pulse.r}, ${pulse.g}, ${pulse.b}, ${pulse.alpha})`;
    threadsCtx.lineWidth = Math.max(0.6, 2.8 * pulse.alpha);
    threadsCtx.stroke();
  }
}

function updateLens() {
  chronoLens.style.transform = `translate(${state.mouse.x}px, ${state.mouse.y}px) translate(-50%, -50%)`;

  pointPast.style.background = state.sampleColors.past.hex;
  pointNow.style.background = state.sampleColors.now.hex;
  pointFuture.style.background = state.sampleColors.future.hex;
  pointFinal.style.background = state.live.hex;

  const rotation = state.time * 0.018;
  ringA.style.transform = `rotate(${rotation}deg)`;
  ringB.style.transform = `rotate(${-rotation * 1.4}deg)`;
}

function updateReadout() {
  const { h, s, l, r, g, b, hex } = state.live;

  liveSwatch.style.background = hex;
  hexValue.textContent = hex;
  rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
  hslValue.textContent = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;

  document.documentElement.style.setProperty('--live-color', hex);
}

function renderMemory() {
  memoryRail.innerHTML = state.memory
    .map(
      (entry, index) => `
        <button class="memory-cell" type="button" data-index="${index}" title="${entry.hex}">
          <div class="memory-chip" style="background:${entry.hex}"></div>
          <div class="memory-code">${entry.hex}</div>
        </button>
      `
    )
    .join('');

  memoryCount.textContent = `${state.memory.length} / ${MAX_MEMORY}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 900);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // Fall through to legacy copy path.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

async function copyHex() {
  await copyText(state.live.hex);
  showToast('HEX Copied');
}

function captureColor() {
  const { h, s, l, r, g, b, hex } = state.live;
  state.memory.unshift({ h, s, l, r, g, b, hex });
  if (state.memory.length > MAX_MEMORY) {
    state.memory.length = MAX_MEMORY;
  }
  state.pulses.push({
    x: state.samplePoints.now.x,
    y: state.samplePoints.now.y,
    radius: 8,
    alpha: 0.9,
    speed: 2.8,
    r,
    g,
    b,
  });
  renderMemory();
  showToast('Collapsed');
}

function cycleUniverse() {
  state.universe = (state.universe + 1) % UNIVERSes.length;
  universeBtn.textContent = UNIVERSes[state.universe].name;
  showToast(UNIVERSes[state.universe].name);
}

function handleMove(clientX, clientY) {
  state.mouse.tx = clamp(clientX, 0, state.width);
  state.mouse.ty = clamp(clientY, 0, state.height);
}

function bindEvents() {
  window.addEventListener('resize', resize);

  window.addEventListener('pointermove', (event) => {
    handleMove(event.clientX, event.clientY);
  });

  window.addEventListener('pointerdown', (event) => {
    handleMove(event.clientX, event.clientY);
    if (!(event.target instanceof Element)) return;
    const interactiveTarget = event.target.closest('button, a, input, .memory-cell');
    if (interactiveTarget || event.button !== 0) return;
    captureColor();
  });

  window.addEventListener(
    'wheel',
    (event) => {
      state.luma = clamp(state.luma - event.deltaY * 0.0008, 0, 1);
      lumaInput.value = String(Math.round(state.luma * 100));
    },
    { passive: true }
  );

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      captureColor();
    } else if (event.key.toLowerCase() === 'c') {
      copyHex();
    } else if (event.key.toLowerCase() === 'u') {
      cycleUniverse();
    }
  });

  paradoxInput.addEventListener('input', () => {
    state.paradox = Number(paradoxInput.value) / 100;
  });

  driftInput.addEventListener('input', () => {
    state.drift = Number(driftInput.value) / 100;
  });

  entropyInput.addEventListener('input', () => {
    state.entropy = Number(entropyInput.value) / 100;
  });

  lumaInput.addEventListener('input', () => {
    state.luma = Number(lumaInput.value) / 100;
  });

  universeBtn.addEventListener('click', cycleUniverse);
  copyBtn.addEventListener('click', copyHex);
  captureBtn.addEventListener('click', captureColor);

  memoryRail.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest('.memory-cell');
    if (!target) return;

    const index = Number(target.dataset.index);
    const entry = state.memory[index];
    if (!entry) return;

    copyText(entry.hex)
      .then(() => showToast(`Echo ${entry.hex}`))
      .catch(() => showToast(`Echo ${entry.hex}`));
  });
}

function tick(timestamp) {
  state.time = timestamp;
  state.frame += 1;

  updatePointerTrail();
  computeLiveColor();

  if (state.frame % 2 === 0) {
    renderField();
  }

  drawThreadBridge();
  updateLens();
  updateReadout();

  requestAnimationFrame(tick);
}

function init() {
  resize();
  bindEvents();
  renderMemory();
  universeBtn.textContent = UNIVERSes[state.universe].name;

  requestAnimationFrame(tick);
}

init();
