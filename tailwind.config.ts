import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem"
      },
      screens: {
        "2xl": "1440px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        ink: {
          DEFAULT: "#050507",
          soft: "#0B0D12",
          line: "#1C2029"
        },
        paper: {
          DEFAULT: "#F6F0DF",
          muted: "#D8CFB8"
        },
        gold: {
          DEFAULT: "#F2C96D",
          deep: "#B9892F",
          soft: "#FFE3A4"
        },
        burgundy: {
          DEFAULT: "#7A1F2B",
          bright: "#D64A3A",
          soft: "#F07E72"
        },
        mist: {
          DEFAULT: "#9DB7C8",
          blue: "#46BDEB",
          pale: "#D3EBF4"
        },
        charcoal: {
          DEFAULT: "#171A21",
          light: "#252A35",
          muted: "#666D7C"
        }
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],
        display: [
          "var(--font-display)",
          "Rajdhani",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.14em" }],
        "display-sm": ["2.5rem", { lineHeight: "2.75rem", fontWeight: "700" }],
        "display-md": ["4rem", { lineHeight: "4.25rem", fontWeight: "700" }],
        "title-lg": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "650" }],
        "title-md": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "650" }],
        body: ["1rem", { lineHeight: "1.625rem" }],
        caption: ["0.875rem", { lineHeight: "1.25rem" }]
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem"
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)"
      },
      boxShadow: {
        glow: "0 0 36px rgb(242 201 109 / 0.22)",
        "glow-blue": "0 0 36px rgb(70 189 235 / 0.2)",
        "glow-red": "0 0 36px rgb(214 74 58 / 0.2)",
        panel: "0 24px 80px rgb(0 0 0 / 0.42)"
      }
    }
  },
  plugins: [animate]
};

export default config;
