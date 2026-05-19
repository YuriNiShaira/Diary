import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Key, Link, ArrowRight, MailOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import RomanticBackground from '../components/RomanticBackground';
import { useTheme } from '../contexts/ThemeContext';

const FloatingHeart = ({ delay = 0, x = "50%", theme = 'light' }) => (
  <motion.div
    initial={{ y: "110vh", opacity: 0, scale: 0 }}
    animate={{ y: "-10vh", opacity: [0, 0.4, 0], scale: [0.5, 1, 0.7], x: ["-20px", "20px", "-20px"] }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: "linear" }}
    className={`absolute pointer-events-none ${
      theme === 'dark' ? 'text-purple-500/40' : 'text-purple-300/40'
    }`}
    style={{ left: x }}
  >
    <Heart fill="currentColor" size={24} />
  </motion.div>
);

const JoinPage: React.FC = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: '', password: '', display_name: '', invite_code: '',
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
      const response = await api.post('/auth/join/', formData);
      const { tokens, ...userData } = response.data;
      login(userData, tokens.access, tokens.refresh);
      toast.success(response.data.message || 'Joined! 💕');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.details) {
        const firstError = Object.values(errorData.details)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(errorData?.error || 'Failed to join');
      }
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950'
        : 'bg-[#f5f0ff]'
    }`}>
      <RomanticBackground />
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[110px] pointer-events-none z-0 ${
        theme === 'dark' ? 'bg-purple-800/30' : 'bg-purple-200/40'
      }`} />
      
      <div className="fixed inset-0 z-0 overflow-hidden">
        <FloatingHeart x="10%" delay={0} theme={theme} />
        <FloatingHeart x="85%" delay={2} theme={theme} />
        <FloatingHeart x="50%" delay={4} theme={theme} />
      </div>

      {/* --- OPEN BOOK CONTAINER --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-[400px] md:max-w-[860px] preserve-3d"
      >
        {/* Vibrant Hardcover */}
        <div className={`absolute inset-0 rounded-2xl shadow-[0_20px_50px_rgba(139,92,246,0.4)] md:-inset-2 md:rounded-[1.5rem] ${
          theme === 'dark'
            ? 'bg-gradient-cover-purple-dark'
            : 'bg-gradient-cover-purple'
        }`} />
        
        {/* Cover Stitching/Inlay Detail */}
        <div className={`absolute inset-1 border border-dashed rounded-xl md:-inset-1 md:rounded-[1.25rem] pointer-events-none hidden md:block ${
          theme === 'dark' ? 'border-purple-500/30' : 'border-white/20'
        }`} />

        {/* The Pages Wrapper - ALWAYS WHITE/CREAM like a real book */}
        <div className="relative flex bg-[#fefdfb] rounded-xl md:rounded-lg shadow-inner overflow-hidden border border-gray-200/50">
          
          {/* --- LEFT PAGE (Decorative, hidden on mobile) --- */}
          <div className="hidden md:flex w-1/2 relative bg-gradient-to-r from-[#fffefc] via-[#fefdfb] to-[#f5f0e8] p-10 flex-col items-center justify-center border-r border-gray-200 shadow-[inset_-15px_0_20px_rgba(0,0,0,0.04)]">
            
            {/* Page Paper Texture/Lines */}
            <div className="absolute inset-0 opacity-20 bg-page-lines mix-blend-multiply" />
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4, duration: 0.6 }} 
              className="text-center relative z-10"
            >
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-100">
                <MailOpen className="w-10 h-10 text-purple-500 opacity-80" />
              </div>
              
              <h2 className="text-3xl font-serif text-purple-900 mb-3 tracking-wide">Join Their Story</h2>
              <div className="w-16 h-[1px] bg-purple-300/60 mx-auto my-4" />
              <p className="text-purple-700/80 text-sm italic leading-relaxed px-6 font-serif">
                "The best stories are written together. Accept the invitation to share your world."
              </p>
              
              <div className="mt-10 space-y-3 text-xs text-purple-500/70 uppercase tracking-widest font-semibold">
                <p className="flex items-center justify-center gap-2"><Heart size={12} /> One diary, two hearts</p>
                <p className="flex items-center justify-center gap-2"><Link size={12} /> Shared memories</p>
              </div>
            </motion.div>
          </div>

          {/* --- CENTER SPINE CREASE --- */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/5 via-black/10 to-black/5 z-20 pointer-events-none" />
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-black/10 z-20 pointer-events-none" />

          {/* --- RIGHT PAGE (Join Form) - ALWAYS WHITE/CREAM --- */}
          <div className="w-full md:w-1/2 relative bg-gradient-to-l from-[#fffefc] via-[#fefdfb] to-[#f5f0e8] p-8 md:p-10 flex flex-col justify-center shadow-[inset_15px_0_20px_rgba(0,0,0,0.04)]">
            
            {/* Page Paper Texture/Lines */}
            <div className="absolute inset-0 opacity-20 bg-page-lines mix-blend-multiply" />
            
            {/* Purple Margin Line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[1px] bg-purple-300/40" />

            <div className="relative z-10 pl-4 md:pl-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 }} 
                className="mb-6 md:mb-8"
              >
                <h1 className="text-2xl font-serif text-purple-800 font-bold tracking-wide">Join Diary</h1>
                <p className="text-xs text-purple-500/80 mt-1 uppercase tracking-wider font-semibold">Enter your partner's code</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Invite Code - Highlighted */}
                <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200 shadow-inner">
                  <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2 text-center">Secret Invite Code</label>
                  <div className="relative">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <input 
                      type="text" 
                      name="invite_code" 
                      value={formData.invite_code} 
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white text-purple-800 border border-purple-100 rounded-lg focus:ring-4 focus:ring-purple-400/20 focus:border-purple-300 font-bold shadow-sm transition-all text-center tracking-[0.3em] uppercase" 
                      placeholder="ABC123" 
                      maxLength={6} 
                      required 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 my-2 opacity-60">
                  <div className="flex-1 h-px bg-purple-200" />
                  <span className="text-[9px] text-purple-600 uppercase tracking-widest font-bold">Your Details</span>
                  <div className="flex-1 h-px bg-purple-200" />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-purple-800/60 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-400/20 focus:border-purple-300 font-medium shadow-inner transition-all text-sm" 
                      placeholder="Username" 
                      required 
                    />
                  </div>
                </div>

                {/* Your Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-purple-800/60 uppercase tracking-widest ml-1">Your First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <input 
                      type="text" 
                      name="display_name" 
                      value={formData.display_name} 
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-400/20 focus:border-purple-300 font-medium shadow-inner transition-all text-sm" 
                      placeholder="First Name" 
                      required 
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-purple-800/60 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-400/20 focus:border-purple-300 font-medium shadow-inner transition-all text-sm" 
                      placeholder="At least 6 characters" 
                      minLength={6} 
                      required 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-400 to-violet-500 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                      <><span>Accept Invitation</span><ArrowRight size={18} /></>}
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-purple-200/50" />
                  <span className="text-[10px] text-purple-400/60 uppercase tracking-widest font-semibold">Or</span>
                  <div className="flex-1 h-px bg-purple-200/50" />
                </div>
                <p className="text-xs text-purple-700/70 font-medium mt-2">
                  Already have an account?{' '}
                  <button onClick={() => navigate('/login')} className="text-purple-600 hover:text-purple-700 font-bold hover:underline underline-offset-2 transition-colors">
                    Sign in here
                  </button>
                </p>
              </div>

            </div>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d { transform-style: preserve-3d; perspective: 2000px; }
        
        .bg-page-lines {
          background-image: linear-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 100% 28px;
        }

        /* Modern Cover Gradient perfectly matched to purple-400 and violet-500 */
        .bg-gradient-cover-purple {
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.25), transparent 45%),
            linear-gradient(to bottom right, #c084fc, #a78bfa, #8b5cf6, #6d28d9);
        }
        
        /* Dark mode cover gradient */
        .bg-gradient-cover-purple-dark {
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.15), transparent 45%),
            linear-gradient(to bottom right, #7c3aed, #6d28d9, #5b21b6, #4c1d95);
        }
      `}} />
    </div>
  );
};

export default JoinPage;