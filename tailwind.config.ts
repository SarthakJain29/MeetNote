import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#07060d", 900: "#0d0b17", 800: "#151222", 700: "#1e1a30" },
      },
      fontFamily: {
        display: ["ui-rounded", "'SF Pro Rounded'", "Nunito", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-18px)" } },
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        rise: "rise .5s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
