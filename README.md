# AI 大模型排行榜

汇聚主流 AI 大模型评测数据，支持多维度排行对比、模型详情查看、雷达图对比。数据来源于 LMSYS Chatbot Arena、Artificial Analysis、OpenLLM Leaderboard 等权威公开评测平台，每 3 天自动更新。

## 功能特性

- 🏆 **多维度排行** — 综合排名 + 编码、推理、数学、多语言、指令遵循、知识问答 6 个维度独立排行
- 🔍 **搜索与筛选** — 按模型名搜索，按厂商、开源/闭源、参数规模筛选
- 📊 **可视化图表** — 评分柱状图、历史趋势折线图、多模型雷达对比图
- 🌓 **深色模式** — 跟随系统偏好，支持手动切换
- 🤖 **25+ 主流模型** — 覆盖 Claude、GPT、Gemini、Grok、DeepSeek、Qwen、Llama 等
- ⏱️ **定时数据抓取** — 每 3 天自动更新，支持手动触发

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.x | App Router + Turbopack |
| React | 19.x | 客户端交互组件 |
| Tailwind CSS | 4.x | 原子化样式，深色模式 |
| Recharts | 3.x | 图表可视化 |
| Prisma | 7.x | ORM + SQLite |
| TypeScript | 5.x | 全栈类型安全 |

## 快速开始

### 环境要求

- Node.js >= 20
- npm >= 10

### 本地开发

```bash
# 克隆项目
git clone https://your-gitlab-url/ai-model-leaderboard.git
cd ai-model-leaderboard

# 安装依赖
npm install

# 生成 Prisma Client + 数据库迁移 + 种子数据
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 运行测试

```bash
npm test
```

## 部署

### 服务器部署（pm2）

```bash
# 安装 pm2（全局，仅首次）
npm install -g pm2

# 拉取代码
git clone https://your-gitlab-url/ai-model-leaderboard.git
cd ai-model-leaderboard

# 安装依赖 + 数据库初始化
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# 构建并启动
npm run build
pm2 start npm --name "ai-leaderboard" -- start

# 设置开机自启
pm2 save
pm2 startup
```

#### 代码更新

```bash
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart ai-leaderboard
```

### Docker 部署

```bash
docker build -t ai-leaderboard .
docker run -d -p 3000:3000 ai-leaderboard
```

## 环境变量

在项目根目录创建 `.env.local`：

| 变量 | 必填 | 说明 |
|------|------|------|
| `ARTIFICIAL_ANALYSIS_API_KEY` | 否 | 配置后启用 Artificial Analysis 实时数据抓取（100+ 模型） |

未配置 API Key 时使用内置数据集（25 个主流模型）。

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/rankings?dimension=composite` | GET | 获取排行榜数据 |
| `/api/models` | GET | 模型列表（分页） |
| `/api/models/[id]` | GET | 模型详情 + 历史评分 |
| `/api/dimensions` | GET | 评测维度列表 |
| `/api/scraper/trigger` | GET | 查看抓取历史 |
| `/api/scraper/trigger` | POST | 手动触发数据抓取 |

## 项目结构

```
├── prisma/                # 数据模型、迁移、种子数据
├── src/
│   ├── app/               # Next.js 页面和 API 路由
│   ├── components/        # React 组件
│   ├── lib/               # 业务逻辑（排名、筛选、抓取）
│   └── types/             # TypeScript 类型定义
├── docs/
│   └── architecture.md    # 详细架构文档
└── Dockerfile             # Docker 部署配置
```

更详细的架构说明见 [docs/architecture.md](docs/architecture.md)。

## 许可证

私有项目，仅供内部使用。
