# Multiverse Search UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 検索履歴を分岐グラフ（commit / checkout / diff / merge）として操作できる検索UIを `search/multiverse/` に追加する。

**Architecture:** 静的データ24件をクライアントサイドで絞り込む。各検索状態はグラフのノード（結果セットを保持）。ノード = 絶対配置の HTML `<button>`、エッジ = 背面 SVG のベジェ曲線。状態は `nodes` 配列 + `currentId` + `compare` のみ。

**Tech Stack:** バニラ HTML / CSS / JS。ビルドなし・依存なし。

**Spec:** `docs/superpowers/specs/2026-08-10-search-multiverse-design.md`

## Global Constraints

- 外部依存・ビルド工程・外部 API を追加しない。
- `lang="ja"`、UI 文言は日本語。コード・クラス名は英語。
- 既存 `search/simple/` の流儀に合わせる: `page-header` 構造、ダーク配色（背景 #0a0a0f 系・カード #16161f 系・アクセント `#00f5d4`）、BEM 風クラス、`data-*` フック。
- `SEARCH_DATA`（24件）と `normalize` / `matches` / `highlight` / `escapeHtml` は `search/simple/script.js` から**一字一句そのままコピー**する（変種は自己完結が規約）。
- `search/simple/` 配下は変更しない。
- テストは追加しない（リポジトリに基盤がなく既存踏襲）。検証はブラウザ実機確認。
- コミットメッセージは英語の命令形。

---

### Task 1: `search/multiverse/` コア（グラフ + commit / checkout / リセット）

**Files:**
- Create: `search/multiverse/index.html`
- Create: `search/multiverse/styles.css`
- Create: `search/multiverse/script.js`

**Interfaces:**
- Consumes: `search/simple/script.js`（データ・ヘルパーのコピー元）、`search/simple/styles.css`（配色・page-header の参照元）
- Produces: Task 2 が拡張する土台。特に `nodes` / `currentId` / `nodeById(id)` / `findFreeRow(depth, startRow)` / `label(node)` / `render()` / `onNodeClick(id)` / `cardHtml(item, query)` / ノード生成規約（`{ id, kind, query, op, parents, resultIds, depth, row }`）

- [ ] **Step 1: 参照ファイルを読む**

`search/simple/index.html`・`search/simple/styles.css`・`search/simple/script.js` を全文読み、`page-header` 構造・配色・BEM 命名・`data-*` フックの流儀を把握する。

- [ ] **Step 2: `index.html` を書く**

構造は以下のとおり（属性は省略せずこのまま使う）:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Multiverse Search Demo</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header class="page-header">
      <h1>マルチバース検索 UI</h1>
      <p class="page-header__subtitle">検索を分岐し、並行世界を比較・統合する</p>
      <p class="page-header__back"><a href="../" class="page-header__link">← ギャラリーへ戻る</a></p>
    </header>

    <main class="container">
      <div class="commit-bar">
        <input
          class="commit-bar__input"
          type="text"
          aria-label="絞り込みキーワードを追加"
          placeholder="キーワードを追加して分岐…（Enter で確定）"
          data-input
        />
        <p class="commit-bar__path" data-path></p>
      </div>

      <section class="graph" aria-label="検索履歴グラフ">
        <div class="graph__toolbar">
          <button class="graph__tool" type="button" data-reset>リセット</button>
        </div>
        <div class="graph__pane" data-pane>
          <svg class="graph__edges" data-edges aria-hidden="true"></svg>
          <div class="graph__nodes" role="group" aria-label="検索履歴ノード" data-nodes></div>
        </div>
      </section>

      <section class="results" aria-label="検索結果">
        <p class="results__status" aria-live="polite" data-status></p>
        <div data-results></div>
      </section>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 3: `script.js` を書く**

先頭に `search/simple/script.js` から `SEARCH_DATA`（24件全部）と `normalize` / `matches` / `highlight` / `escapeHtml` をそのままコピー。続けて IIFE 内にアプリ本体を書く。コア部分は以下を**そのまま**使う:

```js
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
  // …renderGraph / renderPath / renderResults / render / イベント配線（下記仕様）…
})();
```

描画とイベントは以下の仕様で実装する:

