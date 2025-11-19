import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The "Objective Omega" Brand Palette
        omega: {
          900: "#0f1115", // Deepest Tactical Black
          800: "#1a1d23", // Card Background / Lighter Black
          gold: "#C5A059", // Metallic Gold from Logo
          light: "#e4d4b1", // Light Gold for backgrounds/hover
        },
      },
      fontFamily: {
        // Optional: If you want a specific font later, add it here
      }
    },
  },
  plugins: [],
} satisfies Config;