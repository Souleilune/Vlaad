import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        deepCrimson: "#8B0000",
        softCoral: "#E8524A",
        warmRose: "#C63D36",
        cleanWhite: "#FAFAFA",
        cream: "#FAFAFA",
        mint: "#F6D3C9",
        pixelSky: "#F3E5E3",
        retroYellow: "#F5A623",
        softGold: "#F5A623"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        neu: "9px 9px 18px rgba(139, 0, 0, 0.12), -9px -9px 18px rgba(255, 255, 255, 0.92)",
        neuSoft: "6px 6px 14px rgba(139, 0, 0, 0.1), -6px -6px 14px rgba(255, 255, 255, 0.86)",
        neuInset: "inset 4px 4px 10px rgba(139, 0, 0, 0.08), inset -4px -4px 10px rgba(255, 255, 255, 0.88)",
        float: "14px 14px 28px rgba(139, 0, 0, 0.12), -10px -10px 24px rgba(255,255,255,0.88)"
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(250,250,250,0.72) 0, rgba(250,250,250,0) 62%), linear-gradient(rgba(232,82,74,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(232,82,74,0.14) 1px, transparent 1px)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".78", transform: "scale(1.04)" }
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseSoft: "pulseSoft 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
