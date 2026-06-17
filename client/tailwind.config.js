/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#09090b",
        panel: "#111113",
        panelSoft: "#18181b",
        line: "#27272a",
        mint: "#22c55e",
        cyan: "#22d3ee",
        amber: "#f59e0b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.08), 0 18px 45px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

