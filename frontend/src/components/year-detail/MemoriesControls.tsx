import React from 'react';

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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/70 shadow-sm rounded-2xl px-4 py-2">
        <span className="text-sm font-medium text-gray-600">Sort by:</span>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
          className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 mr-2">View as:</span>
        <button
          onClick={() => onLayoutChange('timeline')}
          className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
            layoutStyle === 'timeline' 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v16M20 4v16M12 4v16" />
          </svg>
          Timeline
        </button>
        <button
          onClick={() => onLayoutChange('scattered')}
          className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
            layoutStyle === 'scattered' 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v16M20 4v16M8 8h12M8 12h12M8 16h12" />
          </svg>
          Scattered
        </button>
        <button
          onClick={() => onLayoutChange('masonry')}
          className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
            layoutStyle === 'masonry' 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v16M20 4v16M8 4v16M16 4v16" />
          </svg>
          Masonry
        </button>
      </div>
    </div>
  );
};

export default MemoriesControls;