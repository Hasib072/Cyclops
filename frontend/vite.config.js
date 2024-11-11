import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'; // Import the SVGR plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),svgr(),],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://cyclops-backend-wx30.onrender.com',
        changeOrigin: true,
      },
    },
  }
})
