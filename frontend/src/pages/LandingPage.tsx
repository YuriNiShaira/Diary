import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import RomanticBackground from '../components/RomanticBackground';

const HEARTS_CONFIG = [
  { id: 1, x: '10%', delay: 0, size: 24 },
  { id: 2, x: '30%', delay: 2, size: 18 },
  { id: 3, x: '60%', delay: 5, size: 28 },
  { id: 4, x: '85%', delay: 1, size: 20 },
  { id: 5, x: '45%', delay: 7, size: 16 },
];

const FloatingHeart = ({ delay = 0, x = '50%', size = 24 }) => (
  <motion.div
    initial={{ y: '110vh', opacity: 0 }}
    animate={{ y: '-10vh', opacity: [0, 0.5, 0] }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: 'linear' }}
    className="absolute text-pink-300/40 pointer-events-none"
    style={{ left: x }}
  >
    <Heart fill="currentColor" size={size} />
  </motion.div>
);

const Polaroid = ({
  image,
  caption,
  rotation = -2,
  className = '',
}: {
  image: string;
  caption: string;
  rotation?: number;
  className?: string;
}) => (
  <motion.div
    className={`relative bg-white p-3 pb-8 shadow-xl hover:shadow-2xl border border-gray-100/60 rounded-sm cursor-pointer ${className}`}
    initial={{ rotate: rotation }}
    whileHover={{
      scale: 1.05,
      rotate: 0,
      zIndex: 40,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    }}
  >
    <div className="overflow-hidden rounded-sm bg-gray-50 aspect-[4/5] w-full">
      <img
        src={image}
        alt={caption}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>

    <p className="mt-3 font-handwriting text-xs text-gray-500 italic text-center tracking-wide">
      {caption}
    </p>

    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rotate-[2deg] bg-amber-100/75 w-14 h-4 rounded-xs" />
  </motion.div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#fff5f5] flex items-center justify-center py-12 px-4 sm:px-6">
      <RomanticBackground />

      {/* Floating Hearts */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {HEARTS_CONFIG.map((heart) => (
          <FloatingHeart
            key={heart.id}
            x={heart.x}
            delay={heart.delay}
            size={heart.size}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex md:col-span-3 flex-col items-center gap-10"
          >
            <Polaroid
              image="/dashboard.jpg"
              caption="Our memories timeline"
              rotation={-4}
              className="w-full max-w-[250px]"
            />

            <Polaroid
              image="/dashboard2.jpg"
              caption="Bucket list dreams"
              rotation={3}
              className="w-full max-w-[250px]"
            />
          </motion.div>

          {/* CENTER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="col-span-1 md:col-span-6 text-center max-w-xl mx-auto"
          >

            {/* MOVED LOGO HERE */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="mb-2"
            >
              <img
                src="/favicon.svg"
                alt="LogOfUs"
                className="w-16 h-16 md:w-20 md:h-20 mx-auto"
                style={{
                  filter:
                    'drop-shadow(0 10px 18px rgba(244,114,182,.3))',
                }}
              />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600">
                LogOfUs
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 italic mb-3">
              Your love story, beautifully documented.
            </p>

            <div className="w-16 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-rose-300 to-pink-300" />

            <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
              A shared diary for couples — capture your memories,
              plan adventures, rate movies, and build your story
              together. One chapter at a time.
            </p>

            {/* Mobile */}
            <div className="grid grid-cols-2 gap-4 mb-8 md:hidden">
              <Polaroid
                image="/dashboard.jpg"
                caption="Memories timeline"
              />

              <Polaroid
                image="/dashboard1.jpg"
                caption="Shared calendar"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Create New Diary
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 rounded-xl bg-white text-gray-700 border flex items-center justify-center gap-2"
              >
                Open Your Diary
                <ArrowRight size={18} />
              </motion.button>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Already have an invite code?{' '}
              <button
                onClick={() => navigate('/join')}
                className="text-purple-600 hover:underline"
              >
                Join your partner’s diary
              </button>
            </p>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex md:col-span-3 flex-col items-center gap-10"
          >
            <Polaroid
              image="/dashboard1.jpg"
              caption="Shared calendar view"
              rotation={4}
              className="w-full max-w-[250px]"
            />

            <Polaroid
              image="/dashboard3.jpg"
              caption="Watchlist & ratings"
              rotation={-3}
              className="w-full max-w-[250px]"
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;