import { addEcho, rankArtifacts } from './engine.mjs';

const ARTIFACTS = [
  {
    id: 'helix',
    code: 'HX',
    title: 'ヘリックスカルーセル',
    category: 'Carousel',
    description: '3D空間を螺旋し、慣性で滑る立体カルーセル。',
    signals: ['future', 'motion', 'spatial', 'tactile'],
    href: '../../carousel/helix/',
    accent: '#8df7d6',
    x: 18,
    y: 22,
  },
  {
    id: 'pachislot',
    code: '77',
    title: 'レトロパチスロ',
    category: 'Carousel',
    description: 'CRTノイズとレバーの手応えで回す、遊戯機のようなUI。',
    signals: ['retro', 'motion', 'tactile', 'warm'],
    href: '../../carousel/retro/',
    accent: '#ffad66',
    x: 39,
    y: 15,
  },
  {
    id: 'simple-carousel',
    code: 'SC',
    title: 'シンプルカルーセル',
    category: 'Carousel',
    description: 'スワイプと自動再生に対応した、静かで実用的なカルーセル。',
    signals: ['minimal', 'motion', 'utility'],
    href: '../../carousel/simple/',
    accent: '#d5dfd8',
    x: 70,
    y: 18,
  },
  {
    id: 'blackhole',
    code: 'BH',
    title: 'イベントホライズン',
    category: 'Knob',
    description: '降着円盤と重力レンズを操作感に変えた、宇宙的なノブ。',
    signals: ['cosmic', 'tactile', 'motion', 'experimental'],
    href: '../../knob/blackhole/',
    accent: '#8ea8ff',
    x: 87,
    y: 31,
  },
  {
    id: 'cube',
    code: 'CB',
    title: 'キューブミキサー',
    category: 'Knob',
    description: '立方体の各面をドラッグし、値を混ぜる3Dミキサー。',
    signals: ['spatial', 'tactile', 'precise', 'color'],
    href: '../../knob/rubiks-cube/',
    accent: '#f4d35e',
    x: 81,
    y: 61,
  },
  {
    id: 'simple-knob',
    code: 'KN',
    title: 'ロータリーノブ',
    category: 'Knob',
    description: 'ドラッグやホイールで精密に値を合わせる、道具としてのノブ。',
    signals: ['tactile', 'precise', 'utility', 'minimal'],
    href: '../../knob/simple/',
    accent: '#d8e2dc',
    x: 66,
    y: 82,
  },
  {
    id: 'nebula',
    code: 'NB',
    title: 'クロマティック・ネビュラ',
    category: 'Color Picker',
    description: '星雲の中を航行し、パーティクルから色を捕まえるピッカー。',
    signals: ['cosmic', 'color', 'motion', 'future'],
    href: '../../color-picker/nebula/',
    accent: '#d398ff',
    x: 42,
    y: 87,
  },
  {
    id: 'oracle',
    code: 'OR',
    title: 'パラドックス・オラクル',
    category: 'Color Picker',
    description: '調和色を軌道上で行き来し、配色の可能性を占う探索UI。',
    signals: ['color', 'spatial', 'experimental', 'precise'],
    href: '../../color-picker/paradox-oracle/',
    accent: '#ff9e80',
    x: 15,
    y: 75,
  },
  {
    id: 'simple-color',
    code: 'CP',
    title: 'シンプルカラーピッカー',
    category: 'Color Picker',
    description: 'SV面と色相スライダーで、色を素早く正確に決める実用UI。',
    signals: ['color', 'precise', 'minimal', 'utility'],
    href: '../../color-picker/simple/',
    accent: '#76e6ff',
    x: 10,
    y: 49,
  },
  {
    id: 'glyph',
    code: 'GL',
    title: 'グリフ・リアクター',
    category: 'Text',
    description: '文字を重力場へ放ち、質量と乱流で字形を変容させるUI。',
    signals: ['text', 'motion', 'future', 'experimental'],
    href: '../../text-font/glyph-reactor/',
    accent: '#c9ff68',
    x: 24,
    y: 45,
  },
  {
    id: 'forge',
    code: 'TF',
    title: 'タイプ・フォージ',
    category: 'Text',
    description: '文字を熱し、鎚で打ち、活字として鍛える手仕事のUI。',
    signals: ['text', 'tactile', 'warm', 'experimental'],
    href: '../../text-font/type-forge/',
    accent: '#ff735b',
    x: 54,
    y: 66,
  },
  {
    id: 'simple-type',
    code: 'TY',
    title: 'タイプ・プレイグラウンド',
    category: 'Text',
    description: 'フォント、行間、字間を一つの場所で整える静かな文字の実験室。',
    signals: ['text', 'minimal', 'precise', 'utility'],
    href: '../../text-font/simple/',
    accent: '#f0eee7',
    x: 56,
    y: 28,
  },
];

