import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Set the port to 3001
    proxy: {
      '/api': 'http://127.16.70.106:3001' // Proxy API requests to your backend server
    }
  }
});
