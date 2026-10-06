/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "var(--color-primary)", fg: "var(--color-on-primary)" },
        secondary: { DEFAULT: "var(--color-secondary)", fg: "var(--color-on-secondary)" },
        accent: { DEFAULT: "var(--color-accent)", fg: "var(--color-on-accent)" },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: { DEFAULT: "var(--color-card)", fg: "var(--color-card-foreground)" },
        muted: { DEFAULT: "var(--color-muted)", fg: "var(--color-muted-foreground)" },
        border: "var(--color-border)",
        destructive: { DEFAULT: "var(--color-destructive)", fg: "var(--color-on-destructive)" },
        warning: "var(--color-warning)",
        ring: "var(--color-ring)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, var(--gradient-a), var(--gradient-b) 55%, var(--gradient-c))",
        "brand-gradient-soft": "linear-gradient(135deg, color-mix(in srgb, var(--gradient-a) 18%, transparent), color-mix(in srgb, var(--gradient-c) 18%, transparent))",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "ring-fill": {
          "0%": { strokeDashoffset: "var(--ring-circumference)" },
          "100%": { strokeDashoffset: "var(--ring-offset)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "ring-fill": "ring-fill 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
      },
    },
  },
  plugins: [],
};
