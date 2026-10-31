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
        background: "#070707",
        "background-secondary": "#111111",
        "background-card": "#141414",
        "background-card-hover": "#1A1A1A",
        accent: {
          DEFAULT: "#FFFFFF",
          hover: "#E5E5E5",
          muted: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.16)",
        },
        primary: "#FFFFFF",
        secondary: "#A1A1AA",
        border: {
          DEFAULT: "#262626",
          light: "#333333",
          glass: "rgba(255, 255, 255, 0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["var(--font-montserrat)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-montserrat)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
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
