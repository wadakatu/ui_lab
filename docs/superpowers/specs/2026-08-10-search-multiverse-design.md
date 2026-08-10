# Search UI — Multiverse 設計書 (2026-08-10)

検索UIお題第2弾。テーマは「前代未聞だが現実的に使える検索UI」。

## コンセプト

**検索は破壊的な操作である。** 新しいクエリを打つたびに前の結果セットは消え、
「さっきの絞り込みの方が良かったのに戻れない」が起きる。既存の検索UIはどれも
履歴を一直線にしか持たない。

Multiverse Search は検索履歴を **Git のような分岐グラフ** として扱う:

- **commit** — キーワードを追加するたび、現在ノードの子として新ノードが生える
  （結果セット = 親の結果 ∩ 新キーワードのマッチ。絞り込みの系譜）。
- **checkout** — 過去のどのノードにもクリック一発で戻れる。戻った先から別の
  キーワードで絞れば自動で分岐（fork）する。専用の fork 操作は不要。
- **diff** — 任意の2ノードを比較モードで選ぶと、結果が「共通 / Aのみ / Bのみ」の
  3グループに分かれて表示される。
- **merge** — 比較中の2ノードから AND（積集合）/ OR（和集合）の統合ノードを
  作れる。ブーリアン検索の力を、構文を1文字も書かずに直接操作で得る。

創作要素はビジュアルではなく**インタラクションモデルそのもの**。分岐・比較・統合
できる検索セッションは、EC の条件比較・文献調査・ログ調査など実務にそのまま効く。

検討した対案: ラジオチューナー型（ダイヤルでコーパスを走査。官能的だが「探す」より
「眺める」に寄る）、尋問型（コーパス側が質問して絞る。EC の guided selling に前例
あり）。新規性と実用性の両立で本案を採用。

## 構成

```
search/
├── index.html      ← カードを1枚追加（Multiverse）
├── simple/         ← 既存。変更しない
└── multiverse/
    ├── index.html
    ├── styles.css
    └── script.js
```

トップページのカード追加と README 更新は後続 PR（既存運用どおり）。

## データ

`search/simple/script.js` の `SEARCH_DATA`（24件）と4ヘルパー
（`normalize` / `matches` / `highlight` / `escapeHtml`）を**そのままコピー**して使う。
変種は自己完結が既存規約（各変種にビルドなしで単体配信）。同じコーパスを別の
レンズで見せることで、simple との対比も立つ。

## 状態モデル

```js
// node = {
//   id: number,                    // 連番
//   kind: 'root' | 'query' | 'merge',
//   query: string | null,          // query ノードのみ（trim 済み原文）
//   op: 'AND' | 'OR' | null,       // merge ノードのみ
//   parents: number[],             // root: [] / query: [親1つ] / merge: [A, B]
//   resultIds: number[],           // SEARCH_DATA のインデックス集合（作成時に確定）
//   depth: number, row: number,    // レイアウト座標（作成時に確定）
// }
```

- root: `resultIds = 全24件`。
- query: `resultIds = 親.resultIds のうち matches(item, query) を満たすもの`。
- merge: AND = 積集合、OR = 和集合（`resultIds` は SEARCH_DATA の元順で保持）。
- グローバル状態は `nodes`（配列）、`currentId`、比較モードの `compare = { on, aId, bId }` のみ。
- 結果セットは作成時に確定して保存（静的データなので再計算不要）。

### ラベルとパス

- `label(node)`: root → `すべて` / query → クエリ文字列 /
  merge → `(label(A) ∩ label(B))`（OR は `∪`）。
- `path(node)`: root → `すべて` / query → `path(親) + ' › ' + query` /
  merge → `label(node)`。現在パスとして検索ボックス下に表示する。

## 挙動

