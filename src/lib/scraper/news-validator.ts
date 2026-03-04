import type { RawNewsItem, ValidatedNewsItem } from "@/types";

/**
 * 校验单条原始新闻数据是否字段完整且格式正确
 *
 * 校验规则：
 * - 标题不能为空字符串
 * - 来源名称不能为空字符串
 * - 来源链接不能为空字符串，且必须以 http:// 或 https:// 开头
 * - 发布时间必须是有效日期（不是 Invalid Date）
 */
function isValidNewsItem(item: RawNewsItem): boolean {
  if (typeof item.title !== "string" || item.title.trim() === "") return false;
  if (typeof item.sourceName !== "string" || item.sourceName.trim() === "")
    return false;
  if (typeof item.sourceUrl !== "string" || item.sourceUrl.trim() === "")
    return false;
  if (!/^https?:\/\//.test(item.sourceUrl)) return false;
  if (
    !(item.publishedAt instanceof Date) ||
    isNaN(item.publishedAt.getTime())
  )
    return false;
  return true;
}

/**
 * 校验新闻数据，过滤掉不合格的记录，并添加归一化标题字段
 */
export function validateNews(data: RawNewsItem[]): ValidatedNewsItem[] {
  return data.filter(isValidNewsItem).map((item) => ({
    ...item,
    normalizedTitle: item.title.trim().toLowerCase(),
  }));
}

/**
 * 基于 sourceUrl 去重，保留第一次出现的记录
 */
export function deduplicateNews(
  data: ValidatedNewsItem[]
): ValidatedNewsItem[] {
  const seen = new Set<string>();
  const result: ValidatedNewsItem[] = [];

  for (const item of data) {
    if (!seen.has(item.sourceUrl)) {
      seen.add(item.sourceUrl);
      result.push(item);
    }
  }

  return result;
}
