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
        // Design tokens EnviroFriends — sistem 2 tone: HIJAU + KUNING.
        primary: "#16a34a", // hijau utama — tombol sekunder, accent, border
        secondary: "#facc15", // kuning utama — CTA, highlight, reward
        dark: "#14532d", // hijau gelap — section gelap, teks, footer
        light: "#f0fdf4", // hijau sangat muda — bg section/card
        muted: "#6b7280", // teks muted
      },
      fontFamily: {
        // Headline editorial vs body bersih.
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "chevron-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "chevron-bounce": "chevron-bounce 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
