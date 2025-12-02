/**
 * Rubik's Cube Mixer
 * Interactive 3D cube where each face controls a mixer parameter
 * Face layers rotate during drag, providing visual feedback
 */

class RubiksCubeMixer {
  constructor() {
    // DOM Elements
    this.scene = document.getElementById('scene');
    this.cube = document.getElementById('cube');
    this.cubeGlow = document.getElementById('cubeGlow');
    this.rotationHint = document.getElementById('rotationHint');
    this.activeDisplay = document.getElementById('activeDisplay');
    this.activeFace = document.getElementById('activeFace');
    this.activeValue = document.getElementById('activeValue');
    this.activeLabel = document.getElementById('activeLabel');
    this.ringFill = document.getElementById('ringFill');

    // Cube state
    this.cubies = [];
    this.cubeRotation = { x: -25, y: -35 };
    this.isRotatingView = false;
    this.isRotatingFace = false;
    this.lastMouse = { x: 0, y: 0 };

    // Face parameters
    this.faceParams = {
      top: { name: 'VOLUME', value: 50, color: '#f5f5f5' },
      front: { name: 'BASS', value: 50, color: '#ff1744' },
      right: { name: 'TREBLE', value: 50, color: '#2979ff' },
      left: { name: 'MID', value: 50, color: '#00e676' },
      back: { name: 'REVERB', value: 50, color: '#ff9100' },
      bottom: { name: 'PAN', value: 50, color: '#ffea00' }
    };

    this.activeFaceKey = null;
    this.currentDragFace = null;
    this.dragStartValue = 0;
    this.currentLayerRotation = 0;

    // Hybrid drag state
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.cubeCenter = { x: 0, y: 0 };
    this.lastAngle = 0;
    this.accumulatedDelta = 0;

    this.init();
  }

  init() {
    this.createCube();
    this.setupEventListeners();
    this.updateAllMeters();
  }

