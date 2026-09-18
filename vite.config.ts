import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        guide: resolve(import.meta.dirname, 'guide.html'),
        sampleQuickstart: resolve(import.meta.dirname, 'samples/quickstart.html'),
        sampleCustomData: resolve(import.meta.dirname, 'samples/custom-data.html'),
        sampleHeadless: resolve(import.meta.dirname, 'samples/headless.html'),
        sampleVanilla: resolve(import.meta.dirname, 'samples/standalone-vanilla.html'),
      },
    },
  },
});
