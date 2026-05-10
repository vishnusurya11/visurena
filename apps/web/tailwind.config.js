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
        // Netflix-style base colors (legacy, preserved untouched)
        'netflix': {
          black: '#000000',
          dark: '#141414',
          card: '#2a2a2a',
          text: '#ffffff',
          gray: '#808080',
          muted: '#b3b3b3'
        },
        // Comfy.org inspired blog colors (legacy, preserved untouched)
        'comfy': {
          bg: '#0a0a0a',        // Main background (soft black)
          card: '#111111',      // Card background
          text: '#e5e5e5',      // Body text (readable)
          heading: '#ffffff',   // Headings (crisp white)
          muted: '#999999',     // Secondary text
          accent: '#2563eb',    // Links/highlights (Comfy.org blue)
          border: '#2a2a2a',    // Borders
          code: '#1e1e1e',      // Code block background
        },
        // Aurora Indigo brand tokens v1.3 — locked parent palette + section accents.
        // Use these for all NEW components.
        'aurora': {
          bg:        '#0A0E2A',  // parent bg
          surface:   '#131A3D',  // surface 1
          raised:    '#1D2552',  // surface 2
          hairline:  '#2A3268',
          text:      '#F0F2FF',
          textMid:   '#9DA8D9',
          textMuted: '#5C66A0',
          accent:    '#6B7DFF',  // parent accent — THE VERB (links, focus rings, primary CTAs)
          // Section accents (the aurora glints)
          pink:      '#F472B6',  // Movies
          gold:      '#F4C04E',  // Music
          lime:      '#B5E853',  // Games
          cyan:      '#2DD4BF',  // Story
          lavender:  '#A78BFA',  // VR World (NEW)
          platinum:  '#C0C8E0',  // Blog
        },
        // Section theme palette — KEYS preserved for backward compatibility,
        // VALUES remapped to Aurora Indigo accents (v1.3).
        'theme': {
          // Movies — aurora pink
          movies: {
            primary:   '#F472B6',
            secondary: '#F9A8D4',
            muted:     '#9D2E72'
          },
          // Music — warm gold
          music: {
            primary:   '#F4C04E',
            secondary: '#F8D77A',
            muted:     '#A07720'
          },
          // Games — electric lime
          games: {
            primary:   '#B5E853',
            secondary: '#CFEF85',
            muted:     '#6E9628'
          },
          // Story — soft cyan
          story: {
            primary:   '#2DD4BF',
            secondary: '#5EE3D2',
            muted:     '#1A8273'
          },
          // Blog — cool platinum (was Comfy blue)
          blog: {
            primary:   '#C0C8E0',
            secondary: '#D8DEEC',
            muted:     '#6F7A99'
          },
          // VR — electric lavender (was VR cyan)
          vr: {
            primary:   '#A78BFA',
            secondary: '#C4B5FD',
            muted:     '#6845C7'
          }
        }
      },
      fontFamily: {
        // Aurora Indigo locked stack
        sans:       ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        italic:     ['"DM Serif Display"', '"Spectral"', 'Georgia', 'serif'],  // editorial italic for emphasis (used italic only)
        mono:       ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
        // Legacy aliases (kept for blog and other existing usages)
        spectral:   ['Spectral', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        serif:      ['Spectral', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        'aurora-glow':       '0 0 0 4px rgba(107, 125, 255, 0.18)',
        'aurora-card-hover': '0 24px 60px -12px rgba(107, 125, 255, 0.35)',
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
