import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { alias } from './configs/aliases';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './assets/manifest.json';
// import Checker from 'vite-plugin-checker'

const rootDir = dirname(fileURLToPath(import.meta.url));
const siteResourcesDir = resolve(rootDir, '../Site/resources');
const assetsDir = resolve(rootDir, './assets');

function hasGitBinary(): boolean {
  try { execSync('git --version', { stdio: 'ignore' }); return true; } catch { return false; }
}

const appVersion = (() => {
  try {
    if (!hasGitBinary()) return process.env.npm_package_version ?? '0.0.0';

    return (
      new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + '-' + 
      execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim()
    );
  } catch (error) {
    console.warn('Unable to read git commit hash for version:', error);
    return process.env.npm_package_version ?? '0.0.0';
  }
})();

export default defineConfig({
  plugins: [
    react(),
    // Checker({ typescript: true }),
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
      devOptions: {
        enabled: true
      }
    }),
    viteStaticCopy({
      targets: [
        ...(existsSync(siteResourcesDir) ? [{ src: siteResourcesDir, dest: './' }] : []),
        ...(existsSync(assetsDir) ? [{ src: assetsDir, dest: './' }] : []),
      ],
    }),
  ],
  server: {
    open: false,
    port: 3000,
    allowedHosts: ['web', 'localhost'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: { alias },
});
