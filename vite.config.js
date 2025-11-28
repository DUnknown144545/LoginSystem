import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // IMPORTANT: Change 'LOGINSYSTEM' to match your GitHub repo name EXACTLY
  const base = mode === 'github' ? '/LOGINSYSTEM/' : '/';

  return {
    base,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          dashboard: resolve(__dirname, 'main/dashboard.html'),
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});