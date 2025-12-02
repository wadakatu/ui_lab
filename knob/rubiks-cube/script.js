/**
 * Rubik's Cube Knob Controller
 * A 3D rotating cube that functions as an interactive knob control
 */

class RubiksCubeKnob {
  constructor() {
    // DOM Elements
    this.cube = document.getElementById('cube');
    this.cubeContainer = document.getElementById('cubeContainer');
    this.cubeStage = document.querySelector('.cube-stage');
    this.cubeGlow = document.getElementById('cubeGlow');
    this.interaction = document.getElementById('cubeInteraction');
    this.valueDisplay = document.getElementById('valueDisplay');
    this.rotXDisplay = document.getElementById('rotX');
    this.rotYDisplay = document.getElementById('rotY');

    // Stats elements
    this.rotationCountDisplay = document.getElementById('rotationCount');
    this.momentumDisplay = document.getElementById('momentum');
    this.currentFaceDisplay = document.getElementById('currentFace');
    this.modeDisplay = document.getElementById('modeDisplay');

    // State
    this.rotationX = -20;
    this.rotationY = -30;
    this.value = 0;
    this.isDragging = false;
    this.isScrambling = false;
    this.lastX = 0;
    this.lastY = 0;

    // Momentum physics
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.95;
    this.sensitivity = 0.5;

    // Stats
    this.rotationCount = 0;
    this.lastRotationY = -30;

    // Bind methods
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.animationLoop = this.animationLoop.bind(this);

    this.init();
  }

  init() {
    // Mouse events
    this.interaction.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    // Touch events
    this.interaction.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);

    // Wheel and keyboard
    this.interaction.addEventListener('wheel', this.handleWheel, { passive: false });
    this.interaction.addEventListener('dblclick', this.handleDoubleClick);
    this.interaction.addEventListener('keydown', this.handleKeyDown);

    // Start animation loop
    this.animationLoop();

