export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { ink: '#050505', gold: '#D4AF5A', champagne: '#F3D58A', blush: '#E8A1A8', muted: '#B8B8B8' },
    fontFamily: { serif: ['"Playfair Display"', 'serif'], sans: ['Inter', 'sans-serif'] },
  } },
  plugins: [],
};
