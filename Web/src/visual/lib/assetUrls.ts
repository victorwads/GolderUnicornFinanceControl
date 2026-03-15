export function resolveBankResourceUrl(assetPath?: string) {
  if (!assetPath) return undefined;
  if (/^(https?:)?\/\//.test(assetPath) || assetPath.startsWith("data:") || assetPath.startsWith("/")) {
    return assetPath;
  }

  return `/resources/banks/${assetPath}`;
}
