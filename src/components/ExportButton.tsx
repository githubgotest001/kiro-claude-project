'use client';

import { useState, useRef, useEffect } from 'react';
import type { FilterState } from '@/types';

interface ExportButtonProps {
  filters: FilterState;
  dimension: string;
}

export default function ExportButton({ filters, dimension }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function buildExportUrl(format: 'csv' | 'json'): string {
    const params = new URLSearchParams();
    params.set('format', format);
    if (filters.vendor) params.set('vendor', filters.vendor);
    if (filters.openSource !== null) params.set('openSource', String(filters.openSource));
    if (filters.minParams !== null) params.set('minParams', String(filters.minParams));
    if (filters.maxParams !== null) params.set('maxParams', String(filters.maxParams));
    if (filters.search) params.set('search', filters.search);
    if (dimension) params.set('dimension', dimension);
    return `/api/export?${params.toString()}`;
  }

  async function handleExport(format: 'csv' | 'json') {
    setLoading(true);
    setOpen(false);
    try {
      const url = buildExportUrl(format);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'ai-models-export.csv' : 'ai-models-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      // Small delay so user sees loading state briefly
      setTimeout(() => setLoading(false), 500);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {/* Download icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
        </svg>
        {loading ? '导出中...' : '导出数据'}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10"
        >
          <button
            role="menuitem"
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
          >
            导出 CSV
          </button>
          <button
            role="menuitem"
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
          >
            导出 JSON
          </button>
        </div>
      )}
    </div>
  );
}
