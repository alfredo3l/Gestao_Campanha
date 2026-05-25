import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Public Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["13px", { lineHeight: "1.5" }],
        base: ["14px", { lineHeight: "1.5" }],
        md: ["15px", { lineHeight: "1.5" }],
        lg: ["17px", { lineHeight: "1.4" }],
        xl: ["20px", { lineHeight: "1.3" }],
        "2xl": ["24px", { lineHeight: "1.25" }],
        "3xl": ["30px", { lineHeight: "1.2" }],
        "4xl": ["36px", { lineHeight: "1.15" }],
      },
      colors: {
        brand: {
          50: "#f3f7fb",
          100: "#e5eef6",
          500: "#2683bf",
          600: "#1d6aa0",
          700: "#16507f",
          800: "#0f3a5f",
          900: "#0a2540",
        },
        green: {
          50: "#ebf8f0",
          100: "#d8efe2",
          500: "#2ba867",
          600: "#1f8a52",
          700: "#156b3f",
          900: "#0f3d2a",
        },
        gold: {
          100: "#fbf0d2",
          500: "#d4a124",
          600: "#b88515",
        },
        magenta: {
          50: "#fdf2f8",
          100: "#fce4ef",
          200: "#f9c8df",
          300: "#f49bc4",
          400: "#ec5fa1",
          500: "#d12b86",
          600: "#bc1f72",
          700: "#9a195e",
          800: "#7d1850",
          900: "#5d1239",
        },
        ink: {
          50: "#f6f8fb",
          100: "#ecf0f5",
          200: "#dde2ea",
          300: "#b9c1cd",
          400: "#8f99aa",
          500: "#6a7689",
          600: "#4a5670",
          700: "#344155",
          800: "#1c2638",
          900: "#0e1623",
        },
        status: {
          red: "#b3261e",
          "red-100": "#fae3e1",
          amber: "#a26511",
          "amber-100": "#fbeacb",
          green: "#15803d",
          "green-100": "#dcf3e3",
          blue: "#1d6aa0",
          "blue-100": "#dbe9f5",
          violet: "#6b21a8",
          "violet-100": "#ede2f7",
        },
        // shadcn/ui semantic tokens (via CSS variables em globals.css)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
        xl: "14px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(15, 35, 65, 0.06)",
        md: "0 2px 6px rgba(15, 35, 65, 0.08), 0 1px 2px rgba(15, 35, 65, 0.04)",
        lg: "0 8px 24px rgba(15, 35, 65, 0.12), 0 2px 6px rgba(15, 35, 65, 0.06)",
      },
      spacing: {
        sidebar: "232px",
        topbar: "60px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
