/**
 * Event Horizon Knob - Black Hole UI Control
 * A knob that simulates a black hole with realistic physics visualization
 * NOW WITH CRITICAL MASS BREAKTHROUGH MODE!
 */

class BlackHoleKnob {
  constructor() {
    this.value = 0;
    this.min = 0;
    this.max = 500; // Extended max for breakthrough mode
    this.isDragging = false;
    this.lastAngle = 0;
    this.isCritical = false;
    this.isSingularity = false;

    // DOM elements
    this.container = document.getElementById('knobContainer');
    this.knob = document.getElementById('knob');
    this.eventHorizon = document.getElementById('eventHorizon');
    this.accretionDisk = document.getElementById('accretionDisk');
    this.hawkingRadiation = document.getElementById('hawkingRadiation');
    this.starfield = document.getElementById('starfield');

    // Display elements
    this.valueDisplay = document.getElementById('valueDisplay');
    this.radiusDisplay = document.getElementById('radiusDisplay');
    this.horizonSize = document.getElementById('horizonSize');
    this.accretionRate = document.getElementById('accretionRate');
    this.hawkingTemp = document.getElementById('hawkingTemp');
    this.timeDilation = document.getElementById('timeDilation');

    // Store star elements for absorption effect
    this.stars = [];

    this.init();
  }

  init() {
    this.createStarfield();
    this.createAccretionDisk();
    this.createHawkingRadiation();
    this.createWarningOverlay();
    this.bindEvents();
    this.updateDisplay();
  }

  createWarningOverlay() {
    // Create warning overlay for critical mass
    this.warningOverlay = document.createElement('div');
    this.warningOverlay.className = 'warning-overlay';
    this.warningOverlay.innerHTML = `
      <div class="warning-content">
        <div class="warning-icon">⚠</div>
        <div class="warning-text">CRITICAL MASS</div>
        <div class="warning-subtext">GRAVITATIONAL COLLAPSE IMMINENT</div>
      </div>
    `;
    document.body.appendChild(this.warningOverlay);

    // Create singularity overlay
    this.singularityOverlay = document.createElement('div');
    this.singularityOverlay.className = 'singularity-overlay';
    this.singularityOverlay.innerHTML = `
      <div class="singularity-content">
        <div class="singularity-text">S I N G U L A R I T Y</div>
        <div class="singularity-subtext">ALL MATTER ABSORBED</div>
        <button class="reset-btn" id="resetBtn">INITIATE BIG BANG</button>
      </div>
    `;
    document.body.appendChild(this.singularityOverlay);

    document.getElementById('resetBtn').addEventListener('click', () => this.bigBang());
  }

