'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreHistory } from '@/types';

interface ScoreLineChartProps {
  scoreHistory: ScoreHistory[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

export default function ScoreLineChart({ scoreHistory }: ScoreLineChartProps) {
  if (scoreHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">暂无数据</div>
    );
  }

  // Group by scrapedAt date, with each dimension as a key
  const dimensions = Array.from(new Set(scoreHistory.map((h) => h.dimensionName)));

  // Build chart data: one entry per unique scrapedAt, with dimension values
  const dateMap = new Map<string, Record<string, number | string>>();
  for (const entry of scoreHistory) {
    const dateKey = entry.scrapedAt.slice(0, 10); // YYYY-MM-DD
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: dateKey });
    }
    dateMap.get(dateKey)![entry.dimensionName] = entry.value;
  }

  const chartData = Array.from(dateMap.values()).sort((a, b) =>
    (a.date as string).localeCompare(b.date as string)
  );

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {dimensions.map((dim, i) => (
          <Line
            key={dim}
            type="monotone"
            dataKey={dim}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
