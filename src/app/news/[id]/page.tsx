'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { NewsItem } from '@/types';

/**
 * 新闻详情页
 * 在本地展示新闻完整内容，底部提供原文链接
 */
export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/news/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error(res.status === 404 ? '新闻不存在' : '加载失败');
          return res.json();
        })
        .then((data) => setNews(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </main>
    );
  }

  if (error || !news) {
    return (
      <main className="min-h-screen max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error || '新闻不存在'}</p>
        <Link href="/news" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← 返回新闻列表
        </Link>
      </main>
    );
  }

  const formattedDate = new Date(news.publishedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-8">
      {/* 返回链接 */}
      <Link
        href="/news"
        className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
      >
        ← 返回新闻列表
      </Link>

      {/* 标题 */}
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
        {news.title}
      </h1>

      {/* 来源和时间 */}
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <span>来源：{news.sourceName}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={news.publishedAt}>{formattedDate}</time>
      </div>

      {/* 标签 */}
      {news.tags && news.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {news.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-sm rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 正文内容 */}
      <article className="prose dark:prose-invert max-w-none">
        {(news.content || news.summary).split('\n').map((paragraph, i) => (
          paragraph.trim() ? (
            <p key={i} className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              {paragraph}
            </p>
          ) : null
        ))}
      </article>

      {/* 原文链接 */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a
          href={news.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          查看原文 →
        </a>
      </div>
    </main>
  );
}
