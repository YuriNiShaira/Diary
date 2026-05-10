import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', formData);
      
      const { tokens, ...userData } = response.data;
      
      // Store user data AND tokens
      login(userData, tokens.access, tokens.refresh);
      
      toast.success(response.data.message || 'Welcome back! 💕');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.details?.non_field_errors?.[0] || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blush via-misty-rose to-cherry-blossom">
      {/* Background hearts (same as before) */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-love-red/20"
            initial={{ y: '100vh', x: `${Math.random() * 100}vw` }}
            animate={{ y: '-10vh', rotate: 360 }}
            transition={{ duration: 20 + Math.random() * 15, repeat: Infinity, delay: Math.random() * 10 }}
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
        <div className="glass-card-dark rounded-3xl p-10 shadow-2xl border border-white/30">
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Heart className="w-20 h-20 text-love-red mx-auto fill-current" />
            </motion.div>
            
            <h1 className="text-4xl font-serif mt-4">
              <span className="text-gradient-love">Our Love Story</span>
            </h1>
            <p className="text-gray-600 mt-2 font-light italic">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-love-red/50 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-love-red/30 focus:border-love-red bg-white/60 backdrop-blur-sm transition-all font-medium"
                  placeholder="yourusername"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-love-red/50 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-love-red/30 focus:border-love-red bg-white/60 backdrop-blur-sm transition-all font-medium"
                  placeholder="Your password"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-love-red via-romantic-red to-love-red text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Open Our Diary
                    <Heart className="w-4 h-4 fill-current" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-love-red hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Heart className="w-4 h-4 text-love-red/40 fill-current" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;