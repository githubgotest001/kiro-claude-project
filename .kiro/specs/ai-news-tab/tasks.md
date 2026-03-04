# 实现计划：AI 最新重点新闻 Tab

## 概述

基于需求和设计文档，将 AI 新闻 Tab 功能分解为增量实现步骤。每个任务构建在前一个任务之上，确保代码始终可运行。

## 任务

- [x] 1. 数据模型与类型定义
  - [x] 1.1 在 `prisma/schema.prisma` 中新增 `NewsItem` 模型，包含 title、summary、sourceName、sourceUrl（unique）、publishedAt、tags（JSON 字符串）、scrapedAt、createdAt 字段，并运行 `npx prisma migrate dev` 生成迁移
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 在 `src/types/index.ts` 中新增 `NewsItem`、`NewsListResponse`、`RawNewsItem`、`ValidatedNewsItem`、`NewsScraperInterface` 类型定义
    - _Requirements: 1.1, 1.2_

- [x] 2. 新闻校验器
  - [x] 2.1 创建 `src/lib/scraper/news-validator.ts`，实现 `validateNews` 和 `deduplicateNews` 函数。校验规则：标题/来源名称/来源链接非空，来源链接为有效 URL，发布时间为有效日期。去重基于 sourceUrl。
    - _Requirements: 2.5, 1.3_
  - [ ]* 2.2 编写属性测试：校验过滤有效性
    - **Property 4: 校验过滤有效性**
    - **Validates: Requirements 2.5**
  - [ ]* 2.3 编写属性测试：来源链接去重不变量
    - **Property 2: 来源链接去重不变量**
    - **Validates: Requirements 1.3**

- [x] 3. 新闻抓取器
  - [x] 3.1 创建 `src/lib/scraper/sources/news-builtin.ts`，实现内置新闻数据源 `BuiltinNewsScraper`，包含围绕高排名 AI 模型（如 Claude、GPT、Gemini、DeepSeek、Qwen 等）和 AI 领域重大新闻的预置数据，每条新闻包含 tags 关联模型名称
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.2 创建 `src/lib/scraper/news-scheduler.ts`，实现新闻抓取调度逻辑：抓取 → 校验去重 → 事务写入 NewsItem 表 → 记录 ScrapeLog。通过适配器将新闻抓取器注册到现有 `ScraperScheduler`
    - _Requirements: 5.1, 5.2, 5.3, 2.6, 2.7_
  - [x] 3.3 修改 `src/instrumentation.ts`，在应用启动时注册新闻抓取器到调度系统
    - _Requirements: 5.1, 5.2_

- [x] 4. Checkpoint - 确保数据层正常工作
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 5. 新闻 API 端点
  - [x] 5.1 创建 `src/app/api/news/route.ts`，实现 GET 端点，支持 page、pageSize、keyword 参数，返回按 publishedAt 降序排列的新闻列表，包含分页信息。无效参数返回 400。
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 5.2 编写属性测试：发布时间降序排列
    - **Property 3: 发布时间降序排列**
    - **Validates: Requirements 1.4, 3.1, 4.2**
  - [ ]* 5.3 编写属性测试：分页不变量
    - **Property 5: 分页不变量**
    - **Validates: Requirements 3.2**
  - [ ]* 5.4 编写属性测试：关键词过滤准确性
    - **Property 6: 关键词过滤准确性**
    - **Validates: Requirements 3.3, 4.8**
  - [ ]* 5.5 编写单元测试：API 参数校验边界情况（负数页码、超大 pageSize、空结果集）
    - _Requirements: 3.5_

- [x] 6. 前端新闻组件
  - [x] 6.1 创建 `src/components/NewsCard.tsx` 组件，展示单条新闻：标题、摘要、来源名称（可点击链接，target="_blank"）、发布时间、标签列表
    - _Requirements: 4.3, 4.4, 4.5, 4.9_
  - [x] 6.2 创建 `src/components/Pagination.tsx` 分页组件，支持上一页/下一页导航和当前页码显示
    - _Requirements: 4.6_
  - [x] 6.3 创建 `src/components/NewsList.tsx` 组件，管理新闻数据获取（调用 /api/news）、搜索过滤、分页状态，组合 NewsCard 和 Pagination 组件，包含骨架屏加载状态和空列表提示
    - _Requirements: 4.2, 4.6, 4.7, 4.8_
  - [ ]* 6.4 编写属性测试：新闻卡片渲染信息完整性
    - **Property 8: 新闻卡片渲染信息完整性**
    - **Validates: Requirements 4.3, 4.5, 4.9**

- [x] 7. 新闻页面与导航集成
  - [x] 7.1 创建 `src/app/news/page.tsx` 新闻页面，使用 NewsList 组件，包含页面标题和搜索框
    - _Requirements: 4.1, 4.2_
  - [x] 7.2 修改 `src/app/layout.tsx`，在导航栏中添加"AI 新闻"链接指向 `/news`
    - _Requirements: 4.1_

- [x] 8. 手动触发抓取 API
  - [x] 8.1 修改 `src/app/api/scraper/trigger/` 路由（如已存在）或创建新路由，支持通过参数单独触发新闻抓取任务
    - _Requirements: 5.4_

- [x] 9. 最终 Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选测试任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求编号，确保可追溯性
- Checkpoint 任务用于增量验证
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
