import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        mint: "#6EE7C7",
        periwinkle: "#8B9FFF",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6EE7C7 0%, #8B9FFF 100%)",
        "brand-gradient-r": "linear-gradient(135deg, #8B9FFF 0%, #6EE7C7 100%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
