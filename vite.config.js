import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file for the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      port: 5173,
      // Proxy /api requests to your backend in dev — avoids CORS issues
      proxy: env.VITE_API_BASE_URL ? {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      } : {},
    },

    build: {
      target: 'es2020',
      // Source maps for Vercel — lets you debug minified production errors
      sourcemap: true,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // Split vendor bundles for better caching on Vercel CDN
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router':       ['react-router-dom'],
          },
          assetFileNames:  'assets/[name]-[hash][extname]',
          chunkFileNames:  'assets/[name]-[hash].js',
          entryFileNames:  'assets/[name]-[hash].js',
        },
      },
    },

    // Make app version available in code as __APP_VERSION__
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
    },
  };
});
