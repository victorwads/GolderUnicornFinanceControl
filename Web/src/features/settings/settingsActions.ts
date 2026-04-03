import JSZip from "jszip";

import { DocumentModel } from "@models";
import { getCurrentUser } from "@configs";
import getRepositories, {
  CryptoPassRepository,
  RepoName,
  Repositories,
  RepositoryWithCrypt,
} from "@repositories";
import type { DataProgressInfo } from "@components/DataProgress";
import { ProjectStorage } from "@utils/ProjectStorage";
import { clearSession } from "@utils/clearSession";
import { clearAIMicrophoneOnboardingFlags } from "@componentsDeprecated/voice/AIMicrophoneOnboarding.model";
import { clearAssistantOnboardingDismissal } from "@features/assistant/utils/onboardingStorage";
import { dispatchAssistantEvent } from "@features/assistant/utils/assistantEvents";
import Encryptor, { Hash } from "../../data/crypt/Encryptor";

const RESAVE_CHUNK_SIZE = 100;
const FIREBASE_BATCH_MAX_WRITES = 500;
const PROTECTED_USER_DATA_REPOS: RepoName[] = ["banks", "resourcesUse"];

export type ExportFormat = "json" | "csv" | "all";
export type ExportJsonMode = "decrypted" | "encrypted";
export type ProgressUpdater = (progress: DataProgressInfo | null) => void;
export type ExportFailure = {
  domain: string;
  message: string;
};

type ExportUserDataOptions = {
  jsonMode?: ExportJsonMode;
};

type ImportUserDataOptions = {
  password?: string;
};

type ExportEncryptionMetadata = {
  isEncrypted: boolean;
  source: "memory" | "firestore";
  version: boolean | number | null;
};

export type ExportUserDataResult = {
  fileName: string;
  exportedDomains: RepoName[];
  failedDomains: ExportFailure[];
};

export type ImportUserDataResult = {
  importedFiles: {
    domain: RepoName;
    fileName: string;
    importedCount: number;
  }[];
  failedFiles: {
    fileName: string;
    message: string;
  }[];
  totalImportedCount: number;
};

export function isProtectedUserDataRepo(repoName: RepoName): boolean {
  return PROTECTED_USER_DATA_REPOS.includes(repoName);
}

export class ImportPasswordRequiredError extends Error {
  constructor(
    public readonly files: string[],
    message: string = "O arquivo importado está criptografado. Informe a senha para continuar.",
  ) {
    super(message);
    this.name = "ImportPasswordRequiredError";
  }
}

export async function exportUserData(
  format: ExportFormat,
  setProgress?: ProgressUpdater,
  options: ExportUserDataOptions = {},
): Promise<ExportUserDataResult> {
  const allRepos = getRepositories();
  const repoKeys = Object.keys(allRepos) as RepoName[];
  const zip = new JSZip();
  const exportedDomains: RepoName[] = [];
  const failedDomains: ExportFailure[] = [];
  const date = new Date().toISOString().split("T")[0];
  const jsonMode = options.jsonMode ?? "decrypted";
  const fileName = buildExportZipFileName(format, date, jsonMode);

  try {
    for (const [index, key] of repoKeys.entries()) {
      setProgress?.({
        domain: key,
        current: index + 1,
        max: repoKeys.length,
      });

      try {
        const repo = allRepos[key];
        if (!repo.isReady) {
          await repo.waitUntilReady();
        }

        const data = await repo.getAll();
        if (format === "json" || format === "all") {
          const encryption = getExportEncryptionMetadata(repo, jsonMode);
          const documents = encryption.isEncrypted
            ? await repo.getAllRaw()
            : data;
          zip.file(
            `${key}.json`,
            JSON.stringify(
              {
                schemaVersion: 2,
                collection: key,
                date: new Date().toISOString(),
                encryption,
                documents,
              },
              null,
              2,
            ),
          );
        }
        if (format === "csv" || format === "all") {
          zip.file(`${key}.csv`, toCSV(data));
        }
        exportedDomains.push(key);
      } catch (error) {
        const message = formatExportError(error);
        failedDomains.push({ domain: key, message });
        console.error(`Failed to export repository "${key}"`, error);
      }
    }

    zip.file(
      "export-report.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          format,
          exportedDomains,
          failedDomains,
        },
        null,
        2,
      ),
    );

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return {
      fileName,
      exportedDomains,
      failedDomains,
    };
  } finally {
    setProgress?.(null);
  }
}

