/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0f172a', // slate-900
          light: '#f8fafc', // slate-50
          accent: '#10b981', // emerald-500
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop')",
      }
    },
  },
  plugins: [],
}
