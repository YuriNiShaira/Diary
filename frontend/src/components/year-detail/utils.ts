// src/components/year-detail/utils.ts

export interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image?: string | null;
  location?: string;
  favorite_quote?: string;
  is_favorite: boolean;
  memory_type: string;
  year: number;
}

export type MemoryType = 'milestone' | 'date' | 'travel' | 'everyday' | 'special';

export const getMemoryTypeIcon = (type: string) => {
  switch (type) {
    case 'milestone': return '💫';
    case 'date': return '💕';
    case 'travel': return '✈️';
    case 'everyday': return '🌸';
    case 'special': return '✨';
    default: return '💖';
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) return 'Today';
  
  const diffDays = Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};