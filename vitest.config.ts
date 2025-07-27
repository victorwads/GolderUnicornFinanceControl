import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
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
