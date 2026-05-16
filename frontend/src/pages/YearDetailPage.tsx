// frontend/src/pages/YearDetailPage.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Plus,
  Camera,
  Star,
  Gamepad2,
  Coffee,
  Music,
  Sparkles,
  Calendar,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import CreateMemoryModal from '../components/CreateMemoryModal';
import EditMemoryModal from '../components/EditMemoryModal';
import AnimeRatingSection from '../components/AnimeRatingSection';
import FunFactsSection from '../components/FunFactsSection';
import GamesArena from '../components/GamesArena';
import PlaylistSection from '../components/PlaylistSection';
import MemoryDetailModal from '../components/MemoryDetailModal';
import RomanticBackground from '../components/RomanticBackground';

interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image?: string;
  location?: string;
  favorite_quote?: string;
  is_favorite: boolean;
  memory_type: string;
  year: number;
}

interface Year {
  id: number;
  year: number;
  cover_image?: string;
  description?: string;
}

type TabType = 'memories' | 'funfacts' | 'anime' | 'playlist' | 'games';
type SortOrder = 'newest' | 'oldest';
type LayoutStyle = 'scattered' | 'timeline' | 'masonry';

const TimelineSkeleton = () => (
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

const EmptyMemories = ({ onCreate }: { onCreate: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20"
  >
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="inline-block mb-8"
    >
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center mx-auto shadow-xl">
        <Camera className="w-20 h-20 text-pink-400/60" />
      </div>
    </motion.div>

    <h3 className="text-4xl font-serif text-gray-800 mb-4">No memories yet</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
      Start capturing your beautiful moments together. Add your first memory to begin your love story timeline.
    </p>

    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onCreate}
      className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
    >
      Create First Memory 💕
    </motion.button>
  </motion.div>
);

const getMemoryTypeIcon = (type: string) => {
  switch (type) {
    case 'milestone': return '💫';
    case 'date': return '💕';
    case 'travel': return '✈️';
    case 'everyday': return '🌸';
    case 'special': return '✨';
    default: return '💖';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) return 'Today';
  
  const diffDays = Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Scattered Polaroid Card
const ScatteredPolaroidCard = ({ memory, index, onView, onEdit }: { memory: Memory; index: number; onView: () => void; onEdit: () => void }) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  
  const rotation = useMemo(() => {
    const rotations = [-6, -4, -2, 0, 2, 4, 6];
    return rotations[Math.floor(Math.random() * rotations.length)];
  }, [index]);
  
  const yOffset = useMemo(() => (Math.random() - 0.5) * 20, [index]);
  const scale = useMemo(() => 0.95 + Math.random() * 0.1, [index]);
  const zIndex = useMemo(() => Math.floor(Math.random() * 10) + 10, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, rotate: rotation, scale: scale, y: yOffset }}
      whileHover={{ rotate: 0, scale: 1.05, y: -10, zIndex: 50, transition: { duration: 0.2, type: 'spring', stiffness: 300 } }}
      transition={{ delay: index * 0.03, duration: 0.5, type: 'spring', stiffness: 200 }}
      className="group relative cursor-pointer"
      style={{ transformOrigin: 'center center', zIndex }}
    >
      <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 p-3 pb-6" onClick={onView}>
        <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-gradient-to-br from-pink-50 to-rose-50">
          {memory.image ? (
            <>
              <img src={memory.image} alt={memory.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100">
              <Heart className="w-16 h-16 text-pink-300/60 animate-float" />
            </div>
          )}
          
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl border-2 border-white">
              {memoryIcon}
            </div>
          </div>
          
          {memory.is_favorite && (
            <div className="absolute top-2 right-2">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 rounded-full blur-md opacity-50" />
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 shadow-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono">
            📸 {formattedDate}
          </div>
        </div>
        
        <div className="text-center px-2">
          <h3 className="font-handwriting text-xl text-gray-700 mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
            {memory.title}
          </h3>
          {memory.location && (
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-1">
              <MapPin className="w-3 h-3" /> 
              <span className="line-clamp-1">{memory.location}</span>
            </div>
          )}
          <p className="text-gray-500 text-xs mt-2 line-clamp-2 italic px-2">
            {memory.description.length > 80 ? `${memory.description.substring(0, 80)}...` : memory.description}
          </p>
          <div className="mt-2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
            click to read full story ✨
          </div>
        </div>
        
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4 text-gray-600 hover:text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </motion.button>
        </div>
        
        {index % 3 === 0 && <div className="absolute -top-1 left-4 w-12 h-6 bg-amber-200/40 rotate-[-15deg] rounded-sm blur-[1px]" />}
        {index % 5 === 0 && <div className="absolute -bottom-1 right-4 w-10 h-5 bg-amber-200/40 rotate-[10deg] rounded-sm blur-[1px]" />}
      </div>
    </motion.div>
  );
};

// Masonry Card
const MasonryCard = ({ memory, index, onView, onEdit }: { memory: Memory; index: number; onView: () => void; onEdit: () => void }) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  const heights = ['h-80', 'h-96', 'h-72', 'h-88', 'h-64', 'h-104'];
  const height = heights[index % heights.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-6 cursor-pointer"
      onClick={onView}
    >
      <div className={`${height} bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group relative border border-white/50`}>
        {memory.image ? (
          <>
            <img src={memory.image} alt={memory.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
            <Heart className="w-16 h-16 text-pink-300/60" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg mb-1">{memory.title}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{memory.description}</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs">Read more →</button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs">Edit</button>
          </div>
        </div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-rose-500 flex items-center gap-1">
            <span>{memoryIcon}</span>
          </span>
          {memory.is_favorite && (
            <span className="px-2 py-1 bg-amber-500/90 backdrop-blur rounded-full text-xs font-semibold text-white flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
            </span>
          )}
        </div>
        
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 bg-black/50 backdrop-blur rounded-full text-xs text-white">
            {formattedDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Romantic Timeline Component
const TimelineMemory = ({ memory, index, isEven, onView, onEdit }: { memory: Memory; index: number; isEven: boolean; onView: () => void; onEdit: () => void }) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  const fullDate = new Date(memory.date);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative mb-16"
    >
      {/* Timeline connection line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-pink-300 via-rose-400 to-pink-300" />
      
      {/* Date marker circle */}
      <motion.div 
        className="absolute left-1/2 transform -translate-x-1/2 -top-3 z-20"
        whileHover={{ scale: 1.2 }}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-white border-4 border-rose-400 shadow-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-rose-500" />
          </div>
          <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
        </div>
      </motion.div>
      
      {/* Month indicator */}
      <div className={`absolute ${isEven ? 'right-[52%]' : 'left-[52%]'} top-0 whitespace-nowrap`}>
        <div className="inline-block px-4 py-2 bg-rose-100/90 backdrop-blur-sm rounded-full text-sm font-semibold text-rose-600 shadow-sm border border-rose-200">
          {fullDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-12 ${isEven ? '' : ''}`}>
        {/* Content side */}
        <div className={`${isEven ? 'md:order-1' : 'md:order-2'} pl-0 md:pl-0`}>
          <div className={`max-w-lg ${isEven ? 'md:ml-auto md:pr-8' : 'md:mr-auto md:pl-8'}`}>
            {/* Memory Type Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full mb-4">
              <span className="text-lg">{memoryIcon}</span>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                {memory.memory_type}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-serif text-gray-800 mb-3 group-hover:text-rose-600 transition-colors">
              {memory.title}
            </h3>
            
            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <Clock className="w-4 h-4" />
              <span>{formattedDate}</span>
              {memory.is_favorite && (
                <>
                  <span className="mx-2">•</span>
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-amber-600">Favorite Memory</span>
                </>
              )}
            </div>
            
            {/* Location */}
            {memory.location && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-white/50 rounded-lg inline-flex">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="text-gray-600 text-sm">{memory.location}</span>
              </div>
            )}
            
            {/* Description preview */}
            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
              {memory.description}
            </p>
            
            {/* Quote if exists */}
            {memory.favorite_quote && (
              <div className="border-l-4 border-rose-300 pl-4 py-2 mb-4 bg-rose-50/50 rounded-r-lg">
                <p className="text-gray-600 text-sm italic">"{memory.favorite_quote}"</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onView}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                Read Full Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur text-gray-700 font-medium shadow-md hover:shadow-lg transition-all border border-pink-200"
              >
                Edit Memory
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Image side */}
        <div className={`${isEven ? 'md:order-2' : 'md:order-1'}`}>
          <motion.div
            whileHover={{ scale: 1.02, rotate: isEven ? 1 : -1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
            onClick={onView}
          >
            {memory.image ? (
              <>
                <img 
                  src={memory.image} 
                  alt={memory.title} 
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <Heart className="w-20 h-20 text-pink-300/60" />
              </div>
            )}
            
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-white/60 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-white/60 rounded-br-2xl" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const YearDetailPage: React.FC = () => {
  const { yearId } = useParams();
  const navigate = useNavigate();
  const timelineRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('memories');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('timeline');
  const [isCreateMemoryModalOpen, setIsCreateMemoryModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMemoryForView, setSelectedMemoryForView] = useState<Memory | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: year, isLoading: yearLoading } = useQuery<Year>({
    queryKey: ['year', yearId],
    queryFn: async () => {
      const response = await api.get(`/years/${yearId}/`);
      return response.data;
    },
    enabled: !!yearId,
  });

  const { data: memoriesData, isLoading: memoriesLoading } = useQuery<Memory[]>({
    queryKey: ['memories', yearId],
    queryFn: async () => {
      const response = await api.get(`/memories/?year=${yearId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    enabled: !!yearId && activeTab === 'memories',
  });

  const memories = useMemo(() => {
    const rawMemories = Array.isArray(memoriesData) ? memoriesData : [];
    return [...rawMemories].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [memoriesData, sortOrder]);

  const tabs = [
    { id: 'memories' as TabType, label: 'Memories', icon: Camera, color: 'from-pink-500 to-rose-500' },
    { id: 'funfacts' as TabType, label: 'Fun Facts', icon: Coffee, color: 'from-orange-500 to-amber-500' },
    { id: 'anime' as TabType, label: 'Watchlist', icon: Star, color: 'from-purple-500 to-pink-500' },
    { id: 'playlist' as TabType, label: 'Playlist', icon: Music, color: 'from-green-500 to-emerald-500' },
    { id: 'games' as TabType, label: 'Mini Games', icon: Gamepad2, color: 'from-blue-500 to-cyan-500' },
  ];

  const stats = useMemo(() => {
    if (!memories.length) return null;
    const favoriteCount = memories.filter(m => m.is_favorite).length;
    const uniqueLocations = new Set(memories.filter(m => m.location).map(m => m.location)).size;
    const monthsWithMemories = new Set(memories.map(m => new Date(m.date).getMonth())).size;
    return { favoriteCount, uniqueLocations, totalMemories: memories.length, monthsWithMemories };
  }, [memories]);

  // Group memories by month for timeline
  const memoriesByMonth = useMemo(() => {
    const grouped: { [key: string]: Memory[] } = {};
    memories.forEach(memory => {
      const date = new Date(memory.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(memory);
    });
    return grouped;
  }, [memories]);

  if (yearLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <RomanticBackground />
        <div className="text-center relative z-10">
          <Heart className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
          <p className="text-gray-600 mt-4">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (!year) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <RomanticBackground />
        <div className="text-center relative z-10">
          <Heart className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-4">Year not found</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 btn-soft">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <RomanticBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-rose-500 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-block mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shadow-lg">
                <Heart className="w-12 h-12 text-white fill-white" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-serif text-gray-800 mb-2">
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {year.year}
              </span>
            </h1>
            {year.description && (
              <p className="text-gray-600 text-lg italic">"{year.description}"</p>
            )}
          </div>
        </motion.div>

        {/* Stats Section */}
        {stats && activeTab === 'memories' && memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
              <div className="text-2xl font-bold text-rose-500">{stats.totalMemories}</div>
              <div className="text-sm text-gray-600">Total Memories</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
              <div className="text-2xl font-bold text-amber-500">{stats.favoriteCount}</div>
              <div className="text-sm text-gray-600">Favorite Moments</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
              <div className="text-2xl font-bold text-teal-500">{stats.uniqueLocations}</div>
              <div className="text-sm text-gray-600">Places Visited</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
              <div className="text-2xl font-bold text-indigo-500">{stats.monthsWithMemories}</div>
              <div className="text-sm text-gray-600">Months with Memories</div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex gap-2 p-2 bg-white/50 backdrop-blur-md rounded-2xl flex-wrap shadow-md border border-white/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-medium ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {memoriesLoading ? (
                <TimelineSkeleton />
              ) : memories.length === 0 ? (
                <EmptyMemories onCreate={() => setIsCreateMemoryModalOpen(true)} />
              ) : (
                <>
                  {/* Controls Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/70 shadow-sm rounded-2xl px-4 py-2">
                      <span className="text-sm font-medium text-gray-600">Sort by:</span>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 mr-2">View as:</span>
                      <button
                        onClick={() => setLayoutStyle('timeline')}
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
                        onClick={() => setLayoutStyle('scattered')}
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
                        onClick={() => setLayoutStyle('masonry')}
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

                  {/* Timeline Layout */}
                  {layoutStyle === 'timeline' && (
                    <div ref={timelineRef} className="relative">
                      {/* Hero intro for timeline */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12 pb-8 border-b border-pink-200"
                      >
                        <h2 className="text-2xl md:text-3xl font-serif text-gray-700 mb-3">
                          Our Love Story Timeline
                        </h2>
                        <p className="text-gray-500">
                          A journey through {memories.length} beautiful moments in {year.year}
                        </p>
                      </motion.div>
                      
                      {/* Timeline entries */}
                      <div className="relative">
                        {/* Central line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-pink-200 via-rose-300 to-pink-200 rounded-full hidden md:block" />
                        
                        {memories.map((memory, index) => (
                          <TimelineMemory
                            key={memory.id}
                            memory={memory}
                            index={index}
                            isEven={index % 2 === 0}
                            onView={() => {
                              setSelectedMemoryForView(memory);
                              setIsViewModalOpen(true);
                            }}
                            onEdit={() => {
                              setSelectedMemory(memory);
                              setIsEditModalOpen(true);
                            }}
                          />
                        ))}
                        
                        {/* End of timeline decoration */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          className="flex justify-center mt-8"
                        >
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                              <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Scattered Layout */}
                  {layoutStyle === 'scattered' && (
                    <div className="relative min-h-[600px]">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-20 right-10 w-40 h-40 bg-rose-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-12">
                        {memories.map((memory, index) => (
                          <ScatteredPolaroidCard
                            key={memory.id}
                            memory={memory}
                            index={index}
                            onView={() => {
                              setSelectedMemoryForView(memory);
                              setIsViewModalOpen(true);
                            }}
                            onEdit={() => {
                              setSelectedMemory(memory);
                              setIsEditModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Masonry Layout */}
                  {layoutStyle === 'masonry' && (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                      {memories.map((memory, index) => (
                        <MasonryCard
                          key={memory.id}
                          memory={memory}
                          index={index}
                          onView={() => {
                            setSelectedMemoryForView(memory);
                            setIsViewModalOpen(true);
                          }}
                          onEdit={() => {
                            setSelectedMemory(memory);
                            setIsEditModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Floating Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCreateMemoryModalOpen(true)}
                    className="fixed bottom-8 right-8 z-30 bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'anime' && (
            <motion.div
              key="anime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimeRatingSection yearId={parseInt(yearId!)} yearNumber={year.year} />
            </motion.div>
          )}

          {activeTab === 'funfacts' && (
            <motion.div
              key="funfacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FunFactsSection yearId={parseInt(yearId!)} yearNumber={year.year} />
            </motion.div>
          )}

          {activeTab === 'playlist' && (
            <motion.div
              key="playlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlaylistSection yearId={parseInt(yearId!)} yearNumber={year.year} />
            </motion.div>
          )}

          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GamesArena yearId={parseInt(yearId!)} yearNumber={year.year} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateMemoryModal
        isOpen={isCreateMemoryModalOpen}
        onClose={() => setIsCreateMemoryModalOpen(false)}
        yearId={parseInt(yearId!)}
      />

      <EditMemoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMemory(null);
        }}
        memory={selectedMemory}
        yearId={parseInt(yearId!)}
      />

      <MemoryDetailModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMemoryForView(null);
        }}
        memory={selectedMemoryForView}
        onEdit={(memory) => {
          setIsViewModalOpen(false);
          setSelectedMemoryForView(null);
          setSelectedMemory(memory);
          setIsEditModalOpen(true);
        }}
      />
    </div>
  );
};

export default YearDetailPage;