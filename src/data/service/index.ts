import getRepositories, { Repositories } from "@repositories";
import { BalanceService } from "./BalanceService";
import TimelineService from "./TimelineService";
import { getCurrentUser } from "@configs";

export type Services = {
  timeline: TimelineService;
  balance: BalanceService;
}

export type ServiceName = keyof Services;
export type InitedServices = {
  [K in ServiceName]: Promise<Services[K]>
}

export type ServicesInstance = {
  uid: string;
  instances: Services
}
let servicesInstances: ServicesInstance | null = null;

export function resetServices(uid: string, repositories: Repositories): Services {
  if (servicesInstances?.uid === uid) return servicesInstances.instances;

  const timeline = new TimelineService(repositories);
  const instances: Services = {
    timeline,
    balance: new BalanceService(timeline),
  };

  servicesInstances = { uid, instances };
  return instances;
}

export function clearServices(): void {
  servicesInstances = null;
}

export function getServices(): Services {
  const uuid = getCurrentUser()?.uid;
  if (!servicesInstances && uuid) {
    resetServices(uuid, getRepositories());
  }
  if (!servicesInstances) throw new Error("Services not initialized");
  return servicesInstances.instances;
}

export type * from "./TimelineService";
