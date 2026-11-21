// A fine halftone field behind the window, painted only when its size changes.
const field = document.querySelector('#field');
function paintField() {
  const w = field.clientWidth, h = field.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  field.width = Math.round(w * ratio);
  field.height = Math.round(h * ratio);
  const ctx = field.getContext('2d');
  if (!ctx)
    return;
  ctx.scale(ratio, ratio);
  for (let y = 0; y < h; y += 7) {
    for (let x = 0; x < w; x += 7) {
      const nx = x / w - 0.5;
      const ridge = 0.42 + 0.12 * Math.sin(nx * 8 + 0.8) + 0.16 * nx * nx;
      const distance = (y / h - ridge) / 0.25;
      const wave = Math.exp(-distance * distance) * (0.72 + 0.28 * Math.cos(nx * 13 - y / h * 6));
      const edge = Math.pow(Math.max(0, 1 - 2.6 * nx * nx), 2);
      ctx.fillStyle = 'rgba(195,194,190,' + (wave * edge * 0.36) + ')';
      ctx.beginPath();
      ctx.arc(x, y, 0.7 + wave * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
new ResizeObserver(paintField).observe(field);

for (const install of document.querySelectorAll('.install')) {
  const command = install.querySelector('.install-command code');
  const copy = install.querySelector('.install-command button');
  const status = install.querySelector('[role="status"]');
  let feedbackTimer;
  copy.addEventListener('click', async () => {
    clearTimeout(feedbackTimer);
    try {
      await navigator.clipboard.writeText(command.textContent);
      copy.textContent = 'Copied';
      status.textContent = 'Homebrew command copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(command);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Command selected for copying.';
    }
    feedbackTimer = setTimeout(() => { copy.textContent = 'Copy'; status.textContent = ''; }, 1800);
  });
}

// Keep every diagram available as a regular figure when scripting is disabled.
const diagramTabs = document.getElementById('diagram-tabs');
const diagramPanels = [...document.querySelectorAll('.diagram-panel')];
const diagramButtons = diagramPanels.map((panel, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = panel.id + '-tab';
  button.textContent = panel.dataset.topic;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', button.id);
  button.addEventListener('click', () => selectDiagram(index));
  button.addEventListener('keydown', event => {
    const count = diagramPanels.length;
    const next = (index + 1) % count;
    const previous = (index + count - 1) % count;
    const destination = {ArrowDown:next, ArrowUp:previous, ArrowRight:next, ArrowLeft:previous, Home:0, End:count - 1}[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    diagramButtons[destination].focus({preventScroll:true});
    selectDiagram(destination);
  });
  diagramTabs.append(button);
  return button;
});
let activeDiagram = -1;
function selectDiagram(index) {
  if (index === activeDiagram) return;
  activeDiagram = index;
  diagramButtons.forEach((button, i) => {
    const active = i === index;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    diagramPanels[i].hidden = !active;
  });
}
selectDiagram(0);
diagramTabs.hidden = false;

const imagePreview = document.getElementById('image-preview');
const previewImage = imagePreview.querySelector('.image-canvas img');
for (const trigger of document.querySelectorAll('[data-image-preview]')) {
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.addEventListener('click', () => {
    const figure = trigger.closest('figure');
    const source = (figure || trigger).querySelector('img');
    const title = figure?.dataset.topic ? figure.dataset.topic + ' diagram' : figure?.querySelector('figcaption')?.textContent || source.alt;
    document.getElementById('image-preview-title').textContent = title;
    previewImage.src = source.currentSrc || source.src;
    previewImage.alt = source.alt;
    imagePreview.showModal();
  });
}
imagePreview.addEventListener('click', () => imagePreview.close());
