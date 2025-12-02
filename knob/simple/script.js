/**
 * Simple Knob - Interactive rotary control with circular drag
 */

class Knob {
  constructor(element, options = {}) {
    this.element = element;
    this.knobBody = element.querySelector('.knob-body');

    // Configuration
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.initial = options.initial ?? this.min;
    this.step = options.step ?? 1;
    this.angleRange = options.angleRange ?? 270;
    this.startAngle = options.startAngle ?? -135;

    // State
    this.value = this.initial;
    this.rotation = this.valueToRotation(this.value);
    this.isDragging = false;
    this.lastAngle = 0;

    // Callbacks
    this.onChange = options.onChange || (() => {});

    this.init();
  }

  init() {
    this.updateRotation();
    this.bindEvents();
  }

  bindEvents() {
    // Mouse events
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Touch events
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Wheel event
    this.element.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    // Double click to reset
    this.element.addEventListener('dblclick', this.reset.bind(this));

    // Keyboard
    this.element.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  // Get center of knob element
  getCenter() {
    const rect = this.element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // Calculate angle from center to point (in degrees)
  getAngleFromCenter(clientX, clientY) {
    const center = this.getCenter();
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    // atan2 returns angle in radians, convert to degrees
    // Adjust so that top is 0 degrees, clockwise is positive
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    return angle;
  }

  onMouseDown(e) {
    e.preventDefault();
    this.startDrag(e.clientX, e.clientY);
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    this.drag(e.clientX, e.clientY);
  }

  onMouseUp() {
    this.endDrag();
  }

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.startDrag(touch.clientX, touch.clientY);
  }

  onTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.drag(touch.clientX, touch.clientY);
  }

  onTouchEnd() {
    this.endDrag();
  }

  startDrag(clientX, clientY) {
    this.isDragging = true;
    this.lastAngle = this.getAngleFromCenter(clientX, clientY);
    this.element.classList.add('dragging');
    document.body.style.cursor = 'grabbing';
  }

  drag(clientX, clientY) {
    const currentAngle = this.getAngleFromCenter(clientX, clientY);
    let deltaAngle = currentAngle - this.lastAngle;

    // Handle wrap-around (when crossing from 180 to -180 or vice versa)
    if (deltaAngle > 180) {
      deltaAngle -= 360;
    } else if (deltaAngle < -180) {
      deltaAngle += 360;
    }

    const newRotation = this.clampRotation(this.rotation + deltaAngle);

    if (newRotation !== this.rotation) {
      this.rotation = newRotation;
      this.value = this.rotationToValue(this.rotation);
      this.updateRotation();
      this.onChange(this.value);
    }

    this.lastAngle = currentAngle;
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.element.classList.remove('dragging');
    document.body.style.cursor = '';
  }

  onWheel(e) {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * (this.step / (this.max - this.min)) * this.angleRange * 2;
    const newRotation = this.clampRotation(this.rotation + delta);

    if (newRotation !== this.rotation) {
      this.rotation = newRotation;
      this.value = this.rotationToValue(this.rotation);
      this.updateRotation();
      this.onChange(this.value);
    }
  }

  onKeyDown(e) {
    let delta = 0;
    const stepRotation = (this.step / (this.max - this.min)) * this.angleRange;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        delta = stepRotation;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        delta = -stepRotation;
        break;
      case 'Home':
        this.setValue(this.min);
        return;
      case 'End':
        this.setValue(this.max);
        return;
      default:
        return;
    }

    e.preventDefault();
    const newRotation = this.clampRotation(this.rotation + delta);

    if (newRotation !== this.rotation) {
      this.rotation = newRotation;
      this.value = this.rotationToValue(this.rotation);
      this.updateRotation();
      this.onChange(this.value);
    }
  }

  reset() {
    this.setValue(this.initial);
  }

  setValue(value) {
    this.value = Math.max(this.min, Math.min(this.max, value));
    this.rotation = this.valueToRotation(this.value);
    this.updateRotation();
    this.onChange(this.value);
  }

  valueToRotation(value) {
    const percentage = (value - this.min) / (this.max - this.min);
    return this.startAngle + percentage * this.angleRange;
  }

  rotationToValue(rotation) {
    const percentage = (rotation - this.startAngle) / this.angleRange;
    const rawValue = this.min + percentage * (this.max - this.min);
    return Math.round(rawValue / this.step) * this.step;
  }

  clampRotation(rotation) {
    const minRotation = this.startAngle;
    const maxRotation = this.startAngle + this.angleRange;
    return Math.max(minRotation, Math.min(maxRotation, rotation));
  }

  updateRotation() {
    this.knobBody.style.transform = `rotate(${this.rotation}deg)`;
    this.element.setAttribute('aria-valuenow', this.value);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Create tick marks
  const tickRing = document.getElementById('tickRing');
  const totalTicks = 21;
  const startAngle = -135;
  const endAngle = 135;
  const angleStep = (endAngle - startAngle) / (totalTicks - 1);

  for (let i = 0; i < totalTicks; i++) {
    const angle = startAngle + i * angleStep;
    const tick = document.createElement('div');
    tick.className = 'tick' + (i % 5 === 0 ? ' major' : '');
    tick.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    tickRing.appendChild(tick);
  }

  // Initialize main knob
  const knobElement = document.getElementById('knob');
  const valueDisplay = document.getElementById('valueDisplay');

  const knob = new Knob(knobElement, {
    min: 0,
    max: 100,
    step: 1,
    onChange: (value) => {
      valueDisplay.textContent = Math.round(value);

      // Update active ticks
      const ticks = tickRing.querySelectorAll('.tick');
      const percentage = value / 100;
      const activeCount = Math.floor(percentage * (ticks.length - 1));
      ticks.forEach((tick, index) => {
        tick.classList.toggle('active', index <= activeCount);
      });
    }
  });
});
