'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScoreLineChart from '@/components/ScoreLineChart';
import type { ModelDetail } from '@/types';

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/models/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.model) setModel(data.model);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8" role="status" aria-busy="true" aria-label="数据加载中">
          {/* Back link skeleton */}
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          {/* Info cards skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Scores skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="h-3 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-7 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !model) {
    return (
      <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">模型未找到</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回排行榜
          </Link>
        </div>
      </main>
    );
  }

  const scoreEntries = Object.entries(model.scores);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Back link */}
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          ← 返回排行榜
        </Link>

        {/* Model header */}
        <div>
          <h1 className="text-3xl font-bold">{model.name}</h1>
          {model.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">{model.description}</p>
          )}
        </div>

        {/* Basic info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <InfoCard label="开发商" value={model.vendor} />
          <InfoCard
            label="发布日期"
            value={model.releaseDate ? new Date(model.releaseDate).toLocaleDateString('zh-CN') : null}
          />
          <InfoCard label="参数规模" value={model.paramSize} />
          <InfoCard
            label="是否开源"
            value={model.openSource ? '开源' : '闭源'}
          />
          <InfoCard label="维度数" value={String(scoreEntries.length)} />
        </div>

        {/* Score cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4">评测评分</h2>
          {scoreEntries.length === 0 ? (
            <p className="text-gray-400">暂无数据</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {scoreEntries.map(([dim, score]) => (
                <div
                  key={dim}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{dim}</div>
                  <div className="text-2xl font-bold font-mono">
                    {score != null ? score.toFixed(1) : <span className="text-gray-400">暂无数据</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* History chart */}
        <section>
          <h2 className="text-xl font-semibold mb-4">历史评分变化</h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <ScoreLineChart scoreHistory={model.scoreHistory} />
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="font-medium">
        {value ?? <span className="text-gray-400">暂无数据</span>}
      </div>
    </div>
  );
}
