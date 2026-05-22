// frontend/src/pages/MemoryCalendarPage.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowLeft,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import BookModal from '../components/BookModal';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';

interface CalendarMemory {
  id: number;
  title: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  year_id: number;
  year: number;
}

interface CalendarData {
  memories: Record<string, CalendarMemory[]>;
  total_dates: number;
  total_memories: number;
}

const MemoryCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMemories, setSelectedMemories] = useState<CalendarMemory[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [isBookOpen, setIsBookOpen] = useState(false);

  // ✅ Dynamic start year from couple's anniversary
  const startYear = user?.anniversary_date
    ? new Date(user.anniversary_date).getFullYear()
    : today.getFullYear() - 5;

  // Compute adjacent months (previous and next)
  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Current month data
  const { data: calendarData, isLoading } = useQuery<CalendarData>({
    queryKey: ['calendar', currentYear, currentMonth + 1],
    queryFn: () => api.get(`/calendar/?year=${currentYear}&month=${currentMonth + 1}`).then(res => res.data),
  });

  // Previous month data (if it falls within the valid year range)
  const { data: prevCalendarData } = useQuery<CalendarData>({
    queryKey: ['calendar', prevYear, prevMonthIndex + 1],
    queryFn: () => api.get(`/calendar/?year=${prevYear}&month=${prevMonthIndex + 1}`).then(res => res.data),
    enabled: prevYear >= startYear,
  });

  // Next month data (if it doesn't go beyond today)
  const { data: nextCalendarData } = useQuery<CalendarData>({
    queryKey: ['calendar', nextYear, nextMonthIndex + 1],
    queryFn: () => api.get(`/calendar/?year=${nextYear}&month=${nextMonthIndex + 1}`).then(res => res.data),
    enabled: nextYear < today.getFullYear() || (nextYear === today.getFullYear() && nextMonthIndex <= today.getMonth()),
  });

  // Merge all available month memories into one object for the book modal
  const allMemoriesData = useMemo<Record<string, CalendarMemory[]>>(() => {
    return {
      ...(prevCalendarData?.memories || {}),
      ...(calendarData?.memories || {}),
      ...(nextCalendarData?.memories || {}),
    };
  }, [prevCalendarData, calendarData, nextCalendarData]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // ✅ Dynamic available years
  const availableYears = Array.from(
    { length: today.getFullYear() - startYear + 1 },
    (_, i) => startYear + i
  );

  const jumpToYear = (year: number) => {
    setCurrentYear(year);
    if (year === today.getFullYear()) {
      setCurrentMonth(today.getMonth());
    } else {
      setCurrentMonth(0);
    }
    setSelectedDate(null);
    setSelectedMemories([]);
    setIsBookOpen(false);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedMemories([]);
    setIsBookOpen(false);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedMemories([]);
    setIsBookOpen(false);
  };

  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasMemories = (day: number) => {
    const dateStr = getDateString(day);
    return calendarData?.memories[dateStr] && calendarData.memories[dateStr].length > 0;
  };

  const getMemoriesForDate = (day: number) => {
    const dateStr = getDateString(day);
    return calendarData?.memories[dateStr] || [];
  };

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const handleDateClick = (day: number) => {
    const dateStr = getDateString(day);
    const memories = getMemoriesForDate(day);
    if (memories.length > 0) {
      setSelectedDate(dateStr);
      setSelectedMemories(memories);
      setIsBookOpen(true);
    }
  };

  const thisMonthMemories = calendarData
    ? Object.entries(calendarData.memories)
        .sort(([a], [b]) => b.localeCompare(a))
        .flatMap(([date, memories]) => memories.map(m => ({ ...m, date })))
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <RomanticBackground />
      <Navbar />

      <div className="max-w-6xl mx-auto relative z-10 px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center transition-colors mb-4 group ${
              theme === 'dark'
                ? 'text-purple-200 hover:text-pink-400'
                : 'text-gray-600 hover:text-rose-500'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-gray-800 dark:text-purple-100 mb-2">
                <span className="text-gradient-love">Memory Calendar</span>
              </h1>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-purple-200' : 'text-gray-600'
              }`}>
                Every special day, remembered forever
              </p>
            </div>

            {/* Quick Year Switcher & View Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Year Switcher */}
              <div className={`flex items-center gap-2 p-1.5 rounded-2xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-purple-900/30 border border-purple-800/50'
                  : 'bg-white/40 border border-white/30'
              }`}>
                <button
                  onClick={() => {
                    const newYear = Math.max(startYear, currentYear - 1);
                    jumpToYear(newYear);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    theme === 'dark'
                      ? 'text-purple-300 hover:bg-purple-900/40'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                  title="Previous year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={currentYear}
                  onChange={(e) => jumpToYear(parseInt(e.target.value))}
                  className={`px-3 py-2 bg-transparent font-semibold text-lg outline-none cursor-pointer appearance-none text-center ${
                    theme === 'dark'
                      ? 'text-purple-100'
                      : 'text-gray-800'
                  }`}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year} className={`${
                      theme === 'dark'
                        ? 'bg-gray-800 text-purple-100'
                        : 'bg-white text-gray-800'
                    }`}>
                      {year}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const newYear = Math.min(today.getFullYear(), currentYear + 1);
                    jumpToYear(newYear);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    theme === 'dark'
                      ? 'text-purple-300 hover:bg-purple-900/40'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                  title="Next year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* View Toggle */}
              <div className={`flex gap-1 p-1 rounded-xl backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-purple-900/30 border border-purple-800/50'
                  : 'bg-white/40 border border-white/30'
              }`}>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${
                    viewMode === 'calendar'
                      ? 'bg-gradient-to-r from-love-red to-romantic-red text-white shadow-md'
                      : theme === 'dark'
                      ? 'text-purple-200 hover:bg-purple-900/40'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${
                    viewMode === 'timeline'
                      ? 'bg-gradient-to-r from-love-red to-romantic-red text-white shadow-md'
                      : theme === 'dark'
                      ? 'text-purple-200 hover:bg-purple-900/40'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Timeline
                </button>
              </div>
            </div>
          </div>

          {/* Year Quick Jump Pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className={`text-xs mr-1 ${
              theme === 'dark' ? 'text-purple-300' : 'text-gray-500'
            }`}>Jump to:</span>
            {availableYears.map((year) => (
              <motion.button
                key={year}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => jumpToYear(year)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentYear === year
                    ? 'bg-gradient-to-r from-love-red to-romantic-red text-white shadow-md'
                    : theme === 'dark'
                    ? 'bg-purple-900/30 text-purple-200 hover:bg-purple-800/50 border border-purple-800/50'
                    : 'bg-white/40 text-gray-600 hover:bg-white/50'
                }`}
              >
                {year}
              </motion.button>
            ))}
            {today.getFullYear() > startYear && (
              <span className={`text-xs ml-1 ${
                theme === 'dark' ? 'text-purple-300' : 'text-gray-500'
              }`}>
                ({availableYears.length} years of memories)
              </span>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
            theme === 'dark'
              ? 'bg-purple-900/30 border border-purple-800/50'
              : 'bg-white/40 border border-white/30'
          }`}>
            <CalendarIcon className="w-6 h-6 text-love-red mx-auto mb-2" />
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              {calendarData?.total_dates || 0}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Memory Days</p>
          </div>
          <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
            theme === 'dark'
              ? 'bg-purple-900/30 border border-purple-800/50'
              : 'bg-white/40 border border-white/30'
          }`}>
            <ImageIcon className="w-6 h-6 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              {calendarData?.total_memories || 0}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Total Memories</p>
          </div>
          <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
            theme === 'dark'
              ? 'bg-purple-900/30 border border-purple-800/50'
              : 'bg-white/40 border border-white/30'
          }`}>
            <Sparkles className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mx-auto mb-2" />
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              {daysInMonth}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>
              Days in {monthNames[currentMonth]}
            </p>
          </div>
          <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
            theme === 'dark'
              ? 'bg-purple-900/30 border border-purple-800/50'
              : 'bg-white/40 border border-white/30'
          }`}>
            <Heart className="w-6 h-6 text-rose-500 dark:text-rose-400 mx-auto mb-2" />
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              {calendarData
                ? Object.values(calendarData.memories)
                    .flat()
                    .filter(m => m.is_favorite).length
                : 0}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Favorites</p>
          </div>
        </motion.div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-3xl p-6 md:p-8 backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={prevMonth}
                className={`p-3 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'text-purple-300 hover:bg-purple-900/40'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className={`text-2xl md:text-3xl font-serif ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={nextMonth}
                className={`p-3 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'text-purple-300 hover:bg-purple-900/40'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    i === 0 || i === 6
                      ? 'text-love-red'
                      : theme === 'dark'
                      ? 'text-purple-200'
                      : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const hasMemory = hasMemories(day);
                const isTodayDate = isToday(day);
                const memoriesForDay = getMemoriesForDate(day);

                return (
                  <motion.button
                    key={day}
                    whileHover={hasMemory ? { scale: 1.05 } : {}}
                    whileTap={hasMemory ? { scale: 0.95 } : {}}
                    onClick={() => handleDateClick(day)}
                    disabled={!hasMemory}
                    className={`
                      relative aspect-square rounded-2xl flex flex-col items-center justify-center
                      transition-all text-lg font-semibold
                      ${hasMemory
                        ? theme === 'dark'
                          ? 'bg-purple-800/50 hover:bg-purple-700/50 text-pink-400 cursor-pointer hover:shadow-lg'
                          : 'bg-pink-100 hover:bg-pink-200 text-rose-500 cursor-pointer hover:shadow-lg'
                        : theme === 'dark'
                        ? 'text-gray-600 cursor-default'
                        : 'text-gray-400 cursor-default'
                      }
                      ${isTodayDate && hasMemory ? 'ring-2 ring-love-red ring-offset-2 dark:ring-offset-gray-900' : ''}
                    `}
                  >
                    <span className="text-2xl">{day}</span>
                    {hasMemory && (
                      <div className="flex gap-0.5 mt-1">
                        {memoriesForDay.slice(0, 3).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              theme === 'dark' ? 'bg-pink-400' : 'bg-rose-500'
                            }`}
                          />
                        ))}
                        {memoriesForDay.length > 3 && (
                          <span className={`text-xs ml-0.5 ${
                            theme === 'dark' ? 'text-pink-400' : 'text-rose-500'
                          }`}>+</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-3xl p-6 md:p-8 backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}
          >
            <h3 className={`text-2xl font-serif mb-6 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              This Month's Memories
            </h3>

            {thisMonthMemories.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className={`w-16 h-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-purple-600' : 'text-gray-300'
                }`} />
                <p className={theme === 'dark' ? 'text-purple-200' : 'text-gray-500'}>No memories this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {thisMonthMemories.map((memory: any, index: number) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-4 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all backdrop-blur-sm ${
                      theme === 'dark'
                        ? 'bg-purple-900/30 border border-purple-800/50 hover:bg-purple-800/40'
                        : 'bg-white/40 border border-white/30 hover:bg-white/50'
                    }`}
                    onClick={() => navigate(`/year/${memory.year_id}`)}
                  >
                    <div className="text-center min-w-15">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-pink-400' : 'text-rose-500'}`}>
                        {new Date(memory.date + 'T00:00:00').getDate()}
                      </p>
                      <p className={`text-xs uppercase ${
                        theme === 'dark' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-semibold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
                        {memory.title}
                      </h5>
                      <p className={`text-sm line-clamp-1 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-500'}`}>
                        {memory.description}
                      </p>
                    </div>
                    {memory.image && (
                      <img
                        src={memory.image}
                        alt={memory.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-love-red border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* BookModal – now receives the merged allMemoriesData */}
      <BookModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        date={selectedDate || ''}
        memories={selectedMemories}
        allMemories={allMemoriesData}
        onNavigate={(yearId) => navigate(`/year/${yearId}`)}
        onDateChange={(newDate) => {
          setSelectedDate(newDate);
          setTimeout(() => {
            setSelectedMemories(allMemoriesData[newDate] || []);
          }, 50);
        }}
      />
    </div>
  );
};

export default MemoryCalendarPage;