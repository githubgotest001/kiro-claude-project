// 共享 TypeScript 类型定义

/** 模型基本信息 */
export interface Model {
  id: string;
  name: string;
  vendor: string;
  releaseDate: string | null;
  paramSize: string | null;
  openSource: boolean;
  scores: Record<string, number | null>; // dimensionName -> score
}

/** 模型详情（含描述和历史评分） */
export interface ModelDetail extends Model {
  description: string | null;
  scoreHistory: ScoreHistory[];
}

/** 历史评分记录 */
export interface ScoreHistory {
  dimensionName: string;
  value: number;
  source: string;
  scrapedAt: string;
}

/** 带排名的模型（用于排行榜展示） */
export interface RankedModel extends Model {
  rank: number;
  dimensionScore: number | null;
}

/** 评测维度 */
export interface Dimension {
  id: string;
  name: string;
  displayName: string;
  weight: number;
}

/** 筛选状态 */
export interface FilterState {
  vendor: string | null;
  openSource: boolean | null;
  minParams: number | null;
  maxParams: number | null;
  search: string;
}

/** 原始抓取数据 */
export interface RawScrapedData {
  source: string;
  modelName: string;
  dimensionName: string;
  score: number;
  scrapedAt: Date;
  rawPayload: string;
  /** 模型元信息（可选，用于补充模型详情） */
  modelMeta?: {
    vendor?: string;
    releaseDate?: string; // ISO 日期字符串
    paramSize?: string;   // 如 "175B", "70B"
    openSource?: boolean;
    description?: string;
  };
}

/** 校验后的数据（含归一化字段） */
export interface ValidatedData extends RawScrapedData {
  normalizedModelName: string;
  normalizedDimensionName: string;
}

/** 抓取结果 */
export interface ScrapeResult {
  source: string;
  status: 'success' | 'partial' | 'error';
  recordsProcessed: number;
  errors: string[];
}

/** 导出元信息 */
export interface ExportMeta {
  exportedAt: string;
  source: string;
  filters: FilterState;
  dataLastUpdated: string;
}

/** 数据抓取器接口 */
export interface Scraper {
  name: string;
  source: string;
  scrape(): Promise<RawScrapedData[]>;
}

/** 数据校验器接口 */
export interface DataValidator {
  validate(data: RawScrapedData[]): ValidatedData[];
  deduplicate(data: ValidatedData[]): ValidatedData[];
}

/** 评分归一化接口 */
export interface ScoreNormalizer {
  normalize(rawScore: number, source: string, dimension: string): number;
}