    // Initial render
    this.updateCube();
    this.updateDisplays();
  }

  handleMouseDown(e) {
    if (this.isScrambling) return;

    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.velocityX = 0;
    this.velocityY = 0;

    this.updateMode('DRAGGING');
    this.interaction.style.cursor = 'grabbing';
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.lastX;
    const deltaY = e.clientY - this.lastY;

    this.velocityX = deltaY * this.sensitivity;
    this.velocityY = deltaX * this.sensitivity;

    this.rotationX += this.velocityX;
    this.rotationY += this.velocityY;

    this.lastX = e.clientX;
    this.lastY = e.clientY;

    this.updateCube();
    this.calculateValue();
    this.updateDisplays();
    this.trackRotations();
  }

  handleMouseUp() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.updateMode('MOMENTUM');
    this.interaction.style.cursor = 'grab';
  }

  handleTouchStart(e) {
    if (this.isScrambling) return;
    e.preventDefault();

    const touch = e.touches[0];
    this.isDragging = true;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
    this.velocityX = 0;
    this.velocityY = 0;

    this.updateMode('DRAGGING');
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.lastX;
    const deltaY = touch.clientY - this.lastY;

    this.velocityX = deltaY * this.sensitivity;
    this.velocityY = deltaX * this.sensitivity;

    this.rotationX += this.velocityX;
    this.rotationY += this.velocityY;

    this.lastX = touch.clientX;
    this.lastY = touch.clientY;

    this.updateCube();
    this.calculateValue();
    this.updateDisplays();
    this.trackRotations();
  }

  handleTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.updateMode('MOMENTUM');
  }

  handleWheel(e) {
    if (this.isScrambling) return;
    e.preventDefault();

    const delta = e.deltaY * 0.1;
    this.rotationY += delta;

    this.updateCube();
    this.calculateValue();
    this.updateDisplays();
    this.trackRotations();
  }

  handleKeyDown(e) {
    if (this.isScrambling) return;

    const step = e.shiftKey ? 10 : 5;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.rotationY -= step;
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.rotationY += step;
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.rotationX -= step;
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.rotationX += step;
        break;
      case ' ':
        e.preventDefault();
        this.scramble();
        break;
      default:
        return;
    }

    this.updateCube();
    this.calculateValue();
    this.updateDisplays();
    this.trackRotations();
  }

  handleDoubleClick() {
    this.scramble();
  }

  async scramble() {
    if (this.isScrambling) return;

    this.isScrambling = true;
    this.updateMode('SCRAMBLING');
    this.cube.classList.add('scrambling');
    this.cubeStage.classList.add('scrambling');

    // Random scramble rotations
    const moves = 12;
    const duration = 150;

    for (let i = 0; i < moves; i++) {
      const randomX = (Math.random() - 0.5) * 180;
      const randomY = (Math.random() - 0.5) * 180;

      this.rotationX += randomX;
      this.rotationY += randomY;

      this.updateCube();
      this.calculateValue();
      this.updateDisplays();

      await this.sleep(duration);
    }

    // Reset to initial position with smooth animation
    await this.sleep(200);

    this.rotationX = -20;
    this.rotationY = -30;
    this.value = 0;
    this.velocityX = 0;
    this.velocityY = 0;

    this.updateCube();
    this.updateDisplays();

    this.cube.classList.remove('scrambling');
    this.cubeStage.classList.remove('scrambling');
    this.isScrambling = false;
    this.updateMode('IDLE');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  animationLoop() {
    // Apply momentum when not dragging
    if (!this.isDragging && !this.isScrambling) {
      if (Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01) {
        this.rotationX += this.velocityX;
        this.rotationY += this.velocityY;

        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        this.updateCube();
        this.calculateValue();
        this.updateDisplays();
        this.trackRotations();
      } else if (this.velocityX !== 0 || this.velocityY !== 0) {
        this.velocityX = 0;
        this.velocityY = 0;
        this.updateMode('IDLE');
      }
    }

    // Update momentum display
    const totalMomentum = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
    this.momentumDisplay.textContent = totalMomentum.toFixed(2);

    // Update glow based on momentum
    const glowIntensity = Math.min(1, totalMomentum / 5);
    this.cubeGlow.style.opacity = 0.8 + glowIntensity * 0.2;
    this.cubeGlow.style.transform = `scale(${1 + glowIntensity * 0.3})`;

    requestAnimationFrame(this.animationLoop);
  }

  updateCube() {
    this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
  }

  calculateValue() {
    // Normalize rotation to 0-100 value
    // Use Y rotation as primary value source
    const normalizedY = ((this.rotationY % 360) + 360) % 360;
    this.value = Math.round((normalizedY / 360) * 100);

    // Update ARIA
    this.interaction.setAttribute('aria-valuenow', this.value);
  }

  updateDisplays() {
    // Value display (padded to 3 digits)
    this.valueDisplay.textContent = String(this.value).padStart(3, '0');

    // Rotation displays
    const displayRotX = Math.round(this.rotationX % 360);
    const displayRotY = Math.round(this.rotationY % 360);
    this.rotXDisplay.textContent = `${displayRotX}°`;
    this.rotYDisplay.textContent = `${displayRotY}°`;

    // Current face
    this.currentFaceDisplay.textContent = this.getCurrentFace();
  }

  getCurrentFace() {
    // Determine which face is most visible
    const normX = ((this.rotationX % 360) + 360) % 360;
    const normY = ((this.rotationY % 360) + 360) % 360;

    // Simplified face detection
    if (normX > 45 && normX < 135) return 'BOTTOM';
    if (normX > 225 && normX < 315) return 'TOP';

    if (normY >= 315 || normY < 45) return 'FRONT';
    if (normY >= 45 && normY < 135) return 'RIGHT';
    if (normY >= 135 && normY < 225) return 'BACK';
    if (normY >= 225 && normY < 315) return 'LEFT';

    return 'FRONT';
  }

  trackRotations() {
    // Count full rotations
    const currentFullRotations = Math.floor(Math.abs(this.rotationY) / 360);
    const lastFullRotations = Math.floor(Math.abs(this.lastRotationY) / 360);

    if (currentFullRotations > lastFullRotations) {
      this.rotationCount += currentFullRotations - lastFullRotations;
      this.rotationCountDisplay.textContent = this.rotationCount;
    }

    this.lastRotationY = this.rotationY;
  }

  updateMode(mode) {
    this.modeDisplay.textContent = mode;

    // Color code the mode
    switch (mode) {
      case 'DRAGGING':
        this.modeDisplay.style.color = '#ff2d95';
        break;
      case 'MOMENTUM':
        this.modeDisplay.style.color = '#00f0ff';
        break;
      case 'SCRAMBLING':
        this.modeDisplay.style.color = '#ffea00';
        break;
      default:
        this.modeDisplay.style.color = '#ffffff';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RubiksCubeKnob();
});
