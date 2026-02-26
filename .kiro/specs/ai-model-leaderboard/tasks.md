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
    - 创建 `prisma/schema.prisma`，定义 AIModel、Dimension、Score、ScrapeLog 模型
    - 运行 prisma migrate 生成数据库
    - 创建种子脚本 `prisma/seed.ts`，预填充评测维度数据（编码、推理、数学、多语言、指令遵循、知识问答）
    - _Requirements: 2.1_
  - [x] 1.3 创建共享 TypeScript 类型定义
    - 创建 `src/types/index.ts`，定义 Model、ModelDetail、RankedModel、Dimension、FilterState、RawScrapedData、ValidatedData、ScrapeResult、ExportMeta 等接口
    - _Requirements: 1.2, 1.3_

- [x] 2. 核心数据逻辑实现
  - [x] 2.1 实现筛选与排序逻辑
    - 创建 `src/lib/filters.ts`，实现 filterModels(models, filterState) 函数
    - 实现按开发商、开源状态、参数规模范围、搜索关键词的筛选
    - 实现多条件 AND 组合逻辑
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 2.2 编写筛选逻辑的属性测试
    - **Property 4: 筛选结果正确性** - 对任意模型数据集和单一筛选条件，结果中每个模型都满足条件且不遗漏
    - **Property 5: 筛选条件组合正确性** - 组合筛选结果等于各单一筛选结果的交集
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  - [x] 2.3 实现排行排序逻辑
    - 创建 `src/lib/rankings.ts`，实现 rankByDimension(models, dimension) 和 rankByComposite(models, dimensions) 函数
    - 实现加权平均分计算
    - _Requirements: 2.2, 2.3_
  - [ ]* 2.4 编写排行排序的属性测试
    - **Property 2: 维度排序正确性** - 排序后相邻模型的评分满足降序关系
    - **Property 3: 加权平均排行正确性** - 综合分等于加权平均值且列表降序排列
    - **Validates: Requirements 2.2, 2.3**
  - [x] 2.5 实现数据导出逻辑
    - 创建 `src/lib/export.ts`，实现 exportToCSV(models, meta) 和 exportToJSON(models, meta) 函数
    - 实现 parseCSV(csv) 和 parseExportJSON(json) 解析函数
    - 导出文件包含数据来源和抓取时间元信息
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 2.6 编写数据导出的属性测试
    - **Property 10: 数据导出往返一致性** - 导出后再解析回来应产生等价数据
    - **Property 11: 导出数据与筛选结果一致性** - 导出数据匹配筛选结果且包含元信息
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 3. 检查点 - 确保核心逻辑测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. 数据抓取模块实现
  - [x] 4.1 实现数据校验器
    - 创建 `src/lib/scraper/validator.ts`，实现 validate(data) 和 deduplicate(data) 函数
    - 校验字段完整性和数据格式
    - _Requirements: 4.4_
  - [ ]* 4.2 编写数据校验器的属性测试
    - **Property 6: 数据校验与去重正确性** - 处理后无重复记录且所有记录通过校验
    - **Validates: Requirements 4.4**
  - [x] 4.3 实现各数据源抓取器
    - 创建 `src/lib/scraper/sources/lmsys.ts` - LMSYS Chatbot Arena 抓取器
    - 创建 `src/lib/scraper/sources/openllm.ts` - HuggingFace OpenLLM Leaderboard 抓取器
    - 创建 `src/lib/scraper/sources/official.ts` - 官方数据抓取器
    - 每个抓取器实现 Scraper 接口
    - _Requirements: 4.1_
  - [x] 4.4 实现抓取调度器与错误处理
    - 创建 `src/lib/scraper/scheduler.ts`，实现 ScraperScheduler
    - 使用 node-cron 配置每周定时任务
    - 实现事务性写入：失败时回滚，保留原数据
    - 存储原始数据和处理后数据
    - _Requirements: 4.2, 4.3, 4.5, 4.6_
  - [ ]* 4.5 编写抓取模块的属性测试
    - **Property 7: 错误恢复数据不变性** - 抓取失败时数据库数据与抓取前一致
    - **Property 8: 原始数据与处理数据双重存储** - 成功抓取后两种数据均可查询
    - **Validates: Requirements 4.5, 4.6**

- [x] 5. 检查点 - 确保数据抓取模块测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 6. API 层实现
  - [x] 6.1 实现模型列表和详情 API
    - 创建 `src/app/api/models/route.ts` - GET /api/models，支持筛选、排序、分页
    - 创建 `src/app/api/models/[id]/route.ts` - GET /api/models/:id，返回模型详情和历史评分
    - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3, 3.4_
  - [x] 6.2 实现排行和维度 API
    - 创建 `src/app/api/rankings/route.ts` - GET /api/rankings，支持按维度排行
    - 创建 `src/app/api/dimensions/route.ts` - GET /api/dimensions
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 6.3 实现数据导出和抓取触发 API
    - 创建 `src/app/api/export/route.ts` - GET /api/export，支持 CSV/JSON 导出
    - 创建 `src/app/api/scraper/trigger/route.ts` - POST /api/scraper/trigger
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 4.2_
  - [ ]* 6.4 编写 API 端点的单元测试
    - 测试各 API 的请求参数校验和错误响应
    - 测试缺失数据场景返回正确的错误码
    - _Requirements: 1.5, 3.6_

- [x] 7. 前端页面与组件实现
  - [x] 7.1 实现排行榜首页
    - 创建 `src/app/page.tsx` - 排行榜首页
    - 实现 RankingTable 组件，支持列排序、前三名奖牌图标高亮
    - 实现 DimensionSelector 组件，支持维度切换（客户端无刷新更新）
    - 实现 FilterPanel 组件（开发商、开源、参数规模筛选）
    - 实现 SearchBar 组件（实时搜索，防抖处理）
    - 缺失数据显示"暂无数据"标识
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.2, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 7.2 编写模型展示完整性的属性测试
    - **Property 1: 模型展示完整性** - 对任意模型数据，渲染输出包含所有必需字段和维度评分
    - **Validates: Requirements 1.2, 1.3**
  - [x] 7.3 实现模型详情页
    - 创建 `src/app/models/[id]/page.tsx` - 模型详情页
    - 展示完整评测数据
    - 使用 LineChart 组件展示历史评分变化折线图
    - _Requirements: 1.4, 6.2_
  - [x] 7.4 实现模型对比页
    - 创建 `src/app/compare/page.tsx` - 模型对比页
    - 实现模型选择逻辑（2-5 个模型限制）
    - 使用 RadarChart 组件展示雷达图对比
    - 使用表格展示详细数据对比
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 7.5 编写对比模型数量约束的属性测试
    - **Property 9: 对比模型数量约束** - 选择数量在 2-5 范围内才被接受
    - **Validates: Requirements 5.1**
  - [x] 7.6 实现数据可视化组件
    - 实现 BarChart 组件 - 柱状图展示评分分布
    - 实现图表悬停 tooltip 显示详细数值
    - 支持图表缩放和平移
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 7.7 实现数据导出 UI
    - 实现 ExportButton 组件，支持 CSV/JSON 格式选择和下载
    - _Requirements: 8.1, 8.2, 8.3_

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
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点确保增量验证
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