- `renderGraph()`:
  - `nodes` から最大 depth / row を求め、ペイン内寸を
    `width = PAD * 2 + maxDepth * X_GAP + NODE_W`、`height = PAD * 2 + maxRow * Y_GAP + NODE_H`
    とし、SVG（`width`/`height` 属性 + 同値の `viewBox`）と `.graph__nodes` の
    インラインサイズに反映する。
  - エッジ: 全ノードの各 `parents` について `edgePath(parent, child)` の `<path>` を
    SVG に描く（`fill="none"`、stroke は CSS）。
  - ノード: 各ノードを `<button type="button" class="graph__node" data-node-id="ID">` で
    `.graph__nodes` に絶対配置（`left`/`top` インラインスタイル、幅 `NODE_W`px・高さ `NODE_H`px 固定）。
    中身はラベル（`escapeHtml(label(node))`、1行 ellipsis）+ 件数バッジ（`N件`）。
  - 修飾: 現在ノードに `graph__node--current` と `aria-current="true"`、
    `resultIds.length === 0` のノードに `graph__node--empty`。
  - `aria-label` は「クエリ「3d」 8件」「すべて 24件」の形式（query は「クエリ「X」」、root は「すべて」）。
  - 再描画は `innerHTML` の全再構築でよいが、**再構築前に `document.activeElement` が
    ノードボタンならその `data-node-id` を控え、再構築後に同 ID のボタンへ
    `focus()` を戻す**（Tab 操作でフォーカスが消えないように）。
  - クリックは `.graph__nodes` へのイベント委譲で `closest('[data-node-id]')` →
    `onNodeClick(Number(...))`。
- `renderPath()`: `pathEl.textContent = path(nodeById(currentId))`。
- `renderResults()`: 現在ノードの `resultIds` をカード表示。
  - カードは simple と同型:
    ```js
    function cardHtml(item, query) {
      return (
        '<article class="results__card">' +
          '<h3 class="results__card-title">' + highlight(item.title, query) + '</h3>' +
          '<span class="results__card-category">' + escapeHtml(item.category) + '</span>' +
          '<p class="results__card-desc">' + escapeHtml(item.description) + '</p>' +
        '</article>'
      );
    }
    ```
    query 引数は**現在ノードが query ノードのときのみ** `node.query`、それ以外は `''`
    （`highlight` は空クエリでプレーン出力になる）。
  - `resultsEl.innerHTML = '<div class="results__grid">' + cards + '</div>'`。
  - 0件時はグリッドの代わりに `<p class="results__empty">この分岐に結果はありません。</p>`。
  - `statusEl.textContent`: root → `すべて 24件` / query → `「<query>」で絞り込み: N件` /
    merge → `統合結果: N件`。
- `render()` = `renderGraph()` → `renderPath()` → `renderResults()` の順で呼ぶ。
- イベント配線:
  - `input` の `keydown`: `Enter` のみ処理。`e.isComposing || e.keyCode === 229` なら
    無視（IME 確定）。`e.preventDefault()` して `commit()`。
  - `resetBtn` クリック → `reset()`。
  - 初期化は `reset()` を1回呼ぶ。

- [ ] **Step 4: `styles.css` を書く**

- `search/simple/styles.css` から body / `page-header` / `.container` / `.results__card`
  系（card, title, category, desc, empty）と `mark` のスタイルをベースに流用する
  （配色トークンは同値を使う）。
- `.commit-bar` は `max-width: 640px; margin: 0 auto;`。input は simple の
  `.search__input` 同様の角丸ボーダー + フォーカス時シアンリング。
  `.commit-bar__path` は小さめのグレー文字（現在パス表示）。
- `.graph__pane` は `position: relative; height: 280px; overflow: auto;`、
  背景に薄いグリッド（`background-image: linear-gradient` 2枚重ね等）で盤面感。
  `.graph__edges` と `.graph__nodes` は `position: absolute; top: 0; left: 0;`。
- `.graph__node` は `position: absolute;` 固定サイズ（JS が inline で指定）、
  カード色背景 + 角丸 + 細ボーダー。ラベルは `white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis;`。件数バッジは小さめシアン文字。
  `--current` はシアンの 2px リング（`box-shadow` か `outline`）、
  `--empty` は `opacity: 0.45` + 件数を警告色（例 `#ff6b6b`）。
  hover で軽い持ち上がり。`:focus-visible` リングを必ず用意。
- `.graph__toolbar` はペイン上部に右寄せ、`.graph__tool` はゴースト風小ボタン。
- エッジ `path` は `stroke: rgba(0, 245, 212, 0.35); stroke-width: 2; fill: none;`。
- `.results__grid` は `repeat(auto-fill, minmax(240px, 1fr))`。
- モバイル（〜480px）: `.container` の padding を詰める。グラフは横スクロールで成立。

- [ ] **Step 5: ブラウザで動作確認**

`python3 -m http.server` 等で配信し、以下を目視確認:

1. 初期表示: root ノード「すべて 24件」のみ + 全24件カード。
2. 「かるーせる」Enter → 子ノードが生え、カードが3件に絞られ、パスが「すべて › かるーせる」。
3. 続けて「3d」Enter → さらに絞られる（1件: ヘリックスカルーセル）。
4. root をクリック（checkout）→ 全件表示に戻る。そこから「のぶ」Enter → **分岐**して2本目の枝が生える。
5. root から再度「かるーせる」Enter → 新ノードが増えず既存ノードへ checkout される。
6. 存在しない語（例「zzz」）→ 0件ノードが減光表示、結果は空メッセージ。
7. リセット → root のみに戻る。
8. Tab でノードボタンに到達でき、Enter で checkout できる。

