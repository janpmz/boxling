/* The four base views are Retina captures from Boxling --demo. Interactive
   regions use the same logical coordinates as the SwiftUI/AppKit window. */
'use strict';
const W = 1180, H = 712;
const tabs = ['boxes', 'files', 'editor', 'terminal'];
const todoText =
    '# Website tasks\n\n## To do\n- [x] Add a search field to the homepage\n- [ ] Make the navigation work on mobile\n\n## Updates\nSearch is ready. You can filter pages by title.\nThe keyboard shortcut is Command–K.\n';
const primaryBox = 'document-player-box';
const root = '/workspace', website = root + '/website', todoPath = root + '/todo.md';
const $ = selector => document.querySelector(selector);
const stage = $('#stage'), controls = $('#controls'), strip = $('#tabstrip'), overlays = $('.app-overlays');
const fileKinds = {
  folder: 'Folder',
  markdown: 'Markdown',
  code: 'Source code',
  json: 'JSON',
  image: 'Image',
  text: 'Text'
};
const leaf = path => path.split('/').pop();
const parent = path => path.slice(0, path.lastIndexOf('/')) || '/';
const titleCase = word => word[0].toUpperCase() + word.slice(1);
function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className)
    element.className = className;
  if (value !== undefined)
    element.textContent = value;
  return element;
}
function position(el, x, y, width, height) {
  Object.assign(el.style, {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
    width: width + 'px',
    height: height + 'px'
  });
  return el;
}
function addControl(el, x, y, w, h, container = controls) {
  container.append(position(el, x, y, w, h));
  return el;
}
function hit(label, x, y, w, h, click, container = controls) {
  const button = node('button', 'hit');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  if (click) {
    button.title = label;
    button.onclick = click;
  } else {
    button.disabled = true;
  }
  return addControl(button, x, y, w, h, container);
}
function input(label, value, x, y, w, h, oninput, bg) {
  const field = node('input', 'app-input');
  field.type = 'text';
  field.setAttribute('aria-label', label);
  field.placeholder = label;
  field.value = value;
  field.autocomplete = 'off';
  field.spellcheck = false;
  if (bg)
    field.style.setProperty('--input-bg', bg);
  field.classList.toggle('filled', !!value);
  field.oninput = () => {
    field.classList.toggle('filled', !!field.value);
    oninput(field.value);
  };
  field.onkeydown = event => {
    if (event.key === 'Escape') {
      field.value = '';
      field.oninput();
      field.blur();
    }
  };
  return addControl(field, x, y, w, h);
}
function nativeSlice(name, x, y, w, h, destX, destY, container = controls) {
  const slice = node('div', 'native-row');
  slice.style.backgroundImage = 'url(assets/' + name + '.png)';
  slice.style.backgroundPosition = -x + 'px ' + (-y) + 'px';
  return addControl(slice, destX, destY, w, h, container);
}
function label(text, x, y, w, h, bg, extra = '', container = controls) {
  const el = node('div', 'replacement ' + extra, text);
  if (bg)
    el.style.setProperty('--surface', bg);
  return addControl(el, x, y, w, h, container);
}
function cover(x, y, w, h, color, container = controls) {
  return label('', x, y, w, h, color, '', container);
}
function setScreen(name, description) {
  const image = stage.querySelector('img');
  image.src = 'assets/' + name + '.png';
  image.alt = description;
}
function sampleBox(name, running, cores, memory, disk, outside, inside = 8080) {
  const files = new Map(sampleFiles.map(file => [file.path, {...file}]));
  for (const [name, kind, text] of [
           [
             'README.md', 'markdown',
             '# Workspace\n\nOpen the website folder to explore the sample project.\n'
           ],
           ['app.swift', 'code', 'print("Hello, Boxling")\n'],
           ['run.sh', 'code', '#!/bin/sh\necho "Hello, Boxling"\n'], ['hero.png', 'image', '']]) {
    const path = root + '/' + name;
    files.set(path, {path, kind, text, bytes: text.length});
  }
  files.set(todoPath, {path: todoPath, kind: 'markdown', text: todoText, bytes: todoText.length});
  return {
    name,
    running,
    cores,
    memory,
    disk,
    ports: [{outside, inside}],
    initiallyRunning: running,
    files,
    folder: website,
    selected: website + '/README.md',
    query: '',
    sort: 'name',
    ascending: true
  };
}
let boxes, box, view, filter, documents, doc, shells, shell;
function init() {
  boxes = [
    sampleBox(primaryBox, true, 6, 8, 2.3, 8766),
    sampleBox('experiment-box', false, 6, 6, 3.2, 8767),
    sampleBox('test', true, 2, 2, 0.2, 11111, 1111)
  ];
  box = boxes[0];
  view = 'terminal';
  filter = '';
  documents = [];
  shells = [];
  doc = {box, path: todoPath, unread: true, deletions: false};
  documents.push(doc);
  shell = newShell(box);
}
function newShell(owner) {
  const item = {
    box: owner,
    cwd: root,
    history: [],
    commands: [],
    recall: 0,
    seeded: true
  };
  shells.push(item);
  return item;
}
const approval = node('div', 'approval-flash');
approval.hidden = true;
approval.setAttribute('role', 'status');
approval.setAttribute('aria-atomic', 'true');
const fingerprint = node('img');
fingerprint.src = 'assets/touch-id.png';
fingerprint.alt = '';
fingerprint.width = fingerprint.height = 54;
const approvalReason = node('span', 'approval-reason');
const approvalDuration = 1000;
approval.style.setProperty('--approval-duration', approvalDuration + 'ms');
const demoLabel = node('span', 'approval-demo-label', 'Demo only');
approval.append(demoLabel, fingerprint, node('strong', '', 'Approve with Touch ID'), approvalReason);
$('.app-window').append(approval);
let approvalTimer;
function hideApproval() {
  clearTimeout(approvalTimer);
  approval.hidden = true;
}
function showApproval(reason) {
  hideApproval();
  approvalReason.textContent = reason;
  approval.hidden = false;
  approvalTimer = setTimeout(hideApproval, approvalDuration);
}
function openTab(name, changedBox = false) {
  const entering = name !== view || changedBox;
  view = name;
  $('#pan').scrollLeft = 0;
  render();
  if (entering && name === 'files') showApproval('Access files in “' + box.name + '”.');
  if (entering && name === 'terminal' && shell) showApproval('Open a shell in “' + shell.box.name + '”.');
}
function render() {
  hideApproval();
  dismissPopup();
  controls.replaceChildren();
  strip.style.setProperty('--tab-image', 'url(assets/' + view + '.png)');
  strip.querySelectorAll('button').forEach((button, i) => {
    const active = tabs[i] === view;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  stage.setAttribute('aria-labelledby', 'tab-' + view);
  $('#hint').textContent = '';
  ({boxes: renderBoxes, files: renderFiles, editor: renderEditor, terminal: renderTerminal})[view]();
}
tabs.forEach((name, i) => {
  const button = node('button');
  button.id = 'tab-' + name;
  button.type = 'button';
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-label', titleCase(name));
  button.setAttribute('aria-controls', 'stage');
  button.style.left = (98 + i * 108) + 'px';
  const mobile = node('span', 'mobile-tab', titleCase(name));
  mobile.style.setProperty('--icon', 'url(assets/tab-' + name + '.png)');
  button.append(mobile);
  button.onclick = () => openTab(name);
  button.onkeydown = event => {
    const next = {ArrowRight: (i + 1) % 4, ArrowLeft: (i + 3) % 4, Home: 0, End: 3}[event.key];
    if (next !== undefined) {
      event.preventDefault();
      openTab(tabs[next]);
      strip.children[next].focus();
    }
  };
  strip.append(button);
});
function sizeWindow() {
  const width = $('.app-window').clientWidth, mobile = matchMedia('(max-width:760px)').matches;
  const scale = mobile ? Math.max(.76, width / W) : width / W;
  overlays.style.setProperty('--app-scale', String(scale));
  dismissPopup();
  const top = mobile ? -52 * scale : 0;
  $('#scaled').style.width = (W * scale) + 'px';
  $('#scaled').style.height = (H * scale + top) + 'px';
  stage.style.top = top + 'px';
  stage.style.transform = 'scale(' + scale + ')';
  strip.style.transform = 'scale(' + scale + ')';
}
// Position menus in the visible part of the embedded app window.
let menuOwner = null;
function dismissPopup(restoreFocus = false) {
  if (!overlays.firstChild) return;
  if (overlays.querySelector('.box-sheet')) {
    $('#pan').inert = false;
    strip.inert = false;
  }
  overlays.replaceChildren();
  if (menuOwner) {
    menuOwner.removeAttribute('data-menu-target');
    if (menuOwner.hasAttribute('aria-expanded')) menuOwner.setAttribute('aria-expanded', 'false');
    if (restoreFocus && menuOwner.isConnected) menuOwner.focus({preventScroll:true});
  }
  menuOwner = null;
}

const menuSymbols = ['doc.text','folder','doc.badge.plus','folder.badge.plus',
                     'arrow.down.to.line','doc.on.doc','trash','cube.fill','checkmark'];
function menuSymbol(symbol, extra = '') {
  const icon = node('i', 'menu-symbol ' + extra);
  icon.setAttribute('aria-hidden', 'true');
  icon.style.setProperty('--glyph-offset', -20 * menuSymbols.indexOf(symbol) + 'px');
  return icon;
}

function placePopup(panel, trigger, point) {
  dismissPopup();
  menuOwner = trigger;
  if (trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'true');
  trigger.dataset.menuTarget = '';
  overlays.append(panel);
  const frame = overlays.getBoundingClientRect();
  const anchor = trigger.getBoundingClientRect();
  const size = panel.getBoundingClientRect();
  const left = Math.max(frame.left, 0) + 4;
  const right = Math.min(frame.right, document.documentElement.clientWidth) - 4;
  const top = Math.max(frame.top, $('.mast').getBoundingClientRect().bottom) + 4;
  const bottom = Math.min(frame.bottom, window.innerHeight) - 4;
  const x = point ? point.x : anchor.left;
  const below = point ? point.y : anchor.bottom + 3;
  const above = (point ? point.y : anchor.top - 3) - size.height;
  const y = below + size.height > bottom && above >= top ? above : below;
  panel.style.left = (Math.max(left, Math.min(x, right - size.width)) - frame.left) + 'px';
  panel.style.top = (Math.max(top, Math.min(y, bottom - size.height)) - frame.top) + 'px';
}

function navigateMenu(event) {
  const items = [...event.currentTarget.children];
  const index = items.indexOf(document.activeElement);
  const dest = {
    ArrowDown:(index + 1) % items.length, ArrowUp:(index + items.length - 1) % items.length,
    Home:0, End:items.length - 1
  }[event.key];
  if (dest === undefined) return;
  event.preventDefault();
  items[dest].focus({preventScroll:true});
}

function openBoxMenu(trigger) {
  if (menuOwner === trigger) { dismissPopup(true); return; }
  const panel = node('div','app-menu box-menu');
  panel.setAttribute('role','menu');
  panel.setAttribute('aria-label','Choose box');
  for (const item of boxes) {
    const option = node('button','app-menu-item');
    option.type = 'button';
    option.setAttribute('role','menuitemradio');
    option.setAttribute('aria-checked', String(item === box));
    const mark = menuSymbol('checkmark', 'selection-mark');
    option.append(mark, menuSymbol('cube.fill', item.running ? 'running-cube' : ''), document.createTextNode(item.name));
    option.tabIndex = -1;
    option.onclick = () => {
      useFiles(item);
      controls.querySelector('.box-picker').focus({preventScroll:true});
    };
    panel.append(option);
  }
  panel.onkeydown = navigateMenu;
  placePopup(panel, trigger);
  panel.querySelector('[aria-checked=true]').focus({preventScroll:true});
}

function openFileMenu(target, point) {
  const area = target.dataset.menuArea, path = target.dataset.menuPath;
  const file = box.files.get(path);
  const groups = [];
  if (area === 'row') {
    box.selected = path;
    controls.querySelectorAll('.file-row').forEach(row => row.classList.toggle('selected', row === target));
    groups.push([file.kind === 'folder' ? ['Open Folder','folder'] : ['Open in Editor','doc.text']]);
  }
  groups.push([['New File…','doc.badge.plus'],['New Folder…','folder.badge.plus']]);
  if (area !== 'breadcrumb') groups.push([['Download…','arrow.down.to.line']]);
  groups.push([['Copy Absolute Path','doc.on.doc'],['Copy Relative Path','doc.on.doc']]);
  if (area === 'row' || (area === 'sidebar' && path !== root)) groups.push([['Delete…','trash']]);

  const panel = node('div','app-menu context-menu');
  panel.setAttribute('role','menu');
  panel.setAttribute('aria-label','Actions for ' + leaf(path));
  panel.tabIndex = -1;
  for (const group of groups) {
    if (panel.childElementCount) {
      const separator = node('hr');
      separator.setAttribute('role','separator');
      panel.append(separator);
    }
    for (const [name,symbol] of group) {
      const option = node('button','app-menu-item');
      option.type = 'button';
      option.setAttribute('role','menuitem');
      option.disabled = true;
      option.append(menuSymbol(symbol), document.createTextNode(name));
      panel.append(option);
    }
  }
  placePopup(panel, target, point);
  panel.focus({preventScroll:true});
}

function contextTarget(element, area, path) {
  element.dataset.menuArea = area;
  element.dataset.menuPath = path;
  element.setAttribute('aria-haspopup', 'menu');
  return element;
}
controls.addEventListener('contextmenu', event => {
  const target = event.target.closest('[data-menu-area]');
  if (view !== 'files' || !target) return;
  event.preventDefault();
  openFileMenu(target, {x:event.clientX,y:event.clientY});
});
controls.addEventListener('keydown', event => {
  if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
  const target = event.target.closest('[data-menu-area]');
  if (target) { event.preventDefault(); openFileMenu(target); }
});
document.addEventListener('pointerdown', event => {
  if (overlays.contains(event.target) || menuOwner?.contains(event.target)) return;
  dismissPopup();
}, true);
document.addEventListener('keydown', event => {
  if (overlays.firstChild && (event.key === 'Escape' || event.key === 'Tab')) {
    if (event.key === 'Escape') event.preventDefault();
    dismissPopup(true);
  }
});
$('#pan').addEventListener('scroll', () => dismissPopup(), true);
overlays.addEventListener('contextmenu', event => event.preventDefault());

const creationSheets = {
  'New Box': {
    asset:'create', height:350, cancelX:322,
    description:'Name, CPU and memory settings, port mappings, Cancel and Create box.'
  },
  'Box My Folder': {
    asset:'box-my-folder', height:376, cancelX:333,
    description:'Step 1 of 2. Choose folders to copy into a new box. Continue is disabled until a folder is selected.'
  }
};

function showCreationSheet(event) {
  dismissPopup();
  const trigger = event.currentTarget;
  const title = trigger.getAttribute('aria-label');
  const {asset, height, cancelX, description} = creationSheets[title];
  const layer = node('div', 'box-sheet');
  const backdrop = node('button', 'box-sheet-backdrop');
  backdrop.type = 'button';
  backdrop.tabIndex = -1;
  backdrop.setAttribute('aria-label', 'Dismiss ' + title + ' preview');
  backdrop.onclick = () => dismissPopup(true);
  const panel = node('section', 'box-sheet-panel');
  panel.style.setProperty('--sheet-corner-y', (24 / height * 100) + '%');
  panel.tabIndex = -1;
  panel.setAttribute('aria-label', title);
  const art = node('img');
  art.src = 'assets/' + asset + '.png';
  art.width = 520;
  art.height = height;
  art.alt = description;
  art.draggable = false;
  const cancel = node('button', 'hit sheet-cancel');
  cancel.type = 'button';
  cancel.setAttribute('aria-label', 'Cancel');
  // Keep the hit area on the native button as the captured sheet scales.
  cancel.style.left = (cancelX / art.width * 100) + '%';
  cancel.style.width = (70 / art.width * 100) + '%';
  cancel.style.bottom = (24 / height * 100) + '%';
  cancel.style.height = (28 / height * 100) + '%';
  cancel.onclick = () => dismissPopup(true);
  panel.append(art, cancel);
  layer.append(backdrop, panel);
  menuOwner = trigger;
  trigger.setAttribute('aria-expanded', 'true');
  overlays.append(layer);
  $('#pan').inert = true;
  strip.inert = true;
  cancel.focus({preventScroll:true});
  const bounds = panel.getBoundingClientRect();
  if (bounds.bottom > window.innerHeight - 8 || bounds.top < $('.mast').getBoundingClientRect().bottom + 8)
    panel.scrollIntoView({block:'center', inline:'nearest', behavior:'instant'});
}

function useFiles(owner) {
  const changedBox = box !== owner;
  box = owner;
  openTab('files', changedBox);
}
function useTerminal(owner) {
  const changedBox = shell?.box !== owner;
  shell = shells.find(item => item.box === owner) || newShell(owner);
  openTab('terminal', changedBox);
}
function renderBoxes() {
  setScreen(
      'boxes',
      'Example Debian workspaces with CPU, memory, disk, port mappings and workspace controls.');
  const rows = node('div', 'layer');
  controls.append(rows);
  const refreshRows = () => {
    rows.replaceChildren();
    cover(0, 145, W, 531, '#202123', rows);
    const visible = boxes.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    const list = addControl(node('div'), 0, 145, W, 531, rows);
    list.style.overflow = 'auto';
    visible.forEach((item, index) => {
      const y = index * 73;
      const rowOffset = boxes.indexOf(item) * 73;
      const alternate = item.running !== item.initiallyRunning;
      const row = nativeSlice(alternate ? 'boxes-toggled' : 'boxes', 0,
                              (alternate ? 0 : 145) + rowOffset, W, 73, 0, y, list);
      if (alternate) row.style.backgroundSize = W + 'px auto';
      row.setAttribute('role', 'group');
      row.setAttribute(
          'aria-label',
          item.name + ', ' + (item.running ? 'Running' : 'Stopped') + ', ' + item.cores + ' cores, ' +
              item.memory + ' GB RAM, ' + item.disk + ' GB used');

      const port = item.ports[0];
      row.append(node('span', 'sr-only', 'localhost:' + port.outside + ' → ' + port.inside));
      hit((item.running ? 'Stop ' : 'Start ') + item.name, 1002, 17, 34, 38, () => {
        item.running = !item.running;
        render();
        if (item.running) showApproval('Start “' + item.name + '”.');
      }, row);
      hit('Open terminal for ' + item.name, 1040, 17, 34, 38, () => useTerminal(item), row);
      hit('Open files for ' + item.name, 1078, 17, 34, 38, () => useFiles(item), row);
      hit('Actions for ' + item.name, 1113, 17, 34, 38, null, row);
    });
    if (!visible.length) {
      const empty = label('No matching boxes', 0, 310, W, 45, '#202123', 'app-note', rows);
      empty.style.justifyContent = 'center';
    }
    const runningMemory = boxes.reduce((sum, item) => sum + (item.running ? item.memory : 0), 0);
    if (runningMemory !== 10) {
      label('Running boxes: ' + runningMemory + ' GB RAM', 790, 678, 190, 32,
            '#191a1c', 'box-memory', rows);
    }
  };
  refreshRows();
  input('Filter boxes…', filter, 55, 63, 170, 30, value => {
    filter = value;
    refreshRows();
  });
  hit('New Box', 1053, 60, 106, 37, showCreationSheet).setAttribute('aria-expanded','false');
  hit('Box My Folder', 899, 60, 142, 37, showCreationSheet).setAttribute('aria-expanded','false');
  hit('Settings', 1128, 677, 32, 35);
}
const treePaths = [
  root, root + '/design-assets', root + '/experiments', root + '/notes', website,
  ...['assets', 'docs', 'public', 'src', 'src/components', 'src/styles'].map(p => website + '/' + p)
];
const iconY = {
  folder: 167,
  text: 311,
  json: 383,
  markdown: 455,
  code: 527,
  image: 311
};
function fileIcon(kind) {
  const icon = node('i', 'file-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.style.backgroundPosition = '-245px ' + (9 - iconY[kind]) + 'px';
  return icon;
}
function formatBytes(n) {
  return n < 1000 ? n + ' bytes' :
      n < 1000000 ? Math.round(n / 1000) + ' KB' :
                    (n / 1000000).toFixed(1) + ' MB';
}
function openFolder(path) {
  if (box.files.get(path)?.kind !== 'folder')
    return;
  box.folder = path;
  box.selected = '';
  box.query = '';
  openTab('files');
}
function textOf(file) {
  if (file.text !== undefined)
    return file.text;
  const defaults = {
    'main.tsx': 'import App from \'./App\';\n\nexport default App;\n',
    'Header.tsx': 'export function Header() {\n  return <header>Website</header>;\n}\n',
    'Button.tsx': 'export function Button() {\n  return <button>Continue</button>;\n}\n',
    'package-lock.json': '{\n  "name": "website",\n  "lockfileVersion": 3\n}\n',
    'tsconfig.json': '{\n  "compilerOptions": { "strict": true },\n  "include": ["src"]\n}\n',
    'global.css': 'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n',
    'Brand guide.md': '# Brand guide\n\nUse the wordmark on a simple background.\n'
  };
  return defaults[leaf(file.path)] ?? '';
}
function openFile(path) {
  const file = box.files.get(path);
  if (!file)
    return;
  if (file.kind === 'folder') {
    openFolder(path);
    return;
  }
  if (file.kind === 'image') {
    $('#hint').textContent = path + ' · ' + formatBytes(file.bytes);
    return;
  }
  doc = documents.find(d => d.box === box && d.path === path);
  if (!doc) {
    doc = {box, path, unread: false, deletions: false};
    documents.push(doc);
  }
  openTab('editor');
}
function children(owner, folder) {
  return [...owner.files.values()].filter(f => f.path !== root && parent(f.path) === folder);
}
function renderFiles() {
  const folder = box.folder;
  const folderRender = box.files.get(folder).folderRender;
  const nativeTree = folderRender !== undefined &&
      [...box.files.values()].every(f => f.kind !== 'folder' || f.folderRender !== undefined);
  setScreen(
      'files', 'Boxling Files with a folder sidebar, searchable file table, and workspace path.');
  if (box.name !== primaryBox || !box.running) {
    const choice = addControl(node('div', 'selected-box-label'), 25, 60, 225, 36);
    choice.append(menuSymbol('cube.fill', box.running ? 'running-cube' : ''),
                  document.createTextNode(box.name), node('span', 'picker-chevron', '⌄'));
  }
  const picker = hit('Choose box, ' + box.name, 20, 61, 220, 32,
                     event => openBoxMenu(event.currentTarget));
  picker.classList.add('box-picker');
  picker.setAttribute('aria-haspopup','menu');
  picker.setAttribute('aria-expanded','false');
  picker.onkeydown = event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); openBoxMenu(picker); }
  };
  hit('New File', 731, 60, 31, 37);
  hit('New Folder', 763, 60, 32, 37);
  hit('Upload', 800, 60, 81, 37);
  hit('Download', 885, 60, 89, 37);
  const tableLayer = node('div', 'layer');
  controls.append(tableLayer);
  const table = () => {
    tableLayer.replaceChildren();
    const rows = children(box, folder)
                     .filter(f => leaf(f.path).toLowerCase().includes(box.query.toLowerCase()));
    rows.sort((a, b) => {
      if ((a.kind === 'folder') !== (b.kind === 'folder'))
        return a.kind === 'folder' ? -1 : 1;
      const date = f => (f.modified || 'Today, 10:42')
                            .replace('Today', '3')
                            .replace('Yesterday', '2')
                            .replace('Monday', '1');
      if (box.sort === 'name' && a.rowRender !== undefined && b.rowRender !== undefined)
        return (a.rowRender - b.rowRender) * (box.ascending ? 1 : -1);
      const key = f => box.sort === 'size' ? (f.bytes || 0) :
          box.sort === 'kind'              ? fileKinds[f.kind] :
          box.sort === 'modified'          ? date(f) :
                                             leaf(f.path);
      const av = key(a), bv = key(b);
      return (typeof av === 'number' ? av - bv : av.localeCompare(bv, 'en', {numeric: true})) *
          (box.ascending ? 1 : -1);
    });
    const list = contextTarget(node('div', 'file-list'), 'background', folder);
    tableLayer.append(list);
    rows.forEach(file => {
      const native = file.rowRender !== undefined && file.modified !== 'Just now';
      const button = node(
          'button',
          'file-row' + (native ? ' native-file' : '') +
              (box.selected === file.path ? ' selected' : ''));
      button.type = 'button';
      button.setAttribute('aria-label', 'Open ' + leaf(file.path));
      const size = file.kind === 'folder' ? '—' : formatBytes(file.bytes || 0);
      button.title = leaf(file.path) + ' · ' + fileKinds[file.kind] + ' · ' + size;
      if (native) {
        button.style.setProperty('--row-offset', -36 * file.rowRender + 'px');
      } else {
        const name = node('span');
        name.append(fileIcon(file.kind), document.createTextNode(leaf(file.path)));
        button.append(
            name, node('span', '', file.modified || 'Today, 10:42'),
            node('span', '', fileKinds[file.kind]), node('span', '', size));
      }
      button.onclick = event => {
        if (event.detail === 0 || event.pointerType === 'touch' || matchMedia('(pointer: coarse)').matches) {
          openFile(file.path);
          return;
        }
        box.selected = file.path;
        list.querySelectorAll('.file-row')
            .forEach(row => row.classList.toggle('selected', row === button));
      };
      button.ondblclick = () => openFile(file.path);
      list.append(contextTarget(button, 'row', file.path));
    });
    if (!rows.some(f => f.path === box.selected))
      box.selected = '';
    if (!rows.length)
      list.append(node('p', 'app-note', box.query ? 'No matching files' : 'This folder is empty.'));
  };
  table();
  input('Search this folder', box.query, 1019, 67, 132, 22, value => {
    box.query = value;
    table();
  }, '#222325');
  [['name', 229, 600], ['modified', 830, 141], ['kind', 971, 119], ['size', 1090, 82]].forEach(
      ([key, x, w]) => {
        hit('Sort by ' + key, x, 105, w, 39, () => {
          box.ascending = box.sort === key ? !box.ascending : true;
          box.sort = key;
          table();
        });
      });
  if (nativeTree) {
    const side = addControl(node('div', 'native-sidebar'), 0, 104, 218, 400);
    side.style.setProperty('--folder-offset', -400 * folderRender + 'px');
    treePaths.forEach((path,i) => {
      const item = hit('Browse ' + path, 10, 117 + i * 32, 198, 32, () => openFolder(path));
      contextTarget(item,'sidebar',path);
    });
  } else {
    const aside = node('div', 'nav-list');
    controls.append(aside);
    const draw = (file, depth) => {
      const button = node('button', 'nav-row' + (folder === file.path ? ' selected' : ''));
      button.type = 'button';
      button.setAttribute('aria-label', 'Browse ' + file.path);
      button.style.paddingLeft = (7 + depth * 14) + 'px';
      const folders = children(box, file.path)
                          .filter(f => f.kind === 'folder')
                          .sort((a, b) => a.path.localeCompare(b.path));
      button.append(
          node('span', 'twisty', folders.length ? '⌄' : ''), fileIcon('folder'),
          document.createTextNode(leaf(file.path)));
      button.onclick = () => openFolder(file.path);
      aside.append(contextTarget(button,'sidebar',file.path));
      folders.forEach(f => draw(f, depth + 1));
    };
    draw(box.files.get(root), 0);
  }
  if (nativeTree) {
    const bar = addControl(node('div', 'native-crumbs'), 219, 676, 961, 36);
    bar.style.setProperty('--path-offset', -36 * folderRender + 'px');
    const parts = folder.split('/').filter(Boolean);
    let start = 20, path = '';
    for (const part of parts) {
      path += '/' + part;
      const dest = path, width = part.length * 6.5 + 26;
      const segment = hit('Browse ' + path + ' in path bar', start, 0, width, 35, () => openFolder(dest), bar);
      contextTarget(segment,'breadcrumb',dest);
      start += width + 12;
    }
    hit('Copy current folder path', start - 4, 0, 30, 35, () => copyPath(folder), bar);
  } else {
    const bar = node('div', 'crumbs');
    controls.append(bar);
    let path = '';
    folder.split('/').filter(Boolean).forEach((part, i) => {
      path += '/' + part;
      const dest = path, b = node('button', '', part);
      if (i)
        bar.append(node('span', '', '›'));
      b.onclick = () => openFolder(dest);
      bar.append(contextTarget(b,'breadcrumb',dest));
    });
    const copy = node('button', '', 'Copy path');
    copy.onclick = () => copyPath(folder);
    bar.append(copy);
  }
}
async function copyPath(path) {
  try {
    await navigator.clipboard.writeText(path);
    $('#hint').textContent = 'Copied ' + path;
  } catch {
    $('#hint').textContent = path;
  }
}
function closeDoc(item) {
  documents = documents.filter(d => d !== item);
  if (doc === item)
    doc = documents.at(-1);
  render();
}
function renderEditor() {
  if (!doc) {
    setScreen('editor-empty', 'Editor with no files open. Choose Open File to browse the workspace.');
    hit('Open File', 544, 363, 92, 39, () => openTab('files'));
    return;
  }
  const file = doc.box.files.get(doc.path), text = textOf(file);
  const original = doc.path === todoPath && doc.box.name === primaryBox;
  const reviewed = original && doc.unread && text === todoText;
  setScreen(
      doc.deletions && reviewed ? 'editor-deletions' : 'editor',
      'Boxling Editor showing ' + doc.path + ' in ' + doc.box.name + '.');
  if (documents.length === 1 && original) {
    hit('Close todo.md', 153, 61, 31, 35, () => closeDoc(doc));
  } else {
    const bar = addControl(node('div', 'doc-strip'), 0, 52, 1085, 52);
    bar.style.padding = '6px 16px';
    documents.forEach(d => {
      const tab = node('div', 'doc-tab' + (d === doc ? ' active' : ''));
      const name = node('button', '', leaf(d.path));
      name.append(node('small', '', d.box.name));
      name.onclick = () => {
        doc = d;
        render();
      };
      const close = node('button', '', '×');
      close.setAttribute('aria-label', 'Close ' + leaf(d.path));
      close.onclick = () => closeDoc(d);
      tab.append(name, close);
      bar.append(tab);
    });
  }
  if (!original) {
    const path = label(doc.path, 20, 106, 790, 39, '#202123');
    path.style.fontFamily = 'ui-monospace,Menlo,monospace';
  } else
    hit('Copy document path', 158, 108, 30, 37, () => copyPath(doc.path));
  hit('Open a file', 1093, 54, 84, 47, () => useFiles(doc.box));
  const editor = node('textarea', 'editor-input');
  editor.value = text;
  editor.setAttribute('aria-label', 'Document text');
  editor.spellcheck = false;
  addControl(editor, 0, 147, doc.deletions && reviewed ? 739 : 1180, 530);
  editor.classList.toggle('edited', !reviewed);
  if (reviewed) {
    hit(doc.deletions ? 'Hide deletions' : 'Show deletions', 936, 108, 139, 37, () => {
      doc.deletions = !doc.deletions;
      render();
    });
    hit('Mark as read', 1075, 108, 100, 37, () => {
      doc.unread = false;
      doc.deletions = false;
      render();
    });
  } else {
    cover(935, 105, 245, 41, '#202123');
    cover(887, 678, 293, 34, '#191a1c');
  }
  editor.oninput = () => {
    file.text = editor.value;
    file.bytes = new TextEncoder().encode(file.text).length;
    file.modified = 'Just now';
    doc.unread = false;
    doc.deletions = false;

    if (!editor.classList.contains('edited') || editor.offsetWidth < W) {
      const start = editor.selectionStart, end = editor.selectionEnd;
      render();
      const entry = $('.editor-input');
      entry.focus({preventScroll: true});
      entry.setSelectionRange(start, end);
    }
  };
  editor.onkeydown = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      $('#hint').textContent = 'Saved ' + doc.path + ' in this demo.';
    }
  };
}
function closeShell(item) {
  shells = shells.filter(s => s !== item);
  if (shell === item)
    shell = shells.at(-1);
  render();
}
function shellPath(cwd, name) {
  const parts = (name.startsWith('/') ? name : cwd + '/' + name).split('/'), out = [];
  for (const part of parts) {
    if (part === '..')
      out.pop();
    else if (part && part !== '.')
      out.push(part);
  }
  return '/' + out.join('/');
}
function listing(owner, folder, options, displayPath) {
  const rows = [];
  const long = options.includes('l'), recursive = options.includes('R');
  const human = options.includes('h'), hidden = options.includes('a');
  const bytes = file => file.kind === 'folder' ? 4096 : file.bytes || 0;
  const blocks = file => Math.ceil(bytes(file) / 4096) * 4;
  function size(n) {
    if (!human || n < 1024) return String(n);
    const k = n / 1024;
    return (k < 10 ? k.toFixed(1) : Math.ceil(k)) + 'K';
  }
  function visit(dir, label) {
    const files = children(owner, dir).filter(file => hidden || !leaf(file.path).startsWith('.'))
        .sort((a, b) => leaf(a.path).localeCompare(leaf(b.path), 'en'));
    if (recursive) rows.push({name:label + ':', path:dir});
    if (long) {
      const total = files.reduce((sum, file) => sum + blocks(file), 0);
      rows.push({text:'total ' + (human && total ? total + 'K' : total)});
    }
    for (const file of files) {
      const directory = file.kind === 'folder';
      let prefix = '';
      if (long) {
        const count = directory ? 2 + children(owner, file.path).filter(f => f.kind === 'folder').length : 1;
        const modified = (file.modified || 'Today, 10:42').replace('Today,','Nov 21')
            .replace('Yesterday,','Nov 20').replace('Monday,','Nov 16');
        prefix = (directory ? 'drwxr-xr-x' : leaf(file.path) === 'run.sh' ? '-rwxr-xr-x' : '-rw-r--r--') +
            ' ' + count + ' root root ' + size(bytes(file)).padStart(4) + ' ' + modified + ' ';
      }
      rows.push({prefix, name:leaf(file.path), path:file.path});
    }
    if (recursive) {
      for (const file of files.filter(f => f.kind === 'folder')) {
        rows.push({text:''});
        visit(file.path, label.replace(/\/$/, '') + '/' + leaf(file.path));
      }
    }
  }
  visit(folder, displayPath);
  return rows;
}

