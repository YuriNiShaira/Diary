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

  // Clean up timeouts on unmount to prevent memory leaks
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
      // Smoothly cross-fade from preview inline state into open modal state
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
    // Reset all internal states seamlessly
    setIsEnvelopeOpen(false);
    setShowLetterPreview(false);
    setShowMagic(false);
    setIsAnimating(false);
    classNameTimeoutsClean();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-12 select-none">
        <motion.button
          type="button"
          onClick={handleEnvelopeClick}
          disabled={!currentLetter || isAnimating}
          whileHover={!isAnimating ? { scale: 1.04, y: -8 } : {}}
          whileTap={!isAnimating ? { scale: 0.98 } : {}}
          className="relative h-[240px] w-[350px] cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-pink-400/40 rounded-[32px]"
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
              className={`absolute inset-0 rounded-[32px] blur-2xl transition-colors duration-500 ${
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
                      className="absolute top-[60px] z-50"
                      style={{ left: item.left }}
                    >
                      <Heart className="h-4 w-4 fill-current text-pink-400 drop-shadow-sm" />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [-15, 10, 25] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="absolute left-[25%] top-[65px] z-50"
                  >
                    <Sparkles className="h-5 w-5 text-yellow-300 drop-shadow-md" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: 15 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [15, -10, -25] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute right-[25%] top-[60px] z-50"
                  >
                    <Sparkles className="h-4 w-4 text-pink-200 drop-shadow-md" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ================= LAYER 1: BACK FLAP & MAIN BODY BODY ================= */}
            <div className="absolute inset-0 z-10 rounded-[30px] bg-gradient-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
            <div className="absolute inset-[2px] z-12 rounded-[28px] bg-gradient-to-b from-white/20 to-transparent" />

            {/* ================= LAYER 2: LETTER PREVIEW (EMERGES FROM INSIDE) ================= */}
            <AnimatePresence>
              {showLetterPreview && currentLetter && (
                <motion.div
                  layoutId={`letter-card-container-${currentLetter.id}`}
                  initial={{ y: 40, scale: 0.9, opacity: 0 }}
                  animate={{ y: -115, scale: 1, opacity: 1, rotate: -1.5 }}
                  exit={{ y: -140, scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-[7.5%] top-[40px] z-20 w-[85%]"
                >
                  <div
                    className={`rounded-[20px] border shadow-[0_20px_40px_rgba(15,23,42,0.12)] ${
                      theme === "dark"
                        ? "border-purple-500/40 bg-gradient-to-b from-purple-900/95 to-purple-800/95 shadow-purple-950/50"
                        : "border-rose-100 bg-gradient-to-b from-white to-rose-50/95"
                    } p-5 text-left`}
                  >
                    <div className="mb-2 flex justify-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        theme === "dark" ? "bg-purple-800" : "bg-pink-100"
                      }`}>
                        <Heart className={`h-4 w-4 fill-current ${theme === "dark" ? "text-purple-300" : "text-pink-500"}`} />
                      </div>
                    </div>
                    <h3 className={`line-clamp-1 text-center text-base font-bold tracking-wide ${
                      theme === "dark" ? "text-purple-100" : "text-rose-950"
                    }`}>
                      {currentLetter.title}
                    </h3>
                    <p className={`mt-2 line-clamp-2 text-center text-xs leading-5 ${
                      theme === "dark" ? "text-purple-300" : "text-gray-500"
                    }`}>
                      {currentLetter.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ================= LAYER 3: ENVELOPE FRONT COVER & POCKET ================= */}
            {/* Front pocket wall */}
            <div className="absolute bottom-0 left-0 z-30 h-[142px] w-full rounded-b-[30px] bg-gradient-to-br from-rose-100 via-pink-100 to-pink-200" />

            {/* Geometric Folds */}
            <div
              className="absolute bottom-0 left-0 z-32 h-[142px] w-1/2"
              style={{
                clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.15))",
                borderBottomLeftRadius: "30px",
              }}
            />
            <div
              className="absolute bottom-0 right-0 z-32 h-[142px] w-1/2"
              style={{
                clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)",
                background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.12))",
                borderBottomRightRadius: "30px",
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 z-33 h-[96px] w-[200px] -translate-x-1/2"
              style={{
                clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                background: "rgba(255,255,255,0.22)",
              }}
            />
            <div className="absolute left-6 top-5 z-34 h-22 w-32 rounded-full bg-white/15 blur-xl" />

            {/* Top flap */}
            <motion.div
              initial={false}
              animate={isEnvelopeOpen ? { rotateX: -165, y: -2 } : { rotateX: 0, y: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              className="absolute left-0 top-0 z-35 h-[122px] w-full origin-top"
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

            {/* ================= LAYER 4: INNER TEXT CONTENT (FRONT FACE) ================= */}
            <motion.div
              animate={isEnvelopeOpen ? { opacity: 0, y: 10, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-40 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <motion.div
                  animate={!isEnvelopeOpen ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-13 w-13 items-center justify-center rounded-full bg-white/95 shadow-md shadow-pink-200/50"
                >
                  <Heart className="h-6 w-6 fill-current text-pink-500" />
                </motion.div>

                <div>
                  <p className="text-lg font-bold tracking-wide text-rose-950">
                    {isLoading
                      ? "Unlocking thoughts..."
                      : isError
                      ? "Failed to load entry"
                      : currentLetter
                      ? "Open my letter 💌"
                      : "No entries recorded"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-rose-900/60">
                    {currentLetter ? "Tap to read something sweet" : "Write down a fresh letter view! ✨"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.button>
      </div>

      {/* ================= MODAL DIALOG CONTAINER ================= */}
      <AnimatePresence>
        {showModal && currentLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
            onClick={handleClose}
          >
            <motion.div
              layoutId={`letter-card-container-${currentLetter.id}`}
              transition={{ type: "spring", damping: 26, stiffness: 190 }}
              className={`relative w-full max-w-xl overflow-hidden rounded-[28px] border shadow-[0_30px_80px_rgba(15,23,42,0.3)] ${
                theme === "dark"
                  ? "border-purple-500/30 bg-gradient-to-br from-purple-950 to-purple-900 shadow-purple-950/40"
                  : "border-white/60 bg-white"
              } p-6 md:p-8`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Soft decorative header mesh */}
              <div
                className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-r opacity-60 ${
                  theme === "dark"
                    ? "from-purple-900 via-indigo-950 to-purple-900"
                    : "from-rose-100/70 via-pink-50/50 to-rose-100/70"
                }`}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className={`absolute right-4 top-4 z-50 rounded-full p-2 transition-all duration-200 active:scale-90 ${
                  theme === "dark"
                    ? "text-purple-400 hover:bg-purple-900 hover:text-purple-100"
                    : "text-gray-400 hover:bg-rose-50 hover:text-pink-500"
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-3.5 flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${
                  theme === "dark" ? "bg-purple-900 border border-purple-500/30" : "bg-pink-50"
                }`}>
                  <Heart className={`h-6 w-6 fill-current ${theme === "dark" ? "text-purple-400" : "text-pink-500"}`} />
                </div>

                <h2 className={`text-2xl font-extrabold tracking-tight md:text-3xl ${
                  theme === "dark" ? "text-purple-500 bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent" : "text-rose-950"
                }`}>
                  {currentLetter.title}
                </h2>
                
                <div className={`my-4 h-[1px] w-20 bg-gradient-to-r from-transparent via-pink-400 to-transparent ${
                  theme === "dark" && "via-purple-500/40"
                }`} />
              </div>

              {/* Letter content window */}
              <div className={`relative z-10 max-h-[50vh] overflow-y-auto rounded-2xl border p-5 md:p-6 shadow-inner ${
                theme === "dark"
                  ? "border-purple-800/40 bg-purple-950/50 custom-scrollbar-dark"
                  : "border-rose-100/60 bg-rose-50/40 custom-scrollbar-light"
              }`}>
                <p className={`whitespace-pre-line text-sm md:text-base font-normal leading-7 md:leading-8 tracking-wide ${
                  theme === "dark" ? "text-purple-200/90" : "text-gray-700"
                }`}>
                  {currentLetter.content}
                </p>
              </div>

              <div className="relative z-10 mt-5 text-center">
                <p className={`text-xs font-semibold tracking-widest uppercase ${
                  theme === "dark" ? "text-purple-400/80" : "text-pink-500/90"
                }`}>
                  With love, always ♡
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Envelope;