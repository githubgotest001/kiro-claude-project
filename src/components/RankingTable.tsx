'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { RankedModel } from '@/types';

interface RankingTableProps {
  models: RankedModel[];
}

type SortKey = 'rank' | 'name' | 'vendor' | 'releaseDate' | 'paramSize' | 'openSource' | 'dimensionScore';
type SortDir = 'asc' | 'desc';

const medalIcons: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingTable({ models }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const list = [...models];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'rank':
          cmp = a.rank - b.rank;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'vendor':
          cmp = a.vendor.localeCompare(b.vendor);
          break;
        case 'releaseDate':
          cmp = (a.releaseDate ?? '').localeCompare(b.releaseDate ?? '');
          break;
        case 'paramSize':
          cmp = parseFloat(a.paramSize ?? '0') - parseFloat(b.paramSize ?? '0');
          break;
        case 'openSource':
          cmp = Number(a.openSource) - Number(b.openSource);
          break;
        case 'dimensionScore':
          cmp = (a.dimensionScore ?? -1) - (b.dimensionScore ?? -1);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [models, sortKey, sortDir]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'rank', label: '排名' },
    { key: 'name', label: '模型名称' },
    { key: 'vendor', label: '开发商' },
    { key: 'releaseDate', label: '发布日期' },
    { key: 'paramSize', label: '参数规模' },
    { key: 'openSource', label: '开源' },
    { key: 'dimensionScore', label: '评分' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left" role="table">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
                onClick={() => handleSort(col.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {col.label}{sortIndicator(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sorted.map((model) => (
            <tr
              key={model.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                model.rank <= 3 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {medalIcons[model.rank] ? (
                  <span className="mr-1">{medalIcons[model.rank]}</span>
                ) : null}
                {model.rank}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/models/${model.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {model.name}
                </Link>
              </td>
              <td className="px-4 py-3">{model.vendor}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {model.releaseDate
                  ? new Date(model.releaseDate).toLocaleDateString('zh-CN')
                  : <span className="text-gray-400">暂无数据</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {model.paramSize ?? <span className="text-gray-400">暂无数据</span>}
              </td>
              <td className="px-4 py-3">
                {model.openSource ? (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    开源
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    闭源
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-mono">
                {model.dimensionScore != null ? (
                  <span className="font-semibold">{model.dimensionScore.toFixed(1)}</span>
                ) : (
                  <span className="text-gray-400">暂无数据</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
