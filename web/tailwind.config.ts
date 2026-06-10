const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    colors: {
      // New TruMarket Brand Colors
      "tm-primary": "#4E8C37", // Green - Primary brand color
      "tm-primary-dark": "#3A6B2A",
      "tm-primary-light": "#5FA84A",
      "tm-accent": "#F2A007", // Yellow/Orange - Accent color
      "tm-accent-dark": "#D48806",
      "tm-accent-light": "#FFB619",
      "tm-secondary": "#F28705", // Orange - Secondary accent
      "tm-secondary-dark": "#D47404",
      "tm-secondary-light": "#FF9F1C",
      "tm-danger": "#F25E6B", // Pink/Red - Error/Warning
      "tm-danger-dark": "#D9486E",
      "tm-danger-light": "#FF7582",
      "tm-neutral": "#F2F2F2", // Light gray - Background
      "tm-neutral-dark": "#E0E0E0",
      "tm-neutral-light": "#FAFAFA",

      // Supporting colors
      "tm-white": "#ffffff",
      "tm-black": "#1F2D42",
      // "tm-text": "#2D3E57",
      "tm-text-light": "#6B7280",
      "tm-text-muted": "#9CA3AF",

      // Transparent variants
      "tm-primary-transparent": "#4E8C3720",
      "tm-accent-transparent": "#F2A00720",
      "tm-danger-transparent": "#F25E6B20",
      "tm-neutral-transparent": "#F2F2F220",

      // Legacy colors (for backward compatibility)
      "tm-gray-light": "#0000001a",
      "tm-black-80": "#2D3E57",
      "tm-yellow": "#F2A007",
      "tm-purple": "#C663FF",
      "tm-black-20": "#2d3e5733",
      "tm-theme-text": "#1F2D42",
      "tm-green": "#4E8C37",
      "tm-blue": "#4EA4D9",
      "tm-dark-secondary": "#222222",
      "tm-blue-secondary": "#5898C7",
      "tm-orange": "#F28705",
      "tm-charcoal-blue": "#2D3E57",
      "tm-red": "#F25E6B",
      "tm-black-transparent-05": "#0000000d",
      "tm-yellow-transparent": "#F2A00720",
      "tm-green-transparent": "#4E8C3720",
      "tm-green-light": "#4E8C3733",
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #4E8C37 0%, #3A6B2A 100%)",
        "gradient-accent": "linear-gradient(135deg, #F2A007 0%, #F28705 100%)",
        "gradient-hero": "linear-gradient(135deg, #4E8C37 0%, #4EA4D9 100%)",
        "gradient-success": "linear-gradient(90deg, #4E8C37 0%, #5FA84A 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        custom: "0 0 10px rgba(0, 0, 0, 0.25)",
        "tm-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "tm-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "tm-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "tm-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "tm-primary": "0 4px 14px 0 rgba(78, 140, 55, 0.25)",
        "tm-primary-lg": "0 8px 25px 0 rgba(78, 140, 55, 0.35)",
      },
      borderRadius: {
        "tm-sm": "0.375rem",
        "tm-md": "0.5rem",
        "tm-lg": "0.75rem",
        "tm-xl": "1rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.5s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