function buildExportZipFileName(
  format: ExportFormat,
  date: string,
  jsonMode: ExportJsonMode,
): string {
  const userEmail = getCurrentUser()?.email || "unknown";
  const formatPart = format.toUpperCase();
  const modePart = format === "csv" ? "" : ` ${jsonMode.toUpperCase()}`;
  return `GUMyFinances ${userEmail} ${date} ${formatPart}${modePart}.zip`;
}

export async function deleteAllUserData(setProgress?: ProgressUpdater): Promise<void> {
  const repositories = getRepositories();
  const entries = Object.entries(repositories).filter(
    ([key]) => !isProtectedUserDataRepo(key as RepoName),
  ) as [RepoName, Repositories[RepoName]][];

  try {
    const exportResult = await exportUserData("all");
    if (exportResult.failedDomains.length > 0) {
      throw new Error(
        `Backup incompleto antes da exclusão: ${exportResult.failedDomains
          .map(({ domain }) => domain)
          .join(", ")}`,
      );
    }

    for (const [index, [key, repo]] of entries.entries()) {
      setProgress?.({
        domain: key,
        current: index + 1,
        max: entries.length,
      });
      await repo.deleteAll();
    }

    await clearSession();
  } finally {
    setProgress?.(null);
  }
}

export async function importUserData(
  files: File[],
  setProgress?: ProgressUpdater,
  options: ImportUserDataOptions = {},
): Promise<ImportUserDataResult> {
  const allRepos = getRepositories();
  const repoNames = Object.keys(allRepos) as RepoName[];
  const importedFiles: ImportUserDataResult["importedFiles"] = [];
  const failedFiles: ImportUserDataResult["failedFiles"] = [];
  let skippedProtectedFiles = 0;
  let totalImportedCount = 0;
  const encryptedFilesPendingPassword: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      try {
        const text = await file.text();
        const payload = parseImportPayload(text, file.name, repoNames);
        if (isProtectedUserDataRepo(payload.collection)) {
          skippedProtectedFiles++;
          continue;
        }
        const repo = allRepos[payload.collection];

        if (!repo.isReady) {
          await repo.waitUntilReady();
        }

        setProgress?.({
          domain: payload.collection,
          current: index + 1,
          max: files.length,
          sub: {
            current: 0,
            max: payload.documents.length,
          },
        });

        if (payload.documents.length > FIREBASE_BATCH_MAX_WRITES) {
          throw new Error(
            `A coleção "${payload.collection}" possui ${payload.documents.length} documentos. ` +
            `O Firebase permite no máximo ${FIREBASE_BATCH_MAX_WRITES} escritas por batch.`,
          );
        }

        const documents = await resolveImportDocuments(payload, file.name, options.password);

        await repo.saveAll(documents as any[]);

        setProgress?.({
          domain: payload.collection,
          current: index + 1,
          max: files.length,
          sub: {
            current: payload.documents.length,
            max: payload.documents.length,
          },
        });

        importedFiles.push({
          domain: payload.collection,
          fileName: file.name,
          importedCount: payload.documents.length,
        });
        totalImportedCount += payload.documents.length;
      } catch (error) {
        if (error instanceof ImportPasswordRequiredError) {
          encryptedFilesPendingPassword.push(...error.files);
          continue;
        }
        const message = error instanceof Error ? error.message : "Unknown import error";
        failedFiles.push({
          fileName: file.name,
          message,
        });
      }
    }

    if (encryptedFilesPendingPassword.length > 0) {
      throw new ImportPasswordRequiredError(encryptedFilesPendingPassword);
    }

    if (importedFiles.length === 0 && skippedProtectedFiles === 0) {
      throw new Error(
        failedFiles[0]?.message || "Nenhum arquivo válido foi importado.",
      );
    }

    return {
      importedFiles,
      failedFiles,
      totalImportedCount,
    };
  } finally {
    setProgress?.(null);
  }
}

