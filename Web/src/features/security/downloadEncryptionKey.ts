import { getCurrentUser } from "@configs";
import { CryptoPassRepository } from "@repositories";

type DownloadEncryptionKeyOptions = {
  uid?: string;
};

export async function downloadEncryptionKeyFile(
  options: DownloadEncryptionKeyOptions = {},
): Promise<string> {
  const uid = options.uid ?? getCurrentUser()?.uid;
  if (!uid) {
    throw new Error("Usuário não autenticado.");
  }

  const repository = new CryptoPassRepository(uid);
  const hash = await repository.getHash();
  if (!hash) {
    throw new Error("Nenhuma chave de criptografia disponível neste dispositivo.");
  }

  const payload = {
    type: "gu-crypto-key",
    userId: uid,
    exportedAt: new Date().toISOString(),
    secretHash: hash.hex,
  };
  const fileName = `gu-crypto-key-${uid}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  return fileName;
}
