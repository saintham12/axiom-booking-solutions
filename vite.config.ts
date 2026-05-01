import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
// import tailwindcss from "@tailwindcss/vite" <--- Comment this if error persists

export default defineConfig({
  plugins: [
    react(), 
    // tailwindcss() <--- Comment this too
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