export async function toggleEncryptionAndResave(
  encryptionDisabled: boolean,
  setProgress?: ProgressUpdater,
): Promise<boolean> {
  const newValue = !encryptionDisabled;
  ProjectStorage.set("disableEncryption", newValue ? "true" : "false");

  const repositories = Object.entries(getRepositories()).filter(
    ([, repo]) => repo instanceof RepositoryWithCrypt,
  ) as [string, RepositoryWithCrypt<any>][];

  try {
    for (const [index, [key, repo]] of repositories.entries()) {
      if (!repo.isReady) {
        await repo.waitUntilReady();
      }

      const allItems = repo.getCache(true);
      let savedCount = 0;

      setProgress?.({
        domain: key,
        current: index + 1,
        max: repositories.length,
        sub: {
          current: savedCount,
          max: allItems.length,
        },
      });

      while (savedCount < allItems.length) {
        const chunk = allItems.slice(savedCount, savedCount + RESAVE_CHUNK_SIZE);
        await repo.saveAll(chunk);
        savedCount += chunk.length;
        setProgress?.({
          domain: key,
          current: index + 1,
          max: repositories.length,
          sub: {
            current: savedCount,
            max: allItems.length,
          },
        });
      }
    }

    return newValue;
  } finally {
    setProgress?.(null);
  }
}

export async function resetAssistantOnboarding(): Promise<void> {
  try {
    await getRepositories().user.clearOnboardingFlag();
  } catch (error) {
    console.error("Failed to clear assistant onboarding flag", error);
  }

  clearAssistantOnboardingDismissal();
  dispatchAssistantEvent("assistant:onboarding-reset");
}

export function resetMicrophoneOnboarding(): void {
  clearAIMicrophoneOnboardingFlags();
}

export async function killAccountRegisters(accountId: string): Promise<{
  deletedCount: number;
  accountName?: string;
}> {
  const { accountTransactions, accounts } = getRepositories();

  if (!accountTransactions.isReady) {
    await accountTransactions.waitUntilReady();
  }
  if (!accounts.isReady) {
    await accounts.waitUntilReady();
  }

  const registers = accountTransactions
    .getCache(true)
    .filter((registry) => registry.accountId === accountId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const registry of registers) {
    await accountTransactions.delete(registry.id, false);
  }

  return {
    deletedCount: registers.length,
    accountName: accounts.getLocalById(accountId)?.name,
  };
}

