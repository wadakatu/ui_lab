<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0f,50:00f5d4,100:39ff14&height=200&section=header&text=UI%20Lab&fontSize=80&fontColor=e8e8ed&fontAlignY=35&desc=Frontend%20Component%20Experiments&descSize=20&descAlignY=55&animation=fadeIn" alt="UI Lab Header" />
</p>

<p align="center">
  <a href="https://wadakatu.github.io/ui_lab/">
    <img src="https://img.shields.io/badge/🔬_LIVE_DEMO-00f5d4?style=for-the-badge&logoColor=black" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Vanilla-HTML%2FCSS%2FJS-39ff14?style=for-the-badge" alt="Tech Stack" />
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
| **[Simple](https://wadakatu.github.io/ui_lab/carousel/)** | シンプルで軽量な基本実装 | Auto-play, Swipe, Keyboard, Dots |
| **[Helix Orbital](https://wadakatu.github.io/ui_lab/carousel/helix.html)** | 3D螺旋状に回転する立体カルーセル | 3D Transform, Inertia, Snap, Perspective |
| **[Pachislot](https://wadakatu.github.io/ui_lab/carousel/retro.html)** | パチスロ筐体風レトロUI | Lever Control, CRT Effect, Infinite Spin |

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
└── carousel/
    ├── index.html      # Simple Carousel
    ├── helix.html      # Helix Orbital Carousel
    ├── retro.html      # Pachislot Carousel
    ├── styles.css      # Simple styles
    ├── helix.css       # Helix styles
    ├── retro.css       # Pachislot styles
    └── *.js            # Component scripts
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
