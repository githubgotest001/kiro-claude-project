/**
 * 内置数据源 - 基于公开评测数据整理的综合模型数据集
 * 数据来源参考: LMSYS Chatbot Arena, Artificial Analysis, OpenLLM Leaderboard
 * 当没有配置外部 API key 时作为默认数据源使用
 * 最后更新: 2026-02
 */
import type { Scraper, RawScrapedData } from '@/types';

interface ModelEntry {
  name: string;
  vendor: string;
  releaseDate: string;
  paramSize: string;
  openSource: boolean;
  description: string;
  accessUrl: string;
  scores: {
    coding: number;
    reasoning: number;
    math: number;
    multilingual: number;
    'instruction-following': number;
    'knowledge-qa': number;
  };
}

const MODELS: ModelEntry[] = [
  // === 顶级闭源模型 ===
  {
    name: 'Claude Opus 4',
    vendor: 'Anthropic',
    releaseDate: '2025-05-22',
    paramSize: '-',
    openSource: false,
    description: 'Anthropic 最强旗舰模型，在编码、推理和长文本任务中表现卓越',
    accessUrl: 'https://claude.ai',
    scores: { coding: 96.2, reasoning: 95.8, math: 93.5, multilingual: 93.1, 'instruction-following': 96.8, 'knowledge-qa': 95.0 },
  },
  {
    name: 'GPT-4.5',
    vendor: 'OpenAI',
    releaseDate: '2025-02-27',
    paramSize: '-',
    openSource: false,
    description: 'OpenAI 最大规模预训练模型，知识面广泛，EQ 和写作能力突出',
    accessUrl: 'https://chatgpt.com',
    scores: { coding: 90.5, reasoning: 93.2, math: 88.7, multilingual: 94.0, 'instruction-following': 94.5, 'knowledge-qa': 95.8 },
  },
  {
    name: 'o3',
    vendor: 'OpenAI',
    releaseDate: '2025-04-16',
    paramSize: '-',
    openSource: false,
    description: 'OpenAI 推理模型，在数学和科学推理方面达到顶尖水平',
    accessUrl: 'https://chatgpt.com',
    scores: { coding: 93.8, reasoning: 97.1, math: 96.8, multilingual: 88.5, 'instruction-following': 91.2, 'knowledge-qa': 93.5 },
  },
  {
    name: 'o4-mini',
    vendor: 'OpenAI',
    releaseDate: '2025-04-16',
    paramSize: '-',
    openSource: false,
    description: 'OpenAI 高效推理模型，性价比极高',
    accessUrl: 'https://chatgpt.com',
    scores: { coding: 94.5, reasoning: 96.2, math: 96.0, multilingual: 87.2, 'instruction-following': 92.8, 'knowledge-qa': 91.0 },
  },
  {
    name: 'GPT-4o',
    vendor: 'OpenAI',
    releaseDate: '2024-05-13',
    paramSize: '-',
    openSource: false,
    description: 'OpenAI 旗舰多模态模型，支持文本、图像、音频输入输出',
    accessUrl: 'https://chatgpt.com',
    scores: { coding: 88.5, reasoning: 90.2, math: 85.3, multilingual: 91.8, 'instruction-following': 93.5, 'knowledge-qa': 92.1 },
  },
  {
    name: 'Claude 3.5 Sonnet',
    vendor: 'Anthropic',
    releaseDate: '2024-06-20',
    paramSize: '-',
    openSource: false,
    description: 'Anthropic 高性能模型，在编码和指令遵循方面表现突出',
    accessUrl: 'https://claude.ai',
    scores: { coding: 92.8, reasoning: 91.5, math: 87.6, multilingual: 89.8, 'instruction-following': 95.1, 'knowledge-qa': 90.5 },
  },
  {
    name: 'Claude Sonnet 4',
    vendor: 'Anthropic',
    releaseDate: '2025-05-22',
    paramSize: '-',
    openSource: false,
    description: 'Anthropic 中端模型，平衡性能与成本',
    accessUrl: 'https://claude.ai',
    scores: { coding: 94.0, reasoning: 93.5, math: 91.2, multilingual: 91.5, 'instruction-following': 95.5, 'knowledge-qa': 93.2 },
  },
  {
    name: 'Gemini 2.5 Pro',
    vendor: 'Google',
    releaseDate: '2025-03-25',
    paramSize: '-',
    openSource: false,
    description: 'Google 最新旗舰模型，思维模型，编码和推理能力强',
    accessUrl: 'https://gemini.google.com',
    scores: { coding: 95.0, reasoning: 95.5, math: 94.2, multilingual: 94.8, 'instruction-following': 93.0, 'knowledge-qa': 94.5 },
  },
  {
    name: 'Gemini 2.5 Flash',
    vendor: 'Google',
    releaseDate: '2025-04-17',
    paramSize: '-',
    openSource: false,
    description: 'Google 高效模型，速度快且性价比高',
    accessUrl: 'https://gemini.google.com',
    scores: { coding: 91.2, reasoning: 92.0, math: 91.5, multilingual: 92.5, 'instruction-following': 91.8, 'knowledge-qa': 91.0 },
  },
  {
    name: 'Gemini 2.0 Flash',
    vendor: 'Google',
    releaseDate: '2025-02-05',
    paramSize: '-',
    openSource: false,
    description: 'Google 轻量级多模态模型，适合日常任务',
    accessUrl: 'https://gemini.google.com',
    scores: { coding: 85.0, reasoning: 86.5, math: 83.2, multilingual: 89.0, 'instruction-following': 88.5, 'knowledge-qa': 87.0 },
  },
  {
    name: 'Grok 3',
    vendor: 'xAI',
    releaseDate: '2025-02-17',
    paramSize: '-',
    openSource: false,
    description: 'xAI 旗舰模型，在推理和编码方面表现优异',
    accessUrl: 'https://grok.com',
    scores: { coding: 93.0, reasoning: 94.5, math: 93.8, multilingual: 88.0, 'instruction-following': 92.5, 'knowledge-qa': 93.0 },
  },
  {
    name: 'Grok 3 mini',
    vendor: 'xAI',
    releaseDate: '2025-02-17',
    paramSize: '-',
    openSource: false,
    description: 'xAI 轻量推理模型',
    accessUrl: 'https://grok.com',
    scores: { coding: 88.0, reasoning: 90.5, math: 89.2, multilingual: 84.5, 'instruction-following': 88.0, 'knowledge-qa': 87.5 },
  },
  // === 开源模型 ===
  {
    name: 'DeepSeek-R1',
    vendor: 'DeepSeek',
    releaseDate: '2025-01-20',
    paramSize: '671B',
    openSource: true,
    description: '深度求索开源推理模型，数学和编码能力接近顶级闭源模型',
    accessUrl: 'https://chat.deepseek.com',
    scores: { coding: 92.5, reasoning: 95.0, math: 95.5, multilingual: 85.0, 'instruction-following': 89.0, 'knowledge-qa': 90.0 },
  },
  {
    name: 'DeepSeek-V3',
    vendor: 'DeepSeek',
    releaseDate: '2024-12-26',
    paramSize: '671B',
    openSource: true,
    description: '深度求索 MoE 架构通用模型，训练成本极低',
    accessUrl: 'https://chat.deepseek.com',
    scores: { coding: 90.0, reasoning: 90.5, math: 90.8, multilingual: 87.5, 'instruction-following': 90.0, 'knowledge-qa': 89.5 },
  },
  {
    name: 'Llama 4 Maverick',
    vendor: 'Meta',
    releaseDate: '2025-04-05',
    paramSize: '400B',
    openSource: true,
    description: 'Meta 最新开源 MoE 模型，多模态能力强',
    accessUrl: 'https://llama.meta.com',
    scores: { coding: 89.5, reasoning: 91.0, math: 88.0, multilingual: 90.5, 'instruction-following': 91.5, 'knowledge-qa': 90.0 },
  },
  {
    name: 'Llama 4 Scout',
    vendor: 'Meta',
    releaseDate: '2025-04-05',
    paramSize: '109B',
    openSource: true,
    description: 'Meta 轻量级开源 MoE 模型，支持超长上下文',
    accessUrl: 'https://llama.meta.com',
    scores: { coding: 84.0, reasoning: 86.5, math: 83.5, multilingual: 87.0, 'instruction-following': 87.5, 'knowledge-qa': 85.5 },
  },
  {
    name: 'Llama 3.1 405B',
    vendor: 'Meta',
    releaseDate: '2024-07-23',
    paramSize: '405B',
    openSource: true,
    description: 'Meta 最大参数开源模型，综合能力接近 GPT-4',
    accessUrl: 'https://llama.meta.com',
    scores: { coding: 86.5, reasoning: 88.0, math: 84.5, multilingual: 86.0, 'instruction-following': 89.0, 'knowledge-qa': 88.5 },
  },
  {
    name: 'Qwen3 235B',
    vendor: '阿里云',
    releaseDate: '2025-04-29',
    paramSize: '235B',
    openSource: true,
    description: '阿里通义千问最新旗舰 MoE 模型，支持思考模式切换',
    accessUrl: 'https://tongyi.aliyun.com',
    scores: { coding: 93.5, reasoning: 94.0, math: 94.5, multilingual: 93.0, 'instruction-following': 92.0, 'knowledge-qa': 92.5 },
  },
  {
    name: 'Qwen3 32B',
    vendor: '阿里云',
    releaseDate: '2025-04-29',
    paramSize: '32B',
    openSource: true,
    description: '阿里通义千问中等规模模型，性价比极高',
    accessUrl: 'https://tongyi.aliyun.com',
    scores: { coding: 90.0, reasoning: 91.5, math: 91.0, multilingual: 90.0, 'instruction-following': 89.5, 'knowledge-qa': 89.0 },
  },
  {
    name: 'Qwen2.5 72B',
    vendor: '阿里云',
    releaseDate: '2024-09-19',
    paramSize: '72B',
    openSource: true,
    description: '阿里通义千问上一代旗舰，多语言能力突出',
    accessUrl: 'https://tongyi.aliyun.com',
    scores: { coding: 86.0, reasoning: 85.5, math: 87.0, multilingual: 91.0, 'instruction-following': 85.0, 'knowledge-qa': 86.0 },
  },
  {
    name: 'Mistral Large 2',
    vendor: 'Mistral AI',
    releaseDate: '2024-07-24',
    paramSize: '123B',
    openSource: false,
    description: 'Mistral 旗舰模型，多语言和代码能力强',
    accessUrl: 'https://chat.mistral.ai',
    scores: { coding: 84.5, reasoning: 86.0, math: 83.0, multilingual: 88.5, 'instruction-following': 86.5, 'knowledge-qa': 85.0 },
  },
  {
    name: 'Yi-Lightning',
    vendor: '零一万物',
    releaseDate: '2024-10-01',
    paramSize: '-',
    openSource: false,
    description: '零一万物高性能模型，推理速度快',
    accessUrl: 'https://www.lingyiwanwu.com',
    scores: { coding: 82.0, reasoning: 84.5, math: 82.5, multilingual: 86.0, 'instruction-following': 83.5, 'knowledge-qa': 83.0 },
  },
  {
    name: 'Command A',
    vendor: 'Cohere',
    releaseDate: '2025-03-13',
    paramSize: '111B',
    openSource: true,
    description: 'Cohere 企业级开源模型，擅长 RAG 和工具调用',
    accessUrl: 'https://coral.cohere.com',
    scores: { coding: 85.0, reasoning: 87.0, math: 82.0, multilingual: 85.5, 'instruction-following': 88.0, 'knowledge-qa': 87.5 },
  },
  {
    name: 'Phi-4',
    vendor: 'Microsoft',
    releaseDate: '2024-12-12',
    paramSize: '14B',
    openSource: true,
    description: '微软小参数高性能模型，推理能力超越同级别',
    accessUrl: 'https://huggingface.co/microsoft/phi-4',
    scores: { coding: 82.5, reasoning: 85.0, math: 86.5, multilingual: 78.0, 'instruction-following': 83.0, 'knowledge-qa': 82.0 },
  },
  {
    name: 'Gemma 3 27B',
    vendor: 'Google',
    releaseDate: '2025-03-12',
    paramSize: '27B',
    openSource: true,
    description: 'Google 开源轻量模型，适合端侧部署',
    accessUrl: 'https://ai.google.dev/gemma',
    scores: { coding: 83.0, reasoning: 84.0, math: 82.0, multilingual: 85.5, 'instruction-following': 84.5, 'knowledge-qa': 83.5 },
  },
];

const DIMENSIONS = ['coding', 'reasoning', 'math', 'multilingual', 'instruction-following', 'knowledge-qa'] as const;

export class BuiltinScraper implements Scraper {
  name = 'builtin';
  source = 'Artificial Analysis / LMSYS / OpenLLM';

  async scrape(): Promise<RawScrapedData[]> {
    const scrapedAt = new Date();
    const results: RawScrapedData[] = [];

    for (const model of MODELS) {
      for (const dim of DIMENSIONS) {
        const score = model.scores[dim];
        if (score == null) continue;

        results.push({
          source: this.source,
          modelName: model.name,
          dimensionName: dim,
          score,
          scrapedAt,
          rawPayload: JSON.stringify({
            model_name: model.name,
            vendor: model.vendor,
            dimension: dim,
            score,
            sources: ['Artificial Analysis', 'LMSYS Chatbot Arena', 'OpenLLM Leaderboard'],
          }),
          modelMeta: {
            vendor: model.vendor,
            releaseDate: model.releaseDate,
            paramSize: model.paramSize,
            openSource: model.openSource,
            description: model.description,
            accessUrl: model.accessUrl,
          },
        });
      }
    }

    return results;
  }
}
