import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { alias } from './configs/aliases';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: resolve(rootDir, '../Site/resources'), dest: './' },
        { src: resolve(rootDir, './assets'), dest: './' },
      ],
    }),
  ],
  server: {
    open: true,
    port: 3000,
    allowedHosts: ['web', 'localhost'],
  },
  resolve: { alias },
});
