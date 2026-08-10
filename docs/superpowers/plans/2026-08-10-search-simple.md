# Simple Search UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 検索ボックス + サジェスト + 結果一覧の一般的な検索UIを `search/simple/` に追加する。

**Architecture:** 静的データ（JS 内の配列約24件）をクライアントサイドで絞り込む。入力中は combobox パターンのサジェスト、確定で結果カード一覧を更新。状態は `{ query, activeIndex }` のみ。

**Tech Stack:** バニラ HTML / CSS / JS。ビルドなし・依存なし。

**Spec:** `docs/superpowers/specs/2026-08-10-search-simple-design.md`

## Global Constraints

- 外部依存・ビルド工程・外部 API を追加しない（Google Fonts の `<link>` は既存ページ同様に可）。
- `lang="ja"`、UI 文言は日本語。コード・クラス名は英語。
- 既存 simple 変種（`carousel/simple/` 等）のファイル構成・命名（BEM 風クラス）・`page-header` の流儀に合わせる。
- テストは追加しない（リポジトリに基盤がなく既存踏襲）。検証はブラウザ実機確認。
- コミットメッセージは既存に合わせ英語の命令形（例: `Add simple search UI`）。

---

### Task 1: `search/simple/` 本体（HTML / CSS / JS）

**Files:**
- Create: `search/simple/index.html`
- Create: `search/simple/styles.css`
- Create: `search/simple/script.js`

**Interfaces:**
- Consumes: なし（参照ファイルの規約のみ）
- Produces: `search/simple/` で完結する検索UIページ（Task 2 がリンクする）

- [ ] **Step 1: 参照ファイルを読む**

`carousel/simple/index.html`・`carousel/simple/styles.css`・`carousel/simple/script.js` を全文読み、
`page-header` の構造・配色・BEM 風命名・`data-*` フックの流儀を把握する。

- [ ] **Step 2: `index.html` を書く**

構造は以下のとおり（属性は省略せずこのまま使う）:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Simple Search Demo</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header class="page-header">
      <h1>簡易検索 UI</h1>
      <p class="page-header__subtitle">サジェスト／ハイライト／キーボード操作対応</p>
      <p class="page-header__back"><a href="../" class="page-header__link">← ギャラリーへ戻る</a></p>
    </header>

    <main class="container">
      <div class="search">
        <div class="search__box">
          <svg class="search__icon" aria-hidden="true" viewBox="0 0 24 24"><!-- 虫眼鏡アイコン（circle + line で自作） --></svg>
          <input
            class="search__input"
            type="text"
            role="combobox"
            aria-expanded="false"
            aria-controls="suggestion-list"
            aria-autocomplete="list"
            aria-label="コンポーネントを検索"
            placeholder="コンポーネントを検索…"
            data-input
          />
          <button class="search__clear" data-clear aria-label="検索をクリア" hidden>✕</button>
        </div>
        <ul class="search__suggestions" id="suggestion-list" role="listbox" aria-label="検索候補" data-suggestions hidden></ul>
      </div>

      <section class="results" aria-label="検索結果">
        <p class="results__count" aria-live="polite" data-count></p>
        <div class="results__grid" data-results></div>
      </section>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 3: `script.js` を書く**

先頭に静的データ `SEARCH_DATA`（**24件**）を置く。形は:

```js
const SEARCH_DATA = [
  {
    title: 'ヘリックスカルーセル',
    category: 'Carousel',
    description: '3D螺旋状に回転する立体カルーセル。慣性スクロールとスナップ対応。',
    tags: ['carousel', '3d', 'helix', 'かるーせる'],
  },
  {
    title: 'イベントホライズンノブ',
    category: 'Knob',
    description: 'ブラックホールを模したロータリーノブ。降着円盤と重力レンズ表現。',
    tags: ['knob', 'blackhole', 'のぶ'],
  },
  {
    title: 'ネビュラカラーピッカー',
    category: 'Color Picker',
    description: '星雲を模したカラーピッカー。ドラッグで色相と彩度を選択。',
    tags: ['color', 'picker', 'nebula', 'からーぴっかー'],
  },
  // …計24件。category は Carousel / Knob / Color Picker / Text / Form /
  // Navigation / Feedback / Layout の8種 × 3件。title はカタカナ+英語を混在させ、
  // tags には英語表記とひらがな表記を入れる（かな正規化のデモが効くように）。
];
```

ロジックは以下を実装する:

```js
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
```

挙動仕様:

| 操作 | 挙動 |
|------|------|
| ページ読込 | 全24件をカード表示、件数表示は「すべて 24件」 |
| `input` イベント | クエリ空ならサジェストを閉じ全件表示に戻す。非空なら `matches` で絞った先頭7件をサジェスト表示（title を `highlight`、category を添える）。`activeIndex = -1` にリセット。クリアボタンの `hidden` を切替 |
| `↓` / `↑` | サジェスト表示中に `activeIndex` を循環移動（端でループ）。`aria-activedescendant` を `suggestion-<index>` に更新し、該当 `option` に `aria-selected="true"` とハイライトクラス。非表示時の `↓` は候補があれば開く |
| `Enter` | `e.isComposing || e.keyCode === 229` なら何もしない（IME 確定）。activeIndex >= 0 ならその候補の title を input に入れて検索実行。それ以外は現在の入力値で検索実行。サジェストは閉じる |
| `Escape` | サジェストを閉じる（入力は消さない） |
| サジェストを `mousedown` | `preventDefault()`（blur で閉じるのを防ぐ）して候補選択と同じ処理 |
| input 外のクリック | サジェストを閉じる |
| ✕（クリア） | 入力を空にし、全件表示に戻し、input にフォーカスを戻す |

検索実行（確定）時の結果表示:

- `matches` で絞った全件を `.results__grid` にカード表示。カードは title（`highlight` 適用）+ category バッジ + description。
- 件数表示: 「"<クエリ>" の検索結果 N件」。クエリの echo は `textContent` 相当で安全に（`escapeHtml` 済み文字列を使う）。
- 0件時: グリッドの代わりに空状態メッセージ「「<クエリ>」に一致する結果はありません。キーワードを変えてお試しください。」
- サジェストの開閉時は必ず `aria-expanded` と `hidden` を同期する。

- [ ] **Step 4: `styles.css` を書く**

- `carousel/simple/styles.css` の配色・page-header スタイルをベースにする（ダーク基調 #0a0a0f 系 + シアン `#00f5d4` アクセント）。
- `.search` は `max-width: 640px; margin: 0 auto;` 中央寄せ。`.search__box` は角丸ボーダー、フォーカス時にシアンのリング。
- `.search__suggestions` は box の直下に `position: absolute` で重ねる（`.search` を `position: relative` に）。
- サジェストのアクティブ行は背景色で明示。`mark` は背景シアン系・文字色は背景とのコントラスト比 4.5:1 以上を確保。
- `.results__grid` は `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`。
- カードは `--bg-card: #16161f` 系 + ホバーで軽い持ち上がり。モバイル（〜480px）で padding を詰める。

- [ ] **Step 5: ブラウザで動作確認**

`python3 -m http.server` 等で配信し、以下を目視確認:

1. 初期表示で24件 + 「すべて 24件」
2. 「かるーせる」入力でサジェストにカルーセル系が出てハイライトされる（かな正規化）
3. ↓↑で候補移動が端でループ、Enter で結果が絞られる
4. 存在しない語で空状態メッセージ
5. ✕で全件に戻る、Escape で閉じる、外クリックで閉じる

- [ ] **Step 6: Commit**

```bash
git add search/simple
git commit -m "Add simple search UI"
```

---

### Task 2: `search/index.html` ギャラリーページ

**Files:**
- Create: `search/index.html`
- 参照: `text-font/index.html`（同型のギャラリーページ）

**Interfaces:**
- Consumes: Task 1 の `search/simple/`（カードのリンク先 `simple/`）
- Produces: `search/` 直下のギャラリーページ（ルートからの導線は後続 PR）

- [ ] **Step 1: `text-font/index.html` を全文読む**

カード構造・breadcrumb・配色トークン・フッターの流儀を把握する。

- [ ] **Step 2: `search/index.html` を作る**

`text-font/index.html` と同型で以下を差し替える:

- `<title>Search Gallery | UI Lab</title>`、見出しは「Search」、説明文は「検索UIの実験場。サジェスト・ハイライト・キーボード操作を探求する。」
- カードは1枚のみ: タイトル「Simple」、リンク `simple/`、説明「サジェスト＋結果一覧の一般的な検索UI」、features タグ「Suggest / Highlight / Keyboard / IME-aware」
- text-font 版にあるツールクレジット等、simple に該当しない要素は削る。

- [ ] **Step 3: ブラウザで確認**

`search/` を開き、カードから `simple/` に遷移できること、`simple/` の「← ギャラリーへ戻る」で戻れることを確認。

- [ ] **Step 4: Commit**

```bash
git add search/index.html
git commit -m "Add search gallery page"
```
