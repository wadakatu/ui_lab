# Search UI — Simple 設計書 (2026-08-10)

UI Lab の新お題「検索UI」の第1弾。検索ボックス + サジェスト + 結果一覧という
一般的な検索体験を、既存規約どおりバニラ HTML/CSS/JS・依存なしで実装する。

## 構成

```
search/
├── index.html      ← お題ギャラリーページ（text-font/index.html と同型）
└── simple/
    ├── index.html
    ├── styles.css
    └── script.js
```

トップページ（ルート index.html）のカード追加と README 更新は後続 PR（type forge と同じ運用）。

## データ

- `script.js` 内の静的配列 `SEARCH_DATA`（約24件）。外部 API なし。
- 各要素は `{ title, category, description, tags }`。
- 内容は UI Lab 自身に因んだ UI コンポーネント紹介風のダミーデータ。

## 挙動

- **初期表示**: 全件をカード一覧表示し、「すべて 24件」と件数を出す。
- **入力中**: サジェストドロップダウンを最大7件表示。title / tags の部分一致で、
  マッチ箇所は `<mark>` でハイライト。
- **確定**（Enter・サジェスト選択・✕クリア）: 下の結果一覧を更新。
  件数表示（「N件」）と空状態メッセージ（0件時）あり。結果カードの title もハイライト。
- **正規化**: クエリと対象の両方に lowercase + NFKC + ひらがな→カタカナ変換を適用
  （「かるーせる」で「カルーセル」にヒット）。
- **IME**: 変換中（`isComposing`）の Enter は無視する。
- **キーボード**: ↑↓ でサジェスト移動（端でループ）、Enter で確定、Escape で閉じる。
- サジェストは入力欄外のクリックで閉じる。

## a11y

- WAI-ARIA combobox パターン: input に `role="combobox"` / `aria-expanded` /
  `aria-activedescendant`、ドロップダウンは `role="listbox"` + `role="option"`。
- 結果件数は `aria-live="polite"` の領域で通知。
- クリアボタン・検索アイコンに適切なラベル。

## スタイル

- 既存 simple 変種の流儀に合わせる: `page-header`（タイトル・サブタイトル・ギャラリーへ戻るリンク）、
  ダーク基調のラボ配色（#0a0a0f 系背景 + シアン系アクセント）。
- 結果一覧は `auto-fill` の card grid でレスポンシブ。

## やらないこと

fuzzy 検索・検索履歴・デバウンス（ローカルデータのため即時で十分）・仮想スクロール・外部依存。

## 検証

リポジトリにテスト基盤はないため既存踏襲でテストは追加しない。
Chrome DevTools MCP による実機確認を行う: 絞り込み・サジェスト選択・キーボード操作・
空状態・a11y スナップショット。IME 挙動はコードレビューで確認する。
