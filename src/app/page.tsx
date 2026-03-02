'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import RankingTable from '@/components/RankingTable';
import DimensionSelector from '@/components/DimensionSelector';
import FilterPanel from '@/components/FilterPanel';
import SearchBar from '@/components/SearchBar';
import ScoreBarChart from '@/components/ScoreBarChart';
import SkeletonTable from '@/components/SkeletonTable';
import type { RankedModel, Dimension, FilterState } from '@/types';

export default function Home() {
  const [rankings, setRankings] = useState<RankedModel[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedDimension, setSelectedDimension] = useState('composite');
  const [filters, setFilters] = useState<FilterState>({
    vendor: null,
    openSource: null,
    minParams: null,
    maxParams: null,
    search: '',
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch dimensions on mount
  useEffect(() => {
    fetch('/api/dimensions')
      .then((res) => res.json())
      .then((data) => setDimensions(data.dimensions ?? []))
      .catch(() => setDimensions([]));
  }, []);

  // Fetch rankings when dimension changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/rankings?dimension=${encodeURIComponent(selectedDimension)}`)
      .then((res) => res.json())
      .then((data) => {
        setRankings(data.rankings ?? []);
        setLastUpdated(data.lastUpdated ?? null);
      })
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, [selectedDimension]);

  const handleDimensionChange = useCallback((dim: string) => {
    setSelectedDimension(dim);
  }, []);

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters((prev) => ({ ...prev, vendor: f.vendor, openSource: f.openSource, minParams: f.minParams, maxParams: f.maxParams }));
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setSearch(keyword);
  }, []);

  // Extract unique vendors from rankings
  const vendors = useMemo(() => {
    const set = new Set(rankings.map((m) => m.vendor));
    return Array.from(set).sort();
  }, [rankings]);

  // Client-side filtering
  const filteredModels = useMemo(() => {
    return rankings.filter((model) => {
      // Vendor filter
      if (filters.vendor && model.vendor !== filters.vendor) return false;

      // Open source filter
      if (filters.openSource !== null && model.openSource !== filters.openSource) return false;

      // Param size range filter
      if (filters.minParams != null || filters.maxParams != null) {
        const size = model.paramSize ? parseFloat(model.paramSize) : null;
        if (size == null) return false;
        if (filters.minParams != null && size < filters.minParams) return false;
        if (filters.maxParams != null && size > filters.maxParams) return false;
      }

      // Search filter
      if (search) {
        const keyword = search.toLowerCase();
        if (!model.name.toLowerCase().includes(keyword)) return false;
      }

      return true;
    });
  }, [rankings, filters, search]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">AI 大模型排行榜</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              汇聚主流 AI 大模型评测数据，多维度排行对比
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                数据更新于 {new Date(lastUpdated).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                {' · '}每 3 天自动更新，来源于公开评测平台
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Dimension selector */}
        <DimensionSelector
          dimensions={dimensions}
          selected={selectedDimension}
          onChange={handleDimensionChange}
        />

        {/* Search and filters */}
        <div className="space-y-4">
          <SearchBar onSearch={handleSearch} />
          <FilterPanel vendors={vendors} onFilterChange={handleFilterChange} />
        </div>

        {/* Table */}
        <div aria-live="polite">
          {loading ? (
            <SkeletonTable />
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              未找到匹配的模型，请调整筛选条件
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <RankingTable models={filteredModels} />
            </div>
          )}
        </div>

        {/* Bar chart for score distribution (not shown for composite) */}
        {!loading && filteredModels.length > 0 && selectedDimension !== 'composite' && (
          <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-950">
            <h2 className="text-lg font-semibold mb-4">评分分布</h2>
            <ScoreBarChart models={filteredModels} dimension={selectedDimension} />
          </section>
        )}

        {/* 数据来源 - 悬浮底部栏 */}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium text-gray-600 dark:text-gray-300">数据来源于权威公开评测平台</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <a href="https://lmarena.ai/leaderboard" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <span className="font-medium">LMSYS Chatbot Arena</span>
                <span className="text-gray-400 dark:text-gray-500 ml-1">· 百万级真人盲测投票</span>
              </a>
              <a href="https://artificialanalysis.ai/leaderboards/models" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <span className="font-medium">Artificial Analysis</span>
                <span className="text-gray-400 dark:text-gray-500 ml-1">· 独立第三方性能评测</span>
              </a>
              <a href="https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <span className="font-medium">OpenLLM Leaderboard</span>
                <span className="text-gray-400 dark:text-gray-500 ml-1">· HuggingFace 开源基准测试</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* 底部留白，避免悬浮栏遮挡内容 */}
      <div className="h-12" />
    </main>
  );
}
