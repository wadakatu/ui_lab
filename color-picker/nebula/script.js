// ============================================
// CHROMATIC NEBULA — Interactive Color Picker
// Navigate a living cosmos of color particles
// ============================================

const PARTICLE_COUNT = 2200;
const TRAIL_LENGTH = 3;
const GRAVITATIONAL_PULL = 0.001;
const TURBULENCE = 0.15;
const PARTICLE_BASE_SIZE = 1.5;
const PARTICLE_MAX_SIZE = 4;
const CURSOR_INFLUENCE_RADIUS = 180;
const CURSOR_REPEL_FORCE = 0.8;

// --- State ---
const state = {
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  targetMouseX: window.innerWidth / 2,
  targetMouseY: window.innerHeight / 2,
  luminance: 50,
  hue: 0,
  saturation: 0,
  capturedColor: null,
  constellation: [],
  entered: false,
  time: 0,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
};

// --- DOM ---
const nebulaCanvas = document.getElementById('nebula');
const bloomCanvas = document.getElementById('bloom');
const ctx = nebulaCanvas.getContext('2d');
const bctx = bloomCanvas.getContext('2d');
const cursorGlow = document.getElementById('cursor-glow');
const titleOverlay = document.getElementById('title-overlay');
const titleEnter = document.getElementById('title-enter');

// HUD elements
const hudCoords = document.getElementById('hud-coords');
const hudCapture = document.getElementById('hud-capture');
const hudConstellation = document.getElementById('hud-constellation');
const hudLuminance = document.getElementById('hud-luminance');
const backLink = document.getElementById('back-link');
const hudH = document.getElementById('hud-h');
const hudS = document.getElementById('hud-s');
const hudL = document.getElementById('hud-l');
const captureSwatch = document.getElementById('capture-swatch');
const captureRipple = document.getElementById('capture-ripple');
const captureHex = document.getElementById('capture-hex');
const captureRgb = document.getElementById('capture-rgb');
const captureHsl = document.getElementById('capture-hsl');
const copyBtn = document.getElementById('copy-btn');
const constellationGrid = document.getElementById('constellation-grid');
const constellationEmpty = document.getElementById('constellation-empty');
const luminanceTrack = document.querySelector('.luminance-track');
const luminanceFill = document.getElementById('luminance-fill');
const luminanceThumb = document.getElementById('luminance-thumb');
const luminanceValue = document.getElementById('luminance-value');
const notification = document.getElementById('notification');

// --- Resize ---
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  nebulaCanvas.width = w * state.dpr;
  nebulaCanvas.height = h * state.dpr;
  nebulaCanvas.style.width = w + 'px';
  nebulaCanvas.style.height = h + 'px';
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  bloomCanvas.width = Math.max(1, Math.floor(w * state.dpr * 0.25));
  bloomCanvas.height = Math.max(1, Math.floor(h * state.dpr * 0.25));
  bloomCanvas.style.width = w + 'px';
  bloomCanvas.style.height = h + 'px';
}
resize();
window.addEventListener('resize', resize);

// --- Color Space Mapping ---
// Maps screen position to HSL color space:
// - Hue: angle relative to screen center (0-360 degrees)
// - Saturation: distance from center (closer = less saturated, factor 1.2x allows reaching 100% before max distance)
function colorFromPosition(x, y) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const angle = Math.atan2(dy, dx);
  const hue = ((angle * 180 / Math.PI) + 360) % 360;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = Math.max(w, h) * 0.5;
  const sat = Math.min(100, (dist / maxDist) * 120);
  return { hue, sat };
}