const SIGNAL_LABELS = {
  future: '未来',
  tactile: '触覚',
  motion: '運動',
  spatial: '空間',
  cosmic: '宇宙',
  color: '色彩',
  text: '文字',
  retro: 'レトロ',
  minimal: '静けさ',
  utility: '実用',
  experimental: '実験',
  warm: '温度',
  precise: '精密',
  navigation: '導線',
  feedback: '反応',
};

const field = document.querySelector('[data-field]');
const artifactsElement = document.querySelector('[data-artifacts]');
const detailElement = document.querySelector('[data-detail]');
const form = document.querySelector('[data-form]');
const input = document.querySelector('[data-input]');
const sendButton = document.querySelector('[data-send]');
const statusElement = document.querySelector('[data-status]');
const fieldMessageElement = document.querySelector('[data-field-message]');
const memoryElement = document.querySelector('[data-memory]');
const echoesElement = document.querySelector('[data-echoes]');
const pulsesElement = document.querySelector('[data-pulses]');
const waveCountElement = document.querySelector('[data-wave-count]');
const clockElement = document.querySelector('[data-clock]');

let echoes = [];
let mode = 'attract';
let selectedId = null;
let waveCount = 0;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function displayPosition(item) {
  if (echoes.length === 0) return { x: item.x, y: item.y };
  const direction = item.repelled ? -0.11 : Math.max(0, item.resonance - 18) / 100 * 0.28;
  return {
    x: Math.max(7, Math.min(93, item.x + (50 - item.x) * direction)),
    y: Math.max(9, Math.min(91, item.y + (50 - item.y) * direction)),
  };
}

function artifactHtml(item, index) {
  const position = displayPosition(item);
  const selected = item.id === selectedId;
  const resonance = echoes.length === 0 ? 0.08 : item.resonance / 100;
  const classNames = [
    'artifact',
    selected ? 'is-selected' : '',
    item.repelled ? 'is-repelled' : '',
  ].filter(Boolean).join(' ');
  const name = echoes.length === 0 ? '未知標本 ' + String(index + 1).padStart(2, '0') : item.title;
  return (
    '<button type="button" class="' + classNames + '"' +
      ' style="--x:' + position.x + '%;--y:' + position.y + '%;--glow:' + item.accent +
      ';--resonance:' + resonance + ';--wave-delay:' + Math.round(index * 32) + 'ms"' +
      ' data-artifact-id="' + item.id + '" aria-pressed="' + selected + '">' +
      '<span class="artifact__orb">' + item.code + '</span>' +
      '<span class="artifact__copy">' +
        '<span class="artifact__name">' + escapeHtml(name) + '</span>' +
        '<span class="artifact__meta">' + escapeHtml(item.category.toUpperCase()) + ' / ' +
          String(item.resonance).padStart(2, '0') + '%</span>' +
      '</span>' +
      '<span class="sr-only">正体は' + escapeHtml(item.title) + '、共鳴度' + item.resonance + 'パーセント</span>' +
    '</button>'
  );
}

