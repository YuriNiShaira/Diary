import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, PenLine } from 'lucide-react';
import RomanticBackground from '../components/RomanticBackground';

// Helper: Torn Washi Tape
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-yellow-100/70', className = '' }) => (
  <div className={`absolute -top-4 w-28 h-8 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20 ${className}`} 
       style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const HEARTS_CONFIG = [
  { id: 1, x: '10%', delay: 0, size: 24, rotate: 10 },
  { id: 2, x: '30%', delay: 2, size: 18, rotate: -15 },
  { id: 3, x: '60%', delay: 5, size: 28, rotate: 5 },
  { id: 4, x: '85%', delay: 1, size: 20, rotate: -20 },
  { id: 5, x: '45%', delay: 7, size: 16, rotate: 25 },
];

const FloatingPaperHeart = ({ delay = 0, x = '50%', size = 24, rotate = 0 }) => (
  <motion.div
    initial={{ y: '110vh', opacity: 0, rotate: rotate }}
    animate={{ y: '-10vh', opacity: [0, 0.6, 0], rotate: rotate + (Math.random() * 40 - 20) }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: 'linear' }}
    className="absolute text-rose-300/40 pointer-events-none drop-shadow-sm"
    style={{ left: x }}
  >
    <Heart fill="currentColor" size={size} />
  </motion.div>
);

