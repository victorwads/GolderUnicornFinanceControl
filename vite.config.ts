import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: resolve(rootDir, '../Site/resources'), dest: 'resources' },
        { src: resolve(rootDir, './assets'), dest: './' },
      ],
    }),
  ],
  server: {
    open: true,
    port: 3000,
  },
  resolve: {
    alias: {
      '@models': resolve(rootDir, 'src/data/models'),
      '@repositories': resolve(rootDir, 'src/data/repositories'),
      '@components': resolve(rootDir, 'src/components'),
      '@features': resolve(rootDir, 'src/features'),
    },
  },
});
