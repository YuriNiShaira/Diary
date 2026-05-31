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
      <span className="notebook-label text-[11px] tracking-[0.35em] text-rose-500/80">
        filter notes
      </span>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={`px-4 py-3 border rounded-2xl text-sm shadow-sm transition-all ${
          theme === 'dark'
            ? 'bg-purple-900/30 border-purple-800/50 text-purple-200'
            : 'bg-white/90 border-rose-200 text-slate-700'
        }`}
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`px-4 py-3 border rounded-2xl text-sm shadow-sm transition-all ${
          theme === 'dark'
            ? 'bg-purple-900/30 border-purple-800/50 text-purple-200'
            : 'bg-white/90 border-rose-200 text-slate-700'
        }`}
      >
        <option value="all">All Status</option>
        <option value="pending">⏳ Not Yet</option>
        <option value="planned">📅 Planned</option>
        <option value="completed">✅ Completed</option>
      </select>
    </div>
  );
};

export default BucketListFilters;
