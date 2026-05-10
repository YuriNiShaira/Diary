import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Key, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    invite_code: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/join/', formData);
      
      const { tokens, ...userData } = response.data;
      
      login(userData, tokens.access, tokens.refresh);
      
      toast.success(response.data.message || 'Successfully joined! 💕');
      navigate('/dashboard');
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.details) {
        const firstError = Object.values(errorData.details)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(errorData?.error || 'Failed to join couple');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100">
      {/* Background hearts */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-purple-300/20"
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
        <div className="glass-card-dark rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="text-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Heart className="w-16 h-16 text-purple-500 mx-auto fill-current" />
            </motion.div>
            
            <h1 className="text-3xl font-serif mt-3">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Join Your Partner
              </span>
            </h1>
            <p className="text-gray-600 mt-2 font-light text-sm">
              Enter the invite code from your partner
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invite Code - First because it's the most important */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <input
                  type="text"
                  name="invite_code"
                  value={formData.invite_code}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 bg-white/60 backdrop-blur-sm transition-all text-sm"
                  placeholder="Enter code from your partner"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Ask your partner for their invite code 💜
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-3 text-center">
                Create your account to join
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 bg-white/60 backdrop-blur-sm transition-all text-sm"
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
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 bg-white/60 backdrop-blur-sm transition-all text-sm"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-white/50 rounded-xl focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 bg-white/60 backdrop-blur-sm transition-all text-sm"
                  placeholder="Your first name"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining...
                </span>
              ) : (
                'Join Our Diary 💕'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-purple-500 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Want to create a new diary?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-pink-500 hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinPage;