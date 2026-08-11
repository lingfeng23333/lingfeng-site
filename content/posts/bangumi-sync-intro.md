---
title: 追番数据是怎么自动同步的
date: 2026-08-11
tags: [技术, Bangumi]
summary: 定时任务拉取收藏与分集进度，构建时生成页面，全程不手动。
---

这个站的追番页看着像是实时数据，其实是「定时同步 + 静态构建」。

## 流程

1. GitHub Actions 每天定时触发一次；
2. 同步脚本用 Access Token 调 Bangumi API：
   - 拉取动画收藏列表；
   - 逐部拉取条目详情、分集列表、我的观看进度；
3. 数据写入 `data/bangumi/` 下的 JSON 文件；
4. 提交回仓库，站点重新构建。

## 细节

- 请求间隔控制在 1 秒以上，遇到限流会自动退避重试；
- 以 `subject_id` 和 `episode_id` 为主键反复写入，重复同步不会产生脏数据；
- Token 只放在 GitHub Secrets / 环境变量里，不落库、不进代码；
- 每部番失败只跳过自己，不影响整轮同步。

数据格式、接口字段都写在仓库的 [DESIGN.md](https://example.com/DESIGN.md) 里，想看细节的可以翻一翻。
