// TODO: 这是模拟数据，实际生产环境应替换为真实的 LMSYS Chatbot Arena API 调用
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
    name: 'GPT-4o',
    vendor: 'OpenAI',
    releaseDate: '2024-05-13',
    paramSize: '200B',
    openSource: false,
    scores: { coding: 92.3, reasoning: 94.1, math: 90.5, multilingual: 91.8, 'instruction-following': 95.2, 'knowledge-qa': 93.7 },
  },
  {
    name: 'Claude 3.5 Sonnet',
    vendor: 'Anthropic',
    releaseDate: '2024-06-20',
    paramSize: '175B',
    openSource: false,
    scores: { coding: 93.8, reasoning: 92.5, math: 88.9, multilingual: 90.2, 'instruction-following': 94.6, 'knowledge-qa': 91.4 },
  },
  {
    name: 'Gemini 1.5 Pro',
    vendor: 'Google',
    releaseDate: '2024-02-15',
    paramSize: '340B',
    openSource: false,
    scores: { coding: 89.7, reasoning: 91.3, math: 92.1, multilingual: 93.5, 'instruction-following': 90.8, 'knowledge-qa': 92.0 },
  },
  {
    name: 'GPT-4 Turbo',
    vendor: 'OpenAI',
    releaseDate: '2024-04-09',
    paramSize: '175B',
    openSource: false,
    scores: { coding: 90.1, reasoning: 93.0, math: 89.2, multilingual: 88.5, 'instruction-following': 93.4, 'knowledge-qa': 92.8 },
  },
];

export class LMSYSScraper implements Scraper {
  name = 'lmsys';
  source = 'LMSYS Chatbot Arena';

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
              model: model.name,
              benchmark: dim,
              elo_rating: score,
              arena_rank: MOCK_MODELS.indexOf(model) + 1,
              last_updated: scrapedAt.toISOString(),
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
