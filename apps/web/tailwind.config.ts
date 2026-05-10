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
        softCoral: "#FF6B6B",
        warmRose: "#E76F73",
        cream: "#FFF8E7",
        mint: "#95D5B2",
        pixelSky: "#89CFF0",
        retroYellow: "#FFD166"
      },
      fontFamily: {
        display: ["var(--font-pixel)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        glass: "0 20px 45px rgba(231, 111, 115, 0.16)",
        float: "0 18px 36px rgba(17, 24, 39, 0.14)"
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(255,255,255,0.65) 0, rgba(255,255,255,0) 62%), linear-gradient(rgba(137,207,240,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(137,207,240,0.16) 1px, transparent 1px)"
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
