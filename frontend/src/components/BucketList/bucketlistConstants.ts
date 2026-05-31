import {
  MapPin,
  Heart,
  Mountain,
  Utensils,
  Book,
  Target,
  Sparkles,
} from 'lucide-react';
import type { Category } from './bucketlistTypes';

export const categories: Category[] = [
  { value: 'travel', label: '✈️ Travel', icon: MapPin, color: 'from-blue-400 to-cyan-400', darkColor: 'from-blue-600 to-cyan-600' },
  { value: 'date', label: '💕 Date Ideas', icon: Heart, color: 'from-pink-400 to-rose-400', darkColor: 'from-pink-600 to-rose-600' },
  { value: 'adventure', label: '🏔️ Adventure', icon: Mountain, color: 'from-green-400 to-emerald-400', darkColor: 'from-green-600 to-emerald-600' },
  { value: 'food', label: '🍽️ Food', icon: Utensils, color: 'from-orange-400 to-red-400', darkColor: 'from-orange-600 to-red-600' },
  { value: 'learning', label: '📚 Learn Together', icon: Book, color: 'from-purple-400 to-indigo-400', darkColor: 'from-purple-600 to-indigo-600' },
  { value: 'milestone', label: '🎯 Milestone', icon: Target, color: 'from-yellow-400 to-amber-400', darkColor: 'from-yellow-600 to-amber-600' },
  { value: 'other', label: '✨ Other', icon: Sparkles, color: 'from-gray-400 to-gray-500', darkColor: 'from-gray-600 to-gray-700' },
];
