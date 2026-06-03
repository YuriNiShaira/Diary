import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

interface LoveLetter {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

const floatingHearts = [
  { id: 1, left: "18%", delay: 0 },
  { id: 2, left: "32%", delay: 0.08 },
  { id: 3, left: "50%", delay: 0.16 },
  { id: 4, left: "68%", delay: 0.24 },
  { id: 5, left: "82%", delay: 0.32 },
];

const Envelope: React.FC = () => {
  const { theme } = useTheme();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const timeoutsRef = useRef<number[]>([]);

  const { data: loveLetters, isLoading, isError } = useQuery<LoveLetter[]>({
    queryKey: ["loveLetters"],
    queryFn: async () => {
      const response = await api.get("/love-letters/active/");
      return response.data;
    },
  });

  const currentLetter = useMemo(() => {
    if (!loveLetters || loveLetters.length === 0) return null;
    return loveLetters[0];
  }, [loveLetters]);

  useEffect(() => {
    return () => {
      classNameTimeoutsClean();
    };
  }, []);

  const classNameTimeoutsClean = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const handleEnvelopeClick = () => {
    if (!currentLetter || isAnimating) return;

    classNameTimeoutsClean();
    setIsAnimating(true);
    setIsEnvelopeOpen(true);

    const t1 = window.setTimeout(() => {
      setShowMagic(true);
    }, 150);

    const t2 = window.setTimeout(() => {
      setShowLetterPreview(true);
    }, 350);

    const t3 = window.setTimeout(() => {
      setShowLetterPreview(false);
      setShowModal(true);
    }, 1400);

    const t4 = window.setTimeout(() => {
      setShowMagic(false);
      setIsEnvelopeOpen(false);
      setIsAnimating(false);
    }, 1600);

    timeoutsRef.current = [t1, t2, t3, t4];
  };

  const handleClose = () => {
    setShowModal(false);
    setIsEnvelopeOpen(false);
    setShowLetterPreview(false);
    setShowMagic(false);
    setIsAnimating(false);
    classNameTimeoutsClean();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

        .paper-bg {
          background-color: #fef5e7;
          background-image: 
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 117, 91, 0.03) 2px,
              rgba(139, 117, 91, 0.03) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 117, 91, 0.02) 2px,
              rgba(139, 117, 91, 0.02) 4px
            );
          position: relative;
        }

        .paper-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' seed='2'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .letter-font {
          font-family: 'Crimson Text', serif;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .letter-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 117, 91, 0.2);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 117, 91, 0.35);
        }

        .paper-lines {
          background-image: repeating-linear-gradient(
            0deg,
            #f0e5d8 0px,
            #f0e5d8 1px,
            transparent 1px,
            transparent 28px
          );
          background-position: 0 40px;
          background-size: 100% 28px;
          background-repeat: repeat;
        }

        .wax-seal {
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 
                      0 4px 8px rgba(220, 38, 38, 0.3);
        }

        .paper-edge {
          box-shadow: 
            inset 0 0 30px rgba(139, 117, 91, 0.08),
            0 0 20px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div className="flex flex-col items-center justify-center py-12 select-none">
        <motion.button
          type="button"
          onClick={handleEnvelopeClick}
          disabled={!currentLetter || isAnimating}
          whileHover={!isAnimating ? { scale: 1.05, y: -8 } : {}}
          whileTap={!isAnimating ? { scale: 0.96 } : {}}
          className="relative h-60 w-87.5 cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-pink-400/40 rounded-4xl"
        >
          <motion.div
            animate={
              isEnvelopeOpen
                ? { y: -12, scale: 1.02, rotate: -0.5 }
                : { y: [0, -5, 0], scale: 1, rotate: 0 }
            }
            transition={
              isEnvelopeOpen
                ? { duration: 0.4, ease: "easeOut" }
                : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
            }
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Background glow */}
            <motion.div
              animate={
                isEnvelopeOpen
                  ? { opacity: 1, scale: 1.1 }
                  : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }
              }
              transition={
                isEnvelopeOpen
                  ? { duration: 0.4 }
                  : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              }
              className={`absolute inset-0 rounded-4xl blur-2xl transition-colors duration-500 ${
                theme === "dark" ? "bg-purple-500/20" : "bg-pink-400/20"
              }`}
            />

            {/* Floating particles */}
            <AnimatePresence>
              {showMagic && (
                <>
                  {floatingHearts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], y: -100, scale: [0.5, 1.2, 0.7] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, delay: item.delay, ease: "easeOut" }}
                      className="absolute top-15 z-50"
                      style={{ left: item.left }}
                    >
                      <Heart className="h-4 w-4 fill-current text-red-400 drop-shadow-sm" />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [-15, 10, 25] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="absolute left-[25%] top-16.25 z-50"
                  >
                    <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-md" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: 15 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [15, -10, -25] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute right-[25%] top-15 z-50"
                  >
                    <Sparkles className="h-4 w-4 text-red-300 drop-shadow-md" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Envelope back */}
            <div className="absolute inset-0 z-10 rounded-[30px] bg-linear-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
            <div className="absolute inset-0.5 z-12 rounded-[28px] bg-linear-to-b from-white/20 to-transparent" />

            {/* Letter preview rising from envelope */}
            <AnimatePresence>
              {showLetterPreview && currentLetter && (
                <motion.div
                  layoutId={`letter-preview-${currentLetter.id}`}
                  initial={{ y: 50, scale: 0.85, opacity: 0, rotateX: 20 }}
                  animate={{ y: -120, scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ y: -150, scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-[5%] top-11.25 z-20 w-[90%]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="paper-bg paper-edge rounded-lg overflow-hidden shadow-lg">
                    <div className="p-5">
                      <div className="flex justify-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shadow-md">
                          <Heart className="h-5 w-5 fill-red-400 text-red-500" />
                        </div>
                      </div>
                      <h3 className="letter-title text-lg text-center text-amber-900 mb-2">
                        {currentLetter.title}
                      </h3>
                      <p className="letter-font text-sm text-amber-800/70 text-center line-clamp-2 leading-relaxed">
                        {currentLetter.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Front pocket */}
            <div className="absolute bottom-0 left-0 z-30 h-35.5 w-full rounded-b-[30px] bg-linear-to-br from-rose-100 via-pink-100 to-pink-200" />

            {/* Fold highlights */}
            <div
              className="absolute bottom-0 left-0 z-32 h-35.5 w-1/2"
              style={{
                clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))",
                borderBottomLeftRadius: "30px",
              }}
            />
            <div
              className="absolute bottom-0 right-0 z-32 h-35.5 w-1/2"
              style={{
                clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)",
                background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))",
                borderBottomRightRadius: "30px",
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 z-33 h-24 w-50 -translate-x-1/2"
              style={{
                clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                background: "rgba(255,255,255,0.2)",
              }}
            />

            {/* Top flap */}
            <motion.div
              initial={false}
              animate={isEnvelopeOpen ? { rotateX: -165, y: -2 } : { rotateX: 0, y: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              className="absolute left-0 top-0 z-35 h-30.5 w-full origin-top"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <div
                className="absolute inset-0 shadow-md"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)",
                  borderTopLeftRadius: "30px",
                  borderTopRightRadius: "30px",
                }}
              />
            </motion.div>

            {/* Front message */}
            <motion.div
              animate={isEnvelopeOpen ? { opacity: 0, y: 10, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-40 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <motion.div
                  animate={!isEnvelopeOpen ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg shadow-pink-200/50 wax-seal"
                >
                  <Heart className="h-7 w-7 fill-current text-red-500" />
                </motion.div>

                <div>
                  <p className="text-lg font-semibold tracking-wide text-rose-950 letter-title">
                    {isLoading
                      ? "Unlocking thoughts..."
                      : isError
                      ? "Failed to load"
                      : currentLetter
                      ? "Open my letter 💌"
                      : "No entries yet"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-rose-900/50 letter-font">
                    {currentLetter ? "Tap to reveal" : "Create your first letter ✨"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.button>
      </div>

      {/* Modal with full letter on paper */}
      <AnimatePresence>
        {showModal && currentLetter && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/40 p-4"
            onClick={handleClose}
          >
            <motion.div
              layoutId={`letter-preview-${currentLetter.id}`}
              transition={{ type: "spring", damping: 24, stiffness: 200 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Paper letter container */}
              <div className="paper-bg paper-lines paper-edge rounded-lg shadow-2xl overflow-hidden relative">
                {/* Top red wax seal */}
                <div className="absolute top-8 right-8 z-20">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2, damping: 15 }}
                    className="h-16 w-16 rounded-full bg-linear-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg wax-seal border-2 border-red-800"
                  >
                    <Heart className="h-7 w-7 fill-red-300 text-red-200" />
                  </motion.div>
                </div>

                {/* Letter content */}
                <div className="p-10 md:p-14 min-h-150 flex flex-col">
                  {/* Top spacing */}
                  <div className="h-6" />

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="letter-title text-3xl md:text-4xl text-amber-900 text-center mb-4 tracking-widest"
                  >
                    {currentLetter.title}
                  </motion.h1>

                  {/* Decorative line */}
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-px bg-linear-to-r from-transparent via-amber-700/30 to-transparent" />
                  </div>

                  {/* Letter body */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex-1 max-h-80 overflow-y-auto custom-scrollbar"
                  >
                    <p className="letter-font text-base md:text-lg leading-8 md:leading-9 text-amber-900/80 whitespace-pre-wrap text-justify">
                      {currentLetter.content}
                    </p>
                  </motion.div>

                  {/* Bottom spacing */}
                  <div className="h-6" />

                  {/* Signature */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="border-t border-amber-700/20 pt-6 mt-8"
                  >
                    <p className="letter-font italic text-sm text-amber-800/60 text-center">
                      With endless love, ♡
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.4 }}
              onClick={handleClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-101 rounded-full p-3 bg-white/90 hover:bg-white text-amber-900 transition-colors shadow-lg"
            >
              <X className="h-6 w-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Envelope;