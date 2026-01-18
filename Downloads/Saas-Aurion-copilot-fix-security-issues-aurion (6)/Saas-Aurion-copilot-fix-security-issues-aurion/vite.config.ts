import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    sourcemap: false, // Disable sourcemaps in production for security
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            'lucide-react',
          ],
          
          // State management
          'state-vendor': ['zustand', '@tanstack/react-query'],
          
          // Database & Auth
          'data-vendor': ['@supabase/supabase-js', '@clerk/clerk-react'],
          
          // Animation libraries (lazy loaded)
          'animation-vendor': ['framer-motion'],
          
          // Charts (lazy loaded for dashboard)
          'charts-vendor': ['recharts'],
        },
        // Optimize chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@clerk/clerk-react'], // Clerk handles its own bundling
  },
  // Server configuration for development
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  // Preview configuration
  preview: {
    host: true,
    port: 4173,
  },
});