- [ ] **Step 6: Commit**

```bash
git add search/multiverse
git commit -m "Add multiverse search core UI"
```

---

### Task 2: 比較（diff）と統合（merge）

**Files:**
- Modify: `search/multiverse/index.html`（ツールバーにボタン追加）
- Modify: `search/multiverse/script.js`（比較状態・merge・描画分岐）
- Modify: `search/multiverse/styles.css`（A/B アクセント・グループ表示）

**Interfaces:**
- Consumes: Task 1 の `nodes` / `currentId` / `nodeById` / `findFreeRow` / `label` /
  `render` / `onNodeClick` / `cardHtml` / ノード構造 `{ id, kind, query, op, parents, resultIds, depth, row }`
- Produces: 完成した multiverse 変種（Task 3 がリンクする）

- [ ] **Step 1: ツールバーを拡張する**

`index.html` の `.graph__toolbar` を以下に差し替える（リセットは最後尾のまま）:

```html
<div class="graph__toolbar">
  <button class="graph__tool" type="button" data-compare-toggle aria-pressed="false">比較</button>
  <button class="graph__tool" type="button" data-merge-and disabled>∩ AND統合</button>
  <button class="graph__tool" type="button" data-merge-or disabled>∪ OR統合</button>
  <span class="graph__compare-info" data-compare-info hidden></span>
  <button class="graph__tool graph__tool--reset" type="button" data-reset>リセット</button>
</div>
```

- [ ] **Step 2: `script.js` に比較・統合を実装する**

状態 `let compare = { on: false, aId: null, bId: null };` を追加し、以下を**そのまま**使う:

```js
  function createMergeNode(a, b, op) {
    const aSet = new Set(a.resultIds);
    const bSet = new Set(b.resultIds);
    const resultIds = SEARCH_DATA
      .map((_, i) => i)
      .filter((i) => (op === 'AND' ? aSet.has(i) && bSet.has(i) : aSet.has(i) || bSet.has(i)));
    const depth = Math.max(a.depth, b.depth) + 1;
    const node = {
      id: nextId++, kind: 'merge', query: null, op,
      parents: [a.id, b.id], resultIds,
      depth, row: findFreeRow(depth, Math.round((a.row + b.row) / 2)),
    };
    nodes.push(node);
    return node;
  }

  function findMerge(aId, bId, op) {
    return nodes.find(
      (n) => n.kind === 'merge' && n.op === op &&
        ((n.parents[0] === aId && n.parents[1] === bId) ||
         (n.parents[0] === bId && n.parents[1] === aId))
    );
  }

  function mergeSelected(op) {
    if (!compare.on || compare.aId === null || compare.bId === null) return;
    const node = findMerge(compare.aId, compare.bId, op) ||
      createMergeNode(nodeById(compare.aId), nodeById(compare.bId), op);
    compare = { on: false, aId: null, bId: null };
    currentId = node.id;
    render();
  }

  function diffSets(a, b) {
    const aSet = new Set(a.resultIds);
    const bSet = new Set(b.resultIds);
    return {
      both: a.resultIds.filter((i) => bSet.has(i)),
      onlyA: a.resultIds.filter((i) => !bSet.has(i)),
      onlyB: b.resultIds.filter((i) => !aSet.has(i)),
    };
  }
```

挙動の変更点:

- `onNodeClick(id)` の先頭に比較モード分岐を追加:
  選択済み ID の再クリックはその選択を解除（A解除/B解除）。未選択なら
  `aId` が空なら A に、そうでなければ B に設定（B は上書き）。比較モード中は
  `currentId` を変えない。処理後 `render()`。
- `commit()` の先頭で比較モード中なら `compare = { on: false, aId: null, bId: null };`
  にして通常動作を続ける（比較しながらの commit は比較を終了してから）。
- `reset()` でも `compare` を初期化する。
- 比較トグル（`data-compare-toggle`）: `compare.on` を反転。off にしたら
  `aId` / `bId` も null に戻す。処理後 `render()`。
- `document` の `keydown` で `Escape`: `compare.on` なら比較モードを終了して `render()`。
- merge ボタン: `data-merge-and` → `mergeSelected('AND')`、`data-merge-or` → `mergeSelected('OR')`。

描画の変更点（すべて `render()` 経由で反映）:

- `renderToolbar()` を追加して `render()` の先頭で呼ぶ:
  - トグルの `aria-pressed` と `graph__tool--active` クラスを `compare.on` に同期。
  - merge 2ボタンの `disabled` = `!(compare.on && compare.aId !== null && compare.bId !== null)`。
  - `data-compare-info`: 比較モード外は `hidden`。比較モード中は表示し、
    `A: <ラベル>(N)` / `B: <ラベル>(N)` を選択済みのぶんだけ
    `<span class="graph__compare-chip graph__compare-chip--a">…</span>` 形式で入れる
    （ラベルは `escapeHtml(label(node))`）。
