# AI 大模型排行榜 — 技术架构文档

## 项目概述

一个汇聚主流 AI 大模型评测数据的排行榜网站，支持多维度排行对比、模型详情查看、雷达图对比、数据导出等功能。数据通过定期抓取公开评测平台获得。

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js | 16.x | App Router，React Server Components |
| UI 框架 | React | 19.x | 客户端交互组件 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS，支持深色模式 |
| 图表 | Recharts | 3.x | 折线图、柱状图、雷达图 |
| ORM | Prisma | 7.x | 类型安全的数据库访问层 |
| 数据库 | SQLite | - | 轻量嵌入式数据库，通过 better-sqlite3 驱动 |
| 定时任务 | node-cron | 4.x | 定期触发数据抓取 |
| 测试 | Jest + fast-check | - | 单元测试 + 属性基测试 |
| 语言 | TypeScript | 5.x | 全栈类型安全 |

## 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (客户端)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ 排行榜首页 │ │ 模型详情  │ │ 模型对比  │ │ 数据导出 │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
└───────┼────────────┼────────────┼─────────────┼──────┘
        │ fetch      │ fetch      │ fetch       │ fetch
┌───────▼────────────▼────────────▼─────────────▼──────┐
│                 Next.js API Routes                    │
│  ┌────────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐ │
│  │/api/rankings│ │/api/models│ │/api/export │ │ ...  │ │
│  └─────┬──────┘ └────┬─────┘ └─────┬─────┘ └──┬───┘ │
└────────┼─────────────┼─────────────┼───────────┼─────┘
         │             │             │           │
┌────────▼─────────────▼─────────────▼───────────▼─────┐
│                   业务逻辑层 (src/lib)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ rankings  │ │ filters  │ │  export  │ │ scraper  │ │
│  │ 排名计算  │ │ 筛选过滤  │ │ CSV/JSON │ │ 数据抓取  │ │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘ │
└────────┼────────────┼────────────┼─────────────┼─────┘
         │            │            │             │
┌────────▼────────────▼────────────▼─────────────┘
│              Prisma ORM + SQLite
│  ┌──────────┐ ┌───────────┐ ┌───────┐ ┌──────────┐
│  │ AIModel  │ │ Dimension │ │ Score │ │ScrapeLog │
│  └──────────┘ └───────────┘ └───────┘ └──────────┘
└──────────────────────────────────────────────────────┘
```

## 目录结构

```
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   ├── seed.ts                # 种子数据（6 个评测维度）
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 首页（排行榜）
│   │   ├── layout.tsx         # 全局布局（导航栏、主题）
│   │   ├── compare/           # 模型对比页
│   │   ├── models/[id]/       # 模型详情页
│   │   └── api/               # API 路由
│   │       ├── rankings/      # 排行榜数据
│   │       ├── models/        # 模型 CRUD
│   │       ├── dimensions/    # 评测维度
│   │       ├── export/        # 数据导出
│   │       └── scraper/       # 抓取触发
│   ├── components/            # React 组件
│   │   ├── RankingTable.tsx   # 排行表格
│   │   ├── DimensionSelector  # 维度切换
│   │   ├── FilterPanel.tsx    # 筛选面板
│   │   ├── SearchBar.tsx      # 搜索框
│   │   ├── ScoreBarChart.tsx  # 评分柱状图
│   │   ├── ScoreLineChart.tsx # 评分趋势图
│   │   ├── CompareRadarChart  # 雷达对比图
│   │   ├── ExportButton.tsx   # 导出按钮
│   │   ├── ThemeToggle.tsx    # 深色模式切换
│   │   └── SkeletonTable.tsx  # 加载骨架屏
│   ├── lib/                   # 业务逻辑
│   │   ├── prisma.ts          # Prisma 客户端单例
│   │   ├── rankings.ts        # 排名算法
│   │   ├── filters.ts         # 筛选逻辑
│   │   ├── export.ts          # 导出逻辑
│   │   └── scraper/           # 数据抓取模块
│   │       ├── scheduler.ts   # 调度器（cron + 事务写入）
│   │       ├── validator.ts   # 数据校验与去重
│   │       └── sources/       # 数据源适配器
│   │           ├── builtin.ts              # 内置数据集（31 个模型）
│   │           └── artificial-analysis.ts  # Artificial Analysis API
│   └── types/
│       └── index.ts           # 全局 TypeScript 类型定义
├── Dockerfile                 # Docker 部署配置
├── prisma.config.ts           # Prisma 配置（数据源 URL）
└── next.config.ts             # Next.js 配置（standalone 输出）
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
```

## 数据抓取流程

```
触发方式:
  1. POST /api/scraper/trigger (手动触发)
  2. node-cron 定时任务 (每周日 00:00)

执行流程:
  ScraperScheduler.runNow()
    → 遍历已注册的 Scraper
    → scraper.scrape() (带 30s 超时)
    → validate() 校验字段完整性
    → deduplicate() 按 模型+维度+来源 去重
    → prisma.$transaction() 事务写入
       ├── upsert AIModel (含元信息)
       ├── 查找 Dimension
       ├── 创建 Score 记录
       └── 创建 ScrapeLog 日志
```

## 数据源

| 数据源 | 类型 | 说明 |
|--------|------|------|
| BuiltinScraper | 内置 | 基于公开数据整理的 31 个主流模型，无需配置 |
| ArtificialAnalysisScraper | API | 需配置 `ARTIFICIAL_ANALYSIS_API_KEY`，可获取 100+ 模型实时数据 |

内置数据覆盖的模型包括：Claude Opus 4、GPT-4.5、o3、o4-mini、Gemini 2.5 Pro/Flash、DeepSeek-R1/V3、Qwen3 235B/32B、Llama 4 Maverick/Scout 等。

## 排名算法

- 单维度排名：按该维度最新分数降序排列
- 综合排名：所有维度分数按权重加权平均后降序排列
- 权重默认均为 1.0，可在 Dimension 表中调整

## 前端功能

| 功能 | 页面 | 说明 |
|------|------|------|
| 排行榜 | `/` | 综合/单维度排行，支持搜索、筛选、排序 |
| 模型详情 | `/models/[id]` | 各维度评分、历史趋势折线图 |
| 模型对比 | `/compare` | 2-5 个模型雷达图对比 |
| 数据导出 | 首页按钮 | CSV / JSON 格式导出 |
| 深色模式 | 全局 | localStorage 持久化，跟随系统偏好 |
| 数据来源 | 首页底部 | 展示三个核心数据来源及链接 |
| 数据时效 | 首页标题下 | 显示最后抓取时间和数据性质说明 |

## 部署方式

### 直接部署 (推荐)

```bash
npm install → npx prisma migrate dev → npx prisma db seed → npm run build → npm run start
```

建议使用 pm2 做进程守护。

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
