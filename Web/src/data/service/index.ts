import getRepositories, { Repositories } from "@repositories";
import { BalanceService } from "./BalanceService";
import TimelineService from "./TimelineService";
import FinancialMonthPeriod from "../utils/FinancialMonthPeriod";
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
let unsubscribeAll: (() => void) | null = null;

export function resetServices(uid: string, repositories: Repositories): Services {
  if (servicesInstances?.uid === uid) return servicesInstances.instances;

  const cutOff = parseInt(localStorage.getItem('financeDay') || '1');
  const mode = (localStorage.getItem('financeMode') as "start" | "next") || 'start';
  const period = new FinancialMonthPeriod(cutOff, mode);

  const timeline = new TimelineService(repositories, period);
  const instances: Services = {
    timeline,
    balance: new BalanceService(repositories.accounts, timeline, period),
  };

  // TODO improve invalidation strategy
  const invalidateFrom = () => {
    instances.balance.invalidateFrom();
  }
  const subscriptions = [
    repositories.accounts.addUpdatedEventListenner(invalidateFrom),
    repositories.accountTransactions.addUpdatedEventListenner(invalidateFrom),
    repositories.creditCardsInvoices.addUpdatedEventListenner(invalidateFrom),
  ]

  servicesInstances = { uid, instances };
  unsubscribeAll = () => {
    subscriptions.forEach((un) => un());
    unsubscribeAll = null;
  }
  return instances;
}

export function clearServices(): void {
  servicesInstances = null;
  unsubscribeAll?.();
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
