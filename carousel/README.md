# Simple Carousel UI

ローカルで動作する、純粋な HTML/CSS/JavaScript の簡易カルーセルです。

## 使い方

### Vite（Node）で起動

```bash
npm i
npm run dev
# 出力された URL (例: http://localhost:5173) を開く
```

### デモ（ページ）

- シンプル版: `index.html`
- 独創版: `helix.html`（Helix Orbital Carousel）
- レトロ版: `retro.html`（Pachislot Carousel: レバー/無限スピン/STOPボタン）
  - 操作感: スロットマシン風レバーを引いて回す（ドラッグ/矢印/ドット無し、スペースでクイックスピン）

### 直接開く（最も手軽）

- `index.html` をブラウザで直接開くだけでも動作します
- `helix.html` も直接開けます

### 他の簡易サーバ（任意）

- Python: `python3 -m http.server 8000`
- Node(serve): `npx serve .`（serve があれば）

## 機能

- 矢印ボタン（前へ／次へ）
- ドットナビでジャンプ
- 自動再生（ホバーで一時停止）
- キーボード操作（← →）
- スワイプ（タッチ操作）

## カスタマイズ

- スライド数・内容: `index.html` 内の `.carousel__slide` を追加／削除
- 自動再生間隔: `script.js` の `interval` を調整（ミリ秒）
- デザイン: `styles.css` の色やレイアウトを編集
