// frontend/tailwind.config.js
/** @type {import('tailwindcss').Types.Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Pink Romantic Palette
        'blush': '#FFE4E1',
        'misty-rose': '#FFD1DC',
        'baby-pink': '#F4C2C2',
        'cherry-blossom': '#FFB7C5',
        'cotton-candy': '#FFB3C6',
        'peach': '#FFDAB9',
        'cream': '#FFFDD0',
        'vanilla': '#F3E5AB',
        'soft-white': '#FFFAFA',
        'champagne': '#F7E7CE',
        'rosewater': '#FFE4E1',
        'pink-lace': '#FFDFDD',
        'love-red': '#FF6B8B',
        'romantic-red': '#FF4B6E',
        'deep-pink': '#FF1493',
        'soft-coral': '#FF7F7F',
        'pearl': '#FDF5E6',
        'lavender-blush': '#FFF0F5',
      },
      backgroundImage: {
        'romantic-gradient': 'linear-gradient(135deg, #FFE4E1 0%, #FFD1DC 50%, #FFB7C5 100%)',
        'love-gradient': 'linear-gradient(to right, #FF6B8B, #FF4B6E)',
        'soft-gradient': 'linear-gradient(to bottom, #FFFAFA, #FFE4E1)',
        'sparkle-gradient': 'linear-gradient(45deg, #FFD1DC, #FFB7C5, #F4C2C2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'heart-beat': 'heartBeat 1.5s ease-in-out infinite',
        'sparkle': 'sparkle 3s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(255, 107, 139, 0.1)',
        'soft-lg': '0 20px 40px -10px rgba(255, 107, 139, 0.15)',
        'glow': '0 0 20px rgba(255, 183, 197, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(255, 183, 197, 0.3)',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
        'script': ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [],
}