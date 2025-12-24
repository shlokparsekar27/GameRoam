/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Void Palette
        void: {
          900: '#050508', // Deepest background
          800: '#0F111A', // Card surfaces (Armor)
          700: '#1A1D2D', // Borders/Separators
        },
        // Neon Accents
        cyber: {
          DEFAULT: '#00F0FF', // Cyan - Primary Action
          dim: '#00F0FF20',   // Low opacity glow
        },
        flux: {
          DEFAULT: '#FF003C', // Pink/Red - Alerts/High Contrast
          dim: '#FF003C20',
        },
        plasma: {
          DEFAULT: '#7000FF', // Purple - Secondary/Vault
        },
      },
      fontFamily: {
        mech: ['"Rajdhani"', 'sans-serif'],      // Headings, HUD numbers
        ui: ['"Exo 2"', 'sans-serif'],           // Body text
        code: ['"JetBrains Mono"', 'monospace'], // Stats, prices
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
        'holo-gradient': "linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(112,0,255,0.1) 100%)",
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 10px rgba(255, 0, 60, 0.5), 0 0 20px rgba(255, 0, 60, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
      },
    },
  },
  plugins: [],
}