'use client';

import type { Dimension } from '@/types';

interface DimensionSelectorProps {
  dimensions: Dimension[];
  selected: string;
  onChange: (dimension: string) => void;
}

export default function DimensionSelector({ dimensions, selected, onChange }: DimensionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="评测维度选择">
      <button
        role="tab"
        aria-selected={selected === 'composite'}
        onClick={() => onChange('composite')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selected === 'composite'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        综合排行
      </button>
      {dimensions.map((dim) => (
        <button
          key={dim.id}
          role="tab"
          aria-selected={selected === dim.name}
          onClick={() => onChange(dim.name)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === dim.name
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {dim.displayName}
        </button>
      ))}
    </div>
  );
}
