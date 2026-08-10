const SEARCH_DATA = [
  {
    title: 'ヘリックスカルーセル',
    category: 'Carousel',
    description: '3D螺旋状に回転する立体カルーセル。慣性スクロールとスナップ対応。',
    tags: ['carousel', '3d', 'helix', 'かるーせる'],
  },
  {
    title: 'レトロパチスロカルーセル',
    category: 'Carousel',
    description: 'パチスロ筐体を模したレトロなカルーセル。レバー操作とCRTエフェクトを再現。',
    tags: ['carousel', 'retro', 'pachislot', 'かるーせる'],
  },
  {
    title: 'シンプルカルーセル',
    category: 'Carousel',
    description: '矢印・ドット・自動再生・スワイプに対応した基本実装のカルーセル。',
    tags: ['carousel', 'simple', 'swipe', 'かるーせる'],
  },
  {
    title: 'イベントホライズンノブ',
    category: 'Knob',
    description: 'ブラックホールを模したロータリーノブ。降着円盤と重力レンズ表現。',
    tags: ['knob', 'blackhole', 'のぶ'],
  },
  {
    title: 'ルービックキューブノブ',
    category: 'Knob',
    description: '立方体の各面をドラッグして値を調整する3Dミキサーノブ。',
    tags: ['knob', 'cube', 'rubik', 'のぶ'],
  },
  {
    title: 'シンプルロータリーノブ',
    category: 'Knob',
    description: 'ドラッグ・スクロール・キーボード対応の基本的なロータリーノブ。',
    tags: ['knob', 'simple', 'rotary', 'のぶ'],
  },
  {
    title: 'ネビュラカラーピッカー',
    category: 'Color Picker',
    description: '星雲を模したカラーピッカー。ドラッグで色相と彩度を選択。',
    tags: ['color', 'picker', 'nebula', 'からーぴっかー'],
  },
  {
    title: 'パラドックスオラクルピッカー',
    category: 'Color Picker',
    description: '調和円軌道で配色候補を探索する実験的なカラーピッカー。',
    tags: ['color', 'picker', 'paradox', 'oracle', 'からーぴっかー'],
  },
  {
    title: 'シンプルカラーピッカー',
    category: 'Color Picker',
    description: 'SVキャンバスと色相スライダーで直感的に色を選択できるピッカー。',
    tags: ['color', 'picker', 'simple', 'hsv', 'からーぴっかー'],
  },
  {
    title: 'タイプフォージ活字鍛冶場',
    category: 'Text',
    description: '可変フォントの字形を熱し打ち鍛える鍛冶屋風タイポグラフィUI。',
    tags: ['text', 'font', 'typeforge', 'たいぽぐらふぃ'],
  },
  {
    title: 'グリフリアクターテキスト',
    category: 'Text',
    description: '文字を反応場に放ち質量と重力でグリフの姿を変えるテキストUI。',
    tags: ['text', 'font', 'glyph', 'reactor', 'たいぽぐらふぃ'],
  },
  {
    title: 'シンプルタイププレイグラウンド',
    category: 'Text',
    description: 'フォント・サイズ・行間・字間をライブプレビューで調整できる基本UI。',
    tags: ['text', 'font', 'simple', 'たいぽぐらふぃ'],
  },
  {
    title: 'フローティングラベルフォーム',
    category: 'Form',
    description: '入力時にラベルがふわりと浮き上がるシンプルなフォームUI。',
    tags: ['form', 'input', 'floating', 'ふぉーむ'],
  },
  {
    title: 'ステップウィザードフォーム',
    category: 'Form',
    description: '複数ステップに分割し進捗バーで案内する入力フォーム。',
    tags: ['form', 'wizard', 'step', 'ふぉーむ'],
  },
  {
    title: 'インラインバリデーションフォーム',
    category: 'Form',
    description: '入力中にリアルタイムで検証結果を表示するフォーム。',
    tags: ['form', 'validation', 'inline', 'ふぉーむ'],
  },
  {
    title: 'メガメニューナビゲーション',
    category: 'Navigation',
    description: '大量のリンクをカテゴリ別に整理して表示するドロップダウンメニュー。',
    tags: ['navigation', 'menu', 'mega', 'なびげーしょん'],
  },
  {
    title: 'パンくずナビゲーション',
    category: 'Navigation',
    description: '階層構造をたどれるシンプルなパンくずリスト。',
    tags: ['navigation', 'breadcrumb', 'なびげーしょん'],
  },
  {
    title: 'スクロールスパイタブナビゲーション',
    category: 'Navigation',
    description: 'スクロール位置に連動してアクティブタブが切り替わるナビゲーション。',
    tags: ['navigation', 'tab', 'scrollspy', 'なびげーしょん'],
  },
  {
    title: 'トーストフィードバック通知',
    category: 'Feedback',
    description: '画面端に一時的に表示され自動で消えるトースト通知。',
    tags: ['feedback', 'toast', 'notification', 'ふぃーどばっく'],
  },
  {
    title: 'スケルトンローディング',
    category: 'Feedback',
    description: 'コンテンツ読込中に骨格を表示するプレースホルダーUI。',
    tags: ['feedback', 'skeleton', 'loading', 'ふぃーどばっく'],
  },
  {
    title: 'プログレスモーダルフィードバック',
    category: 'Feedback',
    description: '処理の進捗をモーダル内のバーで表示するフィードバックUI。',
    tags: ['feedback', 'progress', 'modal', 'ふぃーどばっく'],
  },
  {
    title: 'マゾンリーグリッドレイアウト',
    category: 'Layout',
    description: '高さの異なるカードを隙間なく敷き詰めるマゾンリー風レイアウト。',
    tags: ['layout', 'masonry', 'grid', 'れいあうと'],
  },
  {
    title: 'スティッキーサイドバーレイアウト',
    category: 'Layout',
    description: 'スクロールに追従して固定されるサイドバーを持つレイアウト。',
    tags: ['layout', 'sidebar', 'sticky', 'れいあうと'],
  },
  {
    title: 'レスポンシブダッシュボードレイアウト',
    category: 'Layout',
    description: '画面幅に応じてカードを再配置するダッシュボードレイアウト。',
    tags: ['layout', 'dashboard', 'responsive', 'れいあうと'],
  },
];

// 正規化: 小文字化 + NFKC + ひらがな→カタカナ
function normalize(s) {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

// マッチ判定: title または tags のいずれかに部分一致（query は生文字列を渡す）
function matches(item, query) {
  const q = normalize(query);
  return normalize(item.title).includes(q) || item.tags.some((t) => normalize(t).includes(q));
}

// ハイライト: 正規化後のインデックスで元文字列を slice して <mark> を差し込む
// ponytail: NFKC で長さが変わる文字（㈱ ﬁ 等）はデータに入れない前提。入れるなら要インデックス写像
function highlight(text, query) {
  const q = normalize(query);
  const i = normalize(text).indexOf(q);
  if (!q || i < 0) return escapeHtml(text);
  return (
    escapeHtml(text.slice(0, i)) +
    '<mark>' + escapeHtml(text.slice(i, i + q.length)) + '</mark>' +
    escapeHtml(text.slice(i + q.length))
  );
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

(() => {
  const input = document.querySelector('[data-input]');
  const pathEl = document.querySelector('[data-path]');
  const paneEl = document.querySelector('[data-pane]');
  const edgesEl = document.querySelector('[data-edges]');
  const nodesEl = document.querySelector('[data-nodes]');
  const statusEl = document.querySelector('[data-status]');
  const resultsEl = document.querySelector('[data-results]');
  const resetBtn = document.querySelector('[data-reset]');

  const X_GAP = 170;
  const Y_GAP = 84;
  const NODE_W = 150;
  const NODE_H = 60;
  const PAD = 24;

  let nodes = [];
  let nextId = 0;
  let currentId = 0;

  function nodeById(id) {
    return nodes.find((n) => n.id === id);
  }

  // ponytail: linear scans everywhere — fine for a demo-scale graph (dozens of nodes)
  function isOccupied(depth, row) {
    return nodes.some((n) => n.depth === depth && n.row === row);
  }

  function findFreeRow(depth, startRow) {
    let row = Math.max(0, startRow);
    while (isOccupied(depth, row)) row++;
    return row;
  }

  function createRoot() {
    const node = {
      id: nextId++, kind: 'root', query: null, op: null,
      parents: [], resultIds: SEARCH_DATA.map((_, i) => i),
      depth: 0, row: 0,
    };
    nodes.push(node);
    return node;
  }

  function createQueryNode(parent, query) {
    const depth = parent.depth + 1;
    const node = {
      id: nextId++, kind: 'query', query, op: null,
      parents: [parent.id],
      resultIds: parent.resultIds.filter((i) => matches(SEARCH_DATA[i], query)),
      depth, row: findFreeRow(depth, parent.row),
    };
    nodes.push(node);
    return node;
  }

  function findChildByQuery(parent, query) {
    const q = normalize(query);
    return nodes.find(
      (n) => n.kind === 'query' && n.parents[0] === parent.id && normalize(n.query) === q
    );
  }

  function label(node) {
    if (node.kind === 'root') return 'すべて';
    if (node.kind === 'query') return node.query;
    const [a, b] = node.parents.map(nodeById);
    return '(' + label(a) + (node.op === 'AND' ? ' ∩ ' : ' ∪ ') + label(b) + ')';
  }

  function path(node) {
    if (node.kind === 'root') return 'すべて';
    if (node.kind === 'merge') return label(node);
    return path(nodeById(node.parents[0])) + ' › ' + node.query;
  }

  function nodePos(node) {
    return { x: PAD + node.depth * X_GAP, y: PAD + node.row * Y_GAP };
  }

  function edgePath(parent, child) {
    const p = nodePos(parent);
    const c = nodePos(child);
    const x1 = p.x + NODE_W;
    const y1 = p.y + NODE_H / 2;
    const x2 = c.x;
    const y2 = c.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return 'M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
  }

  function commit() {
    const query = input.value.trim();
    if (query === '') return;
    const parent = nodeById(currentId);
    const node = findChildByQuery(parent, query) || createQueryNode(parent, query);
    currentId = node.id;
    input.value = '';
    render();
    const btn = nodesEl.querySelector('[data-node-id="' + node.id + '"]');
    if (btn) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function onNodeClick(id) {
    currentId = id;
    render();
  }

  function reset() {
    nodes = [];
    nextId = 0;
    currentId = createRoot().id;
    render();
  }

  function cardHtml(item, query) {
    return (
      '<article class="results__card">' +
        '<h3 class="results__card-title">' + highlight(item.title, query) + '</h3>' +
        '<span class="results__card-category">' + escapeHtml(item.category) + '</span>' +
        '<p class="results__card-desc">' + escapeHtml(item.description) + '</p>' +
      '</article>'
    );
  }

  function renderGraph() {
    const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
    const maxRow = nodes.reduce((m, n) => Math.max(m, n.row), 0);
    const width = PAD * 2 + maxDepth * X_GAP + NODE_W;
    const height = PAD * 2 + maxRow * Y_GAP + NODE_H;

    edgesEl.setAttribute('width', width);
    edgesEl.setAttribute('height', height);
    edgesEl.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    nodesEl.style.width = width + 'px';
    nodesEl.style.height = height + 'px';

    const focused = document.activeElement;
    const focusedId = focused && focused.matches && focused.matches('[data-node-id]')
      ? focused.getAttribute('data-node-id')
      : null;

    edgesEl.innerHTML = nodes
      .flatMap((n) => n.parents.map((pid) => edgePath(nodeById(pid), n)))
      .map((d) => '<path d="' + d + '" fill="none"></path>')
      .join('');

    nodesEl.innerHTML = nodes
      .map((n) => {
        const pos = nodePos(n);
        const classes = ['graph__node'];
        if (n.id === currentId) classes.push('graph__node--current');
        if (n.resultIds.length === 0) classes.push('graph__node--empty');
        const ariaLabel = (n.kind === 'query' ? 'クエリ「' + n.query + '」' : label(n)) + ' ' + n.resultIds.length + '件';
        return (
          '<button type="button" class="' + classes.join(' ') + '" data-node-id="' + n.id + '"' +
            ' style="left: ' + pos.x + 'px; top: ' + pos.y + 'px; width: ' + NODE_W + 'px; height: ' + NODE_H + 'px;"' +
            (n.id === currentId ? ' aria-current="true"' : '') +
            ' aria-label="' + escapeHtml(ariaLabel) + '">' +
            '<span class="graph__node-label">' + escapeHtml(label(n)) + '</span>' +
            '<span class="graph__node-badge">' + n.resultIds.length + '件</span>' +
          '</button>'
        );
      })
      .join('');

    if (focusedId !== null) {
      const btn = nodesEl.querySelector('[data-node-id="' + focusedId + '"]');
      if (btn) btn.focus();
    }
  }

  function renderPath() {
    pathEl.textContent = path(nodeById(currentId));
  }

  function renderResults() {
    const node = nodeById(currentId);
    const query = node.kind === 'query' ? node.query : '';
    const items = node.resultIds.map((i) => SEARCH_DATA[i]);

    if (items.length === 0) {
      resultsEl.innerHTML = '<p class="results__empty">この分岐に結果はありません。</p>';
    } else {
      resultsEl.innerHTML = '<div class="results__grid">' + items.map((item) => cardHtml(item, query)).join('') + '</div>';
    }

    if (node.kind === 'root') {
      statusEl.textContent = 'すべて ' + node.resultIds.length + '件';
    } else if (node.kind === 'query') {
      statusEl.textContent = '「' + node.query + '」で絞り込み: ' + node.resultIds.length + '件';
    } else {
      statusEl.textContent = '統合結果: ' + node.resultIds.length + '件';
    }
  }

  function render() {
    renderGraph();
    renderPath();
    renderResults();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    commit();
  });

  resetBtn.addEventListener('click', reset);

  nodesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-node-id]');
    if (!btn) return;
    onNodeClick(Number(btn.dataset.nodeId));
  });

  reset();
})();
