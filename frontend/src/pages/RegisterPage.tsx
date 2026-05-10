import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Calendar, User, Users, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    anniversary_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/auth/register/', formData);
    
    const { tokens, ...userData } = response.data;
    
    const fullUserData = {
      ...userData,
      invite_code: response.data.invite_code,
      has_partner: false,
    };
    
    login(fullUserData, tokens.access, tokens.refresh);
    
    toast.success(response.data.message || 'Welcome! 💕');
    navigate('/dashboard');
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.details) {
        // Show first validation error
        const firstError = Object.values(errorData.details)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(errorData?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blush via-misty-rose to-cherry-blossom">
      {/* Animated background hearts */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-love-red/20"
            initial={{ 
              y: '100vh', 
              x: `${Math.random() * 100}vw`,
              scale: 0.3 + Math.random() * 0.7
            }}
            animate={{ 
              y: '-10vh',
              rotate: 360
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          >
            <Heart className="w-12 h-12 fill-current" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-card-dark rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="text-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Heart className="w-16 h-16 text-love-red mx-auto fill-current" />
            </motion.div>
            
            <h1 className="text-3xl font-serif mt-3">
              <span className="text-gradient-love">Create Your Love Diary</span>
            </h1>
            <p className="text-gray-600 mt-2 font-light text-sm">
              Start documenting your beautiful journey together
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-love-red/30 focus:border-love-red bg-white/60 backdrop-blur-sm transition-all text-sm"
                  placeholder="yourusername"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-love-red/30 focus:border-love-red bg-white/60 backdrop-blur-sm transition-all text-sm"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-love-red/30 focus:border-love-red bg-white/60 backdrop-blur-sm transition-all text-sm"
                  placeholder="Your first name"
                  required
                />
              </div>
            </div>

            {/* Anniversary Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anniversary Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
                <input
                  type="date"
                  name="anniversary_date"
                  value={formData.anniversary_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-love-red/30 focus:border-love-red bg-white/60 backdrop-blur-sm transition-all text-sm"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                The day you two became a couple 💕
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-love-red via-romantic-red to-love-red text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                'Create Our Diary 💕'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-love-red hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;