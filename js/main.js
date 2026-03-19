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

// RENDER CARDS
function renderCards(films) {
  const container = document.getElementById('filmsContainer');
  container.innerHTML = '';

  films.forEach(film => {
    const card = document.createElement('div');
    card.className = 'film-card';
    card.setAttribute('data-brand', film.brand);
    card.setAttribute('data-type', film.type);

    const placeholderColor = film.palette[0] || '#ccc';

    card.innerHTML = `
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
    `;

    card.addEventListener('click', () => openModal(film));
    container.appendChild(card);
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
      const filtered = filter === 'all'
        ? films
        : films.filter(f => f.brand === filter || f.type === filter);

      renderCards(filtered);
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
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


// INIT
async function init() {
  const films = await loadFilms();
  renderCards(films);
  initFilters(films);
}

init();