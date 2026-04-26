/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#0F172A",
        accent: "#F59E0B",
        background: "#F8FAFC",
        error: "#EF4444",
      },
    },
  },
  plugins: [],
}
