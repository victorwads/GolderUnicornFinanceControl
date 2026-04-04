import { ProjectStorage } from "@utils/ProjectStorage";

const DEVELOPER_OPTIONS_KEY = "developerOptionsEnabled";

export function isDeveloperOptionsEnabled(): boolean {
  return ProjectStorage.get(DEVELOPER_OPTIONS_KEY) === "true";
}

export function setDeveloperOptionsEnabled(enabled: boolean) {
  if (enabled) {
    ProjectStorage.set(DEVELOPER_OPTIONS_KEY, "true");
    return;
  }

  ProjectStorage.remove(DEVELOPER_OPTIONS_KEY);
}
