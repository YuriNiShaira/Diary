import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Feather } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <RomanticBackground />

      <style>{`
        /* Premium Paper Grain */
        .paper-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E");
        }
        
        /* Soft Vignette for aged edges */
        .paper-vignette {
          background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.04) 100%);
        }
        .dark .paper-vignette {
          background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%);
        }
      `}</style>
      
      <motion.div 
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.25 }}
        className="relative z-10 w-full max-w-lg filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
      >
        
        {/* Main Paper Body */}
        <div className={`relative w-full text-center p-14 sm:p-20 rounded-t-sm overflow-hidden ${
          theme === 'dark' ? 'bg-[#2a0815]' : 'bg-[#FFFAF0]'
        }`}>
          
          {/* Textures */}
          <div className="absolute inset-0 opacity-[0.05] paper-grain pointer-events-none mix-blend-multiply dark:mix-blend-overlay"></div>
          <div className="absolute inset-0 paper-vignette pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              animate={{ y: [-4, 4, -4], rotate: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-10"
            >
              <Feather className={`w-8 h-8 opacity-60 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-400'}`} />
            </motion.div>
            
            {/* Ink-bleed text shadow for the 404 */}
            <h1 
              className={`text-7xl sm:text-8xl font-serif tracking-widest mb-4 ${
                theme === 'dark' ? 'text-rose-100' : 'text-rose-950'
              }`}
              style={{ textShadow: theme === 'dark' ? '0px 2px 15px rgba(255,228,230,0.2)' : '0px 2px 15px rgba(136,19,55,0.15)' }}
            >
              404
            </h1>
            
            <div className="flex justify-center mb-8">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-70" />
            </div>

            <p className={`text-2xl font-serif italic mb-6 ${
              theme === 'dark' ? 'text-rose-300' : 'text-rose-800'
            }`}>
              This page was torn out...
            </p>
            
            <p className={`mb-14 font-serif text-sm leading-relaxed max-w-xs mx-auto tracking-wide ${
              theme === 'dark' ? 'text-rose-400/80' : 'text-rose-700/70'
            }`}>
              "Even the most beautiful love stories have a few missing pages."
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center px-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(-1)}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-serif uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 border ${
                  theme === 'dark'
                    ? 'bg-transparent border-rose-800/50 text-rose-300 hover:bg-rose-900/40 hover:border-rose-700'
                    : 'bg-transparent border-rose-200 text-rose-800 hover:bg-white hover:border-rose-300 hover:shadow-sm'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Turn Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-serif uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 border ${
                  theme === 'dark'
                    ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_5px_15px_rgba(0,0,0,0.3)]'
                    : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_5px_15px_rgba(136,19,55,0.25)]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Return Home
              </motion.button>
            </div>
          </div>
        </div>


        <div className={`w-full -mt-[1px] relative h-6 sm:h-8 ${theme === 'dark' ? 'text-[#2a0815]' : 'text-[#FFFAF0]'}`}>
          <svg viewBox="0 0 1200 40" className="w-full h-full block drop-shadow-sm" preserveAspectRatio="none">
            {/* Back layer */}
            <path 
              fill="currentColor" 
              opacity="0.4" 
              d="M0,0 L1200,0 L1200,10 C1150,25 1100,5 1050,15 C1000,25 950,0 900,20 C850,30 800,10 750,25 C700,15 650,35 600,15 C550,5 500,30 450,20 C400,10 350,25 300,5 C250,15 200,5 150,25 C100,10 50,30 0,15 Z" 
            />
            {/* Front layer  */}
            <path 
              fill="currentColor" 
              d="M0,0 L1200,0 L1200,15 C1160,20 1120,10 1080,25 C1040,15 1000,30 960,10 C920,25 880,5 840,20 C800,35 760,15 720,25 C680,10 640,30 600,20 C560,10 520,25 480,15 C440,30 400,10 360,25 C320,15 280,30 240,10 C200,25 160,5 120,20 C80,30 40,10 0,20 Z" 
            />
          </svg>
        </div>

      </motion.div>
    </div>
  );
};

export default NotFoundPage;