# Blog

## 致谢

参考[www.lapis.cafe](https://www.lapis.cafe), 只保留常规的文章系统：Markdown/MDX 写作、分类与标签、分页、站内搜索、时间线归档。

---

## 技术栈

| 层       | 选型                                                        |
| -------- | ----------------------------------------------------------- |
| 框架     | [Astro](https://astro.build) 7（`output: "static"` 纯静态） |
| 交互组件 | React 19（islands）+ Radix UI + Tailwind CSS 4              |
| 代码块   | Expressive Code（行号、折叠、语言徽章、自定义复制按钮）     |
| 数学公式 | remark-math + KaTeX                                         |
| 站内搜索 | Pagefind（构建时索引）                                      |
| 部署     | Cloudflare                                                  |

包管理器是 **pnpm**。

## 快速开始

```bash
pnpm install
```

```bash
pnpm dev
```

| 命令           | 作用                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| `pnpm dev`     | 本地开发服务器（默认 `http://localhost:4321`）                         |
| `pnpm build`   | 构建到 `dist/`，并跑 Pagefind 建立搜索索引                             |
| `pnpm preview` | 本地预览构建产物                                                       |
| `pnpm check`   | Astro 的类型与内容校验（本项目没有单元测试框架，这就是唯一的自动检查） |

## 项目结构

```
src/
├── pages/          路由入口（每个文件对应一个 URL）
├── layouts/        页面骨架
├── components/     Astro / React 组件，可复用的原子组件放 components/ui/
├── content/        Markdown 内容集合（见下）
├── data/           站点配置：个人信息、免责声明
├── styles/         全局 CSS
├── plugins/        自定义 remark / rehype / Expressive Code 插件
├── lib/            支撑逻辑
public/             原样拷贝到产物根目录的静态资源
scripts/            仓库脚本（new-post.mjs）
templates/          文章模板（post.md，被 pnpm new 读取，不会被当成文章）
```

## 写作

内容集合定义在 `src/content.config.ts`，目前只有一个：`posts`。

### `posts` —— 正式文章

放在 `src/content/posts/`，支持子目录分类。

```yaml
---
title: 文章标题
published: 2026-08-17
updated: 2026-08-18 # 可选
description: 摘要 # 可选，用于 SEO 和卡片
image: /images/cover.webp # 可选，封面
tags: [Astro, 前端]
category: TechnicalTutorials
pinned: false # 置顶
draft: false # 草稿不会被构建
---
```

### 新增文章

```bash
pnpm new a/b/my-post.md
```

`a/b/` 不存在会自动创建；文件名即 URL（`/posts/a/b/my-post/`），`published` 自动填当天，标题由文件名反推后自己改。模板在 `templates/post.md`，字段说明写在模板注释里。目标文件已存在时脚本报错退出，不会覆盖。

## 自定义

想把这个博客改成你自己的，主要改这几处：

| 想改什么                   | 改哪里                                             |
| -------------------------- | -------------------------------------------------- |
| 站点域名                   | `astro.config.mjs` 的 `site` 字段                  |
| 昵称、简介、头像、社交链接 | `src/data/profile.ts`                              |
| 导航栏、页脚               | `src/components/` 下对应组件                       |
| 配色与全局样式             | `src/styles/`                                      |
| 代码块主题                 | `astro.config.mjs` 里 `expressiveCode` 的 `themes` |
| 头像、favicon 等静态资源   | `public/`                                          |

代码风格：Astro/TS/TSX 一律 2 空格缩进。组件命名 `PascalCase` 与 `kebab-case` 混用，跟着所在目录的既有风格走即可。项目没有配 formatter，改动尽量贴合周围代码。

## 部署

托管在 Cloudflare。
具体参考 [deploy](https://github.com/dev24hrs/blog/blob/main/src/content/posts/blog-welcome.md)

## 许可

代码部分可自由参考取用。`src/content/` 下的文章内容版权归作者所有，转载请注明出处。
