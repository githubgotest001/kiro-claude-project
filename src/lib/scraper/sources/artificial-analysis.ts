/**
 * Artificial Analysis API 数据源
 * 文档: https://artificialanalysis.ai/documentation
 * 需要在环境变量 ARTIFICIAL_ANALYSIS_API_KEY 中配置 API key
 * 免费注册获取: https://artificialanalysis.ai/
 */
import type { Scraper, RawScrapedData } from '@/types';

const API_URL = 'https://artificialanalysis.ai/api/v2/data/llms/models';

/** API 返回的模型数据结构 */
interface AAModel {
  id: string;
  name: string;
  slug: string;
  model_creator: {
    id: string;
    name: string;
    slug: string;
  };
  evaluations: Record<string, number | null>;
  pricing?: {
    price_1m_blended_3_to_1?: number;
    price_1m_input_tokens?: number;
    price_1m_output_tokens?: number;
  };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
}

interface AAResponse {
  status: number;
  data: AAModel[];
}

/**
 * 将 Artificial Analysis 的评测指标映射到我们的维度
 */
const DIMENSION_MAP: Record<string, string> = {
  'artificial_analysis_intelligence_index': 'reasoning',
  'artificial_analysis_coding_index': 'coding',
  'artificial_analysis_math_index': 'math',
  'mmlu_pro': 'knowledge-qa',
  'gpqa': 'reasoning',
  'livecodebench': 'coding',
  'math_500': 'math',
};

/**
 * 选择每个维度最佳的指标（避免重复）
 * 优先使用综合指数，其次使用单项基准
 */
const PREFERRED_METRICS: Record<string, string> = {
  'coding': 'artificial_analysis_coding_index',
  'reasoning': 'artificial_analysis_intelligence_index',
  'math': 'artificial_analysis_math_index',
  'knowledge-qa': 'mmlu_pro',
};

export class ArtificialAnalysisScraper implements Scraper {
  name = 'artificial-analysis';
  source = 'Artificial Analysis';

  async scrape(): Promise<RawScrapedData[]> {
    const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
    if (!apiKey) {
      throw new Error('缺少 ARTIFICIAL_ANALYSIS_API_KEY 环境变量，请在 .env.local 中配置');
    }

    const res = await fetch(API_URL, {
      headers: { 'x-api-key': apiKey },
    });

    if (!res.ok) {
      throw new Error(`Artificial Analysis API 请求失败: ${res.status} ${res.statusText}`);
    }

    const json: AAResponse = await res.json();
    const scrapedAt = new Date();
    const results: RawScrapedData[] = [];

    for (const model of json.data) {
      if (!model.evaluations) continue;

      for (const [dimension, metricKey] of Object.entries(PREFERRED_METRICS)) {
        const rawScore = model.evaluations[metricKey];
        if (rawScore == null) continue;

        // 归一化分数到 0-100 范围
        // intelligence_index 和 coding_index 已经是百分制
        // mmlu_pro 等是 0-1 的比例，需要 * 100
        const score = rawScore <= 1 ? rawScore * 100 : rawScore;

        results.push({
          source: this.source,
          modelName: model.name,
          dimensionName: dimension,
          score: Math.round(score * 10) / 10,
          scrapedAt,
          rawPayload: JSON.stringify({
            model_id: model.id,
            model_name: model.name,
            creator: model.model_creator.name,
            metric: metricKey,
            raw_score: rawScore,
            pricing: model.pricing,
          }),
          modelMeta: {
            vendor: model.model_creator.name,
            openSource: isOpenSource(model.model_creator.slug),
          },
        });
      }
    }

    return results;
  }
}

/** 根据厂商判断是否开源（简单启发式） */
function isOpenSource(creatorSlug: string): boolean {
  const openSourceCreators = [
    'meta', 'mistral-ai', 'alibaba', 'deepseek', '01-ai',
    'google-deepmind', 'tii', 'cohere',
  ];
  return openSourceCreators.includes(creatorSlug);
}
