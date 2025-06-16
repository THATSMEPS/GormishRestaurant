import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/restaurants': {
        target: 'https://gormishbackend.onrender.com', // Your backend server URL
        changeOrigin: true,
        
      },
    },
  },
});
