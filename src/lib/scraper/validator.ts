import type { RawScrapedData, ValidatedData, DataValidator } from "@/types";

/**
 * 校验单条原始数据是否字段完整且格式正确
 */
function isValid(record: RawScrapedData): boolean {
  if (typeof record.source !== "string" || record.source.trim() === "") return false;
  if (typeof record.modelName !== "string" || record.modelName.trim() === "") return false;
  if (typeof record.dimensionName !== "string" || record.dimensionName.trim() === "") return false;
  if (typeof record.score !== "number" || !Number.isFinite(record.score)) return false;
  if (!(record.scrapedAt instanceof Date) || isNaN(record.scrapedAt.getTime())) return false;
  if (typeof record.rawPayload !== "string") return false;
  return true;
}

/**
 * 校验原始数据，过滤无效记录并添加归一化字段
 */
export function validate(data: RawScrapedData[]): ValidatedData[] {
  return data.filter(isValid).map((record) => ({
    ...record,
    normalizedModelName: record.modelName.trim().toLowerCase(),
    normalizedDimensionName: record.dimensionName.trim().toLowerCase(),
  }));
}

/**
 * 去重：基于 normalizedModelName + normalizedDimensionName + source 组合，
 * 保留 scrapedAt 最新的记录
 */
export function deduplicate(data: ValidatedData[]): ValidatedData[] {
  const map = new Map<string, ValidatedData>();

  for (const record of data) {
    const key = `${record.normalizedModelName}|${record.normalizedDimensionName}|${record.source}`;
    const existing = map.get(key);
    if (!existing || record.scrapedAt.getTime() > existing.scrapedAt.getTime()) {
      map.set(key, record);
    }
  }

  return Array.from(map.values());
}

/**
 * DataValidator 接口实现
 */
export const dataValidator: DataValidator = { validate, deduplicate };
