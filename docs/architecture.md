# AI 大模型排行榜 — 技术架构文档

## 项目概述

一个汇聚主流 AI 大模型评测数据的排行榜网站，支持多维度排行对比、模型详情查看、雷达图对比、AI 新闻资讯等功能。模型数据每 3 天自动抓取更新，新闻数据每 6 小时自动抓取更新。

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js | 16.x | App Router，React Server Components |
| UI 框架 | React | 19.x | 客户端交互组件 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS，支持深色模式 |
| 图表 | Recharts | 3.x | 折线图、柱状图、雷达图 |
| ORM | Prisma | 7.x | 类型安全的数据库访问层 |
| 数据库 | SQLite | - | 轻量嵌入式数据库，通过 better-sqlite3 驱动 |
| 定时任务 | node-cron | 4.x | 模型数据每 3 天、新闻每 6 小时 |
| 测试 | Jest + fast-check | - | 单元测试 + 属性基测试 |
| 语言 | TypeScript | 5.x | 全栈类型安全 |

## 系统架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        浏览器 (客户端)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 排行榜首页 │ │ 模型详情  │ │ 模型对比  │ │ AI 新闻  │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
└───────┼────────────┼────────────┼────────────┼───────────────────┘
        │ fetch      │ fetch      │ fetch      │ fetch
