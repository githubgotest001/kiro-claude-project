'use client';

const SKELETON_ROWS = 6;

const columns = [
  { width: 'w-8' },    // 排名
  { width: 'w-28' },   // 模型
  { width: 'w-20' },   // 开发商
  { width: 'w-16' },   // 参数规模
  { width: 'w-12' },   // 开源
  { width: 'w-14' },   // 评分
  { width: 'w-14' },   // 评测覆盖
];

const headerLabels = ['排名', '模型', '开发商', '参数规模', '开源', '评分', '评测覆盖'];

export default function SkeletonTable() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="数据加载中"
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs">
            <tr>
              {headerLabels.map((label) => (
                <th key={label} scope="col" className="px-4 py-3 whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: SKELETON_ROWS }, (_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div
                      className={`h-4 ${col.width} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
