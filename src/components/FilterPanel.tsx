'use client';

import { useState, useEffect } from 'react';
import type { FilterState } from '@/types';

interface FilterPanelProps {
  vendors: string[];
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterPanel({ vendors, onFilterChange }: FilterPanelProps) {
  const [vendor, setVendor] = useState<string | null>(null);
  const [openSource, setOpenSource] = useState<boolean | null>(null);
  const [minParams, setMinParams] = useState('');
  const [maxParams, setMaxParams] = useState('');

  useEffect(() => {
    onFilterChange({
      vendor,
      openSource,
      minParams: minParams ? parseFloat(minParams) : null,
      maxParams: maxParams ? parseFloat(maxParams) : null,
      search: '',
    });
  }, [vendor, openSource, minParams, maxParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    setVendor(null);
    setOpenSource(null);
    setMinParams('');
    setMaxParams('');
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Vendor dropdown */}
      <div className="flex flex-col gap-1">
        <label htmlFor="vendor-select" className="text-sm text-gray-600 dark:text-gray-400">
          开发商
        </label>
        <select
          id="vendor-select"
          value={vendor ?? ''}
          onChange={(e) => setVendor(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部</option>
          {vendors.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Open source toggle */}
      <div className="flex flex-col gap-1">
        <label htmlFor="opensource-select" className="text-sm text-gray-600 dark:text-gray-400">
          开源状态
        </label>
        <select
          id="opensource-select"
          value={openSource === null ? '' : openSource ? 'true' : 'false'}
          onChange={(e) => {
            const val = e.target.value;
            setOpenSource(val === '' ? null : val === 'true');
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部</option>
          <option value="true">开源</option>
          <option value="false">闭源</option>
        </select>
      </div>

      {/* Param size range */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 dark:text-gray-400">参数规模 (B)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="最小"
            aria-label="最小参数规模"
            value={minParams}
            onChange={(e) => setMinParams(e.target.value)}
            className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="最大"
            aria-label="最大参数规模"
            value={maxParams}
            onChange={(e) => setMaxParams(e.target.value)}
            className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        重置
      </button>
    </div>
  );
}
