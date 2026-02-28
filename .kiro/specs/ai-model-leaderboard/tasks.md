# 实现计划：AI 大模型排行榜

## 概述

基于 Next.js + TypeScript + Prisma + SQLite 构建 AI 大模型排行榜网站。采用增量开发方式，从数据层开始，逐步构建 API、数据抓取模块和前端界面。

## 任务

- [x] 1. 项目初始化与基础设施搭建
  - [x] 1.1 初始化 Next.js 项目，安装核心依赖
    - 创建 Next.js TypeScript 项目
    - 安装依赖：prisma, @prisma/client, recharts, fast-check, tailwindcss, node-cron
    - 配置 Tailwind CSS 和深色模式支持
    - _Requirements: 7.1, 7.3_
  - [x] 1.2 定义 Prisma Schema 和数据模型
    - 创建 `prisma/schema.prisma`，定义 AIModel（含 accessUrl）、Dimension、Score、ScrapeLog 模型
    - 运行 prisma migrate 生成数据库
    - 创建种子脚本 `prisma/seed.ts`，预填充评测维度数据（编码、推理、数学、多语言、指令遵循、知识问答）
    - _Requirements: 2.1_
  - [x] 1.3 创建共享 TypeScript 类型定义
    - 创建 `src/types/index.ts`，定义 Model、ModelDetail、RankedModel（含 description、dimensionCount）、Dimension、FilterState、RawScrapedData（含 modelMeta）、ValidatedData、ScrapeResult 等接口
    - _Requirements: 1.2, 1.3_

- [x] 2. 核心数据逻辑实现
  - [x] 2.1 实现筛选与排序逻辑
    - 创建 `src/lib/filters.ts`，实现 filterModels(models, filterState) 函数
    - 实现按开发商、开源状态、参数规模范围、搜索关键词的筛选
    - 实现多条件 AND 组合逻辑
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 2.2 编写筛选逻辑的属性测试
    - **Property 4: 筛选结果正确性**
    - **Property 5: 筛选条件组合正确性**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  - [x] 2.3 实现排行排序逻辑
    - 创建 `src/lib/rankings.ts`，实现 rankByDimension 和 rankByComposite 函数
    - 实现加权平均分计算，模型至少需覆盖一半维度才参与综合排名
    - _Requirements: 2.2, 2.3_
  - [ ]* 2.4 编写排行排序的属性测试
    - **Property 2: 维度排序正确性**
    - **Property 3: 加权平均排行正确性**
    - **Validates: Requirements 2.2, 2.3**

- [x] 3. 检查点 - 确保核心逻辑测试通过

- [x] 4. 数据抓取模块实现
  - [x] 4.1 实现数据校验器
    - 创建 `src/lib/scraper/validator.ts`，实现 validate(data) 和 deduplicate(data) 函数
    - 校验字段完整性和数据格式
    - _Requirements: 4.4_
  - [ ]* 4.2 编写数据校验器的属性测试
    - **Property 6: 数据校验与去重正确性**
    - **Validates: Requirements 4.4**
  - [x] 4.3 实现数据源抓取器
    - 创建 `src/lib/scraper/sources/builtin.ts` - 内置综合数据集（25 个主流模型，含 modelMeta 和 accessUrl）
    - 创建 `src/lib/scraper/sources/artificial-analysis.ts` - Artificial Analysis API 抓取器（可选，需 API Key）
    - 每个抓取器实现 Scraper 接口
    - _Requirements: 4.1_
  - [x] 4.4 实现抓取调度器与错误处理
    - 创建 `src/lib/scraper/scheduler.ts`，实现 ScraperScheduler
    - 使用 node-cron 配置每 3 天定时任务（凌晨 2:00）
    - 实现事务性写入：失败时回滚，保留原数据，不重试
    - 存储原始数据和处理后数据
    - _Requirements: 4.2, 4.3, 4.5, 4.6_
  - [x] 4.5 实现 instrumentation 自动启动定时任务
    - 创建 `src/instrumentation.ts`，应用启动时自动开启定时抓取
    - 配置 `next.config.ts` 启用 instrumentationHook
    - _Requirements: 4.3_
  - [ ]* 4.6 编写抓取模块的属性测试
    - **Property 7: 错误恢复数据不变性**
    - **Property 8: 原始数据与处理数据双重存储**
    - **Validates: Requirements 4.5, 4.6**