// --- Particle Class ---
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * Math.max(w, h) * 0.6;
    this.x = cx + Math.cos(angle) * dist;
    this.y = cy + Math.sin(angle) * dist;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.baseAngle = angle;
    this.orbitSpeed = (Math.random() * 0.001 + 0.0003) * (Math.random() > 0.5 ? 1 : -1);
    this.orbitRadius = dist;
    this.size = PARTICLE_BASE_SIZE + Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_BASE_SIZE);
    this.alpha = 0.3 + Math.random() * 0.7;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.5 + Math.random() * 1.5;
    this.trail = [];
    this.noiseOffsetX = Math.random() * 1000;
    this.noiseOffsetY = Math.random() * 1000;
  }

  update(time) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    // Orbital motion
    this.baseAngle += this.orbitSpeed;
    const targetX = cx + Math.cos(this.baseAngle) * this.orbitRadius;
    const targetY = cy + Math.sin(this.baseAngle) * this.orbitRadius;

    // Gravitational pull toward orbit
    this.vx += (targetX - this.x) * GRAVITATIONAL_PULL;
    this.vy += (targetY - this.y) * GRAVITATIONAL_PULL;

    // Turbulence (periodic sine/cosine displacement)
    const noiseX = Math.sin(time * 0.001 + this.noiseOffsetX) * Math.cos(time * 0.0007 + this.noiseOffsetY * 0.5);
    const noiseY = Math.cos(time * 0.0009 + this.noiseOffsetY) * Math.sin(time * 0.0006 + this.noiseOffsetX * 0.5);
    this.vx += noiseX * TURBULENCE * 0.01;
    this.vy += noiseY * TURBULENCE * 0.01;

    // Cursor interaction
    const dx = this.x - state.mouseX;
    const dy = this.y - state.mouseY;
    const distToCursor = Math.sqrt(dx * dx + dy * dy);

    if (distToCursor < CURSOR_INFLUENCE_RADIUS && distToCursor > 0) {
      const force = (1 - distToCursor / CURSOR_INFLUENCE_RADIUS) * CURSOR_REPEL_FORCE;
      const nx = dx / distToCursor;
      const ny = dy / distToCursor;
      this.vx += nx * force * 0.15;
      this.vy += ny * force * 0.15;
    }

    this.vx *= 0.94;
    this.vy *= 0.94;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > TRAIL_LENGTH) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    const margin = 50;
    if (this.x < -margin) this.x = w + margin;
    if (this.x > w + margin) this.x = -margin;
    if (this.y < -margin) this.y = h + margin;
    if (this.y > h + margin) this.y = -margin;

    this.currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(time * 0.001 * this.pulseSpeed + this.pulsePhase));
  }

  getColor() {
    return colorFromPosition(this.x, this.y);
  }

  draw(ctx) {
    const { hue, sat } = this.getColor();
    const l = state.luminance;

    if (this.trail.length > 1) {
      for (let i = 0; i < this.trail.length - 1; i++) {
        const t = this.trail[i];
        const ratio = i / this.trail.length;
        const trailAlpha = this.currentAlpha * ratio * 0.3;
        const trailSize = this.size * ratio * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, trailSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${l}%, ${trailAlpha})`;
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${l}%, ${this.currentAlpha})`;
    ctx.fill();

    // Inner glow for larger particles
    if (this.size > 3) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${Math.max(0, sat - 20)}%, ${Math.min(100, l + 30)}%, ${this.currentAlpha * 0.6})`;
      ctx.fill();
    }
  }
}

// --- Particles ---
const particles = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// --- Background Stars (normalized coordinates for resize-safety) ---
const bgStars = [];
for (let i = 0; i < 200; i++) {
  bgStars.push({
    nx: Math.random(),
    ny: Math.random(),
    size: Math.random() * 1.2 + 0.3,
    alpha: Math.random() * 0.4 + 0.1,
    twinkleSpeed: Math.random() * 2 + 0.5,
    twinklePhase: Math.random() * Math.PI * 2,
  });
}

// --- Capture Effects ---
const captureEffects = [];

function createSupernova(x, y, color) {
  captureEffects.push({
    x,
    y,
    color,
    birth: state.time,
    duration: 60,
    rings: [
      { radius: 0, speed: 4, alpha: 0.8, width: 2 },
      { radius: 0, speed: 3, alpha: 0.6, width: 1 },
      { radius: 0, speed: 5, alpha: 0.4, width: 1.5 },
    ],
    particles: Array.from({ length: 24 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 4,
      radius: 0,
      alpha: 0.5 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
    })),
  });
}

function drawCaptureEffects(ctx) {
  for (let i = captureEffects.length - 1; i >= 0; i--) {
    const effect = captureEffects[i];
    const age = state.time - effect.birth;
    const progress = age / effect.duration;

    if (progress > 1) {
      captureEffects.splice(i, 1);
      continue;
    }

    // Expanding rings
    for (const ring of effect.rings) {
      ring.radius += ring.speed;
      const ringAlpha = ring.alpha * (1 - progress);
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = effect.color.replace(/[\d.]+\)$/, `${ringAlpha})`);
      ctx.lineWidth = ring.width * (1 - progress);
      ctx.stroke();
    }

    // Burst particles
    for (const p of effect.particles) {
      p.radius += p.speed;
      const px = effect.x + Math.cos(p.angle) * p.radius;
      const py = effect.y + Math.sin(p.angle) * p.radius;
      const pa = p.alpha * (1 - progress);
      ctx.beginPath();
      ctx.arc(px, py, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = effect.color.replace(/[\d.]+\)$/, `${pa})`);
      ctx.fill();
    }

    // Central flash
    if (progress < 0.3) {
      const flashAlpha = (1 - progress / 0.3) * 0.6;
      const flashRadius = 20 * (1 - progress / 0.3);
      const gradient = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, flashRadius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, flashRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
}

// --- Color Utilities ---
// h: 0-360 (degrees), s: 0-100 (%), l: 0-100 (%)
function hslToRgbValues(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * Math.max(0, Math.min(1, l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))));
  };
  return [f(0), f(8), f(4)];
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgbValues(h, s, l);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hslToRgb(h, s, l) {
  const [r, g, b] = hslToRgbValues(h, s, l);
  return { r, g, b };
}

function getColorAtCursor() {
  const { hue, sat } = colorFromPosition(state.mouseX, state.mouseY);
  return { hue, sat, lum: state.luminance };
}

// --- Update HUD ---
function updateHUD() {
  const { hue, sat, lum } = getColorAtCursor();
  state.hue = hue;
  state.saturation = sat;

  hudH.textContent = `${Math.round(hue)}°`;
  hudS.textContent = `${Math.round(sat)}%`;
  hudL.textContent = `${Math.round(lum)}%`;

  // Tint cursor glow with current color
  const hex = hslToHex(hue, sat, lum);
  cursorGlow.style.borderColor = `${hex}aa`;
  cursorGlow.style.boxShadow = `0 0 20px ${hex}44, inset 0 0 10px ${hex}22`;
}

function updateCaptureDisplay(h, s, l) {
  const hex = hslToHex(h, s, l);
  const { r, g, b } = hslToRgb(h, s, l);
  captureSwatch.style.backgroundColor = hex;
  captureSwatch.style.boxShadow = `0 0 20px ${hex}66`;
  captureHex.textContent = hex.toUpperCase();
  captureRgb.textContent = `rgb(${r}, ${g}, ${b})`;
  captureHsl.textContent = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  state.capturedColor = hex;

  // Ripple effect
  captureRipple.classList.remove('active');
  void captureRipple.offsetWidth;
  captureRipple.classList.add('active');
}

// --- Constellation ---
// Max 18 colors (3 rows x 6 columns in the constellation grid)
function addToConstellation(hex, h, s, l) {
  if (state.constellation.length >= 18) {
    state.constellation.shift();
  }
  state.constellation.push({ hex, h, s, l });
  renderConstellation();
}

function renderConstellation() {
  constellationGrid.innerHTML = '';
  constellationEmpty.style.display = state.constellation.length ? 'none' : 'block';

  state.constellation.forEach((c) => {
    const star = document.createElement('div');
    star.className = 'constellation-star';
    star.style.backgroundColor = c.hex;
    star.style.color = c.hex;
    star.title = c.hex;
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCaptureDisplay(c.h, c.s, c.l);
    });
    star.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      star.classList.add('removing');
      setTimeout(() => {
        const currentIndex = state.constellation.indexOf(c);
        if (currentIndex !== -1) {
          state.constellation.splice(currentIndex, 1);
        }
        renderConstellation();
      }, 300);
    });
    constellationGrid.appendChild(star);
  });
}

// --- Luminance ---
let draggingLuminance = false;

function syncLuminanceUI() {
  const rounded = Math.round(state.luminance);
  luminanceFill.style.width = `${rounded}%`;
  luminanceThumb.style.left = `${rounded}%`;
  luminanceValue.textContent = `${rounded}%`;
  hudL.textContent = `${rounded}%`;
}

function updateLuminanceFromEvent(e) {
  const rect = luminanceTrack.getBoundingClientRect();
  if (rect.width === 0) return;
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  state.luminance = Math.round(x * 100);
  syncLuminanceUI();
}

luminanceTrack.addEventListener('mousedown', (e) => {
  draggingLuminance = true;
  updateLuminanceFromEvent(e);
});

luminanceTrack.addEventListener('touchstart', (e) => {
  draggingLuminance = true;
  updateLuminanceFromEvent(e.touches[0]);
}, { passive: true });

window.addEventListener('mouseup', () => { draggingLuminance = false; });
window.addEventListener('touchend', () => { draggingLuminance = false; });

// --- Scroll for luminance ---
window.addEventListener('wheel', (e) => {
  if (!state.entered) return;
  state.luminance = Math.round(Math.max(0, Math.min(100, state.luminance - e.deltaY * 0.05)));
  syncLuminanceUI();
}, { passive: true });

// --- Pointer tracking (mouse + touch) ---
function updatePointer(x, y) {
  state.targetMouseX = x;
  state.targetMouseY = y;
  cursorGlow.style.left = x + 'px';
  cursorGlow.style.top = y + 'px';
}

window.addEventListener('mousemove', (e) => {
  updatePointer(e.clientX, e.clientY);
  if (draggingLuminance) {
    updateLuminanceFromEvent(e);
  }
});

window.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  updatePointer(touch.clientX, touch.clientY);
  if (draggingLuminance) {
    updateLuminanceFromEvent(touch);
  }
}, { passive: true });

// --- Click/tap to capture ---
function captureColor(clientX, clientY) {
  if (!state.entered) return;

  const { hue, sat, lum } = getColorAtCursor();
  const hex = hslToHex(hue, sat, lum);

  updateCaptureDisplay(hue, sat, lum);
  addToConstellation(hex, hue, sat, lum);

  cursorGlow.classList.add('capturing');
  setTimeout(() => cursorGlow.classList.remove('capturing'), 400);

  createSupernova(clientX, clientY, `hsla(${hue}, ${sat}%, ${lum}%, 1)`);
}

nebulaCanvas.addEventListener('click', (e) => {
  captureColor(e.clientX, e.clientY);
});

nebulaCanvas.addEventListener('touchend', (e) => {
  if (e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    updatePointer(touch.clientX, touch.clientY);
    // Brief delay to let pointer state update
    requestAnimationFrame(() => captureColor(touch.clientX, touch.clientY));
  }
});

// --- Copy ---
function showNotification(text, duration) {
  notification.textContent = text;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
    notification.textContent = 'Copied!';
  }, duration || 1500);
}

copyBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!state.capturedColor) {
    showNotification('Capture a color first', 1500);
    return;
  }

  if (!navigator.clipboard) {
    showNotification('Copy failed', 1500);
    return;
  }

  navigator.clipboard.writeText(state.capturedColor.toUpperCase()).then(() => {
    showNotification('Copied!', 1500);
  }).catch(() => {
    showNotification('Copy failed', 1500);
  });
});

// --- Enter the Nebula ---
titleEnter.addEventListener('click', enterNebula);
titleEnter.addEventListener('touchend', (e) => {
  e.preventDefault();
  enterNebula();
});

function enterNebula() {
  if (state.entered) return;
  state.entered = true;
  titleOverlay.classList.add('hidden');

  setTimeout(() => {
    hudCoords.classList.add('visible');
    hudCapture.classList.add('visible');
    hudConstellation.classList.add('visible');
    hudLuminance.classList.add('visible');
    backLink.classList.add('visible');
  }, 600);
}

// --- Draw background nebula clouds (expensive radial gradients, every 4th frame) ---
function drawNebulaBackground(ctx, w, h, time) {
  const cx = w / 2;
  const cy = h / 2;

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + time * 0.0001;
    const dist = 100 + Math.sin(time * 0.0003 + i) * 50;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const hue = (i * 72 + time * 0.02) % 360;
    const radius = 200 + Math.sin(time * 0.0005 + i * 2) * 80;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `hsla(${hue}, 60%, ${state.luminance * 0.5}%, 0.03)`);
    gradient.addColorStop(0.5, `hsla(${hue}, 40%, ${state.luminance * 0.4}%, 0.015)`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
}

// --- Draw background stars ---
function drawBackgroundStars(ctx, time) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (const star of bgStars) {
    const alpha = star.alpha * (0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase));
    ctx.beginPath();
    ctx.arc(star.nx * w, star.ny * h, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
    ctx.fill();
  }
}

// --- Draw connecting lines between nearby particles (every 2nd frame) ---
function drawConnections(ctx) {
  const connectionDist = 60;
  const maxConnections = 300;
  let count = 0;

  for (let i = 0; i < particles.length && count < maxConnections; i += 3) {
    const p1 = particles[i];
    for (let j = i + 3; j < particles.length && count < maxConnections; j += 3) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = dx * dx + dy * dy;
      if (dist < connectionDist * connectionDist) {
        const alpha = (1 - Math.sqrt(dist) / connectionDist) * 0.08;
        const { hue, sat } = p1.getColor();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${state.luminance}%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        count++;
      }
    }
  }
}

// --- Draw center gravity well ---
function drawGravityWell(ctx, w, h, time) {
  const cx = w / 2;
  const cy = h / 2;
  const pulseSize = 3 + Math.sin(time * 0.002) * 1.5;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  gradient.addColorStop(0, `rgba(200, 200, 255, 0.06)`);
  gradient.addColorStop(0.5, `rgba(150, 150, 255, 0.02)`);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(cx - 60, cy - 60, 120, 120);

  ctx.beginPath();
  ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(220, 220, 255, 0.3)`;
  ctx.fill();

  ctx.strokeStyle = `rgba(220, 220, 255, 0.1)`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy);
  ctx.lineTo(cx + 12, cy);
  ctx.moveTo(cx, cy - 12);
  ctx.lineTo(cx, cy + 12);
  ctx.stroke();
}

