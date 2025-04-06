import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        green: {
          50: "#e8eeea",
          100: "#b7cbbd",
          200: "#94b29d",
          300: "#638f70",
          400: "#457954",
          500: "#165829",
          600: "#145025",
          700: "#103e1d",
          800: "#0c3017",
          900: "#092511",
        },
        grey: {
          50: "#e9e9e9",
          100: "#bababc",
          200: "#98989c",
          300: "#6a6a6e",
          400: "#4d4d52",
          500: "#202027",
          600: "#1d1d23",
          700: "#17171c",
          800: "#121215",
          900: "#0d0d10",
        },
      },
      fontFamily: {
        satoshi: ["Satoshi-regular", "sans-serif"],
        satoshiBlack: ["Satoshi-black", "sans-serif"],
        satoshiBold: ["Satoshi-bold", "sans-serif"],
        satoshiLight: ["Satoshi-light", "sans-serif"],
        satoshiItalic: ["Satoshi-italic", "sans-serif"],
        satoshiMedium: ["Satoshi-medium", "sans-serif"],
      },
      fontSize: {
        title: "70px",
        h1: "36px",
        h2: "32px",
        h3: "29px",
        h4: "26px",
        h5: "23px",
        h6: "20px",
        body1: "18px",
        body2: "16px",
        body3: "14px",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