| 操作 | 挙動 |
|------|------|
| Enter で commit | `trim` 後空なら無視。IME 変換中（`isComposing \|\| keyCode === 229`）は無視。現在ノードに同じクエリ（normalize 後一致）の子が既にあればそのノードへ checkout（重複ノードを作らない）。なければ子ノードを作成して checkout。入力欄は空に戻す |
| ノードをクリック | checkout。結果パネル・現在パス・件数が切り替わる。比較モード中は比較対象の選択になる（下記） |
| 0件ノード | 作成は許可。ノードは減光 + 件数を警告色で表示（dead branch）。そこからの絞り込みも可能（常に0件） |
| 比較モード開始 | 「比較」トグルボタン。開始後、ノードクリック1回目 = A、2回目 = B。3回目以降は B を置き換え。選択済みノードの再クリックで解除。A・B 揃うと結果パネルが「共通 / Aのみ / Bのみ」3グループ表示に切り替わる |
| merge | A・B 選択中のみ「∩ AND統合」「∪ OR統合」ボタンが有効。押すと merge ノード（parents = [A, B]）を作成して checkout し、比較モードを終了。同じペア（順不同）+ 同じ op の merge ノードが既にあればそちらへ checkout |
| 比較モード終了 | 「終了」ボタンまたは Escape。単一表示に戻る |
| リセット | 「リセット」ボタンで root のみの初期状態に戻す |
| A と A の比較 | 同一ノードは A・B 両方に選べない（選択済みクリックは解除動作） |

結果カードのハイライト: 単一表示で現在ノードが query ノードのときのみ、その
クエリ語を title に `highlight` 適用。root / merge ノード・比較モードでは
ハイライトなし（プレーン表示）。

## グラフ描画

- **ノード = 絶対配置の HTML `<button>`**、**エッジ = 背面の SVG ベジェ曲線**。
  ボタンなのでフォーカス・クリック・aria が素で機能する（Canvas/SVG 内テキストにしない）。
- レイアウトは作成時に一度だけ決める:
  - `depth`: root 0 / query = 親 + 1 / merge = max(親) + 1。
  - `row`: 占有マップ（`depth:row` キー）を引き、query は親の row から、
    merge は親 row の平均（四捨五入）から、下方向に最初の空き row を探す。
  - `x = depth * 間隔`, `y = row * 間隔`。ペインは両方向スクロール、
    新ノード作成時は `scrollIntoView` で可視化。
- ノード表示: ラベル + 件数バッジ。現在ノードはシアンのリング、比較選択 A / B は
  それぞれ専用アクセント色のリング、0件ノードは減光。
- エッジは親の右端 → 子の左端の cubic bezier。merge ノードには2本入る。

## a11y

- グラフコンテナ: `role="group"` + `aria-label="検索履歴グラフ"`。ノードは
  `<button>` で Tab 到達可能。`aria-label` に「クエリ「3d」 8件」等の全文、
  現在ノードに `aria-current="true"`、比較選択中は `aria-pressed` を同期。
- 件数・状態変化は `aria-live="polite"` の status 行で通知
  （「「3d」で絞り込み: 8件」「比較中: 共通5件 / Aのみ3件 / Bのみ2件」等）。
- 入力欄は通常の `<input type="text">` + `aria-label`。サジェストは無いので
  combobox パターンは使わない。
- Escape は比較モード終了のみに割当て。

## スタイル

- 既存規約: ダーク基調（#0a0a0f 系背景、#16161f 系カード）+ シアン `#00f5d4`。
  `page-header`（タイトル・サブタイトル・ギャラリーへ戻る）は simple と同型。
- 比較用アクセント: A = ピンク系 `#ff6ec7`、B = アンバー系 `#ffd166`
  （リング・グループ見出し・カード左ボーダーで一貫使用。共通グループはシアン）。
- 結果カードは simple の `results__card` と同型 + 比較時は左ボーダーの
  モディファイア。グリッドは `repeat(auto-fill, minmax(240px, 1fr))`。
- グラフペインは高さ固定（約 280px）・`overflow: auto`・薄いグリッド背景で
  「盤面」感を出す。モバイル（〜480px）は横スクロール前提で成立させる。

## やらないこと

サジェストドロップダウン（simple の領分）・localStorage 永続化・ノード削除や
ラベル編集・ドラッグでの merge・3ノード以上の比較・NOT 演算・仮想化・外部依存。

## 検証

テスト基盤なしの既存踏襲。headless Chrome + CDP の自作スクリプトで実機確認:
commit の連鎖と分岐、同一クエリ再 commit の checkout 化、比較3グループの件数整合
（|A| = 共通 + Aのみ）、merge ノードの集合演算、0件 dead branch、リセット、
コンソールエラーなし、ギャラリーからの導線。IME ガードはコードレビューで確認。
