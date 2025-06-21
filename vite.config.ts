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
        target: 'https://backendgormish.onrender.com', // Your backend server URL
        // target: 'http://localhost:3000', // Local development server URL
        changeOrigin: true,
        
      },
    },
  },
});
