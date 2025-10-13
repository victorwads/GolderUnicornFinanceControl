import { FieldValue } from "firebase/firestore";

import getBroadcastChannel from "@utils/Broadcast";
import { AIUses, DocumentModel } from "@models";

let STATIC_INSTANTE: ResourcesUseRepository | null = null;
const CHANNEL_NAME = "ResourcesUseRepository";

export class ResourcesUseModel extends DocumentModel {
  constructor(id: string, public use?: ResourceUsage) {
    super(id);
  }
}

export const ResourceUseChannel = getBroadcastChannel<UsageMsgTypes, ResourceUsage>(CHANNEL_NAME);

export function setInstance(instance: typeof STATIC_INSTANTE): void {
  STATIC_INSTANTE = instance
}

export function addResourceUse(additions: ResourceUsage): void {
  if (!STATIC_INSTANTE)
    throw new Error("ResourcesUseRepository not initialized");
  STATIC_INSTANTE.add(additions);
}

export type UsageMsgTypes = 'addition'

export interface ResourcesUseRepository {
  currentUse: ResourceUsage;
  add: (additions: ResourceUsage) => void;
}

export interface ResourceUseNode<T = number> {
  [key: string]: T | ResourceUseNode<T> | undefined;
}

interface DBResourceUse<T = number> extends ResourceUseNode<T> {
  queryReads?: T;
  docReads?: T;
  writes?: T;
}

export interface ResourceUsage<T = number> extends ResourceUseNode<T> {
  db?: {
    remote?: DBResourceUse<T>;
    local?: DBResourceUse<T>;
  };
  ai?: AIUses<T>;
}

export type FirestoreDatabasesUse = Partial<DBResourceUse<FieldValue>>;

ResourceUseChannel.subscribe((type, payload) => {
  if (type !== 'addition') return;
  (STATIC_INSTANTE as any)?._add(payload);
});
