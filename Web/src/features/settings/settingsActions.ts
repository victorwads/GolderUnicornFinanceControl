import JSZip from "jszip";

import { DocumentModel } from "@models";
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
const DELETE_DATA_IGNORED_REPOS: RepoName[] = ["banks"];

export type ExportFormat = "json" | "csv" | "all";
export type ProgressUpdater = (progress: DataProgressInfo | null) => void;

export async function exportUserData(
  format: ExportFormat,
  setProgress?: ProgressUpdater,
): Promise<void> {
  const allRepos = getRepositories();
  const repoKeys = Object.keys(allRepos) as RepoName[];
  const zip = new JSZip();

  try {
    for (const [index, key] of repoKeys.entries()) {
      const repo = allRepos[key];
      setProgress?.({
        domain: key,
        current: index + 1,
        max: repoKeys.length,
      });

      if (!repo.isReady) {
        await repo.waitUntilReady();
      }

      const data = await repo.getAll();
      if (format === "json" || format === "all") {
        zip.file(`${key}.json`, JSON.stringify(data, null, 2));
      }
      if (format === "csv" || format === "all") {
        zip.file(`${key}.csv`, toCSV(data));
      }
    }

    const date = new Date().toISOString().split("T")[0];
    const suffix = format === "all" ? "backup" : format;
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `golder-unicorn-${suffix}-${date}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } finally {
    setProgress?.(null);
  }
}

export async function deleteAllUserData(setProgress?: ProgressUpdater): Promise<void> {
  const repositories = getRepositories();
  const entries = Object.entries(repositories).filter(
    ([key]) => !DELETE_DATA_IGNORED_REPOS.includes(key as RepoName),
  ) as [RepoName, Repositories[RepoName]][];

  try {
    await exportUserData("all");

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
