
// VISTA 3D ESPACIAL
const CAM = {
  isDragging: false,
  startX: 0,
  startY: 0,
  camX: 0,
  camY: 0,
  targetX: 0,
  targetY: 0,
  animFrame: null
};

let currentStage = null;
function render3D(films) {
  cancelAnimationFrame(CAM.animFrame);

  CAM.camX = 0;
  CAM.camY = 0;
  CAM.targetX = 0;
  CAM.targetY = 0;
  CAM.isDragging = false;

  const container = document.getElementById('filmsContainer');
  container.innerHTML = '';
  container.className = 'films-container films-3d';
  container.style.transform = '';
  container.style.cursor = 'grab';

  const stage = document.createElement('div');
  stage.className = 'stage-3d';
  container.appendChild(stage);
  currentStage = stage;

  const hint = document.createElement('p');
  hint.className = 'drag-hint';
  hint.textContent = 'Arrastra para explorar';
  container.appendChild(hint);
  setTimeout(() => hint.style.opacity = '0', 2500);

  const cols = 4;
  const rows = 2;

  films.forEach((film, i) => {
    const card = document.createElement('div');
    card.className = 'film-card film-card-3d';

    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - cols / 2 + 0.5) * 340 + (Math.random() - 0.5) * 80;
    const y = (row - rows / 2 + 0.5) * 380 + (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 2;
    const rotate = (Math.random() - 0.5) * 18;
    const scale = 0.75 + (z + 1) * 0.2;

    card.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
    card.style.opacity = 0.6 + (z + 1) * 0.2;
    card.dataset.x = x;
    card.dataset.y = y;
    card.dataset.z = z;
    card.dataset.rotate = rotate;
    card.dataset.scale = scale;

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
        <div class="film-card-meta">
          <span>ISO ${film.iso}</span>
          <span>${film.type}</span>
          <span>${film.format}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (!CAM.isDragging) openModal(film);
    });

    stage.appendChild(card);
  });

  init3DControls(container, stage);
  start3DLoop(stage);
}

// CONTROLES
function init3DControls(container, stage) {
  container.addEventListener('mousedown', (e) => {
    CAM.isDragging = false;
    CAM.startX = e.clientX - CAM.camX;
    CAM.startY = e.clientY - CAM.camY;
    container.style.cursor = 'grabbing';

    function onMove(e) {
      const dx = e.clientX - CAM.startX;
      const dy = e.clientY - CAM.startY;
      if (Math.abs(dx - CAM.camX) > 3 || Math.abs(dy - CAM.camY) > 3) {
        CAM.isDragging = true;
      }
      CAM.targetX = Math.max(-400, Math.min(400, dx));
      CAM.targetY = Math.max(-300, Math.min(300, dy));
    }

    function onUp() {
      CAM.camX = CAM.targetX;
      CAM.camY = CAM.targetY;
      setTimeout(() => { CAM.isDragging = false; }, 50);
      container.style.cursor = 'grab';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // Touch
  container.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    CAM.startX = t.clientX - CAM.camX;
    CAM.startY = t.clientY - CAM.camY;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    CAM.isDragging = true;
    CAM.targetX = Math.max(-400, Math.min(400, t.clientX - CAM.startX));
    CAM.targetY = Math.max(-300, Math.min(300, t.clientY - CAM.startY));
  }, { passive: true });

  container.addEventListener('touchend', () => {
    CAM.camX = CAM.targetX;
    CAM.camY = CAM.targetY;
    setTimeout(() => { CAM.isDragging = false; }, 100);
  });
}

// LOOP
function start3DLoop(stage) {
  cancelAnimationFrame(CAM.animFrame);

  let x = 0;
  let y = 0;

  function loop() {
    const container = document.getElementById('filmsContainer');
    if (!container || !container.classList.contains('films-3d')) return;

    x += (CAM.targetX - x) * 0.07;
    y += (CAM.targetY - y) * 0.07;

    currentStage.style.transform = `translate(${x}px, ${y}px)`;

    //por profundidad
    currentStage.querySelectorAll('.film-card-3d').forEach(card => {
      const z = parseFloat(card.dataset.z);
      const cx = parseFloat(card.dataset.x);
      const cy = parseFloat(card.dataset.y);
      const rotate = parseFloat(card.dataset.rotate);
      const scale = parseFloat(card.dataset.scale);

      const parallaxX = cx + x * z * 0.4;
      const parallaxY = cy + y * z * 0.4;

      card.style.transform = `translate(${parallaxX}px, ${parallaxY}px) rotate(${rotate}deg) scale(${scale})`;
    });

    CAM.animFrame = requestAnimationFrame(loop);
  }

  loop();
}