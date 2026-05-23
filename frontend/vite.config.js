import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Fix: force Vite to pre-bundle tslib so echarts-for-react can resolve it
  // tslib is installed as a nested dep inside echarts/node_modules, not at root level
  optimizeDeps: {
    include: ['tslib', 'echarts', 'echarts-for-react'],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl')) return 'mapbox';
            if (id.includes('react-date-range') || id.includes('date-fns')) return 'dates';
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) return 'react-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
