# 迭代历史

## [2026-03-04] 新闻详情页增加完整正文内容
- NewsItem 数据模型新增 `content` 字段（数据库迁移 `add_news_content`）
- RawNewsItem、NewsItem 类型定义新增 `content` 字段
- 内置新闻数据源 19 条新闻全部补充完整正文内容（每条 500-700 字）
- 抓取写入逻辑（news-scheduler.ts）支持 content 字段的 upsert
- 新闻详情 API 返回 content 字段
- 详情页优先展示 content 正文，按段落分行渲染，无 content 时回退到 summary

## [2026-03-04] 新闻点击跳转本地详情页
- 新增新闻详情 API `GET /api/news/:id`，按 ID 查询单条新闻
- 新增新闻详情页 `/news/[id]`，本地展示标题、摘要、标签、来源，底部提供原文链接
- 修改 `NewsCard.tsx` 标题链接从跳转第三方改为跳转本地详情页 `/news/:id`
- 更新 NewsCard 测试用例适配新的本地链接

## [2026-03-04] 新闻卡片增加摘要和标签展示
- `NewsCard.tsx` 增加新闻摘要展示（最多 3 行截断）和标签展示（蓝色圆角标签）
- 摘要为空或标签为空数组时自动隐藏对应区域
- 新增 4 个 NewsCard 测试用例（摘要渲染、标签渲染、空摘要、空标签），全部 121 个测试通过

## [2026-03-04] 简化新闻卡片展示
- 简化 `NewsCard.tsx`：移除摘要和标签展示，仅保留标题、来源名称、发布时间
- 同步简化 `NewsList.tsx` 骨架屏样式
- 更新 NewsCard 测试用例

## [2026-03-04] 新闻 Tab 优化：导航高亮、独立 6 小时抓取、1000 条上限、主动抓取 API
- 新增 `NavLinks.tsx` 客户端组件，导航栏 Tab 根据当前路径高亮（蓝色加粗 + 背景色）
- 重构 `layout.tsx` 使用 NavLinks 替代静态 Link
- 新闻抓取从模型数据的 3 天 cron 中独立出来，改为每 6 小时独立定时任务
- 新增新闻存储 1000 条上限，抓取写入后自动清理最旧的超限新闻
- 新增 `GET/POST /api/news/trigger` 新闻主动抓取 API（查看历史 + 手动触发）
- 修改 `scheduler.ts` 移除新闻抓取器注册（不再混在模型数据 cron 中）
- 修改 `instrumentation.ts` 分别启动模型数据和新闻两个独立定时任务
- 全部 120 个测试通过

## [2026-03-04] 新增 AI 新闻 Tab 功能
- 新增 `NewsItem` 数据模型（Prisma schema + 数据库迁移）
- 新增新闻相关 TypeScript 类型定义（NewsItem、RawNewsItem、ValidatedNewsItem、NewsScraperInterface 等）
- 新增新闻校验器 `news-validator.ts`（validateNews + deduplicateNews）
- 新增内置新闻数据源 `news-builtin.ts`（19 条 AI 领域预置新闻）
- 新增新闻抓取调度模块 `news-scheduler.ts`（NewsScraperRunner + 适配器模式）
- 新增新闻 API 端点 `GET /api/news`（支持分页、关键词搜索）
- 新增前端组件：NewsCard、Pagination、NewsList
- 新增新闻页面 `/news`
- 修改导航栏添加"AI 新闻"链接
- 修改 `scheduler.ts` 在单例初始化时注册新闻抓取器
- 修改 `instrumentation.ts` 简化为仅启动调度器
- 新增 27 个新闻相关单元测试，全部 120 个测试通过
