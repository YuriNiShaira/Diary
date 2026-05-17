import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Calendar,
  LogOut,
  Home,
  ListChecks,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: ListChecks, label: 'Bucket List', path: '/bucketlist' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      // Still logout locally
    }
    logout();
    toast.success('See you soon! 💕');
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-purple-950/80 via-gray-900/80 to-purple-950/80 border-purple-800/50 shadow-purple-900/20'
          : 'bg-white/40 border-white/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Far Left */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-love-red to-romantic-red rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <h1 className={`text-xl font-serif font-bold leading-none ${
              theme === 'dark' ? 'text-purple-200' : 'text-gray-800'
            }`}>
              LogOfUs
            </h1>
            {/* ✅ DYNAMIC: Shows couple name instead of hardcoded "Shaira & Yuri" */}
            <p className={`text-[10px] leading-none mt-0.5 ${
              theme === 'dark' ? 'text-purple-300' : 'text-gray-500'
            }`}>
              {user?.couple_name || 'Loading...'} 💕
            </p>
          </div>
        </motion.div>

        {/* Navigation Links - Centered */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-r from-love-red to-romantic-red text-white shadow-md'
                    : theme === 'dark'
                    ? 'text-purple-200 hover:bg-purple-900/40'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right side actions - Far Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className={`md:hidden p-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'text-purple-300 hover:bg-purple-900/40'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'text-purple-200 hover:bg-purple-900/40'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Leave</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${
              theme === 'dark'
                ? 'border-purple-800/50 bg-gradient-to-b from-purple-950/95 to-gray-900/95'
                : 'border-white/30 bg-white/60'
            } backdrop-blur-xl`}
          >
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsNavOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                      active
                        ? 'bg-gradient-to-r from-love-red to-romantic-red text-white'
                        : theme === 'dark'
                        ? 'text-purple-200 hover:bg-purple-900/40'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  handleLogout();
                  setIsNavOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'text-purple-200 hover:bg-purple-900/40'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Leave</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;