function toCSV(data: DocumentModel[]): string {
  const headers = data.reduce((acc, item) => {
    Object.keys(item).forEach((key) => {
      if (!acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, [] as string[]);

  const csvRows = [headers.join(",")];
  data.forEach((item) => {
    const values = headers.map((header) =>
      JSON.stringify(item[header as keyof DocumentModel])?.replaceAll(",", ";"),
    );
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

function formatExportError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown export error";
}

type ImportPayload = {
  schemaVersion?: number;
  collection: RepoName;
  date: string;
  encryption?: ExportEncryptionMetadata;
  documents: DocumentModel[];
};

export function parseImportPayload(rawContent: string, fileName: string, repoNames: RepoName[]): ImportPayload {
  const parsed = JSON.parse(rawContent, importJsonReviver) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Formato inválido em "${fileName}". Esperado: objeto JSON.`);
  }

  const payload = parsed as Partial<ImportPayload>;
  if (typeof payload.collection !== "string" || payload.collection.trim().length === 0) {
    throw new Error(`Formato inválido em "${fileName}": campo "collection" ausente.`);
  }
  if (payload.collection.includes("/")) {
    throw new Error(
      `Formato inválido em "${fileName}": "collection" deve conter apenas o nome da coleção.`,
    );
  }
  if (!repoNames.includes(payload.collection as RepoName)) {
    throw new Error(`Coleção desconhecida em "${fileName}": ${payload.collection}.`);
  }
  if (typeof payload.date !== "string" && !(payload.date instanceof Date)) {
    throw new Error(`Formato inválido em "${fileName}": campo "date" ausente.`);
  }
  if (!Array.isArray(payload.documents)) {
    throw new Error(`Formato inválido em "${fileName}": campo "documents" deve ser um array.`);
  }

  const encryption = parseEncryptionMetadata(payload.encryption);
  for (const [index, document] of payload.documents.entries()) {
    if (!document || typeof document !== "object") {
      throw new Error(`Formato inválido em "${fileName}": documento ${index + 1} inválido.`);
    }
    const id = (document as Partial<DocumentModel>).id;
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new Error(
        `Formato inválido em "${fileName}": documento ${index + 1} sem campo "id" válido.`,
      );
    }
  }

  return {
    collection: payload.collection as RepoName,
    date: payload.date instanceof Date
      ? payload.date.toISOString()
      : payload.date,
    encryption,
    documents: payload.documents as DocumentModel[],
  };
}

function importJsonReviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && isIsoDateString(value)) {
    return new Date(value);
  }
  return value;
}

function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value);
}

function parseEncryptionMetadata(value: unknown): ExportEncryptionMetadata | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const encryption = value as Partial<ExportEncryptionMetadata>;
  return {
    isEncrypted: encryption.isEncrypted === true,
    source: encryption.source === "firestore" ? "firestore" : "memory",
    version: typeof encryption.version === "number" || typeof encryption.version === "boolean"
      ? encryption.version
      : null,
  };
}

function getExportEncryptionMetadata(
  repo: Repositories[RepoName],
  jsonMode: ExportJsonMode,
): ExportEncryptionMetadata {
  const isCryptRepo = repo instanceof RepositoryWithCrypt;
  const shouldExportEncrypted = jsonMode === "encrypted" && isCryptRepo;

  return {
    isEncrypted: shouldExportEncrypted,
    source: shouldExportEncrypted ? "firestore" : "memory",
    version: shouldExportEncrypted ? CryptoPassRepository.ENCRYPTION_VERSION : null,
  };
}

async function resolveImportDocuments(
  payload: ImportPayload,
  fileName: string,
  password?: string,
): Promise<DocumentModel[]> {
  const encryption = payload.encryption;
  const documents = payload.documents as Record<string, unknown>[];
  if (!isEncryptedImport(payload, documents)) {
    return payload.documents;
  }

  const importHash = await resolveImportHash(password);
  if (!importHash) {
    throw new ImportPasswordRequiredError([fileName]);
  }

  return await decryptImportedDocuments(documents, importHash, encryption?.version ?? true) as DocumentModel[];
}

export function isEncryptedImport(
  payload: Pick<ImportPayload, "encryption" | "documents">,
  documents: Record<string, unknown>[] = payload.documents as Record<string, unknown>[],
): boolean {
  if (payload.encryption?.isEncrypted) {
    return true;
  }
  return documents.some((document) => isEncryptedRecord(document));
}

async function resolveImportHash(
  password?: string,
): Promise<Hash | null> {
  const currentHash = getCurrentSyncHash();
  if (currentHash) {
    return currentHash;
  }

  const normalizedPassword = password?.trim();
  if (!normalizedPassword) {
    return null;
  }

  const passwordHash = await Encryptor.createHash(normalizedPassword);
  return passwordHash;
}

async function decryptImportedDocuments(
  documents: Record<string, unknown>[],
  hash: Hash,
  version: boolean | number,
): Promise<Record<string, unknown>[]> {
  const encryptor = new Encryptor(version);
  await encryptor.initWithHash(hash, version);

  return await Promise.all(
    documents.map(async (document) => {
      const decrypted = await encryptor.decrypt(document);
      if (isEncryptedRecord(decrypted)) {
        throw new Error("Não foi possível descriptografar o arquivo importado com a senha informada.");
      }
      return decrypted;
    }),
  );
}

function getCurrentSyncHash(): Hash | null {
  const uid = getCurrentUser()?.uid;
  if (!uid) {
    return null;
  }
  return CryptoPassRepository.getSyncHash(uid);
}

function isEncryptedRecord(value: unknown): value is Record<string, unknown> & { encrypted: boolean | number } {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, "encrypted") &&
    (typeof (value as { encrypted?: unknown }).encrypted === "boolean" ||
      typeof (value as { encrypted?: unknown }).encrypted === "number"),
  );
}
