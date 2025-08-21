import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, '..');

export const alias = {
  '@models': resolve(projectRoot, 'src/data/models'),
  '@configs': resolve(projectRoot, 'src/data/firebase/google-services.ts'),
  '@repositories': resolve(projectRoot, 'src/data/repositories'),
  '@resourceUse': resolve(projectRoot, 'src/data/repositories/ResourcesUseRepositoryShared.ts'),
  '@utils': resolve(projectRoot, 'src/data/utils'),
  '@components': resolve(projectRoot, 'src/components'),
  '@features': resolve(projectRoot, 'src/features'),
  '@lang': resolve(projectRoot, 'src/i18n'),
} as const;

export type AliasKey = keyof typeof alias;
