
// THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
function getTheme() {
  return localStorage.getItem('theme') || 'dark';
}
function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀' : '☾';
}

themeToggle.addEventListener('click', () => {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
});

setTheme(getTheme());

// CARGAR FILMS
async function loadFilms() {
  const response = await fetch('data/films.json');
  const films = await response.json();
  return films;
}

// CREAR CARD HTML
function createCardHTML(film) {
  const placeholderColor = film.palette[0] || '#ccc';
  return `
    <div class="film-card" data-brand="${film.brand}" data-type="${film.type}" data-id="${film.id}">
      <div class="film-card-image-placeholder" style="background-color: ${placeholderColor}20;">
        <span>${film.brand} · ${film.name}</span>
      </div>
      <div class="film-card-body">
        <p class="film-card-brand">${film.brand}</p>
        <h2 class="film-card-name">${film.name}</h2>
        <div class="film-card-palette">
          ${film.palette.map(color => `
            <div class="palette-dot" style="background-color: ${color};"></div>
          `).join('')}
        </div>
        <p class="film-card-description">${film.description}</p>
        <div class="film-card-meta">
          <span>ISO ${film.iso}</span>
          <span>${film.type}</span>
          <span>${film.format}</span>
        </div>
      </div>
    </div>
  `;
}

// RENDER 2D INFINITO
let currentFilms = [];
let scrollAnimation = null;
let scrollPos = 0;
let isPaused = false;
let isDown = false;
let startXDrag = 0;
let scrollStartPos = 0;
const SCROLL_SPEED = 0.5;

function renderInfiniteScroll(films) {
  const container = document.getElementById('filmsContainer');
  container.innerHTML = '';
  container.className = 'films-container films-2d';

  // Duplica las cards para el loop
  const allCards = [...films, ...films, ...films];
  container.innerHTML = allCards.map(f => createCardHTML(f)).join('');

  container.querySelectorAll('.film-card').forEach(card => {
    const id = card.getAttribute('data-id');
    const film = films.find(f => f.id === id);
    card.addEventListener('click', () => {
      if (!isDown) openModal(film);
    });
  });

  startInfiniteScroll(films.length);
}

function startInfiniteScroll(originalCount) {
  const container = document.getElementById('filmsContainer');
  const cardWidth = 300 + 24; // ancho card + gap
  const totalWidth = cardWidth * originalCount;

  cancelAnimationFrame(scrollAnimation);

  function loop() {
    if (!isPaused) {
      scrollPos += SCROLL_SPEED;
      if (scrollPos >= totalWidth) {
        scrollPos = 0;
      }
      container.style.transform = `translateX(-${scrollPos}px)`;
    }
    scrollAnimation = requestAnimationFrame(loop);
  }

  loop();

  // Pausa
  container.addEventListener('mouseenter', () => isPaused = true);
  container.addEventListener('mouseleave', () => {
    isPaused = false;
    isDown = false;
  });

  // Arrastre manual
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    isPaused = true;
    startXDrag = e.clientX;
    scrollStartPos = scrollPos;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const delta = startXDrag - e.clientX;
    scrollPos = scrollStartPos + delta;

    if (scrollPos < 0) scrollPos = 0;
    if (scrollPos >= totalWidth) scrollPos = totalWidth - 1;

    container.style.transform = `translateX(-${scrollPos}px)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    container.style.cursor = 'grab';
    setTimeout(() => { isPaused = false; }, 800);
  });
}

// FILTROS
function initFilters(films) {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      currentFilms = filter === 'all'
        ? films
        : films.filter(f => f.brand === filter || f.type === filter);

      cancelAnimationFrame(scrollAnimation);
      scrollPos = 0;

      if (document.getElementById('filmsContainer').classList.contains('films-2d')) {
        renderInfiniteScroll(currentFilms);
      } else {
        render3D(currentFilms);
      }
    });
  });
}

// MODAL
function openModal(film) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <p class="modal-film-brand">${film.brand}</p>
    <h2 class="modal-film-name">${film.name}</h2>
    <div class="modal-film-palette">
      ${film.palette.map(color => `
        <div class="modal-palette-swatch" style="background-color: ${color};"></div>
      `).join('')}
    </div>
    <p class="modal-film-description">${film.description}</p>
    <div class="modal-film-specs">
      <div class="spec-item">
        <span class="spec-label">ISO</span>
        <span class="spec-value">${film.iso}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Tipo</span>
        <span class="spec-value">${film.type}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Formato</span>
        <span class="spec-value">${film.format}</span>
      </div>
    </div>
    <div class="modal-film-tags">
      ${film.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('')}
    </div>
    <p class="modal-images-note">Próximamente: ejemplos fotográficos de este rollo.</p>
  `;

  overlay.classList.add('active');
  isPaused = true;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { isPaused = false; }, 300);
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// VIEW TOGGLE
viewToggle.addEventListener('click', () => {
  const container = document.getElementById('filmsContainer');
  const is2D = container.classList.contains('films-2d');

  cancelAnimationFrame(scrollAnimation);
  scrollPos = 0;

  if (is2D) {
    viewToggle.querySelector('.view-label').textContent = '2D';
    document.body.classList.add('mode-3d');
    render3D(currentFilms);
  } else {
    viewToggle.querySelector('.view-label').textContent = '3D';
    document.body.classList.remove('mode-3d');
    renderInfiniteScroll(currentFilms);
  }
});
// INIT
async function init() {
  const films = await loadFilms();
  currentFilms = films;
  renderInfiniteScroll(films);
  initFilters(films);
}

init();