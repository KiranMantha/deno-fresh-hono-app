import { type Config } from "tailwindcss";

export default {
  content: [
    "src/{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
} satisfies Config;
