/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Void Palette (Deep Space)
        void: {
          950: '#030305', // The absolute void
          900: '#060609', // Deepest background
          850: '#0A0C12', // Panel backgrounds
          800: '#12141C', // Card surfaces (Armor)
          700: '#1F2232', // Borders/Separators
          600: '#2E3248', // Hover states
        },
        // Neon Accents - The Photon System
        cyber: {
          DEFAULT: '#00F0FF', // Cyan - Primary Action
          dim: 'rgba(0, 240, 255, 0.1)',   // Low opacity glow
          hover: '#4DFAFF',
        },
        flux: {
          DEFAULT: '#FF003C', // Pink/Red - Alerts/Combat
          dim: 'rgba(255, 0, 60, 0.1)',
          hover: '#FF4D70',
        },
        plasma: {
          DEFAULT: '#7000FF', // Purple - Secondary/Vault
          dim: 'rgba(112, 0, 255, 0.1)',
          hover: '#9D4DFF',
        },
        // Utility
        helix: '#22C55E', // Green - Success (DNA)
      },
      fontFamily: {
        mech: ['"Rajdhani"', 'sans-serif'],      // Headings, HUD numbers
        ui: ['"Exo 2"', 'sans-serif'],           // Body text
        code: ['"JetBrains Mono"', 'monospace'], // Stats, prices
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
        'holo-gradient': "linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(112,0,255,0.1) 100%)",
        'noise': "url('/noise.png')", // Optional texture
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 240, 255, 0.4), 0 0 20px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 10px rgba(255, 0, 60, 0.4), 0 0 20px rgba(255, 0, 60, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-insect': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
        'scan': 'scan 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
}