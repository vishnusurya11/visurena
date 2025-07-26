/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Netflix-style base colors
        'netflix': {
          black: '#000000',
          dark: '#141414',
          card: '#2a2a2a',
          text: '#ffffff',
          gray: '#808080',
          muted: '#b3b3b3'
        },
        // Sophisticated streaming service inspired colors
        'theme': {
          // Movies - Netflix inspired warm red with subtle gradient feel
          movies: {
            primary: '#e50914',
            secondary: '#f40612', 
            muted: '#831a1a'
          },
          // Music - Sophisticated teal/cyan like premium music services
          music: {
            primary: '#1db584',
            secondary: '#14a085',
            muted: '#0f6b5c'
          },
          // Games - Rich purple inspired by gaming platforms
          games: {
            primary: '#6f42c1',
            secondary: '#8a63d2',
            muted: '#4a2c85'
          },
          // Story - Warm amber/gold for literature feel
          story: {
            primary: '#f59e0b',
            secondary: '#fbbf24',
            muted: '#92400e'
          },
          // Blog - Professional blue like medium/substack
          blog: {
            primary: '#3b82f6',
            secondary: '#60a5fa',
            muted: '#1e40af'
          },
          // Wiki - Research purple for knowledge/analysis
          wiki: {
            primary: '#8b5cf6',
            secondary: '#a78bfa',
            muted: '#5b21b6'
          },
          // VR - Futuristic cyan for virtual reality
          vr: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            muted: '#0891b2'
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}