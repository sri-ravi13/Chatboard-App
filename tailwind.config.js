/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg-dark': '#1e202e',
        'chat-bg-light': '#2a2d3e',
        'chat-primary': {
          DEFAULT: '#7a3ff2',
          light: '#a179ff',
        },
        'chat-secondary': '#4a00e0',
        'chat-text': '#f0f0f0',
        'chat-text-muted': '#a0a0a0',
      },
    },
  },
  plugins: [],
}