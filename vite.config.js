import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: false, // 🛠️ DEBUGGING: Keep logs for stabilization audit
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('framer-motion')) return 'vendor';
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('recharts')) return 'charts';
            return 'vendor';
          }
        }
      },
    },
    // 🚀 PERFORMANCE: Ensure consistent asset naming for Capacitor
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      'react-is': 'react-is',
    },
  },
});
