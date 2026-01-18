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
    // App version for debugging
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'recharts',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  plugins: [
    react({
      // Enable React Refresh for HMR
      devTarget: 'es2022',
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/config": path.resolve(__dirname, "./src/config"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/types": path.resolve(__dirname, "./src/types"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
    port: 5173,
    strictPort: false,
    cors: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
  },
  preview: {
    port: 4173,
    strictPort: false,
    cors: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'esbuild',
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-ui': ['lucide-react', 'recharts', 'clsx', 'tailwind-merge'],
          'vendor-clerk': ['@clerk/clerk-react'],
        },
        // Hashed file names for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
  },
  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  // Environment variable prefix
  envPrefix: 'VITE_',
  // Performance
  esbuild: {
    legalComments: 'none',
    target: 'es2022',
  },
});
