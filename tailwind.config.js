/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      mono: ["JetBrains Mono", "monospace"],
      display: ["DIN", "sans-serif"],
    },
    extend: {
      fontFamily: {
        morse: ["Morse", "sans-serif"],
      },
    },
  },
  darkMode: "selector",
  plugins: [],
};
