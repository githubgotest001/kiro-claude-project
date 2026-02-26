// TODO: 这是模拟数据，实际生产环境应替换为真实的官方评测报告数据抓取
import type { Scraper, RawScrapedData } from '@/types';

const DIMENSIONS = ['coding', 'reasoning', 'math', 'multilingual', 'instruction-following', 'knowledge-qa'] as const;

interface MockModelEntry {
  name: string;
  vendor: string;
  releaseDate: string;
  paramSize: string;
  openSource: boolean;
  description: string;
  scores: Record<string, number>;
}

const MOCK_MODELS: MockModelEntry[] = [
  {
    name: 'GPT-4o',
    vendor: 'OpenAI',
    releaseDate: '2024-05-13',
    paramSize: '200B',
    openSource: false,
    description: 'OpenAI 旗舰多模态模型，支持文本、图像、音频输入输出',
    scores: { coding: 91.5, reasoning: 93.8, math: 91.2, multilingual: 90.4, 'instruction-following': 94.9, 'knowledge-qa': 93.1 },
  },
  {
    name: 'Claude 3.5 Sonnet',
    vendor: 'Anthropic',
    releaseDate: '2024-06-20',
    paramSize: '175B',
    openSource: false,
    description: 'Anthropic 高性能模型，在编码和指令遵循方面表现突出',
    scores: { coding: 94.2, reasoning: 91.7, math: 87.6, multilingual: 89.8, 'instruction-following': 95.1, 'knowledge-qa': 90.5 },
  },
  {
    name: 'Gemini 1.5 Pro',
    vendor: 'Google',
    releaseDate: '2024-02-15',
    paramSize: '340B',
    openSource: false,
    description: 'Google DeepMind 多模态模型，拥有超长上下文窗口',
    scores: { coding: 88.9, reasoning: 90.6, math: 93.4, multilingual: 94.1, 'instruction-following': 91.2, 'knowledge-qa': 91.8 },
  },
  {
    name: 'Llama 3 70B',
    vendor: 'Meta',
    releaseDate: '2024-04-18',
    paramSize: '70B',
    openSource: true,
    description: 'Meta 开源大语言模型，社区生态丰富',
    scores: { coding: 81.7, reasoning: 84.3, math: 77.9, multilingual: 75.6, 'instruction-following': 83.8, 'knowledge-qa': 82.4 },
  },
];

export class OfficialScraper implements Scraper {
  name = 'official';
  source = 'Official Reports';

  async scrape(): Promise<RawScrapedData[]> {
    const scrapedAt = new Date();
    const results: RawScrapedData[] = [];

    for (const model of MOCK_MODELS) {
      for (const dim of DIMENSIONS) {
        const score = model.scores[dim];
        if (score !== undefined) {
          results.push({
            source: this.source,
            modelName: model.name,
            dimensionName: dim,
            score,
            scrapedAt,
            rawPayload: JSON.stringify({
              model_name: model.name,
              vendor: model.vendor,
              benchmark: dim,
              reported_score: score,
              report_date: scrapedAt.toISOString(),
              source_type: 'official_technical_report',
            }),
            modelMeta: {
              vendor: model.vendor,
              releaseDate: model.releaseDate,
              paramSize: model.paramSize,
              openSource: model.openSource,
              description: model.description,
            },
          });
        }
      }
    }

    return results;
  }
}
