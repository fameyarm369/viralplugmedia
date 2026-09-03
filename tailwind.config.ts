import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        comic: {
          black: "#0A0A0C",
          white: "#FDFAF5",
          yellow: "#FFE600",
          pink: "#FF0055",
          cyan: "#00F0FF",
          purple: "#7928CA",
          orange: "#FF5E00",
          green: "#00E575",
          red: "#E63946",
          darkblue: "#1D3557",
          paper: "#F5EFEB",
          gray: "#E2E8F0",
          darkgray: "#1E293B",
        },
      },
      fontFamily: {
        display: ["Anton", "var(--font-clash)", "Impact", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        comic: ["Bangers", "Anton", "cursive", "sans-serif"],
      },
      boxShadow: {
        comic: "4px 4px 0px #000000",
        "comic-sm": "2px 2px 0px #000000",
        "comic-md": "6px 6px 0px #000000",
        "comic-lg": "8px 8px 0px #000000",
        "comic-xl": "12px 12px 0px #000000",
        "comic-yellow": "6px 6px 0px #FFE600",
        "comic-pink": "6px 6px 0px #FF0055",
        "comic-cyan": "6px 6px 0px #00F0FF",
        "comic-glow": "0 0 25px rgba(255, 230, 0, 0.4)",
      },
      keyframes: {
        "sticker-pop": {
          "0%": { transform: "scale(0.85) rotate(-4deg)" },
          "50%": { transform: "scale(1.1) rotate(2deg)" },
          "100%": { transform: "scale(1) rotate(-1deg)" },
        },
        "starburst-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-comic": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "sticker-pop": "sticker-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "starburst-slow": "starburst-spin 20s linear infinite",
        "pulse-comic": "pulse-comic 2s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
