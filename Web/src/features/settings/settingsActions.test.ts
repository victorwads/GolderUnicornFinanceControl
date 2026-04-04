import { beforeAll, describe, expect, it } from "vitest";

let parseImportPayload: typeof import("./settingsActions").parseImportPayload;
let isEncryptedImport: typeof import("./settingsActions").isEncryptedImport;
let isProtectedUserDataRepo: typeof import("./settingsActions").isProtectedUserDataRepo;

beforeAll(async () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
    },
  });

  const settingsActions = await import("./settingsActions");
  parseImportPayload = settingsActions.parseImportPayload;
  isEncryptedImport = settingsActions.isEncryptedImport;
  isProtectedUserDataRepo = settingsActions.isProtectedUserDataRepo;
});

describe("settingsActions import payload", () => {
  const repoNames = ["accounts", "user", "resourcesUse"] as never[];

  it("parses the standard export format", () => {
    const payload = parseImportPayload(
      JSON.stringify({
        schemaVersion: 2,
        collection: "accounts",
        date: "2026-04-03T12:00:00.000Z",
        documents: [
          {
            id: "account-1",
            name: "Main account",
          },
        ],
      }),
      "accounts.json",
      repoNames,
    );

    expect(payload.collection).toBe("accounts");
    expect(payload.documents).toHaveLength(1);
    expect(isEncryptedImport(payload)).toBe(false);
  });

  it("detects legacy encrypted payloads so they can be rejected safely", () => {
    const payload = parseImportPayload(
      JSON.stringify({
        collection: "accounts",
        date: "2026-04-03T12:00:00.000Z",
        encryption: {
          isEncrypted: true,
        },
        documents: [
          {
            id: "account-1",
            encrypted: true,
          },
        ],
      }),
      "accounts.json",
      repoNames,
    );

    expect(isEncryptedImport(payload)).toBe(true);
  });

  it("marks resourcesUse as protected from import/delete flows", () => {
    expect(isProtectedUserDataRepo("resourcesUse" as never)).toBe(true);
    expect(isProtectedUserDataRepo("accounts" as never)).toBe(false);
  });
});
