import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#005BAA",
          light: "#0078D7",
          dark: "#004A8C",
        },
        accent: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
        },
        "accent-orange": {
          DEFAULT: "#FF6B00",
          light: "#FF8C33",
          dark: "#E05E00",
        },
        navy: "#0B2545",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
