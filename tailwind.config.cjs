/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          // Main colors
          primary: '#E94F37',     // Bright retro red
          dark: '#1B1B3A',        // Deep navy
          light: '#FFFFFF',       // White
          muted: '#7A7A8C',       // Muted text

          // Background variations
          'dark-800': '#2A2A4A',
          'dark-700': '#3A3A5A',
          'light-100': '#FFFFFF',
          'light-200': '#F8F8F8',

          // Accent colors
          accent: '#4361EE',      // Bright blue
          success: '#10B981',     // Green
          warning: '#FFB627',     // Yellow
        },
      },
      fontFamily: {
        'display': ['Rubik Mono One', 'sans-serif'],
        'mono': ['Rubik Mono One', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'retro': '4px 4px 0px rgba(27, 27, 58, 0.2)',
        'retro-lg': '6px 6px 0px rgba(27, 27, 58, 0.2)',
        'retro-xl': '8px 8px 0px rgba(27, 27, 58, 0.2)',
        'retro-inner': 'inset 4px 4px 0px rgba(27, 27, 58, 0.1)',
        'neon': '0 0 5px rgba(233, 79, 55, 0.5), 0 0 20px rgba(233, 79, 55, 0.3)',
        'neon-lg': '0 0 10px rgba(233, 79, 55, 0.5), 0 0 30px rgba(233, 79, 55, 0.3)',
        'neon-xl': '0 0 15px rgba(233, 79, 55, 0.5), 0 0 40px rgba(233, 79, 55, 0.3)',
        'neon-2xl': '0 0 25px rgba(233, 79, 55, 0.5), 0 0 50px rgba(233, 79, 55, 0.3)',
      },
      backgroundImage: {
        'grid': 'radial-gradient(rgba(27, 27, 58, 0.1) 1px, transparent 1px)',
        'noise': "url('/patterns/noise.png')",
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'bounce-slight': 'bounce-slight 1s ease-in-out infinite',
      },
      keyframes: {
        'bounce-slight': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};