import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, '..');

export const alias = {
  '@models': resolve(projectRoot, 'src/data/models'),
  '@configs': resolve(projectRoot, 'src/data/firebase/google-services.ts'),
  '@repositories': resolve(projectRoot, 'src/data/repositories'),
  '@services': resolve(projectRoot, 'src/data/service'),
  '@resourceUse': resolve(projectRoot, 'src/data/repositories/ResourcesUseRepositoryShared.ts'),
  '@utils': resolve(projectRoot, 'src/data/utils'),
  '@componentsDeprecated': resolve(projectRoot, 'src/components'),
  '@features': resolve(projectRoot, 'src/features'),
  '@lang': resolve(projectRoot, 'src/i18n'),

  "@pages": resolve(projectRoot, "src/pages"),
  "@layouts": resolve(projectRoot, "src/visual/layouts"),
  "@components": resolve(projectRoot, "src/visual/components"),
  "@lib": resolve(projectRoot, "src/visual/lib"),
  "@hooks": resolve(projectRoot, "src/visual/hooks"),
  "@contexts": resolve(projectRoot, "src/visual/contexts"),

} as const;

export type AliasKey = keyof typeof alias;
