import React from 'react';

const TimelineSkeleton: React.FC = () => (
  <div className="space-y-12">
    {[1, 2, 3].map((i) => (
      <div key={i} className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-3">
          <div className="w-12 h-12 rounded-full bg-white/80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="bg-white/80 rounded-2xl p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-video" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default TimelineSkeleton;