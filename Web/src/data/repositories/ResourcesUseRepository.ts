import { doc, getDoc, getDocs, increment } from "firebase/firestore";

import getBroadcastChannel from "@utils/Broadcast";

import BaseRepository from "./RepositoryBase";
import { Collections } from "../firebase/Collections";
import { 
  ResourceUsage, FirestoreDatabasesUse, ResourcesUseRepository as Interface, 
  ResourceUseNode, setInstance, ResourcesUseModel, ResourceUseChannel
} from "./ResourcesUseRepositoryShared";

const CACHE_KEY = "dbUse-";
const MIN_READS_TO_SEND = 100;
const MIN_WRITES_TO_SEND = 10;
const MIN_AI_REQUESTS_TO_SEND = 1;
const MAX_SECONDS_WITHOUT_SENDING = 60 * 5;
const MIN_SECONDS_BETWEEN_UPDATES = 5;
const REPORT_USERS = ["fUztrRAGqQZ3lzT5AmvIki5x0443"]

export default class ResourcesUseRepository extends BaseRepository<ResourcesUseModel> implements Interface {
  private lastSent: Date = new Date();
  private totalCache: ResourceUsage = {};
  private toSendCache: ResourceUsage = {};

  constructor() {
    super(Collections.ResourcesUse, ResourcesUseModel);
  }

  public get currentUse() {
    return this.totalCache;
  }

  public add(additions: ResourceUsage): void {
    this._add(additions);
    this.saveSendCache();
    this.checkShouldSendToDB();
    ResourceUseChannel.publish('addition', additions);
  }

  public async getAllUsersUsage(): Promise<ResourcesUseModel[]> {
    if (!REPORT_USERS.includes(this.safeUserId)) return []
        
    const users = await getDocs(this.ref);
    return users.docs
      .filter(doc => doc.id !== this.safeUserId)
      .map(doc => new ResourcesUseModel(doc.id, doc.data()));
  }

  override async reset(userId?: string): Promise<void> {
    super.reset(userId);
    this.initCaches();
    setInstance(this);
  }

  public _add(additions: ResourceUsage): void {
    sumValues(this.toSendCache, additions, false);
    sumValues(this.totalCache, additions, false);
  }

  private get cacheKey(): string {
    return CACHE_KEY + this.safeUserId;
  }

  private saveSendCache() {
    localStorage.setItem(this.cacheKey, JSON.stringify(this.toSendCache));
  }

  private clearSendCache() {
    this.toSendCache = {};
    localStorage.setItem(this.cacheKey, "{}");
  }

  private async initCaches() {
    this.toSendCache = JSON.parse(localStorage.getItem(this.cacheKey) || "{}");

    const bdUse = await getDoc(doc(this.ref, this.safeUserId));
    this.add({ db: { remote: { docReads: 1 } } });

    sumValues(this.totalCache, bdUse.data() || {}, false);
    sumValues(this.totalCache, this.toSendCache, false);
  }

  private async saveDb(): Promise<void> {
    this.lastSent = new Date();
    await this.set(
      {
        id: this.safeUserId,
        ...incrementUseValues(this.toSendCache),
      } as ResourcesUseModel,
      true,
      false
    );
    this.clearSendCache();
  }

  private async checkShouldSendToDB() {
    const secondsSinceLastSent =
      (new Date().getTime() - this.lastSent.getTime()) / 1000;
    const rules = {
      minSeconds: secondsSinceLastSent > MIN_SECONDS_BETWEEN_UPDATES,
      maxSeconds: false,
      writes: false,
      reads: false,
      ai: false,
    }
    if (
      rules.minSeconds && (
        (rules.maxSeconds = secondsSinceLastSent > MAX_SECONDS_WITHOUT_SENDING) ||
        (rules.writes = (this.toSendCache.db?.remote?.writes || 0) > MIN_WRITES_TO_SEND) ||
        (rules.reads = (this.toSendCache.db?.remote?.docReads || 0) > MIN_READS_TO_SEND) ||
        (rules.ai = Object.entries(this.toSendCache.ai || {}).some(([, value]) => {
          return (value?.requests || 0) > MIN_AI_REQUESTS_TO_SEND;
        }))
      )
    ) {
      this.saveDb();
      console.log("Database use updated:", rules,  this.toSendCache);
    }
  }
}

export const incrementUseValues = (
  use: ResourceUsage
): FirestoreDatabasesUse => {
  const result: FirestoreDatabasesUse = {};
  for (const [key, value] of Object.entries(use)) {
    if (typeof value === "number") {
      result[key] = increment(value);
    } else if (value) {
      const nested = incrementUseValues(value as ResourceUsage);
      if (Object.keys(nested).length > 0) {
        result[key] = nested as any;
      }
    }
  }
  return result;
};

export const sumValues = <T extends ResourceUseNode>(
  source: Partial<T> = {},
  adition: Partial<T> = {},
  copy: boolean = true
): Partial<T> => {
  const result = copy ? copyRecursive(source) : source;
  for (const [key, value] of Object.entries(adition)) {
    const current = source[key];
    if (typeof value === "number") {
      result[key] = (typeof current === "number" ? current : 0) + value;
    } else {
      if (typeof current !== "object" || current === null) {
        result[key] = {} as any;
      }
      result[key] = sumValues(
        source[key] as ResourceUseNode,
        value as ResourceUseNode,
        copy
      );
    }
  }
  return result as Partial<T>;
};

function copyRecursive(obj: ResourceUseNode): ResourceUseNode {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const copy: ResourceUseNode = {};
  for (const [key, value] of Object.entries(obj)) {
    copy[key] = copyRecursive(value as ResourceUseNode);
  }
  return copy;
}
