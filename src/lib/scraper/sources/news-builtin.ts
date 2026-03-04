/**
 * 内置新闻数据源 - AI 领域重点新闻预置数据
 * 包含围绕高排名 AI 模型和 AI 领域重大突破的新闻
 * 当没有配置外部新闻 API 时作为默认数据源使用
 */
import type { NewsScraperInterface, RawNewsItem } from '@/types';

interface NewsEntry {
  title: string;
  summary: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  tags: string[];
}

/** 预置新闻数据 */
const NEWS_DATA: NewsEntry[] = [
  {
    title: 'Claude Opus 4 发布：Anthropic 推出迄今最强编码与推理模型',
    summary: 'Anthropic 正式发布 Claude Opus 4，在 SWE-bench 编码基准测试中达到 72.5% 的得分，大幅领先前代。该模型在长文本理解、复杂推理和代码生成方面均有显著提升，被认为是当前最强的通用 AI 模型之一。',
    content: `Anthropic 于 2025 年 5 月 22 日正式发布了 Claude Opus 4，这是该公司迄今为止最强大的 AI 模型。Claude Opus 4 在多项基准测试中取得了突破性成绩，尤其在编码和推理领域表现卓越。

在 SWE-bench 编码基准测试中，Claude Opus 4 达到了 72.5% 的得分，大幅超越前代 Claude 3 Opus 的表现。该模型在处理复杂代码库、理解上下文依赖关系以及生成高质量代码方面展现出了显著的进步。

Claude Opus 4 的核心技术亮点包括：

1. 扩展思维能力：模型能够在回答前进行深度推理，通过内部思维链逐步分析复杂问题，显著提升了数学推理和逻辑分析的准确性。

2. 长文本理解：支持超长上下文窗口，能够处理大规模文档和代码库，在需要跨文件理解的编程任务中表现尤为出色。

3. 指令遵循：在复杂多步骤指令的执行上有了质的飞跃，能够更准确地理解用户意图并按要求完成任务。

4. 安全性提升：Anthropic 在模型训练中加强了安全对齐，减少了有害输出的可能性，同时保持了模型的实用性。

业界分析人士认为，Claude Opus 4 的发布标志着 AI 编码助手进入了一个新阶段。该模型不仅在基准测试中表现优异，在实际开发场景中也展现出了强大的实用价值，能够帮助开发者更高效地完成代码编写、调试和重构等任务。

Anthropic CEO Dario Amodei 表示，Claude Opus 4 代表了公司在安全 AI 研究方面的最新成果，团队将继续致力于开发既强大又安全的 AI 系统。`,
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2025/05/claude-opus-4-release',
    publishedAt: '2025-05-22',
    tags: ['Claude', 'Anthropic', 'Claude Opus 4'],
  },
  {
    title: 'OpenAI 发布 o3 和 o4-mini：推理模型迎来新突破',
    summary: 'OpenAI 推出新一代推理模型 o3 和 o4-mini，在数学竞赛和科学推理任务中表现卓越。o3 在 AIME 2025 数学竞赛中达到 96.7% 的准确率，o4-mini 则以更低成本提供接近的推理能力。',
    content: `OpenAI 于 2025 年 4 月 16 日发布了两款全新的推理模型：o3 和 o4-mini。这两款模型延续了 o 系列专注于深度推理的设计理念，在数学、科学和编程等需要复杂推理的任务中取得了令人瞩目的成绩。

o3 模型的核心表现：

o3 在 AIME 2025（美国数学邀请赛）中达到了 96.7% 的准确率，这一成绩远超此前所有 AI 模型的表现。在 GPQA Diamond（研究生级别科学问答）测试中，o3 同样展现出了接近人类专家的推理能力。

o3 采用了全新的推理架构，能够在回答问题前进行多步骤的深度思考。模型会自动将复杂问题分解为多个子问题，逐步推导出最终答案。这种方法在处理需要多步推理的数学证明和科学分析时尤为有效。

o4-mini 的定位与优势：

o4-mini 是 OpenAI 推出的高性价比推理模型，旨在以更低的计算成本提供接近 o3 的推理能力。在大多数基准测试中，o4-mini 的表现达到了 o3 的 90% 以上，但 API 调用成本仅为 o3 的约四分之一。

这使得 o4-mini 成为企业级应用的理想选择，特别是在需要大规模部署推理能力但对成本敏感的场景中。

OpenAI 表示，o 系列模型代表了 AI 推理能力的未来方向。与传统的大语言模型不同，o 系列模型通过"思考时间"换取更高的准确性，这种范式在处理复杂问题时展现出了明显的优势。`,
    sourceName: 'The Verge',
    sourceUrl: 'https://www.theverge.com/2025/04/o3-o4-mini-reasoning',
    publishedAt: '2025-04-16',
    tags: ['GPT', 'OpenAI', 'o3', 'o4-mini'],
  },
  {
    title: 'Gemini 2.5 Pro 登顶多项基准测试：Google 重回 AI 竞赛前列',
    summary: 'Google 发布 Gemini 2.5 Pro，这是一款具备思维链推理能力的旗舰模型。在 LMArena 排行榜上一度位居榜首，编码和数学能力大幅提升，支持高达 100 万 token 的上下文窗口。',
    content: `Google 于 2025 年 3 月 25 日发布了 Gemini 2.5 Pro，这是一款融合了思维链推理能力的旗舰级大语言模型。该模型在发布后迅速登顶 LMArena 排行榜，标志着 Google 在 AI 竞赛中重新夺回领先地位。

Gemini 2.5 Pro 的技术突破：

1. 思维链推理：Gemini 2.5 Pro 内置了类似 OpenAI o 系列的推理能力，能够在生成回答前进行深度思考。这使得模型在数学推理、逻辑分析和复杂编码任务中的表现大幅提升。

2. 超长上下文窗口：支持高达 100 万 token 的上下文窗口，这意味着模型可以一次性处理整本书籍、大型代码库或长篇文档，而不会丢失关键信息。

3. 多模态能力：Gemini 2.5 Pro 不仅能处理文本，还能理解图像、音频和视频内容，在多模态理解方面处于行业领先水平。

4. 编码能力飞跃：在 HumanEval 和 SWE-bench 等编码基准测试中，Gemini 2.5 Pro 的得分较前代提升了 20% 以上，能够处理更复杂的编程任务。

在 LMArena 排行榜上，Gemini 2.5 Pro 一度超越了 Claude 和 GPT 系列模型，成为综合评分最高的模型。虽然在某些特定任务上其他模型可能更具优势，但 Gemini 2.5 Pro 的全面性使其成为当前最均衡的 AI 模型之一。

Google DeepMind 团队表示，Gemini 2.5 Pro 的成功得益于全新的训练方法和更大规模的高质量训练数据。团队将继续优化模型性能，并计划在未来几个月内推出更多针对特定场景的优化版本。`,
    sourceName: 'VentureBeat',
    sourceUrl: 'https://venturebeat.com/2025/03/gemini-2-5-pro-benchmark',
    publishedAt: '2025-03-25',
    tags: ['Gemini', 'Google', 'Gemini 2.5 Pro'],
  },
  {
    title: 'DeepSeek-R1 开源发布：中国 AI 推理模型震动全球',
    summary: 'DeepSeek 发布开源推理模型 R1，参数量达 671B，在数学和编码任务上接近 OpenAI o1 的水平。该模型采用强化学习训练，训练成本仅为同级别模型的十分之一，引发业界对 AI 训练效率的重新思考。',
    content: `2025 年 1 月 20 日，中国 AI 公司 DeepSeek 发布了开源推理模型 DeepSeek-R1，在全球 AI 社区引发了巨大震动。这款模型在数学推理和编码任务上的表现接近 OpenAI o1，但训练成本仅为同级别模型的十分之一。

DeepSeek-R1 的核心技术特点：

DeepSeek-R1 采用了创新的强化学习训练方法，总参数量达到 671B。与传统的监督学习方法不同，R1 通过大规模强化学习让模型自主学习推理策略，从而在无需大量人工标注数据的情况下获得了强大的推理能力。

在 AIME 数学竞赛测试中，DeepSeek-R1 的准确率接近 OpenAI o1，在某些数学子任务上甚至超越了后者。在编码任务方面，R1 在 Codeforces 竞赛级别的编程题目上展现出了令人印象深刻的解题能力。

训练效率的革命：

最令业界震惊的是 DeepSeek-R1 的训练成本。据 DeepSeek 团队披露，R1 的训练总成本约为 500-600 万美元，仅为 OpenAI 同级别模型估计训练成本的十分之一。这一数据引发了业界对 AI 训练效率的深刻反思。

DeepSeek 团队通过多项技术创新实现了成本的大幅降低：优化的训练框架、高效的数据利用策略以及创新的模型架构设计。这些技术突破表明，开发顶级 AI 模型并不一定需要天文数字的投入。

开源生态影响：

DeepSeek-R1 在 Apache 2.0 协议下完全开源，这意味着任何人都可以自由使用、修改和部署该模型。发布后短短一周内，R1 在 Hugging Face 上的下载量就突破了百万次，成为开源社区最受关注的推理模型。`,
    sourceName: '机器之心',
    sourceUrl: 'https://www.jiqizhixin.com/articles/2025-01-deepseek-r1',
    publishedAt: '2025-01-20',
    tags: ['DeepSeek', 'DeepSeek-R1', '开源'],
  },
  {
    title: 'Qwen3 系列全面开源：阿里云发布 8 款模型覆盖全场景',
    summary: '阿里云发布通义千问 Qwen3 系列，包含 235B MoE 旗舰模型和多款密集模型。Qwen3 支持思考模式无缝切换，在多项基准测试中超越 DeepSeek-R1 和 GPT-4o，全部模型均在 Apache 2.0 协议下开源。',
    content: `阿里云于 2025 年 4 月 29 日正式发布通义千问 Qwen3 系列模型，一次性推出 8 款不同规模的模型，覆盖从端侧部署到云端旗舰的全场景需求。全部模型均在 Apache 2.0 协议下开源。

Qwen3 系列模型矩阵：

旗舰模型 Qwen3-235B 采用 MoE（混合专家）架构，总参数量 235B，激活参数约 22B。该模型在保持高效推理的同时，在多项基准测试中超越了 DeepSeek-R1 和 GPT-4o，成为当前开源模型中综合表现最强的选手。

系列还包括 Qwen3-32B、Qwen3-14B、Qwen3-8B、Qwen3-4B、Qwen3-1.7B 等多款密集模型，以及 Qwen3-30B MoE 模型，满足不同计算资源和应用场景的需求。

核心技术创新：

1. 思考模式无缝切换：Qwen3 支持在"快速回答"和"深度思考"两种模式间无缝切换。用户可以根据问题复杂度选择合适的模式，简单问题快速响应，复杂问题深度推理。

2. 多语言能力：Qwen3 在中文、英文、日文、韩文等多种语言上均表现出色，特别是在中文理解和生成方面保持了显著优势。

3. 工具调用能力：模型内置了强大的工具调用能力，能够自主决定何时调用外部工具，并正确解析工具返回的结果。

Qwen3 的发布进一步巩固了阿里云在开源大模型领域的领先地位，也为全球开发者提供了更多高质量的模型选择。`,
    sourceName: '量子位',
    sourceUrl: 'https://www.qbitai.com/2025/04/qwen3-open-source',
    publishedAt: '2025-04-29',
    tags: ['Qwen', '阿里云', 'Qwen3', '开源'],
  },
  {
    title: 'Llama 4 发布：Meta 推出多模态开源模型家族',
    summary: 'Meta 发布 Llama 4 系列，包括 Scout（109B）和 Maverick（400B）两款 MoE 模型。Llama 4 Scout 支持高达 1000 万 token 的上下文窗口，Maverick 在多模态理解方面表现出色，延续了 Meta 的开源路线。',
    content: `Meta 于 2025 年 4 月 5 日发布了 Llama 4 系列模型，包括 Llama 4 Scout 和 Llama 4 Maverick 两款旗舰模型，均采用 MoE 架构。这是 Meta 在开源大模型领域的又一重要里程碑。

Llama 4 Scout（109B 参数）：

Llama 4 Scout 最引人注目的特性是其高达 1000 万 token 的上下文窗口，这是目前所有大语言模型中最长的。这意味着 Scout 可以一次性处理数百万字的文档、整个代码仓库或长达数小时的对话历史。

Scout 采用了 16 个专家的 MoE 架构，总参数 109B，每次推理激活约 17B 参数。这种设计使得模型在保持强大能力的同时，推理成本相对可控。

Llama 4 Maverick（400B 参数）：

Maverick 是 Llama 4 系列的旗舰模型，总参数量达到 400B，采用 128 个专家的 MoE 架构。该模型在多模态理解方面表现尤为出色，能够同时处理文本、图像和视频内容。

在多模态基准测试中，Maverick 的表现与 Gemini 2.0 Pro 和 GPT-4o 相当，在某些视觉理解任务上甚至超越了这些闭源模型。

Meta 继续坚持开源路线，Llama 4 系列在 Llama 社区许可证下发布，允许商业使用。Meta AI 负责人 Yann LeCun 表示，开源是推动 AI 技术民主化的关键，Meta 将持续投入开源 AI 研究。`,
    sourceName: 'Ars Technica',
    sourceUrl: 'https://arstechnica.com/2025/04/llama-4-multimodal-release',
    publishedAt: '2025-04-05',
    tags: ['Llama', 'Meta', 'Llama 4', '开源'],
  },
  {
    title: 'Mistral AI 融资 6 亿欧元，估值突破 60 亿',
    summary: 'Mistral AI 完成新一轮融资，估值达到 60 亿欧元。公司计划加大在企业级 AI 解决方案和多语言模型方面的投入，其旗舰模型 Mistral Large 2 在欧洲市场获得广泛采用。',
    content: `法国 AI 初创公司 Mistral AI 于 2025 年 3 月完成了新一轮 6 亿欧元的融资，公司估值达到 60 亿欧元，成为欧洲估值最高的 AI 公司。

本轮融资由多家知名投资机构领投，包括 General Catalyst、Lightspeed Venture Partners 以及多家欧洲主权基金。Mistral AI 计划将融资用于以下几个方向：

1. 企业级 AI 解决方案：Mistral AI 正在开发面向企业的定制化 AI 平台，帮助欧洲企业在符合 GDPR 等数据保护法规的前提下部署 AI 技术。

2. 多语言模型优化：作为一家欧洲公司，Mistral AI 在多语言支持方面具有天然优势。公司计划进一步优化模型在法语、德语、西班牙语等欧洲语言上的表现。

3. 开源生态建设：Mistral AI 将继续维护其开源模型系列，同时推出更多针对特定场景的专业模型。

Mistral Large 2 是公司当前的旗舰模型，在欧洲市场获得了广泛采用。该模型在多语言理解、代码生成和企业文档处理等方面表现出色，已被多家欧洲大型企业和政府机构采用。

Mistral AI CEO Arthur Mensch 表示，公司的目标是成为全球领先的 AI 基础设施提供商，为企业提供安全、高效、合规的 AI 解决方案。`,
    sourceName: 'Reuters',
    sourceUrl: 'https://www.reuters.com/2025/03/mistral-ai-funding-round',
    publishedAt: '2025-03-10',
    tags: ['Mistral', 'Mistral AI', 'Mistral Large'],
  },
  {
    title: 'GPT-4.5 发布：OpenAI 最大规模预训练模型问世',
    summary: 'OpenAI 发布 GPT-4.5，这是迄今为止最大规模的预训练模型。该模型在知识广度、创意写作和情感理解方面有显著提升，被 OpenAI 称为"最具人情味"的模型，但推理能力仍由 o 系列模型主导。',
    content: `OpenAI 于 2025 年 2 月 27 日发布了 GPT-4.5，这是公司迄今为止规模最大的预训练模型。与专注于推理的 o 系列不同，GPT-4.5 在知识广度、创意表达和情感理解方面实现了显著突破。

GPT-4.5 的核心特点：

1. 知识广度：GPT-4.5 的训练数据覆盖了更广泛的知识领域，在百科知识、专业领域知识和时事信息方面的准确性大幅提升。模型能够更准确地回答各类知识性问题，减少了"幻觉"现象。

2. 创意写作：在创意写作任务中，GPT-4.5 展现出了更自然、更富有表现力的文字风格。无论是小说创作、诗歌写作还是广告文案，模型都能生成更具感染力的内容。

3. 情感理解：OpenAI 称 GPT-4.5 是"最具人情味"的模型。它能够更好地理解对话中的情感色彩，在客服、心理咨询等需要情感共鸣的场景中表现更加出色。

4. 多模态能力：GPT-4.5 继承了 GPT-4 的多模态能力，能够理解和分析图像内容，并在此基础上进行了优化。

值得注意的是，OpenAI 明确表示 GPT-4.5 并非推理模型的替代品。在需要深度推理的数学、编程和科学任务中，o3 和 o4-mini 仍然是更好的选择。GPT-4.5 的定位是通用型对话模型，适合日常交流、内容创作和知识查询等场景。

GPT-4.5 目前已向 ChatGPT Plus 和 API 用户开放，OpenAI 计划在未来几周内逐步扩大访问范围。`,
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2025/02/gpt-4-5-largest-pretrained',
    publishedAt: '2025-02-27',
    tags: ['GPT', 'OpenAI', 'GPT-4.5'],
  },
  {
    title: 'Gemini 2.5 Flash 发布：Google 推出高性价比思维模型',
    summary: 'Google 发布 Gemini 2.5 Flash，在保持快速响应的同时引入思维链推理能力。该模型在 LMArena 上排名迅速攀升，以极低的 API 价格提供接近 Pro 版本的性能，成为开发者的热门选择。',
    content: `Google 于 2025 年 4 月 17 日发布了 Gemini 2.5 Flash，这是一款兼具速度和推理能力的高性价比模型。Flash 系列一直以快速响应著称，而 2.5 版本首次引入了思维链推理能力，实现了速度与智能的平衡。

Gemini 2.5 Flash 的技术亮点：

1. 思维链推理：与 Gemini 2.5 Pro 类似，Flash 版本也具备了"思考"能力。模型可以在回答前进行简短的推理过程，在不显著增加延迟的情况下提升回答质量。

2. 极致性价比：Gemini 2.5 Flash 的 API 价格仅为 Pro 版本的约十分之一，但在大多数基准测试中的表现达到了 Pro 版本的 85-90%。这使得它成为大规模 API 调用场景的理想选择。

3. 低延迟：Flash 的首 token 响应时间保持在毫秒级别，适合需要实时交互的应用场景，如聊天机器人、代码补全和实时翻译。

在 LMArena 排行榜上，Gemini 2.5 Flash 的排名迅速攀升，在性价比维度上位居榜首。许多开发者开始将其作为默认的 API 模型，用于处理日常的文本生成和分析任务。

Google 表示，Flash 系列的目标是让高质量的 AI 能力变得更加普惠。通过持续优化模型效率，Google 希望让更多开发者和企业能够以可承受的成本使用先进的 AI 技术。`,
    sourceName: 'The Verge',
    sourceUrl: 'https://www.theverge.com/2025/04/gemini-2-5-flash-thinking',
    publishedAt: '2025-04-17',
    tags: ['Gemini', 'Google', 'Gemini 2.5 Flash'],
  },
  {
    title: 'Grok 3 发布：xAI 模型在推理基准测试中跻身前三',
    summary: 'Elon Musk 旗下 xAI 发布 Grok 3，在数学推理和编码任务中表现优异。Grok 3 使用 xAI 自建的 Colossus 超算集群训练，在 AIME 和 GPQA 等基准测试中跻身前三名。',
    content: `Elon Musk 旗下的 AI 公司 xAI 于 2025 年 2 月 17 日发布了 Grok 3，这是该公司迄今为止最强大的模型。Grok 3 在多项推理基准测试中跻身前三名，展现出了与 OpenAI 和 Anthropic 顶级模型竞争的实力。

Grok 3 的训练基础设施：

Grok 3 使用 xAI 自建的 Colossus 超算集群进行训练。Colossus 是目前全球最大的 AI 训练集群之一，配备了超过 10 万块 NVIDIA H100 GPU。这一庞大的算力基础为 Grok 3 的训练提供了强有力的支撑。

基准测试表现：

在 AIME 2025 数学竞赛测试中，Grok 3 的准确率跻身前三名，仅次于 OpenAI o3。在 GPQA Diamond 科学推理测试中，Grok 3 同样表现出色，展现出了强大的科学知识理解和推理能力。

在编码任务方面，Grok 3 在 HumanEval 和 LiveCodeBench 等基准测试中的得分也位居前列，能够处理复杂的算法设计和系统架构问题。

Grok 3 的独特定位：

与其他 AI 模型不同，Grok 3 深度集成在 X（原 Twitter）平台中，能够实时访问平台上的信息流。这使得 Grok 3 在时事分析、舆情监测和社交媒体内容理解方面具有独特优势。

xAI 表示，Grok 3 的发布只是开始，公司计划在 2025 年下半年推出更强大的 Grok 4 模型。`,
    sourceName: 'Wired',
    sourceUrl: 'https://www.wired.com/2025/02/grok-3-xai-reasoning',
    publishedAt: '2025-02-17',
    tags: ['Grok', 'xAI', 'Grok 3'],
  },
  {
    title: 'Claude Sonnet 4 发布：Anthropic 中端模型全面升级',
    summary: 'Anthropic 同步发布 Claude Sonnet 4，在编码准确性和指令遵循方面大幅提升。Sonnet 4 引入了扩展思维能力，在 SWE-bench 上得分超越前代 Sonnet 3.5，成为性价比最高的编码助手之一。',
    content: `Anthropic 于 2025 年 5 月 22 日与 Claude Opus 4 同步发布了 Claude Sonnet 4，这是一款面向开发者的高性价比模型。Sonnet 4 在编码准确性和指令遵循方面实现了大幅提升，成为 AI 编码助手市场中最具竞争力的产品之一。

Sonnet 4 的核心改进：

1. 编码能力跃升：在 SWE-bench 基准测试中，Sonnet 4 的得分超越了前代 Sonnet 3.5，接近 Opus 4 的水平。模型能够更准确地理解代码上下文，生成更高质量的代码补全和修改建议。

2. 扩展思维能力：Sonnet 4 引入了类似 Opus 4 的扩展思维功能，能够在处理复杂编码任务时进行深度推理。这使得模型在处理多文件重构、复杂 bug 修复等任务时表现更加出色。

3. 指令遵循：Sonnet 4 在理解和执行复杂指令方面有了质的飞跃。模型能够更准确地按照用户的具体要求完成任务，减少了需要多次修正的情况。

4. 响应速度：尽管能力大幅提升，Sonnet 4 的响应速度仍然保持在较快水平，适合需要实时交互的开发场景。

在定价方面，Sonnet 4 的 API 价格仅为 Opus 4 的约三分之一，使其成为日常开发工作的理想选择。许多开发者选择将 Sonnet 4 作为默认的编码助手，仅在处理最复杂的任务时切换到 Opus 4。`,
    sourceName: 'VentureBeat',
    sourceUrl: 'https://venturebeat.com/2025/05/claude-sonnet-4-coding',
    publishedAt: '2025-05-22',
    tags: ['Claude', 'Anthropic', 'Claude Sonnet 4'],
  },
  {
    title: 'DeepSeek-V3 发布：MoE 架构训练成本仅 557 万美元',
    summary: 'DeepSeek 发布 V3 模型，采用 MoE 架构，总参数 671B 但激活参数仅 37B。该模型训练成本仅约 557 万美元，远低于同级别模型，在多项基准测试中与 GPT-4o 和 Claude 3.5 Sonnet 持平。',
    content: `DeepSeek 于 2024 年 12 月 26 日发布了 DeepSeek-V3，这是一款采用 MoE 架构的大语言模型，以极低的训练成本实现了与顶级闭源模型相当的性能，再次证明了高效训练的可行性。

DeepSeek-V3 的架构设计：

V3 采用了 MoE（混合专家）架构，总参数量达到 671B，但每次推理仅激活约 37B 参数。这种设计使得模型在保持大规模参数带来的知识容量的同时，推理成本大幅降低。

模型使用了 256 个专家，每次推理选择 8 个专家进行计算。DeepSeek 团队还开发了创新的负载均衡策略，确保各专家被均匀利用，避免了 MoE 架构常见的专家利用不均问题。

训练成本突破：

DeepSeek-V3 的训练总成本约为 557 万美元，这一数字在业界引起了广泛讨论。相比之下，同级别的闭源模型估计训练成本在数千万到上亿美元之间。

DeepSeek 团队通过以下技术实现了成本优化：FP8 混合精度训练、高效的通信策略、优化的数据管道以及创新的学习率调度方案。

基准测试表现：

在多项基准测试中，DeepSeek-V3 的表现与 GPT-4o 和 Claude 3.5 Sonnet 持平。在中文理解和生成任务中，V3 甚至超越了这些模型，展现出了在中文场景下的独特优势。`,
    sourceName: '机器之心',
    sourceUrl: 'https://www.jiqizhixin.com/articles/2024-12-deepseek-v3',
    publishedAt: '2024-12-26',
    tags: ['DeepSeek', 'DeepSeek-V3', '开源', 'MoE'],
  },
  {
    title: 'AI 编程助手大战升级：Cursor、Windsurf、Kiro 争夺开发者市场',
    summary: '2025 年 AI 编程助手市场竞争白热化。Cursor 凭借代码库理解能力领先，Windsurf 主打流畅的编码体验，多家科技巨头也纷纷推出自己的 AI IDE 产品。开发者工具正在经历 AI 原生化的深刻变革。',
    content: `2025 年，AI 编程助手市场进入了白热化竞争阶段。多款产品争相推出创新功能，开发者工具正在经历一场 AI 原生化的深刻变革。

主要竞争者：

Cursor 凭借其强大的代码库理解能力在市场中占据领先地位。Cursor 能够深度理解整个项目的代码结构和依赖关系，在代码补全、重构建议和 bug 修复方面提供高度上下文相关的建议。其"Composer"功能允许开发者通过自然语言描述来生成和修改代码，大幅提升了开发效率。

Windsurf 主打流畅的编码体验，强调"心流"状态的维持。其 AI 助手能够预测开发者的下一步操作，在不打断思路的情况下提供恰到好处的辅助。Windsurf 的界面设计简洁优雅，深受注重开发体验的程序员喜爱。

多家科技巨头也纷纷入局，推出了各自的 AI IDE 产品，进一步加剧了市场竞争。

市场趋势：

1. 从代码补全到全流程辅助：AI 编程助手正在从简单的代码补全工具演变为覆盖需求分析、架构设计、编码实现、测试和部署的全流程开发伙伴。

2. 多模型支持：越来越多的 AI IDE 支持接入多个 AI 模型，让开发者根据任务类型选择最合适的模型。

3. 团队协作：AI 编程助手开始支持团队级别的知识共享和代码规范执行，帮助团队保持一致的代码风格和质量标准。

分析师预测，到 2025 年底，超过 70% 的专业开发者将在日常工作中使用某种形式的 AI 编程助手。`,
    sourceName: 'The Information',
    sourceUrl: 'https://www.theinformation.com/2025/06/ai-coding-assistant-war',
    publishedAt: '2025-06-01',
    tags: ['AI 编程', 'Cursor', 'AI IDE'],
  },
  {
    title: 'Phi-4 发布：微软 14B 小模型在推理任务中超越 70B 级别对手',
    summary: '微软发布 Phi-4，仅 14B 参数却在数学推理任务中超越多个 70B 级别模型。Phi-4 采用合成数据训练策略，证明了高质量训练数据比模型规模更重要的理念。',
    content: `微软于 2024 年 12 月 12 日发布了 Phi-4，这是 Phi 系列小模型的最新成员。Phi-4 仅有 14B 参数，却在数学推理任务中超越了多个 70B 级别的模型，再次证明了"小而精"的模型设计理念。

Phi-4 的技术创新：

1. 合成数据训练：Phi-4 的训练大量使用了高质量的合成数据。微软研究团队开发了专门的数据生成管道，能够自动生成覆盖各种推理模式的训练样本。这些合成数据在质量和多样性方面超越了传统的网络爬取数据。

2. 课程学习策略：Phi-4 的训练采用了精心设计的课程学习策略，从简单任务逐步过渡到复杂任务。这种方法帮助模型建立了扎实的基础推理能力，然后在此基础上发展更高级的推理技能。

3. 数据质量优先：微软团队的核心理念是"数据质量比模型规模更重要"。通过严格的数据筛选和清洗流程，Phi-4 的训练数据质量远高于同类模型。

基准测试表现：

在 MATH 基准测试中，Phi-4 的准确率超越了多个 70B 级别的开源模型。在 GSM8K 数学推理测试中，Phi-4 同样表现出色，证明了小模型在特定任务上可以与大模型一较高下。

Phi-4 的成功对 AI 行业具有重要启示：开发强大的 AI 模型并不一定需要数千亿参数和天文数字的训练成本。通过优化训练数据和训练方法，小模型也能在特定领域达到甚至超越大模型的水平。`,
    sourceName: 'Ars Technica',
    sourceUrl: 'https://arstechnica.com/2024/12/phi-4-small-model-reasoning',
    publishedAt: '2024-12-12',
    tags: ['Phi-4', 'Microsoft', '小模型'],
  },
  {
    title: 'AI 安全峰会达成新共识：全球 28 国签署 AI 治理框架',
    summary: '在巴黎举行的 AI 安全峰会上，28 个国家签署了新的 AI 治理框架协议。协议涵盖前沿模型的安全评估标准、开源模型的责任界定以及 AI 在关键基础设施中的部署规范。',
    content: `2025 年 2 月 10 日，在巴黎举行的第三届全球 AI 安全峰会上，28 个国家正式签署了新的 AI 治理框架协议。这是迄今为止最具约束力的国际 AI 治理文件，标志着全球 AI 监管进入了新阶段。

协议的核心内容：

1. 前沿模型安全评估标准：协议要求所有开发超过一定算力阈值的 AI 模型的公司，必须在模型发布前进行标准化的安全评估。评估内容包括模型的潜在滥用风险、偏见程度和可控性。

2. 开源模型责任界定：协议首次明确了开源 AI 模型的责任框架。模型开发者需要提供基本的安全文档和使用指南，但不对下游用户的具体使用方式承担无限责任。

3. 关键基础设施部署规范：在医疗、金融、交通等关键基础设施领域部署 AI 系统，需要通过额外的安全认证和定期审计。

4. 国际合作机制：协议建立了国际 AI 安全信息共享机制，各签署国将定期交流 AI 安全研究成果和监管经验。

签署国包括美国、中国、英国、法国、德国、日本、韩国、印度等主要 AI 发展国家。虽然协议的执行力度仍有待观察，但它为全球 AI 治理提供了一个重要的框架基础。`,
    sourceName: 'Reuters',
    sourceUrl: 'https://www.reuters.com/2025/02/ai-safety-summit-governance',
    publishedAt: '2025-02-10',
    tags: ['AI 安全', 'AI 治理', '政策'],
  },
  {
    title: 'Qwen2.5 Coder 32B 开源：代码生成能力媲美 GPT-4o',
    summary: '阿里云开源 Qwen2.5 Coder 32B，在 HumanEval 和 MBPP 等代码基准测试中达到与 GPT-4o 相当的水平。该模型支持 92 种编程语言，成为开源社区最受欢迎的代码模型之一。',
    content: `阿里云于 2025 年 1 月 15 日开源了 Qwen2.5 Coder 32B，这是一款专注于代码生成的大语言模型。该模型在多项代码基准测试中达到了与 GPT-4o 相当的水平，成为开源社区中最受欢迎的代码模型之一。

Qwen2.5 Coder 32B 的技术特点：

1. 广泛的语言支持：模型支持 92 种编程语言，涵盖了从主流的 Python、JavaScript、Java 到小众的 Haskell、Erlang 等各类语言。

2. 代码理解能力：模型不仅能生成代码，还能深度理解现有代码的逻辑和结构。在代码审查、bug 检测和重构建议方面表现出色。

3. 长上下文支持：支持 128K token 的上下文窗口，能够处理大型代码文件和跨文件的代码理解任务。

基准测试表现：

在 HumanEval 基准测试中，Qwen2.5 Coder 32B 的 pass@1 得分达到了 92.7%，与 GPT-4o 的表现相当。在 MBPP 测试中同样表现优异，证明了模型在实际编程任务中的实用性。

该模型在 Apache 2.0 协议下开源，开发者可以自由使用和部署。发布后迅速在 Hugging Face 上获得了大量下载，成为许多 AI 编程工具的底层模型选择。`,
    sourceName: '量子位',
    sourceUrl: 'https://www.qbitai.com/2025/01/qwen2-5-coder-open-source',
    publishedAt: '2025-01-15',
    tags: ['Qwen', '阿里云', 'AI 编程', '开源'],
  },
  {
    title: 'Google Gemma 3 开源发布：27B 模型适配消费级硬件',
    summary: 'Google 发布 Gemma 3 系列开源模型，其中 27B 版本可在单张 GPU 上运行。Gemma 3 支持多模态输入和 128K 上下文窗口，在同参数级别中综合表现最佳，推动了端侧 AI 部署的发展。',
    content: `Google 于 2025 年 3 月 12 日发布了 Gemma 3 系列开源模型，这是 Google 面向开源社区推出的轻量级模型家族的最新版本。Gemma 3 的 27B 版本可以在单张消费级 GPU 上运行，大幅降低了部署门槛。

Gemma 3 的技术亮点：

1. 消费级硬件适配：27B 版本经过量化优化后，可以在单张 NVIDIA RTX 4090 或同级别 GPU 上流畅运行。这使得个人开发者和小型团队也能在本地部署高质量的 AI 模型。

2. 多模态能力：Gemma 3 首次引入了多模态输入支持，能够同时处理文本和图像内容。

3. 128K 上下文窗口：支持 128K token 的上下文窗口，能够处理长文档和复杂的多轮对话。

4. 多语言支持：Gemma 3 在 140 多种语言上进行了训练，在非英语语言的理解和生成方面有了显著提升。

在同参数级别的模型对比中，Gemma 3 27B 在 MMLU、HumanEval 等基准测试中的综合表现位居前列。Gemma 3 的发布推动了端侧 AI 部署的发展，越来越多的应用开始在本地运行 AI 模型。`,
    sourceName: 'VentureBeat',
    sourceUrl: 'https://venturebeat.com/2025/03/gemma-3-open-source-edge',
    publishedAt: '2025-03-12',
    tags: ['Gemma', 'Google', '开源', '端侧部署'],
  },
  {
    title: 'NVIDIA Blackwell GPU 全面量产：AI 算力供应迎来转折点',
    summary: 'NVIDIA 宣布 Blackwell 架构 GPU 全面量产，B200 和 GB200 芯片开始大规模出货。新一代 GPU 在 AI 训练和推理性能上较 Hopper 架构提升 4 倍，有望缓解全球 AI 算力紧张局面。',
    content: `NVIDIA 于 2025 年 3 月 5 日宣布，Blackwell 架构 GPU 已进入全面量产阶段，B200 和 GB200 芯片开始大规模出货。这标志着 AI 算力供应即将迎来一个重要的转折点。

Blackwell 架构的性能突破：

1. 训练性能：B200 GPU 在 AI 模型训练方面的性能较上一代 Hopper 架构（H100）提升了约 4 倍。

2. 推理性能：在 AI 推理任务中，B200 的性能提升更为显著，特别是在大语言模型的推理场景中，吞吐量提升了 5-7 倍。

3. 能效比：Blackwell 架构在提升性能的同时，能效比也有了显著改善。每瓦特性能较 Hopper 架构提升了约 2.5 倍。

GB200 将两块 B200 GPU 与一块 Grace CPU 集成在一起，通过高速 NVLink 互连，特别适合大规模 AI 训练和推理工作负载。

Blackwell GPU 的全面量产有望缓解持续已久的全球 AI 算力紧张局面。NVIDIA CEO 黄仁勋表示，Blackwell 是公司历史上最成功的产品发布。`,
    sourceName: 'Wired',
    sourceUrl: 'https://www.wired.com/2025/03/nvidia-blackwell-mass-production',
    publishedAt: '2025-03-05',
    tags: ['NVIDIA', 'GPU', 'AI 算力', 'Blackwell'],
  },
  {
    title: 'Llama 3.1 405B 成为最受欢迎的开源基座模型',
    summary: 'Meta 的 Llama 3.1 405B 在 Hugging Face 上的下载量突破 1000 万次，成为最受欢迎的开源大语言模型。众多企业和研究机构基于该模型进行微调，形成了庞大的开源生态系统。',
    content: `Meta 的 Llama 3.1 405B 在 Hugging Face 上的下载量于 2025 年 1 月突破了 1000 万次，正式成为全球最受欢迎的开源大语言模型。

Llama 3.1 405B 的成功因素：

1. 强大的基础能力：作为一款 405B 参数的密集模型，Llama 3.1 405B 在发布时就展现出了与 GPT-4 相当的综合能力。

2. 开放的许可协议：Llama 3.1 在 Llama 社区许可证下发布，允许商业使用，吸引了大量企业用户。

3. 丰富的微调生态：基于 Llama 3.1 405B，社区开发了数百个针对特定场景的微调模型，涵盖医疗、法律、金融、教育等各个领域。

围绕 Llama 3.1 形成的开源生态系统已经非常庞大。主要的 AI 推理框架（如 vLLM、TGI）都对 Llama 3.1 进行了深度优化。多家云服务商提供了一键部署服务。

在学术研究领域，Llama 3.1 405B 已成为最常用的基准模型之一。Meta AI 负责人表示，Llama 系列的成功证明了开源 AI 的巨大价值。`,
    sourceName: 'The Information',
    sourceUrl: 'https://www.theinformation.com/2025/01/llama-3-1-most-popular-open-source',
    publishedAt: '2025-01-08',
    tags: ['Llama', 'Meta', '开源', 'Llama 3.1'],
  },
];

/**
 * 内置新闻数据源
 * 提供预置的 AI 领域重点新闻数据，包含完整正文内容
 */
export class BuiltinNewsScraper implements NewsScraperInterface {
  name = 'builtin-news';
  source = 'Built-in AI News Dataset';

  async scrapeNews(): Promise<RawNewsItem[]> {
    return NEWS_DATA.map((entry) => ({
      title: entry.title,
      summary: entry.summary,
      content: entry.content,
      sourceName: entry.sourceName,
      sourceUrl: entry.sourceUrl,
      publishedAt: new Date(entry.publishedAt),
      tags: entry.tags,
      rawPayload: JSON.stringify({
        title: entry.title,
        summary: entry.summary,
        source: entry.sourceName,
        url: entry.sourceUrl,
        published: entry.publishedAt,
        tags: entry.tags,
      }),
    }));
  }
}
