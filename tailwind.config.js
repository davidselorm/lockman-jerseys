/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        "background-secondary": "#0A0A0A",
        "background-card": "#0C0C0C",
        "background-card-hover": "#141414",
        accent: {
          DEFAULT: "#FFFFFF",
          hover: "#EAEAEA",
          muted: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.16)",
        },
        primary: "#FFFFFF",
        secondary: "#8E8E93",
        border: {
          DEFAULT: "#1F1F1F",
          light: "#2E2E2E",
          glass: "rgba(255, 255, 255, 0.14)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-heading)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        montserrat: ["var(--font-heading)", "sans-serif"],
        inter: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 20px 50px -10px rgba(0, 0, 0, 0.8)",
        "luxury-sm": "0 10px 25px -10px rgba(0, 0, 0, 0.6)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        "glass-hover": "0 16px 40px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)",
        "accent-glow": "0 0 30px -5px rgba(255, 255, 255, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
