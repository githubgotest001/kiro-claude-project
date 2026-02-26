import type { Model, RankedModel, Dimension } from "@/types";

/**
 * 按指定维度对模型进行排行
 * - 按该维度评分降序排列
 * - 评分为 null 的模型排在末尾
 * - 从 1 开始分配排名
 */
export function rankByDimension(
  models: Model[],
  dimension: string
): RankedModel[] {
  const withScores = models.map((model) => ({
    ...model,
    dimensionScore: model.scores[dimension] ?? null,
  }));

  withScores.sort((a, b) => {
    if (a.dimensionScore === null && b.dimensionScore === null) return 0;
    if (a.dimensionScore === null) return 1;
    if (b.dimensionScore === null) return -1;
    return b.dimensionScore - a.dimensionScore;
  });

  return withScores.map((model, index) => ({
    ...model,
    rank: index + 1,
  }));
}

/**
 * 按加权平均综合分对模型进行排行
 * - 综合分 = sum(score_i * weight_i) / sum(weight_i)，仅计算非 null 评分的维度
 * - 所有维度评分均为 null 的模型排在末尾，dimensionScore 为 null
 * - 按综合分降序排列，从 1 开始分配排名
 */
export function rankByComposite(
  models: Model[],
  dimensions: Dimension[]
): RankedModel[] {
  const withScores = models.map((model) => {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const dim of dimensions) {
      const score = model.scores[dim.name];
      if (score != null) {
        weightedSum += score * dim.weight;
        totalWeight += dim.weight;
      }
    }

    const compositeScore =
      totalWeight > 0 ? weightedSum / totalWeight : null;

    return {
      ...model,
      dimensionScore: compositeScore,
    };
  });

  withScores.sort((a, b) => {
    if (a.dimensionScore === null && b.dimensionScore === null) return 0;
    if (a.dimensionScore === null) return 1;
    if (b.dimensionScore === null) return -1;
    return b.dimensionScore - a.dimensionScore;
  });

  return withScores.map((model, index) => ({
    ...model,
    rank: index + 1,
  }));
}
