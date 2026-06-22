/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Michigan / outdoors palette
        forest:  { DEFAULT: "#1B4332", light: "#2D6A4F", dark: "#0A2E1F" },
        river:   { DEFAULT: "#1565C0", light: "#4FC3F7", dark: "#0D47A1" },
        dawn:    { DEFAULT: "#FF8F00", light: "#FFB74D", dark: "#E65100" },
        stone:   { DEFAULT: "#4E342E", light: "#A1887F", dark: "#3E2723" },
        birch:   { DEFAULT: "#F5F5F0", dark: "#E0E0D8" },
        mi:      { blue: "#003DA5", gold: "#CDA323" },
      },
      fontFamily: {
        sans: ["System"],
        display: ["System"],
      },
    },
  },
  plugins: [],
};

