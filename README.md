# iFastDesk Docs

Source of the official iFastDesk documentation site, built with Jekyll and served by GitHub Pages.

No third-party theme, no CSS framework, no CDN — the entire site is a few Markdown files plus one stylesheet, so it loads fast and stays reachable from mainland China.

## Live site

| Page | URL |
| --- | --- |
| 导航主页 | https://www.ifastdesk.com/ |
| 产品介绍 | https://www.ifastdesk.com/app/ |
| 用户操作指南 | https://www.ifastdesk.com/app/guide/ |
| 升级 Pro | https://www.ifastdesk.com/app/buy/ |
| 隐私说明 | https://www.ifastdesk.com/app/privacy/ |

Every page is independently addressable. The left sidebar highlights the current page; the right rail generates an on-page table of contents and tracks scroll position.

## Layout

```
.
├── _config.yml            # Jekyll / GitHub Pages settings
├── _layouts/
│   ├── app.html           # 产品站布局（顶栏 + 侧边栏 + TOC）
│   └── nav.html           # 导航站布局（独立风格，无侧边栏）
├── _includes/
│   ├── logo.html          # 共享 logo（SVG，两站共用）
│   └── app-sidebar.html   # 产品站侧边导航
├── assets/
│   ├── css/
│   │   ├── style.css      # 产品站样式（仅 app 模块加载）
│   │   └── nav.css        # 导航站样式（独立设计，仅 nav 模块加载）
│   ├── img/               # Logo、图标与历史示意素材
│   └── media/app/         # 实际 App 截图、视频与封面
├── app/                   # 产品站（模块一）
│   ├── index.md           # 产品介绍          ->  /app/
│   ├── guide.md           # 用户操作指南      ->  /app/guide/
│   ├── buy.md             # 升级 Pro          ->  /app/buy/
│   ├── activate.md        # 激活与订阅        ->  /app/activate/
│   └── privacy.md         # 隐私说明          ->  /app/privacy/
├── nav/                   # 导航站（模块二，独立风格）
│   └── index.md           # 导航主页          ->  /
└── README.md
```

两个模块仅共用 logo（`_includes/logo.html`）与 iFastDesk 名称；样式、布局、配色、画幅各自独立：
产品站走 `app.html` + `style.css`（蓝调、左侧栏文档版式），导航站走 `nav.html` + `nav.css`（暖橙、居中门户版式），互不引用对方元素。

## Editing

| I want to change | Edit this |
| --- | --- |
| 产品站页面文案 | `app/index.md` / `app/guide.md` / `app/buy.md` / `app/activate.md` / `app/privacy.md` |
| 导航站页面文案 | `nav/index.md` |
| 产品站侧边导航 | `_includes/app-sidebar.html` |
| 产品站布局 / 顶栏 / TOC | `_layouts/app.html` |
| 导航站布局 | `_layouts/nav.html` |
| 产品站样式 | `assets/css/style.css` |
| 导航站样式 | `assets/css/nav.css` |
| 产品截图与演示视频 | `scripts/prepare_app_media.py`、`_data/app_media.json`、`assets/media/app/` |
| Site title, description, baseurl | `_config.yml` |

Bilingual pages use two helper classes: `.zh` for the Chinese line, `.en` for the English line beneath it.

The on-page table of contents is opt-in. Add `toc: true` to a page's front matter to enable it; omit it and the right rail disappears.

## Two conventions you must follow

**1. Static assets use relative paths.**

```html
<img src="assets/img/01-float.svg">
```

`_layouts/app.html` declares `<base href="{{ site.baseurl }}/">`, which resolves these against the repository root on every page, at any depth. No paths need updating when a page moves.

**2. Internal links must go through `relative_url`.**

```liquid
<a href="{{ '/app/buy/' | relative_url }}">升级 Pro</a>
```

Do not write `href="/buy/"`. Because of the `<base>` tag above, a leading `/` resolves against the domain root and 404s (`…/buy/` instead of `…/app/buy/`).

## Deployment

Pushing to `main` is the entire release process — GitHub Pages builds the site server-side.

```bash
git add .
git commit -m "Update docs"
git push origin main
```

Configure Pages once under **Settings → Pages → Source: `main` / `/ (root)`**.

## Local preview

Not required. GitHub builds the site remotely and there is nothing to compile.

To preview changes locally, install Ruby with Jekyll and run:

```bash
bundle init      # then add: gem "github-pages", group: :jekyll_plugins
bundle install
bundle exec jekyll serve --livereload
```

