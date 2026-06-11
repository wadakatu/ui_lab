<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0f,50:00f5d4,100:39ff14&height=200&section=header&text=UI%20Lab&fontSize=80&fontColor=e8e8ed&fontAlignY=35&desc=Frontend%20Component%20Experiments&descSize=20&descAlignY=55&animation=fadeIn" alt="UI Lab Header" />
</p>

<p align="center">
  <a href="https://wadakatu.github.io/ui_lab/">
    <img src="https://img.shields.io/badge/🔬_LIVE_DEMO-00f5d4?style=for-the-badge&logoColor=black" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Components-10-39ff14?style=for-the-badge" alt="Components" />
  <img src="https://img.shields.io/badge/License-MIT-bf5af2?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <sub>フロントエンドUIコンポーネントの実験場。<br/>インタラクティブで独創的なUIを探求するラボラトリー。</sub>
</p>

---

## ✦ Overview

**UI Lab** は、創造的なフロントエンドコンポーネントを実験・展示するためのリポジトリです。

一般的なUIライブラリでは見られない、**ユニークで印象的なインタラクション**を追求しています。すべてのコンポーネントはバニラHTML/CSS/JSで構築され、依存関係なしで動作します。

<br/>

## ⬡ Components

<details open>
<summary><b>🎠 Carousel</b></summary>

| Component | Description | Features |
|:----------|:------------|:---------|
| **[Simple](https://wadakatu.github.io/ui_lab/carousel/simple/)** | シンプルで軽量な基本実装 | Auto-play, Swipe, Keyboard, Dots |
| **[Helix Orbital](https://wadakatu.github.io/ui_lab/carousel/helix/)** | 3D螺旋状に回転する立体カルーセル | 3D Transform, Inertia, Snap, Perspective |
| **[Pachislot](https://wadakatu.github.io/ui_lab/carousel/retro/)** | パチスロ筐体風レトロUI | Lever Control, CRT Effect, Infinite Spin |

</details>

<details open>
<summary><b>🎛️ Knob</b></summary>

| Component | Description | Features |
|:----------|:------------|:---------|
| **[Simple](https://wadakatu.github.io/ui_lab/knob/simple/)** | ハイエンドオーディオ風ロータリーノブ | Drag, Scroll, Keyboard, Touch |
| **[Event Horizon](https://wadakatu.github.io/ui_lab/knob/blackhole/)** | ブラックホールを模したノブ | Accretion Disk, Gravitational Lensing, Hawking Radiation |
| **[Cube Mixer](https://wadakatu.github.io/ui_lab/knob/rubiks-cube/)** | ルービックキューブ型ミキサー | 3D View, Face Rotation, RGB Control |

</details>

<details open>
<summary><b>🎨 Color Picker</b></summary>

| Component | Description | Features |
|:----------|:------------|:---------|
| **[Simple](https://wadakatu.github.io/ui_lab/color-picker/simple/)** | SV キャンバス＋ヒュースライダーの基本実装 | HEX/RGB/HSL, Copy, Canvas |
| **[Chromatic Nebula](https://wadakatu.github.io/ui_lab/color-picker/nebula/)** | 星雲パーティクルで色を探索 | Particle Nebula, Cosmic Nav, Constellation |
| **[Paradox Oracle](https://wadakatu.github.io/ui_lab/color-picker/paradox-oracle/)** | Harmony Orbit中心の探索型カラーピッカー | Harmony Orbit, SV+Hue+Alpha, RGB/HSL/HEX Sync, Saved Palette |

</details>

<details open>
<summary><b>🔤 Text / Font</b></summary>

| Component | Description | Features |
|:----------|:------------|:---------|
| **[Simple](https://wadakatu.github.io/ui_lab/text-font/simple/)** | フォント調整とライブプレビューの基本実装 | Font Family, Type Scale, Tracking, Copy CSS |

</details>

<details>
<summary><b>🧩 More coming soon...</b></summary>

新しいコンポーネントを随時追加予定

</details>

<br/>

## ⌬ Tech Stack

```
╭──────────────────────────────────────╮
│  HTML5      ████████████████  100%   │
│  CSS3       ████████████████  100%   │
│  JavaScript ████████████████  100%   │
│  Framework  ░░░░░░░░░░░░░░░░    0%   │
╰──────────────────────────────────────╯
```

- **Zero Dependencies** - 外部ライブラリ不要
- **Modern CSS** - CSS Variables, Grid, Flexbox, 3D Transforms
- **Vanilla JS** - フレームワークなしのピュアな実装
- **Responsive** - モバイル対応

<br/>

## ⎔ Local Development

```bash
# Clone the repository
git clone https://github.com/wadakatu/ui_lab.git
cd ui_lab

# Option 1: Open directly
open index.html

# Option 2: Python server
python3 -m http.server 8080

# Option 3: Vite (for carousel dev)
cd carousel && npm i && npm run dev
```

<br/>

## ◈ Project Structure

```
ui_lab/
├── index.html          # Gallery landing page
├── carousel/
│   ├── index.html      # Carousel gallery
│   ├── simple/         # Simple Carousel
│   ├── helix/          # Helix Orbital Carousel
│   └── retro/          # Pachislot Carousel
├── knob/
│   ├── index.html      # Knob gallery
│   ├── simple/         # Simple Rotary Knob
│   ├── blackhole/      # Event Horizon Knob
│   └── rubiks-cube/    # Cube Mixer Knob
├── color-picker/
│   ├── index.html      # Color Picker gallery
│   ├── simple/         # Simple Color Picker
│   ├── nebula/         # Chromatic Nebula
│   └── paradox-oracle/ # Paradox Oracle
└── text-font/
    ├── index.html      # Text / Font gallery
    └── simple/         # Simple Type Playground
```

<br/>

## ⟡ Design Philosophy

> *"実験室のように、失敗を恐れず新しいUIを試す場所"*

- **Distinctive** - 既存のUIパターンに囚われない独創的なデザイン
- **Interactive** - ユーザーが触りたくなるインタラクション
- **Performant** - 軽量で高速なアニメーション
- **Accessible** - キーボード操作・スクリーンリーダー対応

<br/>

---

<p align="center">
  <sub>
    Made with ⚡ by <a href="https://github.com/wadakatu">@wadakatu</a>
  </sub>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:39ff14,50:00f5d4,100:0a0a0f&height=100&section=footer" alt="Footer" />
</p>
