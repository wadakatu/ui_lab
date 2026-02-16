/**
 * Simple Color Picker - Interactive color selection with SV canvas and Hue slider
 */

class ColorPicker {
  constructor(container) {
    this.container = container;

    // Internal color model: HSV
    this.h = 0;   // 0-360
    this.s = 100;  // 0-100
    this.v = 100;  // 0-100

    // DOM elements
    this.svCanvas = container.querySelector('#svCanvas');
    this.svCtx = this.svCanvas.getContext('2d');
    this.svCursor = container.querySelector('.sv-cursor');
    this.hueSlider = container.querySelector('.hue-slider');
    this.hueHandle = container.querySelector('.hue-handle');
    this.previewSwatch = container.querySelector('.preview-swatch');
    this.hexInput = container.querySelector('#hexInput');
    this.rInput = container.querySelector('#rInput');
    this.gInput = container.querySelector('#gInput');
    this.bInput = container.querySelector('#bInput');
    this.hInput = container.querySelector('#hslH');
    this.sInput = container.querySelector('#hslS');
    this.lInput = container.querySelector('#hslL');
    this.copyBtn = container.querySelector('.copy-btn');

    // Drag state
    this.draggingSV = false;
    this.draggingHue = false;

    this.init();
  }

  init() {
    this.drawSV();
    this.updateFromHSV();
    this.bindEvents();
  }

  // ── Color Conversion Helpers ──

  hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;

    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120)  { r = x; g = c; b = 0; }
    else if (h < 180)  { r = 0; g = c; b = x; }
    else if (h < 240)  { r = 0; g = x; b = c; }
    else if (h < 300)  { r = x; g = 0; b = c; }
    else               { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0, s = 0, v = max;

    if (max !== 0) s = d / max;

    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }

    return { h, s: s * 100, v: v * 100 };
  }

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  hslToHsv(h, s, l) {
    s /= 100;
    l /= 100;
    const v = l + s * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);
    return { h, s: sv * 100, v: v * 100 };
  }

  // ── Drawing ──

  drawSV() {
    const w = this.svCanvas.width;
    const h = this.svCanvas.height;
    const ctx = this.svCtx;

    // Base hue color
    ctx.fillStyle = `hsl(${this.h}, 100%, 50%)`;
    ctx.fillRect(0, 0, w, h);

    // White gradient left to right
    const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, w, h);

    // Black gradient top to bottom
    const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Update UI ──

  updateFromHSV() {
    const rgb = this.hsvToRgb(this.h, this.s, this.v);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Preview swatch
    this.previewSwatch.style.backgroundColor = hex;

    // HEX input
    this.hexInput.value = hex.toUpperCase();

    // RGB inputs
    this.rInput.value = rgb.r;
    this.gInput.value = rgb.g;
    this.bInput.value = rgb.b;

    // HSL inputs
    this.hInput.value = hsl.h;
    this.sInput.value = hsl.s;
    this.lInput.value = hsl.l;

    // SV cursor position
    const svRect = this.svCanvas;
    const cx = (this.s / 100) * svRect.width;
    const cy = (1 - this.v / 100) * svRect.height;
    this.svCursor.style.left = `${(this.s / 100) * 100}%`;
    this.svCursor.style.top = `${(1 - this.v / 100) * 100}%`;

    // Determine cursor border color based on brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    this.svCursor.style.borderColor = brightness > 128 ? '#333' : '#fff';

    // Hue handle position
    this.hueHandle.style.left = `${(this.h / 360) * 100}%`;
    this.hueHandle.style.backgroundColor = `hsl(${this.h}, 100%, 50%)`;
  }

  // ── SV Canvas Interaction ──

  getSVFromEvent(e) {
    const rect = this.svCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return {
      s: (x / rect.width) * 100,
      v: (1 - y / rect.height) * 100
    };
  }

  onSVStart(e) {
    e.preventDefault();
    this.draggingSV = true;
    this.svCanvas.classList.add('dragging');
    const sv = this.getSVFromEvent(e);
    this.s = sv.s;
    this.v = sv.v;
    this.updateFromHSV();
  }

  onSVMove(e) {
    if (!this.draggingSV) return;
    e.preventDefault();
    const sv = this.getSVFromEvent(e);
    this.s = sv.s;
    this.v = sv.v;
    this.updateFromHSV();
  }

  onSVEnd() {
    if (!this.draggingSV) return;
    this.draggingSV = false;
    this.svCanvas.classList.remove('dragging');
  }

  // ── Hue Slider Interaction ──

  getHueFromEvent(e) {
    const rect = this.hueSlider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return (x / rect.width) * 360;
  }

  onHueStart(e) {
    e.preventDefault();
    this.draggingHue = true;
    this.hueSlider.classList.add('dragging');
    this.h = this.getHueFromEvent(e);
    this.drawSV();
    this.updateFromHSV();
  }

  onHueMove(e) {
    if (!this.draggingHue) return;
    e.preventDefault();
    this.h = this.getHueFromEvent(e);
    this.drawSV();
    this.updateFromHSV();
  }

  onHueEnd() {
    if (!this.draggingHue) return;
    this.draggingHue = false;
    this.hueSlider.classList.remove('dragging');
  }

  // ── Input Field Handlers ──

  onHexChange() {
    const rgb = this.hexToRgb(this.hexInput.value);
    if (!rgb) return;
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.h = hsv.h;
    this.s = hsv.s;
    this.v = hsv.v;
    this.drawSV();
    this.updateFromHSV();
  }

  onRGBChange() {
    const r = this.clampInt(this.rInput.value, 0, 255);
    const g = this.clampInt(this.gInput.value, 0, 255);
    const b = this.clampInt(this.bInput.value, 0, 255);
    const hsv = this.rgbToHsv(r, g, b);
    this.h = hsv.h;
    this.s = hsv.s;
    this.v = hsv.v;
    this.drawSV();
    this.updateFromHSV();
  }

  onHSLChange() {
    const h = this.clampInt(this.hInput.value, 0, 360);
    const s = this.clampInt(this.sInput.value, 0, 100);
    const l = this.clampInt(this.lInput.value, 0, 100);
    const hsv = this.hslToHsv(h, s, l);
    this.h = hsv.h;
    this.s = hsv.s;
    this.v = hsv.v;
    this.drawSV();
    this.updateFromHSV();
  }

  clampInt(val, min, max) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  // ── Copy to Clipboard ──

  async copyHex() {
    try {
      await navigator.clipboard.writeText(this.hexInput.value);
      this.copyBtn.classList.add('copied');
      this.copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        this.copyBtn.classList.remove('copied');
        this.copyBtn.textContent = 'Copy';
      }, 1500);
    } catch {
      // Fallback
      this.hexInput.select();
      document.execCommand('copy');
    }
  }

  // ── Keyboard Navigation ──

  onKeyDown(e) {
    const step = e.shiftKey ? 5 : 1;
    let handled = true;

    switch (e.key) {
      case 'ArrowRight':
        this.s = Math.min(100, this.s + step);
        break;
      case 'ArrowLeft':
        this.s = Math.max(0, this.s - step);
        break;
      case 'ArrowUp':
        this.v = Math.min(100, this.v + step);
        break;
      case 'ArrowDown':
        this.v = Math.max(0, this.v - step);
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      this.updateFromHSV();
    }
  }

  // ── Event Binding ──

  bindEvents() {
    // SV Canvas
    this.svCanvas.addEventListener('mousedown', (e) => this.onSVStart(e));
    document.addEventListener('mousemove', (e) => this.onSVMove(e));
    document.addEventListener('mouseup', () => this.onSVEnd());
    this.svCanvas.addEventListener('touchstart', (e) => this.onSVStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.onSVMove(e), { passive: false });
    document.addEventListener('touchend', () => this.onSVEnd());

    // Hue Slider
    this.hueSlider.addEventListener('mousedown', (e) => this.onHueStart(e));
    document.addEventListener('mousemove', (e) => this.onHueMove(e));
    document.addEventListener('mouseup', () => this.onHueEnd());
    this.hueSlider.addEventListener('touchstart', (e) => this.onHueStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.onHueMove(e), { passive: false });
    document.addEventListener('touchend', () => this.onHueEnd());

    // Input fields
    this.hexInput.addEventListener('change', () => this.onHexChange());
    [this.rInput, this.gInput, this.bInput].forEach(input => {
      input.addEventListener('change', () => this.onRGBChange());
    });
    [this.hInput, this.sInput, this.lInput].forEach(input => {
      input.addEventListener('change', () => this.onHSLChange());
    });

    // Copy button
    this.copyBtn.addEventListener('click', () => this.copyHex());

    // Keyboard
    this.svCanvas.addEventListener('keydown', (e) => this.onKeyDown(e));
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('colorPicker');
  new ColorPicker(container);
});