// --- Main Render Loop ---
function render() {
  try {
    const w = window.innerWidth;
    const h = window.innerHeight;
    state.time++;

    // Skip full rendering while title overlay is visible
    if (!state.entered) {
      // Fade previous frame (semi-transparent fill creates motion trails)
      ctx.fillStyle = `rgba(2, 2, 8, 0.4)`;
      ctx.fillRect(0, 0, w, h);
      drawBackgroundStars(ctx, state.time);
      requestAnimationFrame(render);
      return;
    }

    state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;

    // Fade previous frame (semi-transparent fill creates motion trails)
    ctx.fillStyle = `rgba(2, 2, 8, 0.4)`;
    ctx.fillRect(0, 0, w, h);

    if (state.time % 4 === 0) {
      drawNebulaBackground(ctx, w, h, state.time);
    }
    drawBackgroundStars(ctx, state.time);
    drawGravityWell(ctx, w, h, state.time);

    if (state.time % 2 === 0) {
      drawConnections(ctx);
    }

    for (const p of particles) {
      p.update(state.time);
      p.draw(ctx);
    }

    drawCaptureEffects(ctx);

    // Bloom pass: downsample main canvas to 25% resolution bloom canvas.
    // The bloom canvas is overlaid via CSS mix-blend-mode: screen at 50% opacity
    // (see styles.css #bloom), creating a soft glow on bright particles.
    const bw = bloomCanvas.width;
    const bh = bloomCanvas.height;
    if (bw > 0 && bh > 0) {
      bctx.clearRect(0, 0, bw, bh);
      bctx.drawImage(nebulaCanvas, 0, 0, bw, bh);
    }

    // Update HUD (every 3rd frame)
    if (state.time % 3 === 0) {
      updateHUD();
    }
  } catch (err) {
    console.error('[Nebula] Render error:', err);
  }

  requestAnimationFrame(render);
}

// --- Start ---
render();