function terminalPrompt(owner, cwd) {
  const prompt = node('span', 'term-prompt');
  for (const [part, value] of [
    ['user','root'], ['at','@'], ['host',owner.name + '.box.test'],
    ['colon',':'], ['cwd',cwd], ['hash','# ']
  ]) prompt.append(node('span', 'term-' + part, value));
  return prompt;
}

function revealTerminalPath(owner, path) {
  box = owner;
  const directory = owner.files.get(path).kind === 'folder';
  box.folder = directory ? path : parent(path);
  box.selected = directory ? '' : path;
  box.query = '';
  openTab('files');
}

function appendListingRow(container, owner, row) {
  if (!row.path) {
    container.append(row.text);
    return;
  }
  const link = node('button', 'term-path', row.name);
  link.type = 'button';
  link.classList.toggle('directory', owner.files.get(row.path).kind === 'folder');
  link.setAttribute('aria-label', 'Open ' + row.path + ' in Files');
  link.onclick = () => revealTerminalPath(owner, row.path);
  container.append(row.prefix || '', link);
  return link;
}

function openTerminalPorts(trigger, owner, inside, point) {
  if (menuOwner === trigger) { dismissPopup(true); return; }
  const panel = node('div', 'app-menu');
  panel.setAttribute('role', 'menu');
  panel.setAttribute('aria-label', 'Choose port for ' + owner.name);
  const mapped = owner.ports.filter(port => port.inside === inside && port.outside !== inside)
      .sort((a, b) => a.outside - b.outside);
  const choices = [[inside, 'Original'], ...mapped.map(port => [port.outside, 'Mapped'])];
  for (const [port, kind] of choices) {
    const address = 'localhost:' + port;
    const item = node('button', 'app-menu-item', 'Open ' + address + ' (' + kind + ')');
    item.type = 'button';
    item.tabIndex = -1;
    item.setAttribute('role', 'menuitem');
    item.onclick = () => {
      dismissPopup(true);
      $('#hint').textContent = 'Selected ' + address + ' (' + kind + ') for ' + owner.name + '.';
    };
    panel.append(item);
  }
  panel.onkeydown = navigateMenu;
  placePopup(panel, trigger, point);
  panel.firstElementChild.focus({preventScroll:true});
}

