import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1720",
          surface: "#16212C",
          raised: "#1D2B38",
          line: "#26374480",
        },
        text: {
          DEFAULT: "#E8EDF2",
          muted: "#8A99A8",
          faint: "#5B6B7A",
        },
        brass: {
          DEFAULT: "#C9A24B",
          soft: "#C9A24B26",
          strong: "#E0BC6C",
        },
        pos: {
          DEFAULT: "#4E9E82",
          soft: "#4E9E8220",
        },
        neg: {
          DEFAULT: "#C1554A",
          soft: "#C1554A20",
        },
        warn: {
          DEFAULT: "#D2A857",
          soft: "#D2A85720",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(232,237,242,0.035) 1px, transparent 0)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
