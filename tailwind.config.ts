import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg)",
        surface: "var(--surface)",
        surfaceMuted: "var(--surface-muted)",
        sidebar: "var(--sidebar)",
        borderDefault: "var(--border)",
        borderStrong: "var(--border-strong)",
        textPrimary: "var(--text)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        brand: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
        },
        status: {
          supported: "var(--success)",
          supportedSoft: "var(--success-soft)",
          contradicted: "var(--danger)",
          contradictedSoft: "var(--danger-soft)",
          missing: "var(--warning)",
          missingSoft: "var(--warning-soft)",
          ambiguous: "var(--purple)",
          ambiguousSoft: "var(--purple-soft)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
