---
title: 博客｜序
published: 2026-10-16
description: "Astro 静态博客,托管在 Clouldflare"
image: ""
tags: [setup]
category: 博客
draft: false
pinned: true
---

# 博客

感谢 [lapis.cafe](https://www.lapis.cafe) . 基于其,保留常规的文章系统,同时在 **deepseek** 帮助下,微改了几点:

- `hearder` & `footer` 与 `content layout` 视觉统一,统一为 content layout 背景色
- `hearder` & `footer` 删除2处页脚分割线
- `footer` 固定在底部,固定高度
- `content width` 调整为 58%,文章显示更宽
- `Astro` 版本7.3.1 升级为 **7.3.8**

具体参考 [readme.md](https://github.com/dev24hrs/blog/blob/main/README.md)

# Cloudflare & Git

博客为静态博客,托管在 Clouldflare.

## 0. 现状速查

| 项        | 值                                                                                 | 来源                     |
| --------- | ---------------------------------------------------------------------------------- | ------------------------ |
| 域名      | `xxx.com`,托管在 Cloudflare（NS：`xx.ns.cloudflare.com` / `xx.ns.cloudflare.com`） | Cloudflare Overview      |
| 规范域名  | `https://www.xxx.com`（apex 301 跳过来）                                           | astro.config.mjs 的 site |
| 构建      | pnpm build → astro build + pagefind --site dist，产物在 `dist/`                    | package.json             |
| 部署形态  | Cloudflare Workers 静态资源（不是 Pages）                                          | wrangler.jsonc           |
| Worker 名 | xxx-blog                                                                           | wrangler.jsonc 的 name   |
| 备用地址  | `xxx-blog.githubName.workers.dev`                                                  | Worker → Domains         |

**顺序很重要**：域名必须先 Active，才能绑自定义域名；Worker 必须先部署，绑域名时才会自动写出 DNS 记录

## 1. Cloudflare 托管域名

- 选择平台购买域名,`腾讯云` / `阿里云`, 记住购买的域名 ,比如 xxx.com
- Cloudflare → **Add a site** → 输入 `xxx.com` → 选 Free 计划
- 去**域名购买平台**把 NS 改成 Cloudflare 分配的两个
- 回 Cloudflare → 域名 → **Overview**，确认状态从 `Pending` 变成 `Active`

改完 NS 到 生效 需要时间。**在 Active 之前，DNS 页面加什么记录都不会解析**，页面顶部会有一条 `is pending until you complete the instructions on the Overview page` 的黄条，黄条消失才算好了。

> 如果域名是在 Cloudflare Registrar 买的，这步自动完成，`Pending` 只是等待验证。

**验证**:

```bash
# 1) 两个域名都解析到 Cloudflare
dig +short xxx.com
dig +short www.xxx.com
```

## 2. 部署 Worker

使用 Wrangler, 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)。由于是静态网站, 不需要安装 [@astrojs/cloudflare](https://docs.astro.build/zh-cn/guides/integrations-guide/cloudflare/) 适配器

```bash
npm install wrangler@latest --save-dev
```

创建一个 [Wrangler 配置项文件](https://developers.cloudflare.com/workers/wrangler/configuration/)

```jsonc
// 构建产物由 `pnpm build`（astro build + pagefind --site dist）生成到 dist/，
// 该目录在 .gitignore 中，因此必须在构建侧生成，不需要提交到仓库。
{
  "name": "xxx-blog",
  // 日期取构建时的当月。
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "none",
  },
}
```

本地预览调试

```bash
pnpm build && npx wrangler dev
```

调试成功后 `git push`

## 3. git push 自动部署

Cloudflare -> Dashboard -> Workers & Pages -> Create appliction -> Continue with Github

选择 blog的repo,页面中会自动生成相关参数值

- `Build command` : pnpm run build
- `Deploy command`: npx wrangler deploy
- `Preview commadn`: npx wrangler preview

之后每次 git push ,cloudflare就会自动部署，不用再手敲上面命令 `pnpm build && pnpm dlx wrangler@latest deploy`

## 4. 绑自定义域名

**不要**在 DNS 页面手动 Add record. 正确的入口在 Worker 上：

Worker → **Settings → Domains & Routes** → **Add** → **Custom domain**，依次添加：

- `www.xxx.com`

- `xxx.com`

Cloudflare 会自动写出对应记录（`www` 是 CNAME，apex 是 A 记录，proxy 开启、TTL Auto）。加完回 DNS 页面刷新就能看到 **DNS** 记录

状态流转：Initializing → Active。

## 5. 开启 Always Use HTTPS

cloudflare → xxx.com → **SSL/TLS → Edge Certificates → Always Use HTTPS** 打开

不开的话，浏览器输入 `xxx.com` 默认走 http，地址栏会显示 `Not secure`（开了之后 http 自动 301 到 https)

同时确认 **SSL/TLS → Overview** 的加密模式不是 Off / Flexible，选 `Full`

## 6. Rules

**astro.config.mjs** 的 site 是 `https://www.xxx.com`，因此 canonical、og:url、sitemap 全部指向 www（可用 `grep -o '<link rel="canonical"[^>]*>' dist/index.html` 自查）。此时若 apex 也能直接打开，就是同一内容两个地址，需要 301 收口。

Cloudflare → xxx.com → **Rules → Redirect Rules → Create rule**：

| 字段                  | 值                               |
| --------------------- | -------------------------------- |
| Rule name             | `apex to www`                    |
| 匹配方式              | Wildcard pattern                 |
| Request URL           | `https://xxx.com/*`              |
| Target URL            | `https://www.xxx.com/${1}`       |
| Status code           | `301 - Permanent Redirect`       |
| Preserve query string | 勾上（不勾会丢 `?a=1` 这类参数） |

最后点 **Deploy**.

方向**别做反**。如果想让 apex 当规范域名，必须同步把 **astro.config.mjs** 的 site 改成 `https://xxx.com` 并重新构建部署

## 7. SEO 收尾

- **Google Search Console** → 添加资源 `https://www.xxx.com`（推荐 URL 前缀或域名资源）→ 选 **DNS 验证**
- 提交 sitemap：`https://www.xxx.com/sitemap-index.xml`（由 **@astrojs/sitemap** 构建时生成）
- Bing Webmaster Tools 用同一份 sitemap,手动在DNS页面add
  - `Type`: CNAME
  - `Name`: 页面给出的值
  - `Target`: verify.bing.com
  - `Proxy Status`: DNS only
  - `TTL`: 1hr
