'use client';

import { useState } from 'react';
import NewsList from '@/components/NewsList';
import SearchBar from '@/components/SearchBar';

/**
 * AI 新闻页面
 * 展示 AI 领域最新重点新闻列表，支持关键词搜索
 */
export default function NewsPage() {
  const [keyword, setKeyword] = useState('');

  return (
    <main className="min-h-screen">
      {/* 页面头部 */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold">AI 新闻</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            围绕核心高排名 AI 模型和 AI 领域重大突破的最新资讯
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 搜索框 */}
        <SearchBar onSearch={setKeyword} />

        {/* 新闻列表 */}
        <NewsList keyword={keyword} />
      </div>
    </main>
  );
}
