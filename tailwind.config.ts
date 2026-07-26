import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#f97316",
          "orange-dark": "#ea580c",
          blue: "#2563eb",
          "blue-dark": "#1d4ed8",
        },
        ink: {
          900: "#1c1917",
          700: "#3f3a37",
          500: "#78716c",
          300: "#d6d3d1",
          100: "#f5f4f2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(28,25,23,0.12)",
        popup: "0 12px 32px -8px rgba(28,25,23,0.22)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