const Polaroid = ({
  image,
  caption,
  rotation = -2,
  tapeColor,
  tapeRotate,
  className = '',
}: {
  image: string;
  caption: string;
  rotation?: number;
  tapeColor?: string;
  tapeRotate?: string;
  className?: string;
}) => (
  <motion.div
    className={`relative bg-white p-3 pb-10 shadow-[0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 rounded-sm cursor-pointer ${className}`}
    initial={{ rotate: rotation }}
    whileHover={{
      scale: 1.05,
      rotate: rotation > 0 ? rotation - 2 : rotation + 2,
      zIndex: 40,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    }}
  >
    <WashiTape color={tapeColor} rotate={tapeRotate} className="left-1/2 -translate-x-1/2" />
    
    <div className="overflow-hidden bg-gray-100 border border-gray-200 aspect-[4/5] w-full">
      <img
        src={image}
        alt={caption}
        className="w-full h-full object-cover filter contrast-[1.05] sepia-[.1] pointer-events-none"
      />
    </div>

    <div className="absolute bottom-3 left-0 w-full text-center px-4">
      <p className="font-handwriting text-2xl text-gray-700 opacity-90 truncate">
        {caption}
      </p>
    </div>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#faf8f5] flex items-center justify-center py-12 px-4 sm:px-6">
      <RomanticBackground />

      {/* Subtle Paper Texture Overlay for the entire desk */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Floating Paper Hearts */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {HEARTS_CONFIG.map((heart) => (
          <FloatingPaperHeart
            key={heart.id}
            x={heart.x}
            delay={heart.delay}
            size={heart.size}
            rotate={heart.rotate}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT: Scattered Polaroids */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden md:flex md:col-span-3 lg:col-span-3 flex-col items-end gap-12 pt-10"
          >
            <Polaroid
              image="/dashboard.jpg"
              caption="Our timeline"
              rotation={-6}
              tapeColor="bg-rose-100/80"
              tapeRotate="-rotate-3"
              className="w-full max-w-[240px] transform -translate-x-4"
            />

            <Polaroid
              image="/dashboard2.jpg"
              caption="Bucket list"
              rotation={4}
              tapeColor="bg-blue-100/80"
              tapeRotate="rotate-2"
              className="w-full max-w-[220px] transform translate-x-4"
            />
          </motion.div>

          {/* CENTER: The Journal Title Page */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-1 md:col-span-6 lg:col-span-6 flex justify-center relative"
          >
            {/* The physical "Card" */}
            <div className="bg-[#fffaf6] p-10 sm:p-14 w-full max-w-xl mx-auto shadow-2xl border border-gray-200 relative transform rotate-1">
              <WashiTape rotate="rotate-2" color="bg-red-100/60" className="left-1/2 -translate-x-1/2 -top-4 w-32" />
              <WashiTape rotate="-rotate-3" color="bg-amber-100/60" className="right-[-20px] top-10 w-20" />
              <WashiTape rotate="rotate-6" color="bg-blue-100/60" className="left-[-20px] bottom-20 w-16" />

              <div className="text-center relative z-10 flex flex-col items-center">
                
                {/* RESTORED LOGO WITH ELEGANT SCRAPBOOK ANIMATION */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-6 relative"
                >
                  {/* Subtle paper glow behind the logo */}
                  <div className="absolute inset-0 bg-rose-200/30 rounded-full blur-2xl" />
                  <img
                    src="/favicon.svg"
                    alt="LogOfUs"
                    className="w-20 h-20 md:w-24 md:h-24 mx-auto relative z-10"
                    style={{
                      filter: 'drop-shadow(0 8px 20px rgba(244,114,182,0.4))',
                    }}
                  />
                </motion.div>

                {/* Typography */}
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-black tracking-tighter text-gray-900 mb-2 leading-none">
                  LogOfUs
                </h1>

                <p className="text-3xl sm:text-4xl font-handwriting text-rose-600 mb-8 transform -rotate-2">
                  Your love story, beautifully documented.
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4 w-full max-w-xs mx-auto mb-8 opacity-60">
                  <div className="h-px bg-gray-400 flex-1" />
                  <Heart className="w-3 h-3 text-gray-400 fill-current" />
                  <div className="h-px bg-gray-400 flex-1" />
                </div>

                <p className="text-gray-600 font-serif text-lg leading-relaxed mb-10 px-4">
                  A shared diary for couples. Capture your memories, 
                  plan adventures, rate movies, and build your story 
                  together—one chapter at a time.
                </p>

                {/* Mobile Polaroids (Only visible on small screens) */}
                <div className="grid grid-cols-2 gap-4 mb-10 md:hidden w-full px-2">
                  <Polaroid image="/dashboard.jpg" caption="Timeline" rotation={-4} />
                  <Polaroid image="/dashboard1.jpg" caption="Calendar" rotation={3} />
                </div>

                {/* Call to Action Actions */}
                <div className="flex flex-col items-center gap-6 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')}
                    className="w-full sm:w-auto px-10 py-4 rounded-sm bg-rose-500 text-white font-handwriting text-3xl shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:bg-rose-600 hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-3"
                  >
                    <PenLine className="w-5 h-5 mb-1" />
                    Start Writing
                  </motion.button>

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2">
                    <button
                      onClick={() => navigate('/login')}
                      className="font-handwriting text-2xl text-gray-600 hover:text-gray-900 border-b border-transparent hover:border-gray-400 transition-colors flex items-center gap-2"
                    >
                      Open your diary <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <span className="hidden sm:block text-gray-300">•</span>
                    
                    <button
                      onClick={() => navigate('/join')}
                      className="font-handwriting text-2xl text-rose-500 hover:text-rose-700 border-b border-transparent hover:border-rose-300 transition-colors"
                    >
                      Have an invite code?
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* RIGHT: Scattered Polaroids */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="hidden md:flex md:col-span-3 lg:col-span-3 flex-col items-start gap-12 pt-10"
          >
            <Polaroid
              image="/dashboard1.jpg"
              caption="Shared calendar"
              rotation={5}
              tapeColor="bg-yellow-100/80"
              tapeRotate="rotate-3"
              className="w-full max-w-[240px] transform translate-x-2"
            />

            <Polaroid
              image="/dashboard3.jpg"
              caption="Watchlists"
              rotation={-5}
              tapeColor="bg-rose-100/80"
              tapeRotate="-rotate-4"
              className="w-full max-w-[220px] transform -translate-x-6"
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;