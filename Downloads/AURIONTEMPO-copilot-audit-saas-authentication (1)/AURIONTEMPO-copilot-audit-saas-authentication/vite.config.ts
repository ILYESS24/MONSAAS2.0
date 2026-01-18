import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  define: {
    // Production environment variables embedded in build
    ...(process.env.NODE_ENV === 'production' && {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://otxxjczxwhtngcferckz.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDcxOTEsImV4cCI6MjA4MTIyMzE5MX0.B4A300qQZCwP-aG4J29KfeazJM_Pp1eHKXQ98_bLMw8'),
      // Clerk authentication - Real keys from user account
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify('pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA'),
    }),
  },
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