Open http://127.0.0.1:4000/ — 自定义域名下 `baseurl` 为空、无路径前缀；若退回 GitHub Pages 默认域名，则改为 http://127.0.0.1:4000/iFastDesk/。

## Custom domain

1. Add your domain under **Settings → Pages → Custom domain** and enable Enforce HTTPS.
2. Commit a `CNAME` file at the repository root containing the bare domain.
3. Update `_config.yml`:

```yaml
url: https://www.ifastdesk.com
baseurl: ""
```

Nothing else changes — links, stylesheets, and images follow automatically.

## Real app media

`/app/` 用于宣传产品效果，`/app/guide/` 用于逐步操作说明。两页使用真实截图和录屏；原有 SVG/GIF 示意素材不再被这两页引用。

原始素材保留在 `E:\iFastDesk\素材`，网页版本由脚本生成，不修改原文件：

```powershell
python -m pip install Pillow imageio-ffmpeg
python scripts/prepare_app_media.py --source "E:\iFastDesk\素材"
```

也可用 `--ffmpeg "完整路径\ffmpeg.exe"` 指定已有转码器。只更新图片使用 `--images-only`，已有视频清单会保留。

- 图片提供 480、960 像素与不超过 1600 像素的原始大图版本，不放大原图。WebP 为首选，JPEG 为兼容回退；990 像素宽的主界面大图使用无损 WebP，保留文字细节。
- 大图通过 `srcset` / `sizes` 适配屏幕。首屏主图优先加载，其他图片懒加载；点击可放大，并切换到原始尺寸。禁用脚本时图片仍可通过链接单独打开。
- 视频使用 H.264 MP4 / 24 fps / `faststart`，保持完整操作过程和画面比例，宽度上限为 1600 像素，高度按比例调整；静音录屏移除音轨。完整演示也只在播放后加载。
- 所有视频使用 `preload="none"`，封面接近视口时才加载。两页的功能演示进入视口后静音循环播放，离开视口、切到后台或打开大图时暂停；只有完整演示由用户点击播放。
- 尊重系统的减少动画设置和浏览器省流量设置，关闭自动播放；用户主动暂停的演示不会被滚动再次启动。
- `_data/app_media.json` 记录原始文件名、网页路径、尺寸、时长与文件大小。两页复用 `_includes/app-image.html` 和 `_includes/app-video.html`，共享同一份素材。

| 作用 | 录屏文件名 | 网页素材 ID |
| --- | --- | --- |
| 悬浮呼出与收起 | 动画-移入移出-悬浮桌面2.mp4 | `show-hide` |
| 卡片换位与设置 | 动画-卡片面板换位-设置操作 (2).mp4 | `rearrange-cards` |
| 首次设置、自定义卡片、收藏 | 动画-卡片设置-自定义卡片-首次使用-设置收藏连接文件夹.mp4 | `first-setup` |
| 左右分屏 | 动画-分屏操作.mp4 | `split-view` |
| 设置文件夹 | 视频-设置文件夹.mp4 | `bind-folder` |
| 新建、编辑、移动、删除 | 视频-新建文件编辑移动删除操作.mp4 | `file-actions` |
| 应用图标排序 | 视频-应用图标自己排序.mp4 | `sort-apps` |
| 完整演示 | 视频-全部演示.mp4 | `full-tour` |

## Microsoft Store introduction

`app/index.md` 中 `store-description:start` 与 `store-description:end` 注释之间为第 0 章，保留原有介绍结构，配六张连续横排截图，覆盖深浅主题、六宫格、九宫格与桌面全景。微软应用商店介绍仅同步这一段；第 1–8 章的网页视频演示、导航按钮和整个操作指南不属于商店介绍。HTML 注释不会显示在网页上；这些标记只界定同步范围，不会自动发布到商店。

图注仅保留素材编号与功能名：产品页 `A01`–`A14`，指南页 `G01`–`G13`，编号链接可直接定位。正文图片和视频以原版悬浮动画为高度基准：正文宽度 × 1200 / 1548，正文最大宽度 1100px 时约 853px；不再受视口高度限制。图库按原比例横排，图间留白 4px，高度较上一版增加 70%（桌面由 320px 调为 544px），不显示底部图注；两张全景在前，随后为两张深色、两张浅色主题，底部保留横向滚动条。

只替换 A08 对应录屏：`python scripts/prepare_app_media.py --source "E:\iFastDesk\素材" --video rearrange-cards`。新录屏与封面使用 `rearrange-cards-v2` 文件名，避免浏览器继续使用旧缓存；指南中的同功能演示同步更新。