┌───────▼────────────▼────────────▼────────────▼───────────────────┐
│                     Next.js API Routes                            │
│  ┌────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │/api/rankings│ │/api/models│ │/api/scraper/ │ │/api/news[/*] │  │
│  └─────┬──────┘ └────┬─────┘ └──────┬───────┘ └──────┬───────┘  │
└────────┼─────────────┼──────────────┼────────────────┼───────────┘
         │             │              │                │
┌────────▼─────────────▼──────────────▼────────────────▼───────────┐
│                       业务逻辑层 (src/lib)                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────────────────┐   │
│  │ rankings  │ │ filters  │ │           scraper               │   │
│  │ 排名计算  │ │ 筛选过滤  │ │ 模型数据(3天) + 新闻数据(6小时) │   │
│  └─────┬────┘ └─────┬────┘ └───────────────┬─────────────────┘   │
└────────┼────────────┼──────────────────────┼─────────────────────┘
         │            │                      │
┌────────▼────────────▼──────────────────────▼─────────────────────┐
│                   Prisma ORM + SQLite                              │
│  ┌────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐ ┌────────────┐   │
│  │AIModel │ │Dimension│ │ Score │ │ScrapeLog │ │NewsItem    │   │
│  │        │ │         │ │       │ │          │ │(上限1000条)│   │
│  └────────┘ └─────────┘ └───────┘ └──────────┘ └────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## 目录结构

```
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   ├── seed.ts                # 种子数据（6 个评测维度）
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── instrumentation.ts     # 应用启动钩子（启动两个独立定时任务）
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 首页（排行榜）
│   │   ├── layout.tsx         # 全局布局（导航栏、主题）
│   │   ├── compare/           # 模型对比页
│   │   ├── models/[id]/       # 模型详情页
│   │   ├── news/              # AI 新闻页
│   │   │   └── [id]/          # 新闻详情页（本地展示）
│   │   └── api/               # API 路由
│   │       ├── rankings/      # 排行榜数据
│   │       ├── models/        # 模型 CRUD
│   │       ├── dimensions/    # 评测维度
│   │       ├── news/          # 新闻数据查询
│   │       │   ├── [id]/     # 单条新闻详情
│   │       │   └── trigger/   # 新闻抓取触发与历史
│   │       └── scraper/       # 模型数据抓取触发与历史
│   ├── components/            # React 组件
│   │   ├── NavLinks.tsx       # 导航链接（路径高亮）
│   │   ├── RankingTable.tsx   # 排行表格（含简介、评测覆盖）
│   │   ├── DimensionSelector  # 维度切换
│   │   ├── FilterPanel.tsx    # 筛选面板
│   │   ├── SearchBar.tsx      # 搜索框
│   │   ├── ScoreBarChart.tsx  # 评分柱状图
│   │   ├── ScoreLineChart.tsx # 评分趋势图
│   │   ├── CompareRadarChart  # 雷达对比图
│   │   ├── ThemeToggle.tsx    # 深色模式切换
│   │   ├── SkeletonTable.tsx  # 加载骨架屏
│   │   ├── NewsCard.tsx       # 新闻卡片组件（标题链接到本地详情页、摘要、来源、标签）
│   │   ├── NewsList.tsx       # 新闻列表组件（含搜索、分页、骨架屏）
│   │   └── Pagination.tsx     # 通用分页组件
│   ├── lib/                   # 业务逻辑
│   │   ├── prisma.ts          # Prisma 客户端单例
│   │   ├── rankings.ts        # 排名算法
│   │   ├── filters.ts         # 筛选逻辑
│   │   └── scraper/           # 数据抓取模块
│   │       ├── scheduler.ts        # 模型数据调度器（cron 3天 + 事务写入）
│   │       ├── validator.ts        # 模型数据校验与去重
│   │       ├── news-validator.ts   # 新闻数据校验与去重
│   │       ├── news-scheduler.ts   # 新闻抓取运行器（独立 cron 6小时 + 1000条上限清理）
│   │       └── sources/            # 数据源适配器
│   │           ├── builtin.ts              # 内置模型数据集（25 个主流模型）
│   │           ├── artificial-analysis.ts  # Artificial Analysis API
│   │           └── news-builtin.ts         # 内置新闻数据集（19 条 AI 新闻）
│   └── types/
│       └── index.ts           # 全局 TypeScript 类型定义
├── docs/
│   ├── architecture.md        # 本文档
│   └── changelog.md           # 迭代历史
├── Dockerfile                 # Docker 部署配置
├── prisma.config.ts           # Prisma 配置（数据源 URL）
└── next.config.ts             # Next.js 配置（standalone + instrumentation）
```

## 数据模型

```
AIModel (AI 模型)
├── id: String (CUID)
├── name: String (唯一)
├── vendor: String (开发商)
├── releaseDate: DateTime?
├── paramSize: String? (参数规模，如 "70B")
├── openSource: Boolean
├── description: String?
├── accessUrl: String? (模型访问链接)
└── scores: Score[] (一对多)

Dimension (评测维度)
├── id: String (CUID)
├── name: String (唯一，如 "coding")
├── displayName: String (如 "编码能力")
├── weight: Float (权重，默认 1.0)
└── scores: Score[] (一对多)

Score (评分记录)
├── modelId → AIModel
├── dimensionId → Dimension
├── value: Float (分数)
├── source: String (数据来源)
├── scrapedAt: DateTime
└── 唯一约束: [modelId, dimensionId, source, scrapedAt]

ScrapeLog (抓取日志)
├── source: String
├── status: String (success/error)
├── rawData: String? (原始数据 JSON)
├── error: String?
├── startedAt / endedAt: DateTime

NewsItem (新闻条目，上限 1000 条)
├── id: String (CUID)
├── title: String (标题)
├── summary: String (摘要)
├── content: String (完整正文，默认空字符串)
├── sourceName: String (来源名称)
├── sourceUrl: String (唯一，原文链接)
├── publishedAt: DateTime (发布时间)
├── tags: String (JSON 数组字符串，关联 AI 模型/关键词)
├── scrapedAt: DateTime
└── createdAt: DateTime
```

## 数据抓取流程

```
定时任务（通过 instrumentation.ts 启动）:
  1. 模型数据: 每 3 天凌晨 2:00 (ScraperScheduler)
  2. 新闻数据: 每 6 小时 (独立 cron job)

手动触发:
  - POST /api/scraper/trigger  (模型数据，可指定 source)
  - POST /api/news/trigger     (新闻数据)

查看历史:
  - GET /api/scraper/trigger   (模型数据抓取历史)
  - GET /api/news/trigger      (新闻抓取历史 + 当前新闻条数)

模型数据抓取流程:
  ScraperScheduler.runNow()
    → scraper.scrape() (带 30s 超时)
    → validate() + deduplicate()
    → prisma.$transaction() 事务写入 AIModel + Score + ScrapeLog

新闻数据抓取流程:
  NewsScraperRunner.runNewsScraper()
    → scrapeNews() (带 30s 超时)
    → validateNews() + deduplicateNews()
    → prisma.$transaction() 事务 upsert NewsItem + ScrapeLog
    → 清理超限旧新闻（保留最新 1000 条）

失败处理:
  - 失败不重试，仅记录错误日志到 ScrapeLog
  - 事务回滚保留原有数据
```

## 数据源

| 数据源 | 类型 | 说明 |
|--------|------|------|
| BuiltinScraper | 内置 | 基于公开数据整理的 25 个主流模型，无需配置 |
| ArtificialAnalysisScraper | API | 需配置 `ARTIFICIAL_ANALYSIS_API_KEY`，可获取 100+ 模型实时数据 |
| BuiltinNewsScraper | 内置 | 19 条 AI 领域重点新闻预置数据（含完整正文），无需配置 |

内置数据覆盖的模型包括：Claude Opus 4、Claude Sonnet 4、GPT-4.5、o3、o4-mini、Gemini 2.5 Pro/Flash、Grok 3、DeepSeek-R1/V3、Qwen3 235B/32B、Llama 4 Maverick/Scout 等。

## 排名算法

- **单维度排名**：按该维度最新分数降序排列
- **综合排名**：所有维度分数按权重加权平均后降序排列
  - 模型至少需要覆盖一半以上的维度才参与综合排名
  - 权重默认均为 1.0，可在 Dimension 表中调整

## 前端功能

| 功能 | 页面 | 说明 |
|------|------|------|
| 排行榜 | `/` | 综合/单维度排行，支持搜索、筛选、排序 |
| 模型详情 | `/models/[id]` | 各维度评分、历史趋势折线图、模型简介 |
| 模型对比 | `/compare` | 2-5 个模型雷达图对比 |
| AI 新闻 | `/news` | AI 领域重点新闻列表，卡片展示标题/摘要/标签/来源，支持搜索、分页 |
| 新闻详情 | `/news/[id]` | 本地展示新闻完整正文、标签、来源，底部提供原文链接 |
| 导航高亮 | 全局导航栏 | 当前页面 Tab 蓝色高亮 + 加粗 + 背景色 |
| 深色模式 | 全局 | localStorage 持久化，跟随系统偏好 |
| 数据来源 | 首页底部悬浮栏 | 展示三个核心数据来源及权威性说明 |
| 数据时效 | 首页标题下 | 显示最后抓取时间，标注"每 3 天自动更新" |
| 评测覆盖 | 排行表格 | 显示每个模型覆盖的评测维度数（如 6/6） |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/rankings` | 排行榜数据（支持维度筛选） |
| GET | `/api/models` | 模型列表（支持筛选、搜索、分页） |
| GET | `/api/models/:id` | 模型详情（含历史评分） |
| GET | `/api/dimensions` | 评测维度列表 |
| GET | `/api/news` | 新闻列表（支持分页、关键词搜索） |
| GET | `/api/news/:id` | 单条新闻详情 |
| GET | `/api/news/trigger` | 查看新闻抓取历史和当前新闻条数 |
| POST | `/api/news/trigger` | 手动触发新闻抓取 |
| GET | `/api/scraper/trigger` | 查看模型数据抓取历史 |
| POST | `/api/scraper/trigger` | 手动触发模型数据抓取（可指定 source） |

## 部署方式

### 直接部署 (推荐)

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
npm run start
```

建议使用 pm2 做进程守护。定时抓取通过 instrumentation.ts 在应用启动时自动开启。

### Docker 部署

```bash
docker build -t ai-leaderboard .
docker run -d -p 3000:3000 ai-leaderboard
```

已配置 `output: "standalone"` 优化镜像体积。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `ARTIFICIAL_ANALYSIS_API_KEY` | 否 | Artificial Analysis API 密钥，配置后启用实时数据抓取 |

配置文件：项目根目录 `.env.local`
