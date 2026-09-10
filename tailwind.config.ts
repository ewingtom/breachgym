import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aubergine: {
          DEFAULT: "#120C14",
          raised: "#160F1A",
        },
        limestone: "#F2EDE5",
        ivory: "#F7F4EE",
        copper: "#B87333",
        ink: "#1A1518",
        muted: "#8A8279",
        ok: "#3D5C4A",
        miss: "#7A3B3B",
      },
      fontFamily: {
        serif: [
          "ui-serif",
          "Iowan Old Style",
          "Source Serif 4",
          "Source Serif Pro",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.28s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
