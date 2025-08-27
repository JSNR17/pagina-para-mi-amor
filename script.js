// Utilidad: desplazamiento suave
document.addEventListener('click', (e) => {
  const target = e.target;
  if (target instanceof HTMLElement && target.dataset.scroll) {
    const selector = target.dataset.scroll;
    const el = document.querySelector(selector);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Contador de días juntos (desde 31/05/2022)
(function daysTogether() {
  const daysEl = document.getElementById('days-count');
  const sinceText = document.getElementById('since-text');
  if (!daysEl || !sinceText) return;
  const startDate = new Date('2022-05-31T00:00:00');
  function update() {
    const now = new Date();
    const diffMs = now - startDate;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysEl.textContent = String(days);
    sinceText.textContent = `Desde 31/04/2022 • Tú y yo, siempre`;
  }
  update();
  setInterval(update, 60 * 1000);
})();

// Carruseles genéricos con teclado, swipe y fullscreen
function initCarousel(root) {
  const track = root.querySelector('.carousel-track');
  if (!track) return;
  const slides = Array.from(track.children);
  const prev = root.querySelector('.carousel-control.prev');
  const next = root.querySelector('.carousel-control.next');
  const dots = root.querySelector('.carousel-dots');
  const autoplay = root.getAttribute('data-autoplay') === 'true';
  const interval = Number(root.getAttribute('data-interval')) || 5000;
  let index = slides.findIndex(s => s.classList.contains('is-active'));
  if (index < 0) index = 0;

  // Crear dots si existen
  let dotButtons = [];
  if (dots) {
    dots.innerHTML = '';
    dotButtons = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(i === index));
      b.addEventListener('click', () => goTo(i));
      dots.appendChild(b);
      return b;
    });
  }

  function updateUI() {
    const offset = index * root.clientWidth;
    track.style.transform = `translateX(-${offset}px)`;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dotButtons.forEach((b, i) => b.setAttribute('aria-selected', String(i === index)));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    updateUI();
  }

  function nextSlide() { goTo(index + 1); }
  function prevSlide() { goTo(index - 1); }

  next && next.addEventListener('click', nextSlide);
  prev && prev.addEventListener('click', prevSlide);

  // Teclado
  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowRight') nextSlide();
    if (ev.key === 'ArrowLeft') prevSlide();
  });

  // Swipe táctil
  let startX = 0; let isTouch = false;
  root.addEventListener('touchstart', (e) => { isTouch = true; startX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchmove', (e) => { if (!isTouch) return; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (!isTouch) return; isTouch = false;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) nextSlide(); else prevSlide();
    }
  });

  // Fullscreen para slides con imagen
  const overlay = document.getElementById('fullscreen');
  const overlayImg = overlay ? overlay.querySelector('img') : null;
  const overlayClose = overlay ? overlay.querySelector('.fullscreen-close') : null;
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    if (!img || !overlay || !overlayImg) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      overlayImg.src = img.src;
      overlay.classList.add('is-open');
    });
  });
  if (overlay && overlayClose) {
    overlayClose.addEventListener('click', () => overlay.classList.remove('is-open'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('is-open'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.classList.remove('is-open'); });
  }

  // Redimensionar
  window.addEventListener('resize', updateUI);
  updateUI();

  // Autoplay
  let timer;
  function start() { if (autoplay) timer = setInterval(nextSlide, interval); }
  function stop() { if (timer) clearInterval(timer); }
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();
}

document.querySelectorAll('.carousel').forEach(initCarousel);

// Corazones flotantes en sección especial
(function floatingHearts() {
  const container = document.querySelector('.hearts');
  if (!container) return;
  const colors = ['#ff7aa2', '#fda4af', '#b794f6'];
  function spawnHeart() {
    const h = document.createElement('div');
    h.className = 'heart';
    const size = 10 + Math.random() * 14; // 10 - 24px
    h.style.width = `${size}px`;
    h.style.height = `${size}px`;
    h.style.left = `${Math.random() * 100}%`;
    h.style.bottom = `-30px`;
    const c = colors[Math.floor(Math.random() * colors.length)];
    h.style.background = c;
    h.style.setProperty('--shadow-color', c);
    container.appendChild(h);
    const duration = 6000 + Math.random() * 6000;
    const drift = (Math.random() * 60 - 30);
    const keyframes = [
      { transform: `translate(${drift}px, 0) rotate(45deg)`, opacity: .2 },
      { transform: `translate(${drift * 1.5}px, -120vh) rotate(45deg)`, opacity: 0 }
    ];
    const anim = h.animate(keyframes, { duration, easing: 'ease-out' });
    anim.onfinish = () => h.remove();
  }
  setInterval(spawnHeart, 500);
})();


