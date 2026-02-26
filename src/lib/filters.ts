import type { Model, FilterState } from "@/types";

/**
 * 解析参数规模字符串为数值（单位：十亿/Billion）
 * 例如: "175B" -> 175, "1.5T" -> 1500, "7B" -> 7, "500M" -> 0.5
 * 返回 null 表示无法解析
 */
export function parseParamSize(paramSize: string | null): number | null {
  if (paramSize == null || paramSize.trim() === "") {
    return null;
  }

  const normalized = paramSize.trim().toUpperCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([BMTK]?)$/);
  if (!match) {
    return null;
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "T":
      return value * 1000;
    case "B":
    case "":
      return value;
    case "M":
      return value / 1000;
    case "K":
      return value / 1_000_000;
    default:
      return null;
  }
}

/**
 * 根据筛选条件过滤模型列表
 * 所有条件以 AND 逻辑组合——模型必须通过所有激活的筛选条件
 * 值为 null 或空字符串的筛选条件不生效
 */
export function filterModels(models: Model[], filters: FilterState): Model[] {
  return models.filter((model) => {
    // 按开发商筛选（大小写不敏感）
    if (filters.vendor != null && filters.vendor !== "") {
      if (model.vendor.toLowerCase() !== filters.vendor.toLowerCase()) {
        return false;
      }
    }

    // 按开源状态筛选
    if (filters.openSource != null) {
      if (model.openSource !== filters.openSource) {
        return false;
      }
    }

    // 按参数规模范围筛选
    if (filters.minParams != null || filters.maxParams != null) {
      const size = parseParamSize(model.paramSize);
      if (size == null) {
        return false;
      }
      if (filters.minParams != null && size < filters.minParams) {
        return false;
      }
      if (filters.maxParams != null && size > filters.maxParams) {
        return false;
      }
    }

    // 按搜索关键词筛选（大小写不敏感，匹配模型名称子串）
    if (filters.search != null && filters.search !== "") {
      if (!model.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}
