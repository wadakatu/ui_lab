// Helix Orbital Carousel
(() => {
  const stage = document.querySelector('[data-stage]');
  const root = document.querySelector('.orbit');
  const prevBtn = document.querySelector('[data-prev]');
  const nextBtn = document.querySelector('[data-next]');
  const dotsEl = document.querySelector('[data-dots]');
  const cards = Array.from(stage.children);

  const N = cards.length;
  const step = (Math.PI * 2) / N;
  let t = 0; // fractional index position (clamped 0..N-1)
  let radius = 320; // will adjust on resize
  let pitch = 36;   // vertical offset per step
  let autoplay = true;
  let rafId = 0;

  // Build dots
  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'orbit__dot';
    b.type = 'button';
    b.setAttribute('aria-label', `${i + 1}へ移動`);
    b.addEventListener('click', () => snapTo(i));
    dotsEl.appendChild(b);
  });
  const dots = Array.from(dotsEl.children);

  function clampT(x) { return Math.max(0, Math.min(N - 1, x)); }

  function layout() {
    const w = root.clientWidth;
    radius = Math.max(220, Math.min(420, w / 2.2));
    pitch = Math.max(26, Math.min(48, w / 24));
    // Adjust drag sensitivity with viewport size (slower)
    // Need more pixels per slide => less sensitive
    pxPerStep = Math.max(520, Math.min(900, w * 0.8));

    for (let i = 0; i < N; i++) {
      const angle = (i - t) * step; // radians
      const cos = Math.cos(angle);
      const deg = angle * 180 / Math.PI;
      const depth = (cos + 1) / 2; // 0..1 (back..front)

      const scale = 0.86 + 0.24 * depth; // 0.86..1.10
      const alpha = 0.35 + 0.65 * depth; // 0.35..1
      const blur = (1 - depth) * 2.2;   // 0..2.2 px
      const sat = 0.9 + 0.3 * depth;    // 0.9..1.2
      const y = (i - t) * pitch;

      const zIndex = (depth * 1000) | 0;
      const el = cards[i];
      el.style.setProperty('--ry', `${deg}deg`);
      el.style.setProperty('--z', `${radius}px`);
      el.style.setProperty('--y', `${y}px`);
      el.style.setProperty('--scale', scale.toFixed(3));
      el.style.setProperty('--alpha', alpha.toFixed(3));
      el.style.setProperty('--blur', `${blur.toFixed(2)}px`);
      el.style.setProperty('--sat', sat.toFixed(3));
      el.style.setProperty('--zindex', String(zIndex));
    }

    const active = Math.round(clampT(t));
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === active)));
    // disable controls at bounds
    prevBtn.disabled = t <= 0.0001;
    nextBtn.disabled = t >= (N - 1) - 0.0001;
  }

  function snapTo(i) {
    const target = clampT(i);
    animateTo(target, 480);
  }

  function animateTo(target, ms = 420) {
    target = clampT(target);
    const start = performance.now();
    const t0 = t;
    const dist = target - t0;
    cancelAnimationFrame(rafId);
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      t = t0 + dist * ease(p);
      t = clampT(t);
      layout();
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  prevBtn.addEventListener('click', () => animateTo(t - 1));
  nextBtn.addEventListener('click', () => animateTo(t + 1));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') animateTo(t - 1);
    if (e.key === 'ArrowRight') animateTo(t + 1);
  });

  // Pointer drag with inertia
  let dragging = false;
  let startX = 0;
  let vt = 0; // velocity in t / ms
  let lastT = 0;
  let lastTime = 0;
  let pxPerStep = 520; // larger = slower spin per px

  const onDown = (x) => {
    dragging = true;
    startX = x;
    vt = 0; lastT = t; lastTime = performance.now();
    cancelAnimationFrame(rafId);
  };
  const onMove = (x) => {
    if (!dragging) return;
    const dx = x - startX;
    const now = performance.now();
    t = clampT(lastT - dx / pxPerStep); // drag right -> previous (decrease t)
    vt = (t - lastT) / Math.max(1, now - lastTime);
    lastT = t; lastTime = now;
    layout();
  };
  const onUp = () => {
    if (!dragging) return; dragging = false;
    // inertia
    let v = vt * 16; // estimate per frame velocity
    const friction = 0.92;
    const tick = () => {
      v *= friction;
      t = clampT(t + v);
      layout();
      if (t <= 0 || t >= N - 1) {
        // hit boundary: stop inertia and snap
        animateTo(Math.round(t));
        return;
      }
      if (Math.abs(v) > 0.002) {
        rafId = requestAnimationFrame(tick);
      } else {
        // snap to nearest integer position
        animateTo(Math.round(t));
      }
    };
    rafId = requestAnimationFrame(tick);
  };

  root.addEventListener('pointerdown', (e) => {
    // If clicking UI controls or dots, don't start drag or capture
    if (e.target.closest('.orbit__control') || e.target.closest('.orbit__dot')) return;
    onDown(e.clientX);
  });
  root.addEventListener('pointermove', (e) => onMove(e.clientX));
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);
  root.addEventListener('pointerleave', onUp);

  // Autoplay (gentle orbit); pauses on hover
  let autoId = 0;
  function startAuto() {
    cancelAnimationFrame(autoId);
    const loop = () => {
      if (autoplay) {
        t = clampT(t + 0.003); // slow orbit forward only
        // stop at ends
        if (t >= N - 1 || t <= 0) autoplay = false;
        layout();
      }
      autoId = requestAnimationFrame(loop);
    };
    loop();
  }
  root.addEventListener('mouseenter', () => { autoplay = false; });
  root.addEventListener('mouseleave', () => { autoplay = true; });

  // Resize
  const ro = new ResizeObserver(() => layout());
  ro.observe(root);

  // Init
  layout();
  startAuto();
})();
