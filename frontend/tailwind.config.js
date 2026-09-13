/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          base: '#121212',       // Spotify / Netflix authentic dark base
          sidebar: '#000000',    // Pure black sidebar
          surface: '#181818',    // Clean card surface
          elevated: '#242424',   // Elevated modal / hover
          highlight: '#2a2a2a',  // Active row highlight
          border: 'rgba(255, 255, 255, 0.08)',
        },
        netflix: {
          red: '#E50914',
          hover: '#F40612',
          card: '#181818',
        },
        spotify: {
          green: '#1ED760',
          darkgreen: '#1DB954',
          card: '#181818',
          hover: '#282828',
          textMuted: '#B3B3B3',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
