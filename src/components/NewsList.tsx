'use client';

import { useState, useEffect, useCallback } from 'react';
import NewsCard from '@/components/NewsCard';
import Pagination from '@/components/Pagination';
import type { NewsItem } from '@/types';

const PAGE_SIZE = 12;

/** 骨架屏卡片 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="flex gap-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}

interface NewsListProps {
  keyword?: string;
}

/**
 * 新闻列表组件
 * 管理新闻数据获取、搜索过滤和分页状态
 */
export default function NewsList({ keyword = '' }: NewsListProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (keyword.trim()) {
        params.set('keyword', keyword.trim());
      }
      const res = await fetch(`/api/news?${params}`);
      if (!res.ok) throw new Error('获取新闻失败');
      const data = await res.json();
      setNews(data.news);
      setTotal(data.total);
    } catch {
      setError('加载新闻数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // keyword 变化时重置到第一页
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  // 加载中：骨架屏
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchNews}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  // 空列表
  if (news.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">暂无新闻</p>
        {keyword && <p className="text-sm">未找到与「{keyword}」相关的新闻，请尝试其他关键词</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
