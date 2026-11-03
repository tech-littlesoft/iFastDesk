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
│   └── img/               # 产品站插画(.svg) 与演示(.gif)
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
| Illustrations | Replace files under `assets/img/` (`.png` / `.jpg` work too) |
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