- [x] 5. 检查点 - 确保数据抓取模块测试通过

- [x] 6. API 层实现
  - [x] 6.1 实现模型列表和详情 API
    - 创建 `src/app/api/models/route.ts` - GET /api/models，支持筛选、排序、分页
    - 创建 `src/app/api/models/[id]/route.ts` - GET /api/models/:id，返回模型详情和历史评分
    - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3, 3.4_
  - [x] 6.2 实现排行和维度 API
    - 创建 `src/app/api/rankings/route.ts` - GET /api/rankings，支持按维度排行，返回 description、dimensionCount、lastUpdated
    - 创建 `src/app/api/dimensions/route.ts` - GET /api/dimensions
    - _Requirements: 2.1, 2.2, 2.3, 2.6_
  - [x] 6.3 实现抓取触发与历史查询 API
    - 创建 `src/app/api/scraper/trigger/route.ts` - GET 查看抓取历史，POST 手动触发
    - _Requirements: 4.2, 4.8_
  - [ ]* 6.4 编写 API 端点的单元测试
    - 测试各 API 的请求参数校验和错误响应
    - _Requirements: 1.5, 3.6_

- [x] 7. 前端页面与组件实现
  - [x] 7.1 实现排行榜首页
    - 创建 `src/app/page.tsx` - 排行榜首页
    - 实现 RankingTable 组件，支持列排序、前三名奖牌图标高亮、模型简介、评测覆盖维度数
    - 实现 DimensionSelector 组件，支持维度切换
    - 实现 FilterPanel 组件（开发商、开源、参数规模筛选）
    - 实现 SearchBar 组件（实时搜索，防抖处理）
    - 实现底部悬浮数据来源栏（含权威性说明和外部链接）
    - 显示最后抓取时间和"每 3 天自动更新"标注
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.2, 2.4, 2.5, 2.6, 3.1-3.6, 4.7, 8.1-8.3_
  - [ ]* 7.2 编写模型展示完整性的属性测试
    - **Property 1: 模型展示完整性**
    - **Validates: Requirements 1.2, 1.3**
  - [x] 7.3 实现模型详情页
    - 创建 `src/app/models/[id]/page.tsx` - 模型详情页
    - 展示完整评测数据
    - 使用 ScoreLineChart 组件展示历史评分变化折线图
    - _Requirements: 1.4, 6.2_
  - [x] 7.4 实现模型对比页
    - 创建 `src/app/compare/page.tsx` - 模型对比页
    - 实现模型选择逻辑（2-5 个模型限制）
    - 使用 CompareRadarChart 组件展示雷达图对比
    - 使用表格展示详细数据对比
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 7.5 编写对比模型数量约束的属性测试
    - **Property 9: 对比模型数量约束**
    - **Validates: Requirements 5.1**
  - [x] 7.6 实现数据可视化组件
    - 实现 ScoreBarChart 组件 - 柱状图展示评分分布
    - 实现图表悬停 tooltip 显示详细数值
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. 响应式设计与用户体验优化
  - [x] 8.1 实现响应式布局
    - 适配桌面端（>= 1024px）、平板端（768px-1023px）、移动端（< 768px）
    - 实现深色/浅色模式切换组件和主题持久化
    - _Requirements: 7.1, 7.3_
  - [x] 8.2 实现加载状态与无障碍支持
    - 实现骨架屏/加载动画组件
    - 为所有交互元素添加 ARIA 属性和键盘导航支持
    - _Requirements: 7.2, 7.4, 7.5_

- [x] 9. 最终检查点 - 确保所有测试通过

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 开发
- 数据导出功能（原需求 8）已在迭代中移除
- 旧 mock scraper（lmsys.ts、openllm.ts、official.ts）已删除，由 builtin.ts 替代
- 抓取频率从每周改为每 3 天，失败不重试
- 每个任务引用了具体的需求编号以确保可追溯性
