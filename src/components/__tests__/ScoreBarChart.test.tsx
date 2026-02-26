/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreBarChart from '../ScoreBarChart';
import type { Model } from '@/types';

// Mock recharts to avoid canvas/SVG issues in jsdom
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const makeModel = (id: string, name: string, scores: Record<string, number | null>): Model => ({
  id,
  name,
  vendor: 'TestVendor',
  releaseDate: null,
  paramSize: null,
  openSource: false,
  scores,
});

describe('ScoreBarChart', () => {
  it('renders "暂无数据" when no models have scores for the dimension', () => {
    const models = [
      makeModel('1', 'ModelA', { coding: null }),
      makeModel('2', 'ModelB', { reasoning: 80 }),
    ];
    render(<ScoreBarChart models={models} dimension="coding" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders "暂无数据" when models array is empty', () => {
    render(<ScoreBarChart models={[]} dimension="coding" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders the chart container when models have valid scores', () => {
    const models = [
      makeModel('1', 'GPT-4', { coding: 90 }),
      makeModel('2', 'Claude', { coding: 85 }),
    ];
    render(<ScoreBarChart models={models} dimension="coding" />);
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('excludes models with null scores for the given dimension', () => {
    const models = [
      makeModel('1', 'GPT-4', { coding: 90 }),
      makeModel('2', 'Claude', { coding: null }),
      makeModel('3', 'Llama', { coding: 75 }),
    ];
    // Should still render chart (2 valid models)
    render(<ScoreBarChart models={models} dimension="coding" />);
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
