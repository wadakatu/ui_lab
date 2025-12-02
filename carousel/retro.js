(() => {
  const root = document.querySelector('.pachi');
  const viewport = document.querySelector('.pachi__viewport');
  const track = document.querySelector('[data-track]');
  const arm = document.querySelector('[data-arm]');
  const lamp = document.querySelector('[data-lamp]');
  const stopBtn = document.querySelector('[data-stop]');
  const credEl = document.querySelector('[data-cred]');
  const lastEl = document.querySelector('[data-last]');

  // Build seamless loop (3 sets)
  const baseSlides = Array.from(track.children);
  const n = baseSlides.length;
  track.innerHTML = '';
  for (let s = 0; s < 3; s++) baseSlides.forEach(node => track.appendChild(node.cloneNode(true)));
  let slideW = 0;
  let pos = n; // start in middle set
  let state = 'idle'; // idle | spin | snap
  let v = 0; // slides/sec
  let reqStop = false;
  let rafId = 0;
  let guardId = 0;
  let credits = 0;

  function pad3(num) { return String(num).padStart(3, '0'); }
  function measure() { slideW = viewport.clientWidth; }
  function measureLeverDown() {
    const slot = document.querySelector('.lever__slot');
    if (!slot) return;
    const slotH = slot.clientHeight;
    const armH = arm.offsetHeight || 0; // ~150px
    const free = Math.max(0, slotH - armH);
    const half = free * 0.5; // move to lower half at max
    arm.style.setProperty('--down', half + 'px');
  }
  function normalize() { while (pos >= 2 * n) pos -= n; while (pos < n) pos += n; }
  function applyTransform(offset = 0) { track.style.transform = `translate3d(${-pos * slideW + offset}px,0,0)`; }
  function currentIndex() { return Math.round(pos) % n; }
  function currentSlideLabel() { const idx = currentIndex(); const node = track.children[n + idx]; const h = node.querySelector('h2'); return h ? h.textContent : `#${idx+1}`; }
  function setCredits(c) { credits = c; if (credEl) credEl.textContent = pad3(credits); }
  function setLast(text) { if (lastEl) lastEl.textContent = text; }

  function spin(strength) {
    if (state !== 'idle') return;
    state = 'spin';
    root.classList.add('is-spinning');
    lamp.classList.add('is-on');
    reqStop = false;
    v = 2.6 + 4.0 * Math.max(0, Math.min(1, strength)); // slides/sec, forward only
    setCredits(credits + 1);
    let last = performance.now();
    cancelAnimationFrame(rafId); clearTimeout(guardId);
    const tick = (now) => {
      const dt = Math.max(0.001, (now - last) / 1000); last = now;
      const baseF = 0.90, stopF = 0.75; // per-second friction bases
      const f = reqStop ? stopF : baseF;
      const decay = Math.pow(f, dt * 60);
      pos += v * dt; normalize();
      v *= decay;
      applyTransform();
      if (v < 0.15) return snapTo(Math.round(pos));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    guardId = setTimeout(() => { reqStop = true; }, 7000);
  }

  function snapTo(target) {
    state = 'snap';
    const start = performance.now();
    const from = pos; const to = target; const dur = 380; const ease = (x) => 1 - Math.pow(1 - x, 3);
    cancelAnimationFrame(rafId);
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      pos = from + (to - from) * ease(p); normalize(); applyTransform();
      if (p < 1) rafId = requestAnimationFrame(step); else finish();
    };
    rafId = requestAnimationFrame(step);
  }

  function finish() {
    state = 'idle'; v = 0; reqStop = false; normalize(); applyTransform();
    root.classList.remove('is-spinning'); lamp.classList.remove('is-on'); setLast(currentSlideLabel());
  }

  // Lever mechanics (3D rotateX 0°..60° with CSS spring back)
  let pulling = false; let startY = 0; let lastY = 0; let startAngle = 0; let angle = 0;
  const minAngle = 0; const maxAngle = 60; // degrees
  const pxToDeg = 0.6; // drag sensitivity (px -> deg)
  function setAngle(a){
    angle = Math.max(minAngle, Math.min(maxAngle, a));
    // Toward viewer = negative rotateX for a standard camera; we drive a CSS var used by rotateX
    const rx = -angle; // 0..-60deg (toward viewer)
    arm.style.setProperty('--rx', rx + 'deg');
    arm.style.setProperty('--ty', (angle / maxAngle).toFixed(3)); // normalized 0..1 for translateY
    return angle;
  }
  function strength(){ return angle / maxAngle; }
  arm.addEventListener('pointerdown', (e) => { if (state!=='idle') return; pulling = true; startY = lastY = e.clientY; startAngle = angle; arm.classList.remove('is-spring'); try{ arm.setPointerCapture(e.pointerId);}catch{} });
  arm.addEventListener('pointermove', (e) => { if (!pulling) return; lastY = e.clientY; const dy = lastY - startY; setAngle(startAngle + dy * pxToDeg); });
  function endPull(e){ if (!pulling) return; pulling = false; try{ if (arm.hasPointerCapture && arm.hasPointerCapture(e.pointerId)) arm.releasePointerCapture(e.pointerId);}catch{} const s = strength(); arm.classList.remove('is-spring'); // restart animation reliably
    // trigger CSS spring animation back to 0deg
    arm.classList.add('is-spring'); arm.addEventListener('animationend', () => { arm.classList.remove('is-spring'); setAngle(0); }, { once:true });
    if (s > 0.08) spin(s);
  }
  arm.addEventListener('pointerup', endPull); arm.addEventListener('pointercancel', endPull); window.addEventListener('pointerup', endPull); window.addEventListener('pointercancel', endPull);

  // Stop button & keyboard
  stopBtn.addEventListener('click', () => { if (state==='spin') reqStop = true; });
  document.addEventListener('keydown', (e) => { if (e.key===' ') { e.preventDefault(); if(state==='idle') spin(0.6); } if (e.key.toLowerCase()==='s') { if (state==='spin') reqStop = true; } });

  // Resize
  function update() { measure(); measureLeverDown(); normalize(); applyTransform(); }
  const ro = new ResizeObserver(update); ro.observe(viewport); window.addEventListener('resize', update);

  // Init
  update(); setAngle(0); setCredits(0); setLast('—');
})();
