---
title: "这是测试文章"
published: 2026-10-16
# updated: 2026-01-01         # 可选：更新时间 → article:modified_time / JSON-LD
description: "这是测试文章" # 可选：卡片摘要 + SEO；留空则取正文前 140 字
category: "test" # 可选：侧栏分类；留空显示「未分类」
tags: [test] # 可选：侧栏标签，如 [Astro, 前端]
# image: /images/cover.webp   # 可选：封面，图片放 public/ 下
draft: false # true → pnpm build 不收录（pnpm dev 仍可见）
---

使用 TiDB 处理高并发读写和在线 DDL，但它的分布式事务有性能开销。我们将热数据缓存到 Redis，冷查询优化索引。Hibernate 生成的关联查询有时导致分布式 join 性能差，需人工改成两次简单查询组装，监控 slow_query 并定期 review。
