'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Model, Dimension } from '@/types';

interface CompareRadarChartProps {
  models: Model[];
  dimensions: Dimension[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
];

export default function CompareRadarChart({ models, dimensions }: CompareRadarChartProps) {
  if (models.length === 0 || dimensions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">暂无数据</div>
    );
  }

  // Build chart data: one entry per dimension
  const chartData = dimensions.map((dim) => {
    const entry: Record<string, string | number | null> = {
      dimension: dim.displayName,
    };
    for (const model of models) {
      entry[model.name] = model.scores[dim.name] ?? 0;
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#374151" opacity={0.3} />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend />
        {models.map((model, i) => (
          <Radar
            key={model.id}
            name={model.name}
            dataKey={model.name}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.15}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
