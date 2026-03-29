import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf4ef",
          100: "#fbe5d4",
          200: "#f6c9a8",
          300: "#f0a572",
          400: "#e9783a",
          500: "#e45a1e",
          600: "#d44213",
          700: "#b03012",
          800: "#8d2817",
          900: "#732316",
          950: "#3e0f09",
        },
      },
    },
  },
  plugins: [],
};

export default config;
