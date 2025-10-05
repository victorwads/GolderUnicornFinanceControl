import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { alias } from './configs/aliases';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './assets/manifest.json';

const rootDir = dirname(fileURLToPath(import.meta.url));

const appVersion = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
  } catch (error) {
    console.warn('Unable to read git commit hash for version:', error);
    return process.env.npm_package_version ?? '0.0.0';
  }
})();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/logo.png'],
      manifest,
      manifestFilename: 'manifest.json',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,woff,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Example: increase to 10 MiB
      },
    }),
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
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: { alias },
});
