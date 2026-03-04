import Link from 'next/link';
import type { NewsItem } from '@/types';

interface NewsCardProps {
  news: NewsItem;
}

/**
 * 新闻卡片组件
 * 点击标题跳转到本地新闻详情页，展示标题、摘要、来源、标签
 */
export default function NewsCard({ news }: NewsCardProps) {
  const formattedDate = new Date(news.publishedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 transition-shadow hover:shadow-md dark:hover:shadow-gray-800/30">
      {/* 标题 - 跳转到本地详情页 */}
      <h3 className="text-base font-semibold leading-snug mb-1.5">
        <Link
          href={`/news/${news.id}`}
          aria-label={`查看详情：${news.title}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {news.title}
        </Link>
      </h3>

      {/* 摘要 */}
      {news.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2 line-clamp-3">
          {news.summary}
        </p>
      )}

      {/* 来源和时间 */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
        <span>来源：{news.sourceName}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={news.publishedAt}>{formattedDate}</time>
      </div>

      {/* 标签 */}
      {news.tags && news.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {news.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
