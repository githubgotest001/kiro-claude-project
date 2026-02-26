'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CompareRadarChart from '@/components/CompareRadarChart';
import type { Model, Dimension } from '@/types';

const MAX_COMPARE = 5;
const MIN_COMPARE = 2;

export default function ComparePage() {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState('');

  // Fetch models and dimensions on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/models?pageSize=100').then((r) => r.json()),
      fetch('/api/dimensions').then((r) => r.json()),
    ])
      .then(([modelsData, dimsData]) => {
        setAllModels(modelsData.models ?? []);
        setDimensions(dimsData.dimensions ?? []);
      })
      .catch(() => {
        setAllModels([]);
        setDimensions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedModels = useMemo(
    () => allModels.filter((m) => selectedIds.includes(m.id)),
    [allModels, selectedIds]
  );

  const availableModels = useMemo(() => {
    return allModels
      .filter((m) => !selectedIds.includes(m.id))
      .filter((m) =>
        searchTerm
          ? m.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      );
  }, [allModels, selectedIds, searchTerm]);

  const addModel = (id: string) => {
    if (selectedIds.length >= MAX_COMPARE) {
      setWarning('已达到对比上限（最多 5 个模型）');
      return;
    }
    setWarning('');
    setSelectedIds((prev) => [...prev, id]);
    setSearchTerm('');
    setDropdownOpen(false);
  };

  const removeModel = (id: string) => {
    setWarning('');
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6" role="status" aria-busy="true" aria-label="数据加载中">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Back link */}
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          ← 返回排行榜
        </Link>

        <h1 className="text-3xl font-bold">模型对比</h1>

        {/* Model selection */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">选择模型</h2>

          {/* Selected model chips */}
          <div className="flex flex-wrap gap-2">
            {selectedModels.map((model) => (
              <span
                key={model.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {model.name}
                <button
                  onClick={() => removeModel(model.id)}
                  className="ml-1 hover:text-red-500 cursor-pointer"
                  aria-label={`移除 ${model.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Dropdown search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="搜索并添加模型..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dropdownOpen && availableModels.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                {availableModels.map((model) => (
                  <li key={model.id}>
                    <button
                      onClick={() => addModel(model.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className="ml-2 text-gray-400 text-xs">{model.vendor}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Warnings / hints */}
          {warning && (
            <p className="text-amber-600 dark:text-amber-400 text-sm">{warning}</p>
          )}
          {selectedIds.length < MIN_COMPARE && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              请至少选择 2 个模型进行对比
            </p>
          )}
        </section>

        {/* Comparison content - only show when >= 2 models selected */}
        {selectedIds.length >= MIN_COMPARE && (
          <>
            {/* Radar chart */}
            <section>
              <h2 className="text-xl font-semibold mb-4">雷达图对比</h2>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <CompareRadarChart models={selectedModels} dimensions={dimensions} />
              </div>
            </section>

            {/* Comparison table */}
            <section>
              <h2 className="text-xl font-semibold mb-4">详细数据对比</h2>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <th className="text-left px-4 py-3 font-semibold">维度</th>
                      {selectedModels.map((model) => (
                        <th key={model.id} className="text-center px-4 py-3 font-semibold">
                          {model.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic info rows */}
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-2 font-medium text-gray-500">开发商</td>
                      {selectedModels.map((m) => (
                        <td key={m.id} className="text-center px-4 py-2">{m.vendor}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-2 font-medium text-gray-500">参数规模</td>
                      {selectedModels.map((m) => (
                        <td key={m.id} className="text-center px-4 py-2">
                          {m.paramSize ?? <span className="text-gray-400">暂无数据</span>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-2 font-medium text-gray-500">是否开源</td>
                      {selectedModels.map((m) => (
                        <td key={m.id} className="text-center px-4 py-2">
                          {m.openSource ? '开源' : '闭源'}
                        </td>
                      ))}
                    </tr>
                    {/* Dimension score rows */}
                    {dimensions.map((dim) => {
                      const scores = selectedModels.map((m) => m.scores[dim.name] ?? null);
                      const validScores = scores.filter((s): s is number => s !== null);
                      const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;

                      return (
                        <tr key={dim.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-4 py-2 font-medium">{dim.displayName}</td>
                          {selectedModels.map((m) => {
                            const score = m.scores[dim.name];
                            const isBest = score !== null && score !== undefined && score === maxScore;
                            return (
                              <td
                                key={m.id}
                                className={`text-center px-4 py-2 font-mono ${
                                  isBest ? 'font-bold text-green-600 dark:text-green-400' : ''
                                }`}
                              >
                                {score != null ? score.toFixed(1) : <span className="text-gray-400">暂无数据</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
