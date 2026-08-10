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
  const clearBtn = document.querySelector('[data-clear]');
  const suggestionsEl = document.querySelector('[data-suggestions]');
  const countEl = document.querySelector('[data-count]');
  const resultsEl = document.querySelector('[data-results]');

  const MAX_SUGGESTIONS = 7;

  let currentSuggestions = [];
  let activeIndex = -1;

  function cardHtml(item, query) {
    return (
      '<article class="results__card">' +
        '<h3 class="results__card-title">' + highlight(item.title, query) + '</h3>' +
        '<span class="results__card-category">' + escapeHtml(item.category) + '</span>' +
        '<p class="results__card-desc">' + escapeHtml(item.description) + '</p>' +
      '</article>'
    );
  }

  function renderCards(items, query) {
    resultsEl.innerHTML = items.map((item) => cardHtml(item, query)).join('');
  }

  function showAll() {
    countEl.textContent = 'すべて ' + SEARCH_DATA.length + '件';
    renderCards(SEARCH_DATA, '');
  }

  function runSearch(query) {
    query = query.trim();
    closeSuggestions();
    clearBtn.hidden = query === '';
    if (query === '') {
      showAll();
      return;
    }
    const filtered = SEARCH_DATA.filter((item) => matches(item, query));
    countEl.textContent = '"' + query + '" の検索結果 ' + filtered.length + '件';
    if (filtered.length === 0) {
      resultsEl.innerHTML =
        '<p class="results__empty">「' + escapeHtml(query) + '」に一致する結果はありません。キーワードを変えてお試しください。</p>';
    } else {
      renderCards(filtered, query);
    }
  }

  function openSuggestions() {
    suggestionsEl.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function closeSuggestions() {
    suggestionsEl.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    currentSuggestions = [];
    activeIndex = -1;
  }

  function suggestionHtml(item, index, query) {
    return (
      '<li id="suggestion-' + index + '" role="option" class="search__suggestion" aria-selected="false" data-index="' + index + '">' +
        '<span class="search__suggestion-title">' + highlight(item.title, query) + '</span>' +
        '<span class="search__suggestion-category">' + escapeHtml(item.category) + '</span>' +
      '</li>'
    );
  }

  function renderSuggestions(query) {
    query = query.trim();
    currentSuggestions = SEARCH_DATA.filter((item) => matches(item, query)).slice(0, MAX_SUGGESTIONS);
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    if (currentSuggestions.length === 0) {
      closeSuggestions();
      return;
    }
    suggestionsEl.innerHTML = currentSuggestions
      .map((item, index) => suggestionHtml(item, index, query))
      .join('');
    openSuggestions();
  }

  function setActive(nextIndex) {
    activeIndex = nextIndex;
    const options = suggestionsEl.querySelectorAll('[role="option"]');
    options.forEach((option, index) => {
      const isActive = index === activeIndex;
      option.setAttribute('aria-selected', String(isActive));
      option.classList.toggle('search__suggestion--active', isActive);
    });
    if (activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', 'suggestion-' + activeIndex);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function moveActive(direction) {
    const len = currentSuggestions.length;
    if (len === 0) return;
    const next = activeIndex === -1 ? (direction === 1 ? 0 : len - 1) : (activeIndex + direction + len) % len;
    setActive(next);
  }

  input.addEventListener('input', () => {
    const query = input.value;
    clearBtn.hidden = query === '';
    if (query === '') {
      closeSuggestions();
      showAll();
      return;
    }
    renderSuggestions(query);
  });

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (suggestionsEl.hidden) {
          const query = input.value;
          if (query !== '') renderSuggestions(query);
        } else {
          moveActive(1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!suggestionsEl.hidden) moveActive(-1);
        break;
      case 'Enter': {
        if (e.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        let query;
        if (activeIndex >= 0 && currentSuggestions[activeIndex]) {
          query = currentSuggestions[activeIndex].title;
          input.value = query;
        } else {
          query = input.value;
        }
        runSearch(query);
        break;
      }
      case 'Escape':
        closeSuggestions();
        break;
      default:
        break;
    }
  });

  input.addEventListener('blur', () => closeSuggestions());

  suggestionsEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const li = e.target.closest('[data-index]');
    if (!li) return;
    const item = currentSuggestions[Number(li.dataset.index)];
    if (!item) return;
    input.value = item.title;
    runSearch(item.title);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.hidden = true;
    closeSuggestions();
    showAll();
    input.focus();
  });

  showAll();
})();
