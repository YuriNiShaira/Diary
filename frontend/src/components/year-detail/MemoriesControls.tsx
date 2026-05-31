import React from 'react';
import { AlignLeft, LayoutGrid, LayoutTemplate } from 'lucide-react';

interface MemoriesControlsProps {
  sortOrder: 'newest' | 'oldest';
  onSortChange: (order: 'newest' | 'oldest') => void;
  layoutStyle: 'scattered' | 'timeline' | 'masonry';
  onLayoutChange: (layout: 'scattered' | 'timeline' | 'masonry') => void;
}

const MemoriesControls: React.FC<MemoriesControlsProps> = ({
  sortOrder,
  onSortChange,
  layoutStyle,
  onLayoutChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 pb-4 border-b border-gray-200 dark:border-gray-800">
      
      {/* Sorting Control */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Sort Index</span>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
          className="bg-transparent text-sm font-serif outline-none cursor-pointer border-b border-dashed border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 pb-1 focus:border-rose-500 transition-colors"
        >
          <option value="newest" className="font-sans">Newest Entries</option>
          <option value="oldest" className="font-sans">Archived First</option>
        </select>
      </div>

      {/* View Layout Controls */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mr-2 hidden sm:block">Layout</span>
        
        <button
          onClick={() => onLayoutChange('timeline')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-2 transition-all border-b-2 -mb-4.25 ${
            layoutStyle === 'timeline'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <AlignLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Timeline</span>
        </button>
        
        <button
          onClick={() => onLayoutChange('masonry')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-2 transition-all border-b-2 -mb-4.25 ${
            layoutStyle === 'masonry'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">Masonry</span>
        </button>

        <button
          onClick={() => onLayoutChange('scattered')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-2 transition-all border-b-2 -mb-4.25 ${
            layoutStyle === 'scattered'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span className="hidden sm:inline">Scattered</span>
        </button>
      </div>
      
    </div>
  );
};

export default MemoriesControls;