- `renderGraph()`: merge ノードの `aria-label` は `統合「<ラベル>」 N件` 形式
  （ラベルは `label(node)` の `(A ∩ B)` 表記）。比較選択ノードに `graph__node--a` / `graph__node--b` クラス。
  比較モード中は全ノードボタンに `aria-pressed`（選択中 A/B のみ `"true"`）を付け、
  モード外では付けない。
- `renderResults()`: `compare.on && aId !== null && bId !== null` のとき 3グループ表示に分岐:
  - `diffSets(a, b)` の結果で「共通 N件」「Aのみ N件」「Bのみ N件」の3セクション。
    各セクションは `<section class="results__group results__group--both（/--a/--b）">` +
    `<h2 class="results__group-title">共通 N件</h2>`（A/B は `Aのみ N件` / `Bのみ N件`）+ カードグリッド
    （`cardHtml(item, '')` でハイライトなし）。0件のグループは
    グリッドの代わりに `<p class="results__group-none">なし</p>`。
  - `statusEl.textContent = '比較中: 共通' + both.length + '件 / Aのみ' + onlyA.length + '件 / Bのみ' + onlyB.length + '件'`。
  - 比較モードだが選択が2つ揃っていない間は、通常の単一表示のまま。
    `statusEl` は `比較モード: ノードを2つ選んでください`（0選択時）/
    `比較モード: A「<ラベル>」選択中。もう1つ選んでください`（1選択時）。

- [ ] **Step 3: `styles.css` に比較スタイルを足す**

- アクセント色: A = `#ff6ec7`、B = `#ffd166`、共通 = `#00f5d4`。
- `.graph__node--a` / `--b` はそれぞれの色の 2px リング（`--current` より優先して見えるように）。
- `.graph__compare-chip--a` / `--b` は色付き小チップ。
- `.results__group` は上マージン + 左ボーダー 3px（グループ色）+ 見出し
  `.results__group-title`（グループ色の文字）。グループ内グリッドは既存
  `.results__grid` を再利用。
- `.graph__tool--active` はシアン背景寄りの強調。
- `.graph__tool:disabled` は減光 + `cursor: default`。

- [ ] **Step 4: ブラウザで動作確認**

1. 「かるーせる」枝と「のぶ」枝を作る（root から2分岐）。
2. 「比較」→ かるーせるノード → のぶノードをクリック → 結果が3グループ
   （共通0 / Aのみ3 / Bのみ3）になり、ノードにピンク/アンバーのリング。
3. 「∪ OR統合」→ `(かるーせる ∪ のぶ)` ノードが生え、6件表示、比較モード終了。
4. 再度同じ2ノードで「∪ OR統合」→ 新ノードが増えず既存 merge ノードへ checkout。
5. 「比較」中に Escape → 比較モード終了。
6. simple 側（`search/simple/`）が無変更であることを `git status` で確認。

- [ ] **Step 5: Commit**

```bash
git add search/multiverse
git commit -m "Add compare and merge to multiverse search"
```

---

### Task 3: ギャラリーにカード追加

**Files:**
- Modify: `search/index.html`

**Interfaces:**
- Consumes: Task 2 まで完成した `search/multiverse/`（リンク先）
- Produces: ギャラリーからの導線

- [ ] **Step 1: `search/index.html` を全文読む**

既存の Simple カードの構造（`.variant-card` 等のクラス・features タグ・プレビュー部）を把握する。

- [ ] **Step 2: Multiverse カードを追加する**

Simple カードの**後ろ**に同型のカードを1枚追加する:

- タイトル「Multiverse」、リンク `multiverse/`。
- 説明「検索履歴を並行世界として分岐・比較・統合する検索UI」。
- features タグ: `Branch` / `Diff` / `Merge` / `Time-travel`。
- プレビュー部は CSS 製のミニ分岐グラフ（丸ノード3つ + 線2本程度）。既存カードの
  プレビューの流儀（インライン SVG かdiv + CSS）に合わせ、新しい共通クラスを
  増やしすぎない（`mv-` プレフィクス等でカード内に閉じる）。
- ページ冒頭の説明文・カード数表記に件数が入っていれば整合させる。

- [ ] **Step 3: ブラウザで確認**

`search/` を開き、カード2枚（Simple / Multiverse）が並び、Multiverse カードから
`multiverse/` に遷移でき、「← ギャラリーへ戻る」で戻れることを確認。

- [ ] **Step 4: Commit**

```bash
git add search/index.html
git commit -m "Add multiverse card to search gallery"
```
