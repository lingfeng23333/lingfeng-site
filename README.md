# 风起之地

风起之地——一切的起始点。凌风的个人站：追番数据从 Bangumi 自动同步，博客支持分集感想，背景图和名言随机。

## 功能

- 追番页：在看 / 看过 / 想看，进度条，来自 Bangumi 自动同步
- 番剧详情：简介、评分、标签、分集列表，每集可挂感想文章
- 反向同步：在番剧详情页点「标记已看」会实时写回 Bangumi
- 统计与成就：周/月/年汇总、趋势图、27 个成就和趣味记录
- 博客：Markdown 写作，frontmatter 里填 `subject_id + ep` 即成为分集感想
- 随机背景：本地图池优先，可配置远程图源，失败自动降级为渐变
- 随机名言：本地名言库，随时换一句
- 标准博客件：标签、归档、RSS、sitemap、404

## 快速开始

```bash
npm install
cp .env.example .env
# 编辑 .env，填入 BANGUMI_TOKEN
npm run sync      # 拉取 Bangumi 数据
npm run dev       # 本地开发 http://localhost:3000
```

## 写一篇分集感想

在 `content/posts/` 下新建 Markdown 文件：

```md
---
title: EP04 · 辉煌光荣的古籍部之昔日
subject_id: 27364
anime: 冰菓
ep: 4
date: 2026-08-11
tags: [感想, 冰菓]
spoiler: true
summary: 一句话短评。
---

正文……
```

不带 `subject_id` 就是普通文章。`spoiler: true` 会默认折叠正文。

## 自动同步

`scripts/sync-bangumi.ts` 负责拉取数据，写入 `data/bangumi/`。本地执行：

```bash
npm run sync
```

部署到 GitHub 后，把 `BANGUMI_TOKEN` 加进仓库 Secrets，`.github/workflows/sync.yml` 会每天自动同步并提交数据。

## 部署

1. 在 GitHub 新建一个仓库，把本目录推上去（首次推送前建议先 `git commit`）。
2. 仓库 Settings → Secrets and variables → Actions，添加：
   - `BANGUMI_TOKEN`：你的 Bangumi Access Token（定时同步 + 站内写回都用它）
3. 在 Vercel 导入该仓库（Framework 选 Next.js），配置环境变量：
   - `NEXT_PUBLIC_SITE_URL`：正式域名
   - `BANGUMI_TOKEN`：同上
   - `WALLPAPER_API`（可选）：自定义随机壁纸源
   - `SITE_EDIT_SECRET`（可选）：给「标记已看」接口加简单鉴权
4. 之后每次 `git push` 会自动触发同步 + 重新构建；GitHub Actions 每天也会自动同步一次。

## 目录

```text
app/                 页面与路由
components/          通用组件
content/posts/       Markdown 文章
data/bangumi/        同步生成的追番数据
data/quotes.json     名言库
lib/                 数据读取、文章解析、Bangumi 客户端
public/wallpapers/   本地背景图池
scripts/             同步脚本
```

详细设计见 [DESIGN.md](./DESIGN.md)。
