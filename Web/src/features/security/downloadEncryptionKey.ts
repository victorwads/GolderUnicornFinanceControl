import { getCurrentUser } from "@configs";
import { CryptoPassRepository } from "@repositories";
import Encryptor from "../../data/crypt/Encryptor";

type DownloadEncryptionKeyOptions = {
  uid?: string;
};

export type EncryptionKeyFilePayload = {
  type: "gu-crypto-key";
  userId: string;
  exportedAt: string;
  secretHash: string;
};

export function buildEncryptionKeyFileName(uid: string): string {
  const prefix = Lang.auth.encryptionKeyFileNamePrefix;
  return `${prefix}-${uid}.txt`;
}

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
  } satisfies EncryptionKeyFilePayload;
  const fileName = buildEncryptionKeyFileName(uid);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
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

export async function readEncryptionKeyFile(file: File): Promise<EncryptionKeyFilePayload> {
  const encoded = (await file.text()).trim();
  if (!encoded) {
    throw new Error("O arquivo enviado está vazio.");
  }

  let raw: Partial<EncryptionKeyFilePayload>;
  try {
    raw = JSON.parse(decodeURIComponent(escape(atob(encoded)))) as Partial<EncryptionKeyFilePayload>;
  } catch {
    throw new Error("O arquivo enviado não contém uma chave de criptografia válida.");
  }

  if (raw.type !== "gu-crypto-key") {
    throw new Error("O arquivo enviado não é uma chave de criptografia válida.");
  }

  if (typeof raw.userId !== "string" || !raw.userId) {
    throw new Error("O arquivo enviado não contém um identificador de usuário válido.");
  }

  if (typeof raw.secretHash !== "string" || !/^[a-f0-9]{64}$/i.test(raw.secretHash)) {
    throw new Error("O arquivo enviado não contém uma chave de criptografia válida.");
  }

  if (typeof raw.exportedAt !== "string" || Number.isNaN(Date.parse(raw.exportedAt))) {
    throw new Error("O arquivo enviado não contém uma data de exportação válida.");
  }

  Encryptor.hashFromHex(raw.secretHash);

  return {
    type: raw.type,
    userId: raw.userId,
    exportedAt: raw.exportedAt,
    secretHash: raw.secretHash,
  };
}