function renderArtifacts() {
  const focusedArtifactId = document.activeElement?.dataset?.artifactId;
  const ranked = rankArtifacts(ARTIFACTS, echoes);
  artifactsElement.innerHTML = ranked.map(artifactHtml).join('');
  field.classList.toggle('has-echo', echoes.length > 0);
  fieldMessageElement.setAttribute('aria-hidden', String(echoes.length > 0));
  if (focusedArtifactId) {
    artifactsElement
      .querySelector('[data-artifact-id="' + focusedArtifactId + '"]')
      ?.focus({ preventScroll: true });
  }
  return ranked;
}

function renderDetail() {
  const item = ARTIFACTS.find((artifact) => artifact.id === selectedId);
  if (!item) {
    detailElement.innerHTML =
      '<div class="specimen__placeholder">' +
        '<p class="micro-label">SELECTED SIGNAL</p>' +
        '<h2 id="specimen-title">未観測</h2>' +
        '<div class="specimen__placeholder-orbit" aria-hidden="true"><span></span></div>' +
        '<p>光点を選ぶと、ここに輪郭が現れます。</p>' +
        '<p class="specimen__hint">TIP — 最初の波を放つと<br />名前が読み取れるようになります</p>' +
      '</div>';
    return;
  }

  const ranked = rankArtifacts(ARTIFACTS, echoes);
  const scored = ranked.find((artifact) => artifact.id === item.id);
  const signals = item.signals
    .map((signal) => '<span>' + escapeHtml(SIGNAL_LABELS[signal] || signal) + '</span>')
    .join('');

  detailElement.innerHTML =
    '<div class="specimen__content" style="--specimen-accent:' + item.accent + '">' +
      '<div class="specimen__index"><span>SPECIMEN / ' + item.code + '</span><span>R ' +
        String(scored.resonance).padStart(2, '0') + '%</span></div>' +
      '<div class="specimen__rune" aria-hidden="true">' + item.code + '</div>' +
      '<p class="specimen__category">' + escapeHtml(item.category) + '</p>' +
      '<h2 id="specimen-title">' + escapeHtml(item.title) + '</h2>' +
      '<p class="specimen__description">' + escapeHtml(item.description) + '</p>' +
      '<div class="specimen__signals" aria-label="特徴信号">' + signals + '</div>' +
      '<div class="specimen__actions">' +
        '<button class="specimen__action" type="button" data-emit-artifact="attract">＋ これに似たもの</button>' +
        '<button class="specimen__action specimen__action--repel" type="button" data-emit-artifact="repel">− これではない</button>' +
        '<a class="specimen__visit" href="' + item.href + '">標本を体験する ↗</a>' +
      '</div>' +
    '</div>';
}

function renderMemory() {
  memoryElement.hidden = echoes.length === 0;
  echoesElement.innerHTML = echoes.map((echo, index) => {
    const isRepel = echo.mode === 'repel';
    return (
      '<div class="echo-chip' + (isRepel ? ' echo-chip--repel' : '') + '">' +
        '<span class="echo-chip__mode" aria-hidden="true">' + (isRepel ? '−' : '＋') + '</span>' +
        '<span>' + escapeHtml(echo.label || echo.term) + '</span>' +
        '<button type="button" data-remove-echo="' + index + '" aria-label="' +
          escapeHtml(echo.label || echo.term) + 'の波を消す">×</button>' +
      '</div>'
    );
  }).join('');
}

function render() {
  const ranked = renderArtifacts();
  renderDetail();
  renderMemory();

  if (echoes.length > 0) {
    const strong = ranked.filter((item) => item.resonance >= 50 && !item.repelled).length;
    statusElement.textContent = '強い共鳴 ' + strong + ' / ' + ARTIFACTS.length +
      ' ・ 第' + String(waveCount).padStart(2, '0') + '波を観測';
  } else {
    statusElement.textContent = '未送信 — ' + ARTIFACTS.length + '個の微弱な輪郭を検出';
  }
}

