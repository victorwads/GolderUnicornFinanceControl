import JSZip from "jszip";

import { DocumentModel } from "@models";
import { getCurrentUser } from "@configs";
import getRepositories, {
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

const RESAVE_CHUNK_SIZE = 100;
const FIREBASE_BATCH_MAX_WRITES = 500;
const DELETE_DATA_IGNORED_REPOS: RepoName[] = ["banks"];

export type ExportFormat = "json" | "csv" | "all";
export type ProgressUpdater = (progress: DataProgressInfo | null) => void;
export type ExportFailure = {
  domain: string;
  message: string;
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

export async function exportUserData(
  format: ExportFormat,
  setProgress?: ProgressUpdater,
): Promise<ExportUserDataResult> {
  const allRepos = getRepositories();
  const repoKeys = Object.keys(allRepos) as RepoName[];
  const zip = new JSZip();
  const exportedDomains: RepoName[] = [];
  const failedDomains: ExportFailure[] = [];
  const date = new Date().toISOString().split("T")[0];
  const fileName = buildExportZipFileName(format, date);

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
          zip.file(
            `${key}.json`,
            JSON.stringify(
              {
                collection: key,
                date: new Date().toISOString(),
                documents: data,
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

function buildExportZipFileName(format: ExportFormat, date: string): string {
  const userEmail = getCurrentUser()?.email || "unknown";
  const formatPart = format.toUpperCase();
  return `GUMyFinances ${userEmail} ${date} ${formatPart}.zip`;
}

export async function deleteAllUserData(setProgress?: ProgressUpdater): Promise<void> {
  const repositories = getRepositories();
  const entries = Object.entries(repositories).filter(
    ([key]) => !DELETE_DATA_IGNORED_REPOS.includes(key as RepoName),
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
): Promise<ImportUserDataResult> {
  const allRepos = getRepositories();
  const repoNames = Object.keys(allRepos) as RepoName[];
  const importedFiles: ImportUserDataResult["importedFiles"] = [];
  const failedFiles: ImportUserDataResult["failedFiles"] = [];
  let totalImportedCount = 0;

  try {
    for (const [index, file] of files.entries()) {
      try {
        const text = await file.text();
        const payload = parseImportPayload(text, file.name, repoNames);
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

        await repo.saveAll(payload.documents as any[]);

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
        const message = error instanceof Error ? error.message : "Unknown import error";
        failedFiles.push({
          fileName: file.name,
          message,
        });
      }
    }

    if (importedFiles.length === 0) {
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
  collection: RepoName;
  date: string;
  documents: DocumentModel[];
};

function parseImportPayload(rawContent: string, fileName: string, repoNames: RepoName[]): ImportPayload {
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
