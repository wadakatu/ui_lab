(() => {
  const track = document.querySelector('[data-track]');
  const prevBtn = document.querySelector('[data-prev]');
  const nextBtn = document.querySelector('[data-next]');
  const dotsEl = document.querySelector('[data-dots]');
  const slides = Array.from(track.children);

  let index = 0;
  let playing = true;
  let autoplayTimer = null;
  const interval = 3000;
  const threshold = 40; // px swipe threshold

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `${i + 1}へ移動`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const dots = Array.from(dotsEl.children);

  function updateUI() {
    const offset = -index * 100;
    track.style.transform = `translate3d(${offset}%, 0, 0)`;
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    updateUI();
    restartAutoplay();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Autoplay
  function startAutoplay() {
    if (autoplayTimer) return;
    autoplayTimer = setInterval(() => {
      if (!playing) return;
      if (index === slides.length - 1) {
        goTo(0);
      } else {
        next();
      }
    }, interval);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover
  const root = document.querySelector('.carousel');
  root.addEventListener('mouseenter', () => { playing = false; });
  root.addEventListener('mouseleave', () => { playing = true; });

  // Touch / swipe
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  root.addEventListener('touchstart', (e) => {
    dragging = true;
    startX = e.touches[0].clientX;
    deltaX = 0;
    stopAutoplay();
  }, { passive: true });

  root.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const x = e.touches[0].clientX;
    deltaX = x - startX;
    const percent = (deltaX / root.clientWidth) * 100;
    track.style.transition = 'none';
    track.style.transform = `translate3d(${(-index * 100) + percent}%, 0, 0)`;
  }, { passive: true });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) next();
      else prev();
    } else {
      updateUI();
    }
    restartAutoplay();
  }

  root.addEventListener('touchend', endDrag);
  root.addEventListener('touchcancel', endDrag);

  // Init
  updateUI();
  startAutoplay();
})();

