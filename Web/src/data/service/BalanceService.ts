import { AccountsRegistry } from "../models/AccountRegistry";

import FinancialMonthPeriod, {
  Month,
  MonthKey,
  MonthNumber,
  Period,
} from "@utils/FinancialMonthPeriod";
import TimelineService from "./TimelineService";
import { Registry } from "@models";

type Key = "all" | string;
export interface BalanceSnapshot {
  closingBalance: number;
  schema: string;
}

type MonthBalanceCache = Record<Key, BalanceSnapshot>;
type BalanceCache = Partial<Record<MonthKey, MonthBalanceCache>>;

export class BalanceService {
  private static SCHEMA = "v1";
  private cache: BalanceCache = {};

  constructor(
    private timeline: TimelineService,
    public readonly period = new FinancialMonthPeriod(1)
  ) {}

  getBalance(accountIds: string|string[] = [], date: Date = new Date()): number {
    const ids = Array.isArray(accountIds) ? accountIds : [accountIds];
    const month = this.period.getMonthForDate(date);
    if(ids.length === 0)
      return this.ensureMonthComputed(month).closingBalance

    return ids.reduce((acc, id) => {
      return acc + this.ensureMonthComputed(month, id).closingBalance;
    }, 0);
  }

  invalidateFrom(date: Date): void {
    const ym = Month.fromDate(date).key;
    Object.keys(this.cache)
      .filter((k) => k >= ym)
      .forEach((k) => {
        delete this.cache[k as MonthKey];
      });
  }

  reset(): void {
    this.cache = {};
  }

  private getRegistriesForMonth(period: Period, accountId?: string): Registry[] {
    return this.timeline.getAccountItems({
        period,
        accountIds: accountId ? [accountId] : [],
        light: true,
        paid: true
    }).map(r => r.registry);
  }

  private ensureMonthComputed(month: Month, accountId?: string): BalanceSnapshot {
    if (this.hasSnapshot(month.key, accountId))
      return this.getSnapshot(month.key, accountId)!;

    const period = this.period.getMonthPeriod(month);
    const snapshot: BalanceSnapshot = {
      closingBalance: 0,
      schema: BalanceService.SCHEMA,
    };
    const monthRegistries = this.getRegistriesForMonth(
      period,
      accountId
    );

    if (this.isFirstMonth(period)) {
      return snapshot;
    }
    const prev = this.prevMonth(month);
    const monthSum = monthRegistries.reduce((acc, r) => acc + r.value, 0);
    const opening = this.ensureMonthComputed(prev,  accountId).closingBalance;

    snapshot.closingBalance = opening + monthSum;
    this.setSnapshot(month.key, accountId, snapshot);
    return snapshot;
  }

  private isFirstMonth(period: Period): boolean {
    return period.start <= this.timeline.getFirstRegistryDate();
  }

  private prevMonth(month: Month): Month {
    if (month.month === 1) {
      return new Month(month.year - 1, 12);
    }
    return new Month(month.year, (month.month - 1) as MonthNumber);
  }

  private hasSnapshot = (ym: MonthKey, account?: Key) =>
    !!this.cache[ym]?.[account || ALL] &&
    this.cache[ym]?.[account || ALL].schema === BalanceService.SCHEMA;

  private getSnapshot = (ym: MonthKey, account?: Key) =>
    this.cache[ym]?.[account || ALL];

  private setSnapshot(
    ym: MonthKey,
    account: Key | undefined,
    snapshot: BalanceSnapshot
  ): void {
    if (!this.cache[ym]) this.cache[ym] = {};
    this.cache[ym][account || ALL] = snapshot;
  }
}

const ALL = "all";
