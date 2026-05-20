import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Mail, Send, ArrowLeft, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';

const ContactPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error('Please write a message');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/contact/', form);
      toast.success(response.data.message || 'Message sent! 💕');
      setSent(true);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <RomanticBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 rounded-3xl p-8 max-w-lg w-full shadow-xl border ${
          theme === 'dark'
            ? 'bg-purple-900/90 backdrop-blur-sm border-purple-700/50'
            : 'bg-white/90 backdrop-blur-sm border-white/50'
        }`}
      >
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center text-sm transition-colors ${
            theme === 'dark' ? 'text-purple-400 hover:text-purple-200' : 'text-gray-400 hover:text-gray-600'
          } mb-6`}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        {sent ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">💌</div>
            <h2 className={`text-2xl font-serif mb-2 ${
              theme === 'dark' ? 'text-purple-200' : 'text-gray-800'
            }`}>
              Message Sent!
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`}>
              We'll get back to you soon!
            </p>
            <button
              onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
              className={`text-sm ${
                theme === 'dark' ? 'text-purple-300 hover:text-purple-100' : 'text-rose-500 hover:underline'
              }`}
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className={`w-12 h-12 mx-auto mb-3 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-rose-400'
                }`} />
              </motion.div>
              <h1 className={`text-2xl font-serif ${
                theme === 'dark' ? 'text-purple-200' : 'text-gray-800'
              }`}>
                Get in Touch
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`}>
                Have a question or feedback? We'd love to hear from you!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ml-1 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-500' : 'text-gray-300'
                  }`} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all text-sm ${
                      theme === 'dark'
                        ? 'bg-purple-800/50 border-purple-700 text-purple-200 placeholder-purple-400 focus:ring-purple-500 focus:bg-purple-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-rose-300 focus:bg-white'
                    }`}
                    placeholder="Your name (optional)"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ml-1 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  Email
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-500' : 'text-gray-300'
                  }`} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all text-sm ${
                      theme === 'dark'
                        ? 'bg-purple-800/50 border-purple-700 text-purple-200 placeholder-purple-400 focus:ring-purple-500 focus:bg-purple-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-rose-300 focus:bg-white'
                    }`}
                    placeholder="your@email.com (optional)"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ml-1 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all text-sm resize-none ${
                    theme === 'dark'
                      ? 'bg-purple-800/50 border-purple-700 text-purple-200 placeholder-purple-400 focus:ring-purple-500 focus:bg-purple-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-rose-300 focus:bg-white'
                  }`}
                  placeholder="Tell us what's on your mind..."
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>

            <p className={`text-center text-xs mt-4 ${
              theme === 'dark' ? 'text-purple-400' : 'text-gray-400'
            }`}>
              Or email us directly at{' '}
              <a href="mailto:yurimauricio0404@gmail.com" className={`${
                theme === 'dark' ? 'text-purple-300 hover:text-purple-100' : 'text-rose-500 hover:underline'
              }`}>
                yurimauricio0404@gmail.com
              </a>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ContactPage;