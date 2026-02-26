'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Cell,
} from 'recharts';
import type { Model } from '@/types';

interface ScoreBarChartProps {
  models: Model[];
  dimension: string;
}

/** Map a score (0-100) to a blue intensity */
function scoreToColor(score: number): string {
  // Clamp to 0-100
  const s = Math.max(0, Math.min(100, score));
  // Interpolate lightness: low score = light blue, high score = deep blue
  const lightness = 80 - (s / 100) * 50; // 80% -> 30%
  return `hsl(217, 80%, ${lightness}%)`;
}

export default function ScoreBarChart({ models, dimension }: ScoreBarChartProps) {
  const chartData = useMemo(() => {
    return models
      .filter((m) => m.scores[dimension] != null)
      .map((m) => ({
        name: m.name,
        score: m.scores[dimension] as number,
      }))
      .sort((a, b) => b.score - a.score);
  }, [models, dimension]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">暂无数据</div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
        <Tooltip
          formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '-', '评分']}
          labelFormatter={(label: unknown) => `模型: ${label}`}
          contentStyle={{
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: '#f3f4f6',
          }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={scoreToColor(entry.score)} />
          ))}
        </Bar>
        {chartData.length > 8 && (
          <Brush
            dataKey="name"
            height={25}
            stroke="#3b82f6"
            startIndex={0}
            endIndex={Math.min(chartData.length - 1, 9)}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
