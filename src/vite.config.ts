import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ChessApp/', // Must match your repository name exactly
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}); 