import React from 'react';
import { categories } from './bucketlistConstants';

interface BucketListFiltersProps {
  theme: string | null;
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const BucketListFilters: React.FC<BucketListFiltersProps> = ({
  theme,
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}) => {
  return (
    <div className="flex gap-3 mb-6 flex-wrap items-center">
      <span className={`notebook-label text-[11px] tracking-[0.35em] ${theme === 'dark' ? '!text-rose-400' : 'text-rose-500/80'}`}>
        filter notes
      </span>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`px-4 py-3 border rounded-2xl text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
          theme === 'dark'
            ? '!bg-gray-800 !border-gray-700 !text-gray-100 color-scheme-dark'
            : '!bg-white/90 !border-rose-200 !text-slate-700 color-scheme-light'
        }`}
      >
        <option value="all" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-700'}>
          All Categories
        </option>
        {categories.map((cat) => (
          <option 
            key={cat.value} 
            value={cat.value} 
            className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-700'}
          >
            {cat.label}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`px-4 py-3 border rounded-2xl text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
          theme === 'dark'
            ? '!bg-gray-800 !border-gray-700 !text-gray-100 color-scheme-dark'
            : '!bg-white/90 !border-rose-200 !text-slate-700 color-scheme-light'
        }`}
      >
        <option value="all" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-700'}>
          All Status
        </option>
        <option value="pending" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-700'}>
          ⏳ Not Yet
        </option>
        <option value="planned" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-700'}>
          📅 Planned
        </option>
        <option value="completed" className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-700'}>
          ✅ Completed
        </option>
      </select>
    </div>
  );
};

export default BucketListFilters;