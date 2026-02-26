// TODO: 这是模拟数据，实际生产环境应替换为真实的 HuggingFace OpenLLM Leaderboard API 调用
import type { Scraper, RawScrapedData } from '@/types';

const DIMENSIONS = ['coding', 'reasoning', 'math', 'multilingual', 'instruction-following', 'knowledge-qa'] as const;

interface MockModelEntry {
  name: string;
  vendor: string;
  releaseDate: string;
  paramSize: string;
  openSource: boolean;
  scores: Record<string, number>;
}

const MOCK_MODELS: MockModelEntry[] = [
  {
    name: 'Llama 3 70B',
    vendor: 'Meta',
    releaseDate: '2024-04-18',
    paramSize: '70B',
    openSource: true,
    scores: { coding: 82.4, reasoning: 85.1, math: 78.3, multilingual: 76.9, 'instruction-following': 84.7, 'knowledge-qa': 83.2 },
  },
  {
    name: 'Mistral Large',
    vendor: 'Mistral AI',
    releaseDate: '2024-02-26',
    paramSize: '123B',
    openSource: false,
    scores: { coding: 80.6, reasoning: 83.8, math: 79.5, multilingual: 81.2, 'instruction-following': 82.3, 'knowledge-qa': 80.9 },
  },
  {
    name: 'Qwen2 72B',
    vendor: '阿里云',
    releaseDate: '2024-06-07',
    paramSize: '72B',
    openSource: true,
    scores: { coding: 84.1, reasoning: 82.7, math: 86.4, multilingual: 88.3, 'instruction-following': 81.5, 'knowledge-qa': 82.6 },
  },
  {
    name: 'Yi-1.5 34B',
    vendor: '零一万物',
    releaseDate: '2024-05-13',
    paramSize: '34B',
    openSource: true,
    scores: { coding: 76.8, reasoning: 79.4, math: 80.2, multilingual: 83.7, 'instruction-following': 78.1, 'knowledge-qa': 77.5 },
  },
];

export class OpenLLMScraper implements Scraper {
  name = 'openllm';
  source = 'HuggingFace OpenLLM Leaderboard';

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
              task: dim,
              score,
              evaluation_date: scrapedAt.toISOString(),
              framework: 'lm-evaluation-harness',
            }),
            modelMeta: {
              vendor: model.vendor,
              releaseDate: model.releaseDate,
              paramSize: model.paramSize,
              openSource: model.openSource,
            },
          });
        }
      }
    }

    return results;
  }
}