  createCube() {
    const size = 3;
    const cubieSize = 200 / 3;
    const offset = (size - 1) / 2;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          if (x === 1 && y === 1 && z === 1) continue;

          const cubie = document.createElement('div');
          cubie.className = 'cubie';
          cubie.dataset.x = x;
          cubie.dataset.y = y;
          cubie.dataset.z = z;

          const posX = (x - offset) * cubieSize;
          const posY = (y - offset) * cubieSize;
          const posZ = (z - offset) * cubieSize;

          cubie.style.transform = `translate3d(${posX}px, ${posY}px, ${posZ}px)`;
          cubie.dataset.baseTransform = `translate3d(${posX}px, ${posY}px, ${posZ}px)`;

          if (z === 2) this.addFace(cubie, 'front');
          if (z === 0) this.addFace(cubie, 'back');
          if (x === 2) this.addFace(cubie, 'right');
          if (x === 0) this.addFace(cubie, 'left');
          if (y === 0) this.addFace(cubie, 'top');
          if (y === 2) this.addFace(cubie, 'bottom');

          this.cube.appendChild(cubie);
          this.cubies.push(cubie);
        }
      }
    }
  }

  addFace(cubie, faceName) {
    const face = document.createElement('div');
    face.className = `cubie-face ${faceName}`;
    face.dataset.face = faceName;
    cubie.appendChild(face);
  }

  setupEventListeners() {
    this.scene.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    this.scene.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Mouse wheel for fine control
    this.scene.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    this.scene.addEventListener('contextmenu', e => e.preventDefault());
  }

  handleWheel(e) {
    e.preventDefault();
    const faceEl = e.target.closest('.cubie-face');
    if (!faceEl) return;

    const face = faceEl.dataset.face;
    const delta = -e.deltaY * 0.1; // Scroll sensitivity

    let newValue = this.faceParams[face].value + delta;
    newValue = Math.max(0, Math.min(100, newValue));
    this.faceParams[face].value = Math.round(newValue);

    this.setActiveFace(face);
    this.updateMeter(face);
    this.updateActiveDisplay(face);
    this.updateFaceGlow(face);

    // Quick visual feedback
    this.rotateLayer(face, delta * 3);
    setTimeout(() => this.snapLayerBack(face), 100);
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.lastMouse = { x: e.clientX, y: e.clientY };

    if (e.button === 2) {
      this.isRotatingView = true;
      return;
    }

    const faceEl = e.target.closest('.cubie-face');
    if (faceEl) {
      this.startFaceInteraction(faceEl.dataset.face, e.clientX, e.clientY);
    } else {
      this.isRotatingView = true;
    }
  }

  handleMouseMove(e) {
    if (this.isRotatingView) {
      const deltaX = e.clientX - this.lastMouse.x;
      const deltaY = e.clientY - this.lastMouse.y;
      this.cubeRotation.y += deltaX * 0.5;
      this.cubeRotation.x -= deltaY * 0.5;
      this.updateCubeRotation();
      this.lastMouse = { x: e.clientX, y: e.clientY };
    } else if (this.isRotatingFace && this.currentDragFace) {
      this.updateFaceInteraction(e.clientX, e.clientY);
    }
  }

  handleMouseUp() {
    this.isRotatingView = false;
    if (this.isRotatingFace) {
      this.endFaceInteraction();
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.lastMouse = { x: touch.clientX, y: touch.clientY };

    const faceEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.cubie-face');
    if (faceEl) {
      this.startFaceInteraction(faceEl.dataset.face, touch.clientX, touch.clientY);
    } else {
      this.isRotatingView = true;
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];

    if (this.isRotatingView) {
      const deltaX = touch.clientX - this.lastMouse.x;
      const deltaY = touch.clientY - this.lastMouse.y;
      this.cubeRotation.y += deltaX * 0.5;
      this.cubeRotation.x -= deltaY * 0.5;
      this.updateCubeRotation();
      this.lastMouse = { x: touch.clientX, y: touch.clientY };
    } else if (this.isRotatingFace && this.currentDragFace) {
      this.updateFaceInteraction(touch.clientX, touch.clientY);
    }
  }

  handleTouchEnd() {
    this.isRotatingView = false;
    if (this.isRotatingFace) {
      this.endFaceInteraction();
    }
  }

  startFaceInteraction(face, clientX, clientY) {
    this.isRotatingFace = true;
    this.currentDragFace = face;
    this.dragStartValue = this.faceParams[face].value;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.currentLayerRotation = 0;
    this.accumulatedDelta = 0;

    // Calculate cube center for circular drag
    const sceneRect = this.scene.getBoundingClientRect();
    this.cubeCenter = {
      x: sceneRect.left + sceneRect.width / 2,
      y: sceneRect.top + sceneRect.height / 2
    };
    this.lastAngle = this.getAngleFromCenter(clientX, clientY);
    this.lastMouse = { x: clientX, y: clientY };

    this.setActiveFace(face);
    this.showRotationHint(face);
    this.highlightLayer(face, true);
  }

  getAngleFromCenter(clientX, clientY) {
    const dx = clientX - this.cubeCenter.x;
    const dy = clientY - this.cubeCenter.y;
    return Math.atan2(dx, -dy) * (180 / Math.PI);
  }

  updateFaceInteraction(clientX, clientY) {
    const face = this.currentDragFace;
    if (!face) return;

    // Calculate circular (angular) delta
    const currentAngle = this.getAngleFromCenter(clientX, clientY);
    let angularDelta = currentAngle - this.lastAngle;
    if (angularDelta > 180) angularDelta -= 360;
    if (angularDelta < -180) angularDelta += 360;

    // Calculate linear delta (vertical movement)
    const linearDelta = (this.lastMouse.y - clientY) * 0.8;

    // Hybrid: combine both inputs
    // Use whichever is more significant, with a slight bias toward linear for precision
    const absAngular = Math.abs(angularDelta);
    const absLinear = Math.abs(linearDelta);

    let delta;
    if (absAngular > absLinear * 1.5) {
      // Circular motion is dominant
      delta = angularDelta;
    } else if (absLinear > absAngular * 1.5) {
      // Linear motion is dominant
      delta = linearDelta;
    } else {
      // Combined: average both inputs
      delta = (angularDelta + linearDelta) / 2;
    }

    this.accumulatedDelta += delta;
    this.lastAngle = currentAngle;
    this.lastMouse = { x: clientX, y: clientY };

    // Visual layer rotation (continuous, modulo 360 for display)
    this.currentLayerRotation = this.accumulatedDelta;
    this.rotateLayer(face, this.accumulatedDelta % 360);

    // Calculate value: 360 degrees = 100 value (clamped)
    let newValue = this.dragStartValue + (this.accumulatedDelta / 3.6);
    // Clamp between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));
    this.faceParams[face].value = Math.round(newValue);

    this.updateMeter(face);
    this.updateActiveDisplay(face);
    this.updateFaceGlow(face);
  }

  endFaceInteraction() {
    const face = this.currentDragFace;
    if (face) {
      // Snap back with animation
      this.snapLayerBack(face);
      this.highlightLayer(face, false);
    }

    this.isRotatingFace = false;
    this.currentDragFace = null;
    this.currentLayerRotation = 0;
    this.hideRotationHint();
  }

  rotateLayer(faceName, angle) {
    const axis = this.getAxis(faceName);
    const layerIndex = this.getLayerIndex(faceName);

    this.cubies.forEach(cubie => {
      const pos = {
        x: parseInt(cubie.dataset.x),
        y: parseInt(cubie.dataset.y),
        z: parseInt(cubie.dataset.z)
      };

      if (this.isInLayer(pos, axis, layerIndex)) {
        const baseTransform = cubie.dataset.baseTransform;
        const rotateTransform = this.getRotateTransform(axis, angle, faceName);
        cubie.style.transform = `${rotateTransform} ${baseTransform}`;
        cubie.style.transition = 'none';
      }
    });
  }

  snapLayerBack(faceName) {
    const axis = this.getAxis(faceName);
    const layerIndex = this.getLayerIndex(faceName);

    this.cubies.forEach(cubie => {
      const pos = {
        x: parseInt(cubie.dataset.x),
        y: parseInt(cubie.dataset.y),
        z: parseInt(cubie.dataset.z)
      };

      if (this.isInLayer(pos, axis, layerIndex)) {
        const baseTransform = cubie.dataset.baseTransform;
        cubie.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        cubie.style.transform = baseTransform;
      }
    });
  }

  getAxis(face) {
    if (face === 'top' || face === 'bottom') return 'y';
    if (face === 'left' || face === 'right') return 'x';
    return 'z';
  }

  getLayerIndex(face) {
    if (face === 'right' || face === 'bottom' || face === 'front') return 2;
    return 0;
  }

  isInLayer(pos, axis, layerIndex) {
    return pos[axis] === layerIndex;
  }

  getRotateTransform(axis, angle, face) {
    let adjustedAngle = angle;
    if (face === 'left' || face === 'back' || face === 'top') {
      adjustedAngle = -angle;
    }

    switch (axis) {
      case 'x': return `rotateX(${adjustedAngle}deg)`;
      case 'y': return `rotateY(${adjustedAngle}deg)`;
      case 'z': return `rotateZ(${adjustedAngle}deg)`;
    }
  }

  highlightLayer(faceName, highlight) {
    const axis = this.getAxis(faceName);
    const layerIndex = this.getLayerIndex(faceName);

    this.cubies.forEach(cubie => {
      const pos = {
        x: parseInt(cubie.dataset.x),
        y: parseInt(cubie.dataset.y),
        z: parseInt(cubie.dataset.z)
      };

      if (this.isInLayer(pos, axis, layerIndex)) {
        cubie.querySelectorAll('.cubie-face').forEach(face => {
          if (highlight) {
            face.classList.add('active');
          } else {
            face.classList.remove('active');
          }
        });
      }
    });
  }

  updateFaceGlow(faceName) {
    const value = this.faceParams[faceName].value;
    const glowIntensity = value / 100;
    const color = this.faceParams[faceName].color;

    document.querySelectorAll(`.cubie-face.${faceName}`).forEach(face => {
      face.style.filter = `brightness(${1 + glowIntensity * 0.4})`;
      face.style.boxShadow = `0 0 ${glowIntensity * 20}px ${color}`;
    });
  }

  updateCubeRotation() {
    this.cube.style.transform = `rotateX(${this.cubeRotation.x}deg) rotateY(${this.cubeRotation.y}deg)`;
  }

  setActiveFace(face) {
    this.activeFaceKey = face;
    const param = this.faceParams[face];

    const faceIcon = this.activeFace.querySelector('.face-icon');
    faceIcon.className = `face-icon ${face}`;

    const faceName = this.activeFace.querySelector('.face-name');
    faceName.textContent = face.toUpperCase();

    this.activeLabel.textContent = param.name;

    document.querySelectorAll('.mixer-channel').forEach(ch => {
      ch.classList.toggle('active', ch.dataset.face === face);
    });

    this.updateActiveDisplay(face);
  }

  updateActiveDisplay(face) {
    const param = this.faceParams[face];
    let displayValue = param.value;

    if (face === 'bottom') {
      if (param.value < 45) {
        displayValue = `L${Math.round((50 - param.value) * 2)}`;
      } else if (param.value > 55) {
        displayValue = `R${Math.round((param.value - 50) * 2)}`;
      } else {
        displayValue = 'C';
      }
    }

    this.activeValue.textContent = displayValue;

    const circumference = 283;
    const percentage = param.value / 100;
    this.ringFill.style.strokeDashoffset = circumference * (1 - percentage);
    this.ringFill.style.stroke = param.color;
  }

  updateMeter(face) {
    const param = this.faceParams[face];
    const meterFill = document.getElementById(`meter-${face}`);
    const meterGlow = document.getElementById(`glow-${face}`);
    const valueDisplay = document.getElementById(`value-${face}`);

    if (!meterFill) return;

    if (face === 'bottom') {
      const panValue = param.value - 50;
      meterFill.style.height = `${Math.abs(panValue)}%`;
      meterFill.style.top = panValue >= 0 ? '50%' : 'auto';
      meterFill.style.bottom = panValue < 0 ? '50%' : 'auto';

      if (param.value < 45) {
        valueDisplay.textContent = `L${Math.round((50 - param.value) * 2)}`;
      } else if (param.value > 55) {
        valueDisplay.textContent = `R${Math.round((param.value - 50) * 2)}`;
      } else {
        valueDisplay.textContent = 'C';
      }
    } else {
      meterFill.style.height = `${param.value}%`;
      if (meterGlow) meterGlow.style.height = `${param.value}%`;
      valueDisplay.textContent = param.value;
    }
  }

  updateAllMeters() {
    Object.keys(this.faceParams).forEach(face => this.updateMeter(face));
  }

  showRotationHint(face) {
    const param = this.faceParams[face];
    this.rotationHint.querySelector('.hint-face').textContent = param.name;
    this.rotationHint.querySelector('.hint-direction').textContent = '↕ ↻ drag';
    this.rotationHint.classList.add('visible');
  }

  hideRotationHint() {
    this.rotationHint.classList.remove('visible');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RubiksCubeMixer();
});