  createStarfield() {
    const count = 200;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      star.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        width: ${Math.random() * 2 + 1}px;
        height: ${Math.random() * 2 + 1}px;
        --duration: ${Math.random() * 3 + 2}s;
        --base-opacity: ${Math.random() * 0.5 + 0.3};
        --start-x: ${x}%;
        --start-y: ${y}%;
        animation-delay: ${Math.random() * 5}s;
      `;
      this.starfield.appendChild(star);
      this.stars.push({ element: star, x, y });
    }
  }

  createAccretionDisk() {
    const particleCount = 60;
    const colors = [
      '#ff6b35', '#ffdd00', '#ffffff',
      '#7ec8ff', '#00f7ff', '#ff2d2d',
    ];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'accretion-particle';

      const orbitRadius = 80 + Math.random() * 60;
      const size = Math.random() * 4 + 2;
      const duration = 2 + (orbitRadius / 80) * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * duration;
      const startOpacity = Math.random() * 0.5 + 0.5;

      particle.style.cssText = `
        --orbit-offset: ${orbitRadius}px;
        --size: ${size}px;
        --duration: ${duration}s;
        --color: ${color};
        --delay: -${delay}s;
        --start-opacity: ${startOpacity};
      `;

      this.accretionDisk.appendChild(particle);
    }
  }

  createHawkingRadiation() {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'hawking-particle';
      const angle = (i / particleCount) * 360;
      const duration = 2 + Math.random() * 2;
      const delay = Math.random() * duration;

      particle.style.cssText = `
        --angle: ${angle}deg;
        --duration: ${duration}s;
        --delay: -${delay}s;
      `;

      this.hawkingRadiation.appendChild(particle);
    }
  }

  bindEvents() {
    this.knob.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    this.knob.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));

    this.knob.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    this.knob.addEventListener('dblclick', this.collapse.bind(this));
    this.knob.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  getCenter() {
    const rect = this.knob.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  getAngleFromCenter(clientX, clientY) {
    const center = this.getCenter();
    return Math.atan2(clientX - center.x, -(clientY - center.y)) * (180 / Math.PI);
  }

  onMouseDown(e) {
    if (this.isSingularity) return;
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
    if (this.isSingularity) return;
    e.preventDefault();
    this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }

  onTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.drag(e.touches[0].clientX, e.touches[0].clientY);
  }

  onTouchEnd() {
    this.endDrag();
  }

  startDrag(clientX, clientY) {
    this.isDragging = true;
    this.lastAngle = this.getAngleFromCenter(clientX, clientY);
    this.knob.classList.add('dragging');
  }

  drag(clientX, clientY) {
    const currentAngle = this.getAngleFromCenter(clientX, clientY);
    let deltaAngle = currentAngle - this.lastAngle;

    if (deltaAngle > 180) deltaAngle -= 360;
    else if (deltaAngle < -180) deltaAngle += 360;

    // Acceleration factor increases as mass grows
    const accelerationFactor = 1 + (this.value / 100) * 0.5;
    const newValue = Math.max(this.min, this.value + deltaAngle * 0.3 * accelerationFactor);

    if (newValue !== this.value) {
      this.value = newValue;
      this.updateDisplay();
      this.triggerPulse();
    }

    this.lastAngle = currentAngle;
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.knob.classList.remove('dragging');
  }

  onWheel(e) {
    if (this.isSingularity) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * (2 + this.value * 0.02);
    const newValue = Math.max(this.min, this.value + delta);

    if (newValue !== this.value) {
      this.value = newValue;
      this.updateDisplay();
      this.triggerPulse();
    }
  }

  onKeyDown(e) {
    if (this.isSingularity) return;
    let delta = 0;
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        delta = 1 + this.value * 0.01;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        delta = -(1 + this.value * 0.01);
        break;
      case 'Home':
        this.bigBang();
        return;
      default:
        return;
    }

    e.preventDefault();
    const newValue = Math.max(this.min, this.value + delta);
    if (newValue !== this.value) {
      this.value = newValue;
      this.updateDisplay();
    }
  }

  collapse() {
    if (this.isSingularity) return;
    this.eventHorizon.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    this.value = 0;
    this.isCritical = false;
    document.body.classList.remove('critical-mode', 'extreme-mode');
    this.warningOverlay.classList.remove('active');
    this.updateDisplay();
    this.resetStars();

    setTimeout(() => {
      this.eventHorizon.style.transition = '';
    }, 800);
  }

  bigBang() {
    // Epic reset animation
    this.singularityOverlay.classList.add('big-bang');
    document.body.classList.add('big-bang-flash');

    setTimeout(() => {
      this.isSingularity = false;
      this.isCritical = false;
      this.value = 0;
      document.body.classList.remove('critical-mode', 'extreme-mode', 'singularity-mode', 'big-bang-flash');
      this.singularityOverlay.classList.remove('active', 'big-bang');
      this.warningOverlay.classList.remove('active');
      this.resetStars();
      this.updateDisplay();
    }, 1000);
  }

  resetStars() {
    this.stars.forEach(star => {
      star.element.style.transform = '';
      star.element.style.opacity = '';
      star.element.classList.remove('absorbed');
    });
  }

  triggerPulse() {
    this.container.classList.remove('pulse');
    void this.container.offsetWidth;
    this.container.classList.add('pulse');
  }

  updateDisplay() {
    // Calculate various states
    const criticalThreshold = 100;
    const extremeThreshold = 200;
    const singularityThreshold = 350;

    // Update value display
    this.valueDisplay.textContent = Math.round(this.value);
    this.knob.setAttribute('aria-valuenow', Math.round(this.value));

    // Calculate Schwarzschild radius
    const schwarzschildRadius = Math.round(this.value * 3);
    this.radiusDisplay.textContent = schwarzschildRadius.toLocaleString();

    // Calculate event horizon size - grows exponentially after critical mass
    let horizonSize;
    if (this.value <= criticalThreshold) {
      horizonSize = 80 + (100 / criticalThreshold) * this.value;
    } else if (this.value <= extremeThreshold) {
      const overCritical = this.value - criticalThreshold;
      horizonSize = 180 + overCritical * 3;
    } else if (this.value <= singularityThreshold) {
      const overExtreme = this.value - extremeThreshold;
      horizonSize = 480 + overExtreme * 5;
    } else {
      // Singularity - covers entire screen
      horizonSize = Math.min(3000, 1230 + (this.value - singularityThreshold) * 20);
    }

    this.eventHorizon.style.width = `${horizonSize}px`;
    this.eventHorizon.style.height = `${horizonSize}px`;

    // Critical mode effects
    if (this.value >= criticalThreshold && !this.isCritical) {
      this.isCritical = true;
      document.body.classList.add('critical-mode');
      this.warningOverlay.classList.add('active');
    } else if (this.value < criticalThreshold && this.isCritical) {
      this.isCritical = false;
      document.body.classList.remove('critical-mode', 'extreme-mode');
      this.warningOverlay.classList.remove('active');
    }

    // Extreme mode
    if (this.value >= extremeThreshold) {
      document.body.classList.add('extreme-mode');
      this.absorbStars();
    } else {
      document.body.classList.remove('extreme-mode');
    }

    // Singularity mode - game over
    if (this.value >= singularityThreshold && !this.isSingularity) {
      this.isSingularity = true;
      document.body.classList.add('singularity-mode');
      this.singularityOverlay.classList.add('active');
    }

    // Update info panel
    const percentage = Math.min(this.value / criticalThreshold, 1);
    this.horizonSize.textContent = this.value >= criticalThreshold
      ? `${Math.round((this.value / criticalThreshold) * 100)}% [CRITICAL]`
      : `${Math.round(percentage * 100)}%`;

    const accRate = (this.value * 0.005).toFixed(2);
    this.accretionRate.textContent = `${accRate} M☉/yr`;

    if (this.value > 0) {
      const temp = Math.round(6.2e-8 / this.value * 1e10);
      this.hawkingTemp.textContent = `${temp.toExponential(1)} K`;
    } else {
      this.hawkingTemp.textContent = '∞ K';
    }

    const timeFactor = 1 + (this.value / 100) * 10;
    this.timeDilation.textContent = this.value >= criticalThreshold
      ? `∞ (FROZEN)`
      : `${timeFactor.toFixed(2)}x`;

    // Screen shake at high values
    if (this.value >= extremeThreshold) {
      const shakeIntensity = Math.min((this.value - extremeThreshold) / 50, 5);
      document.body.style.setProperty('--shake-intensity', `${shakeIntensity}px`);
    }
  }

  absorbStars() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const absorptionProgress = Math.min((this.value - 200) / 150, 1);

    this.stars.forEach((star, index) => {
      const starRect = star.element.getBoundingClientRect();
      const starX = starRect.left + starRect.width / 2;
      const starY = starRect.top + starRect.height / 2;

      const dx = centerX - starX;
      const dy = centerY - starY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Stars closer to center get absorbed first
      const threshold = (1 - absorptionProgress) * window.innerWidth;

      if (distance < threshold * (0.5 + index / this.stars.length * 0.5)) {
        const pullStrength = absorptionProgress * 0.8;
        const newX = dx * pullStrength;
        const newY = dy * pullStrength;
        star.element.style.transform = `translate(${newX}px, ${newY}px) scale(${1 - absorptionProgress * 0.8})`;
        star.element.style.opacity = 1 - absorptionProgress;

        if (absorptionProgress > 0.8) {
          star.element.classList.add('absorbed');
        }
      }
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new BlackHoleKnob();
});
