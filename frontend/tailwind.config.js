/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#070912",
          900: "#0b1020",
          800: "#11172b",
          700: "#1a2238",
        },
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(99, 102, 241, 0.45)",
        card: "0 20px 50px -20px rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(99,102,241,0.08) 0%, transparent 70%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
