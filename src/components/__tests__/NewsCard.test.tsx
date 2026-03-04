/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsCard from '../NewsCard';
import type { NewsItem } from '@/types';

// 构造测试用新闻数据
const makeNews = (overrides?: Partial<NewsItem>): NewsItem => ({
  id: 'test-1',
  title: 'GPT-5 发布：性能大幅提升',
  summary: 'OpenAI 今日发布了 GPT-5 模型，在多项基准测试中取得了显著进步。',
  sourceName: 'TechCrunch',
  sourceUrl: 'https://techcrunch.com/gpt-5-release',
  publishedAt: '2024-06-15T08:00:00.000Z',
  tags: ['GPT-5', 'OpenAI'],
  ...overrides,
});

describe('NewsCard', () => {
  it('渲染新闻标题，且标题链接指向本地详情页', () => {
    render(<NewsCard news={makeNews()} />);
    const titleLink = screen.getByRole('link', { name: /查看详情：GPT-5 发布/ });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/news/test-1');
  });

  it('渲染来源名称', () => {
    render(<NewsCard news={makeNews()} />);
    expect(screen.getByText(/来源：TechCrunch/)).toBeInTheDocument();
  });

  it('渲染格式化的中文日期', () => {
    render(<NewsCard news={makeNews()} />);
    expect(screen.getByText(/2024年6月15日/)).toBeInTheDocument();
  });

  it('使用 article 语义化标签', () => {
    render(<NewsCard news={makeNews()} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('渲染新闻摘要', () => {
    render(<NewsCard news={makeNews()} />);
    expect(screen.getByText(/OpenAI 今日发布了 GPT-5 模型/)).toBeInTheDocument();
  });

  it('渲染标签', () => {
    render(<NewsCard news={makeNews()} />);
    expect(screen.getByText('GPT-5')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('摘要为空时不渲染摘要区域', () => {
    render(<NewsCard news={makeNews({ summary: '' })} />);
    expect(screen.queryByText(/OpenAI 今日发布/)).not.toBeInTheDocument();
  });

  it('标签为空数组时不渲染标签区域', () => {
    render(<NewsCard news={makeNews({ tags: [] })} />);
    expect(screen.queryByText('GPT-5')).not.toBeInTheDocument();
  });
});