function launchPulse(nextMode) {
  waveCount += 1;
  waveCountElement.textContent = 'WAVE ' + String(waveCount).padStart(2, '0');
  const pulse = document.createElement('span');
  pulse.className = 'pulse' + (nextMode === 'repel' ? ' pulse--repel' : '');
  pulsesElement.appendChild(pulse);
  field.classList.remove('is-listening');
  requestAnimationFrame(() => field.classList.add('is-listening'));
  pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
  window.setTimeout(() => field.classList.remove('is-listening'), 1800);
}

function broadcast(term, nextMode = mode, extra = {}) {
  const cleanTerm = String(term).trim();
  if (!cleanTerm) {
    input.focus();
    return;
  }

  echoes = addEcho(echoes, { term: cleanTerm, mode: nextMode, ...extra });
  launchPulse(nextMode);
  render();
}

function setMode(nextMode) {
  mode = nextMode === 'repel' ? 'repel' : 'attract';
  document.querySelectorAll('[data-mode]').forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  form.classList.toggle('is-repel', mode === 'repel');
  sendButton.querySelector('span').textContent = mode === 'repel' ? '遠ざける' : '波を放つ';
  input.placeholder = mode === 'repel'
    ? '例：3Dは違う、派手すぎる'
    : '例：未来的で、触ると動くもの';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.isComposing) return;
  const term = input.value;
  if (!term.trim()) return;
  broadcast(term);
  input.value = '';
});

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    setMode('attract');
    broadcast(button.dataset.prompt, 'attract');
  });
});

artifactsElement.addEventListener('click', (event) => {
  const artifactButton = event.target.closest('[data-artifact-id]');
  if (!artifactButton) return;
  selectedId = artifactButton.dataset.artifactId;
  renderArtifacts();
  renderDetail();
});

detailElement.addEventListener('click', (event) => {
  const emitButton = event.target.closest('[data-emit-artifact]');
  if (!emitButton || !selectedId) return;
  const item = ARTIFACTS.find((artifact) => artifact.id === selectedId);
  const nextMode = emitButton.dataset.emitArtifact;
  broadcast('artifact:' + item.id, nextMode, {
    label: '「' + item.title + '」' + (nextMode === 'repel' ? 'ではない' : 'に似たもの'),
    signals: item.signals,
  });
  detailElement
    .querySelector('[data-emit-artifact="' + nextMode + '"]')
    ?.focus({ preventScroll: true });
});

echoesElement.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-echo]');
  if (!removeButton) return;
  const removedIndex = Number(removeButton.dataset.removeEcho);
  echoes.splice(removedIndex, 1);
  render();
  const remainingRemoveButtons = echoesElement.querySelectorAll('[data-remove-echo]');
  if (remainingRemoveButtons.length > 0) {
    remainingRemoveButtons[Math.min(removedIndex, remainingRemoveButtons.length - 1)]
      .focus({ preventScroll: true });
  } else {
    input.focus({ preventScroll: true });
  }
});

document.querySelector('[data-reset]').addEventListener('click', () => {
  echoes = [];
  selectedId = null;
  waveCount = 0;
  waveCountElement.textContent = 'WAVE 00';
  render();
  input.focus();
});

field.addEventListener('pointermove', (event) => {
  const bounds = field.getBoundingClientRect();
  field.style.setProperty('--mx', ((event.clientX - bounds.left) / bounds.width * 100).toFixed(1) + '%');
  field.style.setProperty('--my', ((event.clientY - bounds.top) / bounds.height * 100).toFixed(1) + '%');
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== input) {
    event.preventDefault();
    input.focus();
  }
  if (event.key === 'Escape' && selectedId) {
    selectedId = null;
    renderArtifacts();
    renderDetail();
  }
});

function updateClock() {
  clockElement.textContent = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date()) + ' JST';
}

updateClock();
window.setInterval(updateClock, 1000);
render();
