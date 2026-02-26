'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import RankingTable from '@/components/RankingTable';
import DimensionSelector from '@/components/DimensionSelector';
import FilterPanel from '@/components/FilterPanel';
import SearchBar from '@/components/SearchBar';
import ScoreBarChart from '@/components/ScoreBarChart';
import ExportButton from '@/components/ExportButton';
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
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
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
                {' · '}非实时数据，通过定期抓取公开评测平台获得
              </p>
            )}
          </div>
          <ExportButton
            filters={{ ...filters, search }}
            dimension={selectedDimension}
          />
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

        {/* 数据来源 */}
        <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-950">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">数据来源</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: 'LMSYS Chatbot Arena',
                url: 'https://lmarena.ai/leaderboard',
                desc: '基于百万级真实用户投票的 Elo 排名系统',
              },
              {
                name: 'Artificial Analysis',
                url: 'https://artificialanalysis.ai/leaderboards/models',
                desc: '独立 AI 模型评测平台，覆盖 100+ 模型的智能与性能指标',
              },
              {
                name: 'OpenLLM Leaderboard',
                url: 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard',
                desc: 'HuggingFace 开源模型标准化评测基准排行榜',
              },
            ].map((src) => (
              <a
                key={src.name}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{src.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{src.desc}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
