---
title: "Cloudflare R2搭建图床"
published: 2026-10-16
description: "使用 Cloudflare R2 搭建图床"
category: "Cloudflare"
tags: [Cloudflare]
draft: false
pinned: true
---

# Cloudflare R2

## 0. 创建 R2 Bucket

1. Cloudflare -> Storage & databases -> R2 Object Storage -> Create Bucket -> 输入Bucket name -> Create

2. Settings -> Custom Domains -> `images.xxx.com` -> Save
   `xxx.com` 为之前已经托管在Cloudflare的域名
3. Settings -> CORS Policy -> 添加

```json
[
  {
    "AllowedOrigins": ["https://www.xxx.com"],
    "AllowedMethods": ["GET"]
  }
]
```

4. R2 Object Storage- > Overview -> Manage API Token -> Create Account API Token

- 选择 `Read and write` Permission
- Apply to specific buckets only
- TTL : forever

保存 `Access Key ID` & `Secret Access Key`

## 1. Wrangler api

安装配置好 `wrangler`

```bash
npm i -g wrangler
wrangler login
```

## 2. Typora 配置

编写 [r2-upload-images.sh](https://github.com/dev24hrs/Dotfiles/blob/main/r2-upload-images.sh) 脚本,在脚本里配置相关的参数

- `R2_PUBLIC_BASE`: `https://images.xxx.com` (cloudflare托管的R2子域名)
- `BUCKET`: blog-images (bucket名称)
- `KEY_PREFIX`: blog (bucket中的子路径,没有可以为空)

配置 Typora

- 图像 -> 插入图片时 -> 上传图片 -> 允许根据YAML设置自动上传图片
- 上传服务 -> 自定义命令 -> 命令 -> `/bin/bash path/r2-upload-images.sh`

<img src="https://images.dev24hrs.top/blog/26-10-92e34a5e229aa998.png" alt="image-20261017070039823" style="zoom:40%;" />

之后每次在md文档中粘贴图片都是自动上传到R2. 同时命名规则为:YY-MM-hash

## 3. Cache rule

- 打开 dash.cloudflare.com → 选 xxx.com 这个 zone（注意不是在 R2 页面里)
- 左侧 Caching（缓存）→ Cache Rules（缓存规则）→ Create rule（创建规则）
- 规则名随便起，比如 cache-r2-images
- If（匹配条件）：下拉选 Hostname + equals + images.xxx.com
- Then（动作），关键三项
  - Cache eligibility → Eligible for cache ← 核心开关（等价于老的 "Cache Everything")
  - Edge TTL：保持默认「遵循源站 cache-control」
  - Browser TTL：保持默认
  - 可选：Cache Key → Query String 设为 Ignore —— 静态网站永远不带 query，设了可防止以后 `?v=` 之类的参数把缓存拆散
- Deploy / 保存
