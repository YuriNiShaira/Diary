import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, User, Key, Calendar, ArrowRight, BookHeart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const FloatingHeart = ({ delay = 0, x = "50%" }) => (
  <motion.div
    initial={{ y: "110vh", opacity: 0, scale: 0 }}
    animate={{ y: "-10vh", opacity: [0, 0.4, 0], scale: [0.5, 1, 0.7], x: ["-20px", "20px", "-20px"] }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: "linear" }}
    className="absolute text-pink-300/40 pointer-events-none"
    style={{ left: x }}
  >
    <Heart fill="currentColor" size={24} />
  </motion.div>
);

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', display_name: '', anniversary_date: '',
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
      const response = await api.post('/auth/register/', formData);
      const { tokens, ...userData } = response.data;
      login({ ...userData, invite_code: response.data.invite_code, has_partner: false }, tokens.access, tokens.refresh);
      toast.success(response.data.message || 'Welcome! 💕');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.details) {
        const firstError = Object.values(errorData.details)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(errorData?.error || 'Registration failed');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#fff0f5]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-pink-100/60 rounded-full blur-[110px] pointer-events-none z-0" />
      
      <div className="fixed inset-0 z-0 overflow-hidden">
        <FloatingHeart x="10%" delay={0} />
        <FloatingHeart x="85%" delay={2} />
        <FloatingHeart x="50%" delay={4} />
      </div>

      {/* --- OPEN BOOK CONTAINER --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-[400px] md:max-w-[860px] preserve-3d"
      >
        {/* The Leather Cover */}
        <div className="absolute inset-0 bg-gradient-leather rounded-2xl shadow-[0_20px_50px_rgba(131,24,67,0.3)] md:-inset-2 md:rounded-[1.5rem]" />
        
        {/* Cover Stitching Detail */}
        <div className="absolute inset-1 border border-dashed border-rose-400/20 rounded-xl md:-inset-1 md:rounded-[1.25rem] pointer-events-none hidden md:block" />

        {/* The Pages Wrapper */}
        <div className="relative flex bg-[#f5f5f5] rounded-xl md:rounded-lg shadow-inner overflow-hidden border border-gray-200/50">
          
          {/* --- LEFT PAGE (Decorative, hidden on mobile) --- */}
          <div className="hidden md:flex w-1/2 relative bg-gradient-to-r from-[#fffefc] via-[#fefdfb] to-[#eae6e1] p-10 flex-col items-center justify-center border-r border-gray-300 shadow-[inset_-15px_0_20px_rgba(0,0,0,0.04)]">
            
            {/* Page Paper Texture/Lines */}
            <div className="absolute inset-0 opacity-20 bg-page-lines mix-blend-multiply" />
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4, duration: 0.6 }} 
              className="text-center relative z-10"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
                <BookHeart className="w-10 h-10 text-rose-400 opacity-80" />
              </div>
              
              <h2 className="text-3xl font-serif text-rose-900 mb-3 tracking-wide">A New Chapter</h2>
              <div className="w-16 h-[1px] bg-rose-300/60 mx-auto my-4" />
              <p className="text-rose-700/80 text-sm italic leading-relaxed px-6 font-serif">
                "Every great love story starts with a single page. Write yours together."
              </p>
              
              <div className="mt-10 space-y-3 text-xs text-rose-500/70 uppercase tracking-widest font-semibold">
                <p className="flex items-center justify-center gap-2"><Sparkles size={12} /> Your memories await</p>
                <p className="flex items-center justify-center gap-2"><Heart size={12} /> Share with your partner</p>
              </div>
            </motion.div>
          </div>

          {/* --- CENTER SPINE CREASE (Visible only on desktop) --- */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/10 via-black/20 to-black/10 z-20 pointer-events-none" />
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-black/20 z-20 pointer-events-none" />

          {/* --- RIGHT PAGE (Registration Form) --- */}
          <div className="w-full md:w-1/2 relative bg-gradient-to-l from-[#fffefc] via-[#fefdfb] to-[#eae6e1] p-8 md:p-10 flex flex-col justify-center shadow-[inset_15px_0_20px_rgba(0,0,0,0.04)]">
            
            {/* Page Paper Texture/Lines */}
            <div className="absolute inset-0 opacity-20 bg-page-lines mix-blend-multiply" />
            
            {/* Red Margin Line (Classic notebook look) */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[1px] bg-rose-300/40" />

            <div className="relative z-10 pl-4 md:pl-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 }} 
                className="mb-6 md:mb-8"
              >
                <h1 className="text-2xl font-serif text-rose-800 font-bold tracking-wide">Begin Your Story</h1>
                <p className="text-xs text-rose-500/80 mt-1 uppercase tracking-wider font-semibold">Author Details</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-rose-800/60 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4" />
                    <input type="text" name="username" value={formData.username} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-400/20 focus:border-rose-300 font-medium shadow-inner transition-all text-sm" placeholder="Username" required />
                  </div>
                </div>

                {/* Your Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-rose-800/60 uppercase tracking-widest ml-1">Your First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4" />
                    <input type="text" name="display_name" value={formData.display_name} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-400/20 focus:border-rose-300 font-medium shadow-inner transition-all text-sm" placeholder="First Name" required />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-rose-800/60 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-400/20 focus:border-rose-300 font-medium shadow-inner transition-all text-sm" placeholder="At least 6 characters" minLength={6} required />
                  </div>
                </div>

                {/* Anniversary */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-rose-800/60 uppercase tracking-widest ml-1">Anniversary Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 w-4 h-4" />
                    <input type="date" name="anniversary_date" value={formData.anniversary_date} onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 text-gray-800 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-400/20 focus:border-rose-300 font-medium shadow-inner transition-all text-sm text-rose-900/70" required />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                      <><span>Open First Page</span><ArrowRight size={18} /></>}
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-rose-200/50" />
                  <span className="text-[10px] text-rose-400/60 uppercase tracking-widest font-semibold">Or</span>
                  <div className="flex-1 h-px bg-rose-200/50" />
                </div>
                <p className="text-xs text-rose-700/70 font-medium mt-2">
                  Already have a diary?{' '}
                  <button onClick={() => navigate('/login')} className="text-pink-600 hover:text-pink-700 font-bold hover:underline underline-offset-2 transition-colors">
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

        .bg-gradient-leather {
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.05), transparent 30%),
            linear-gradient(to bottom right, #a02052, #831843, #651034);
        }
      `}} />
    </div>
  );
};

export default RegisterPage;