function terminalExample(owner, transcript) {
  const command = node('div', 'term-command');
  command.append(terminalPrompt(owner, root), 'ls -lhR website/src');
  transcript.append(command);
  let firstPath, nestedPath, firstFile;
  for (const row of listing(owner, website + '/src', 'lhR', 'website/src')) {
    const line = node('div', 'term-output');
    const link = appendListingRow(line, owner, row);
    if (link) {
      firstPath ??= link;
      if (row.prefix === undefined && link !== firstPath) nestedPath ??= link;
      if (!link.classList.contains('directory')) firstFile ??= link;
    }
    transcript.append(line);
  }
  const inside = owner.ports[0].inside;
  const start = node('div', 'term-command term-server');
  start.append(terminalPrompt(owner, root), 'npm --prefix website run dev -- --port ' + inside + ' &');
  const address = node('button', 'term-web', 'http://localhost:' + inside + '/');
  address.type = 'button';
  address.setAttribute('aria-label', 'Choose a port mapping for localhost:' + inside);
  address.setAttribute('aria-haspopup', 'menu');
  address.setAttribute('aria-expanded', 'false');
  address.onclick = event => openTerminalPorts(address, owner, inside,
      event.detail ? {x:event.clientX, y:event.clientY} : undefined);
  address.onkeydown = event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); openTerminalPorts(address, owner, inside); }
  };
  const local = node('div', 'term-output');
  local.append(node('span', 'term-local-label', 'Local: '), address);
  transcript.append(start, local);
  if (firstFile) annotateTerminalTarget(firstFile, 'Click a file to open in Files', 'file-hint');
  annotateTerminalTarget(nestedPath || firstPath, 'Open folder in Files', 'path-hint');
  annotateTerminalTarget(address, 'Choose a port', 'port-hint');
}

function annotateTerminalTarget(target, text, kind) {
  target.classList.add('term-callout', kind);
  target.dataset.action = text;
  target.parentElement.classList.add('annotated-output');
}

function runSample(command) {
  const words = (command.match(/"[^"]*"|'[^']*'|\S+/g) ||
                 []).map(w => /^(['"]).*\1$/.test(w) ? w.slice(1, -1) : w);
  const [verb, ...args] = words, owner = shell.box;
  const arg = args.filter(a => !a.startsWith('-')).join(' '), path = shellPath(shell.cwd, arg || '.'),
        file = owner.files.get(path);
  switch (verb) {
    case undefined:
      return '';
    case 'help':
      return 'Sample commands: pwd, ls, cd, cat, whoami, hostname, uname, echo, git diff, clear.\nTry cd website and cat README.md.';
    case 'pwd':
      return shell.cwd;
    case 'whoami':
      return 'root';
    case 'hostname':
      return owner.name + '.box.test';
    case 'uname':
      return args.includes('-a') ? 'Linux ' + owner.name + '.box.test aarch64 GNU/Linux' : 'Linux';
    case 'echo':
      return args.join(' ');
    case 'ls':
      if (!file)
        return 'ls: cannot access ' + path + ': No such file or directory';
      const options = args.filter(a => a.startsWith('-')).join('');
      const rows = file.kind === 'folder'
          ? listing(owner, path, options, arg || '.')
          : [{name:leaf(path), path}];
      return {rows, separator:/[lR]/.test(options) ? '\n' : '  '};
    case 'cd': {
      const dest = arg ? path : root;
      if (owner.files.get(dest)?.kind !== 'folder')
        return 'cd: ' + dest + ': Not a directory';
      shell.cwd = dest;
      return '';
    }
    case 'cat':
      if (path === '/etc/os-release')
        return 'PRETTY_NAME="Debian GNU/Linux"\nID=debian';
      if (!file)
        return 'cat: ' + path + ': No such file or directory';
      if (file.kind === 'folder')
        return 'cat: ' + path + ': Is a directory';
      if (file.kind === 'image')
        return 'cat: binary image';
      return textOf(file);
    case 'git':
      if (args.join(' ') === 'diff')
        return '@@ -1 +1 @@\n- const title = \'Hello\';\n+ const title = \'Hello, Boxling\';';
      break;
  }
  return verb + ': unavailable in the browser demo. Type help for sample commands.';
}
function renderTerminal() {
  if (!shell) {
    setScreen('terminal-empty', 'Open a terminal by choosing an example box.');
    hit('Open a new terminal', 1129, 52, 50, 42);
    boxes.slice(0, 2).forEach(
        (b, i) =>
            hit('Open terminal for ' + b.name, 380, 383 + i * 43, 420, 44, () => useTerminal(b)));
    return;
  }
  const owner = shell.box;
  setScreen('terminal', 'Boxling Terminal with a sample shell in ' + owner.name + '.');
  if (shells.length === 1 && owner.name === primaryBox) {
    hit('Close terminal session', 149, 52, 32, 37, () => closeShell(shell));
  } else {
    const bar = addControl(node('div', 'session-strip'), 0, 52, 1138, 39);
    shells.forEach((s, i) => {
      const tab = node('div', 'session-tab' + (s === shell ? ' active' : '')),
            name = node('button', '', s.box.name + (i ? ' · ' + (i + 1) : ''));
      name.onclick = () => {
        shell = s;
        render();
      };
      const close = node('button', '', '×');
      close.setAttribute('aria-label', 'Close session ' + (i + 1));
      close.onclick = () => closeShell(s);
      tab.append(name, close);
      bar.append(tab);
    });
  }
  hit('New terminal session', 1138, 52, 41, 39);
  const terminal = addControl(node('div', 'terminal-extra'), 8, 99, 1164, 591);
  const body = node('div', 'term-body');
  const transcript = node('div', 'term-transcript');
  terminal.append(body);
  body.append(transcript);
  if (shell.seeded) terminalExample(owner, transcript);
  const history = node('pre', 'term-history');
  for (const {prompt, output} of shell.history) {
    history.append(prompt + '\n');
    if (typeof output === 'string') {
      if (output) history.append(output + '\n');
    } else {
      output.rows.forEach((row, index) => {
        appendListingRow(history, owner, row);
        history.append(index === output.rows.length - 1 ? '\n' : output.separator);
      });
    }
  }
  transcript.append(history);
  const line = node('form', 'term-line');
  line.autocomplete = 'off';
  const prompt = node('label');
  prompt.append(terminalPrompt(owner, shell.cwd));
  const entry = node('input');
  entry.id = 'terminal-command';
  entry.setAttribute('aria-label', 'Terminal command');
  entry.spellcheck = false;
  entry.autocapitalize = 'off';
  prompt.htmlFor = entry.id;
  line.append(prompt, entry);
  transcript.append(line);
  terminal.onclick = event => {
    if (!event.target.closest('button, a, label, input') && !window.getSelection()?.toString())
      entry.focus({preventScroll: true});
  };
  const current = shell;
  line.onsubmit = e => {
    e.preventDefault();
    const command = entry.value.trim(), before = shell.cwd;
    if (command === 'clear') {
      shell.seeded = false;
      shell.history = [];
    } else {
      const output = runSample(command);
      shell.history.push({prompt:'root@' + owner.name + '.box.test:' + before + '# ' + command, output});
    }
    if (command)
      shell.commands.push(command);
    shell.recall = shell.commands.length;
    render();
    const next = $('#terminal-command');
    next.focus({preventScroll: true});
    next.closest('.terminal-extra').scrollTop = next.closest('.terminal-extra').scrollHeight;
  };
  entry.onkeydown = e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      current.recall = Math.max(
          0, Math.min(current.commands.length, current.recall + (e.key === 'ArrowUp' ? -1 : 1)));
      entry.value = current.commands[current.recall] || '';
    }
  };
}

init();
render();
sizeWindow();
new ResizeObserver(sizeWindow).observe($('.app-window'));
