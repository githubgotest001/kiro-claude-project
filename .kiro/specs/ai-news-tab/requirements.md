# 需求文档：AI 最新重点新闻 Tab

## 简介

为现有 AI 大模型排行榜网站增加"AI 最新重点新闻"Tab 功能。该功能从网络上抓取围绕核心高排名 AI 模型和爆炸性 AI 新闻的内容，在前端以独立 Tab 页面展示，并注明新闻来源。新闻抓取复用现有的定时调度器架构。

## 术语表

- **News_Scraper（新闻抓取器）**：负责从外部新闻源获取 AI 相关新闻数据的模块
- **News_API（新闻接口）**：提供新闻数据查询的后端 API 端点
- **News_Tab（新闻标签页）**：前端展示 AI 新闻列表的页面标签
- **News_Item（新闻条目）**：单条新闻数据，包含标题、摘要、来源、发布时间等字段
- **News_Store（新闻存储）**：数据库中存储新闻数据的表
- **Scheduler（调度器）**：现有的定时任务调度系统，基于 node-cron

## 需求

### 需求 1：新闻数据模型

**用户故事：** 作为开发者，我希望有一个结构化的新闻数据模型，以便持久化存储抓取到的 AI 新闻数据。

#### 验收标准

1. THE News_Store SHALL 存储每条新闻的标题、摘要、来源名称、来源链接、发布时间、抓取时间字段
2. THE News_Store SHALL 为每条新闻存储关联的 AI 模型名称或关键词标签
3. WHEN 存储新闻条目时，THE News_Store SHALL 基于来源链接进行去重，避免重复存储相同新闻
4. THE News_Store SHALL 支持按发布时间降序查询新闻列表

### 需求 2：新闻抓取

**用户故事：** 作为系统管理员，我希望系统能自动从网络抓取 AI 相关重点新闻，以便用户获取最新资讯。

#### 验收标准

1. THE News_Scraper SHALL 从至少两个不同的新闻源抓取 AI 相关新闻
2. WHEN 抓取新闻时，THE News_Scraper SHALL 优先抓取与排行榜中高排名 AI 模型相关的新闻
3. WHEN 抓取新闻时，THE News_Scraper SHALL 同时抓取 AI 领域的爆炸性或重大突破新闻
4. THE News_Scraper SHALL 为每条新闻提取标题、摘要、来源名称和原文链接
5. WHEN 抓取完成后，THE News_Scraper SHALL 对原始数据进行校验，过滤掉字段不完整的记录
6. IF 抓取过程中发生网络错误，THEN THE News_Scraper SHALL 记录错误日志并继续处理其他新闻源
7. THE News_Scraper SHALL 复用现有 Scheduler 的定时调度架构，以独立的抓取任务注册运行

### 需求 3：新闻 API 端点

**用户故事：** 作为前端开发者，我希望有一个 API 端点提供新闻数据，以便前端页面获取并展示新闻列表。

#### 验收标准

1. WHEN 前端请求新闻列表时，THE News_API SHALL 返回按发布时间降序排列的新闻条目
2. THE News_API SHALL 支持分页查询，接受页码和每页数量参数
3. WHEN 请求包含关键词参数时，THE News_API SHALL 返回标题或摘要中包含该关键词的新闻
4. THE News_API SHALL 在每条新闻响应中包含来源名称和原文链接
5. IF 查询参数无效（如页码为负数），THEN THE News_API SHALL 返回 400 状态码和错误描述

### 需求 4：前端新闻 Tab 展示

**用户故事：** 作为用户，我希望在排行榜网站上看到一个"AI 新闻"标签页，以便浏览最新的 AI 重点新闻。

#### 验收标准

1. THE News_Tab SHALL 在网站导航栏中显示为独立的导航链接
2. WHEN 用户点击新闻 Tab 时，THE News_Tab SHALL 展示按时间倒序排列的新闻列表
3. THE News_Tab SHALL 为每条新闻展示标题、摘要、来源名称、发布时间
4. WHEN 用户点击新闻条目时，THE News_Tab SHALL 在新窗口中打开原文链接
5. THE News_Tab SHALL 为每条新闻显示关联的 AI 模型标签或关键词标签
6. WHEN 新闻列表超过一页时，THE News_Tab SHALL 提供分页导航控件
7. WHILE 新闻数据加载中，THE News_Tab SHALL 显示骨架屏加载状态
8. WHEN 用户在搜索框中输入关键词时，THE News_Tab SHALL 过滤并展示匹配的新闻
9. THE News_Tab SHALL 在每条新闻旁清晰标注来源名称，并提供指向原文的可点击链接

### 需求 5：新闻抓取调度集成

**用户故事：** 作为系统管理员，我希望新闻抓取任务与现有调度系统集成，以便统一管理所有定时任务。

#### 验收标准

1. THE Scheduler SHALL 将新闻抓取任务作为独立的抓取器注册到现有调度系统中
2. WHEN 定时任务触发时，THE Scheduler SHALL 同时执行模型数据抓取和新闻抓取
3. THE Scheduler SHALL 为新闻抓取任务记录独立的抓取日志，包含状态和错误信息
4. WHEN 手动触发抓取 API 时，THE Scheduler SHALL 支持单独触发新闻抓取任务
