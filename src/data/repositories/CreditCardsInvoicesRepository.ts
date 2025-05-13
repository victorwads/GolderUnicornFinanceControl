import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';

import getRepositories from ".";
import CreditCardInvoice from "../models/CreditCardInvoice";
import { WithInvoiceTime } from "../models/CreditCardRegistry";

export default class CreditCardInvoicesRepository extends RepositoryWithCrypt<CreditCardInvoice> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.CreditCardInvoices}`, CreditCardInvoice);
  }

  public getNextInvoices(): CreditCardInvoice[] {
    return [];
  }

  public getInvoices(cardId: string): CreditCardInvoice[] {

    const { creditCardsRegistries } = getRepositories();

    const invoices = this.getCache()
      .filter((invoice) => invoice.cardId === cardId)
      .sort((a, b) => a.year - b.year || a.month - b.month);

    const lastSavedInvoiceTime = CreditCardInvoicesRepository.getLastInvoiceTime(invoices);
    const lastRegistryInvoiceTime = CreditCardInvoicesRepository.getLastInvoiceTime(
      creditCardsRegistries.getRegistriesByCard(cardId)
    );

    if (lastSavedInvoiceTime.year === lastRegistryInvoiceTime.year &&
      lastSavedInvoiceTime.month === lastRegistryInvoiceTime.month) {
      return invoices;
    }

    const futureInvoices = [];
    const currentInvoiceTime: WithInvoiceTime = {...lastSavedInvoiceTime};
    while (currentInvoiceTime.year < lastRegistryInvoiceTime.year || (
      currentInvoiceTime.year === lastRegistryInvoiceTime.year &&
      currentInvoiceTime.month < lastRegistryInvoiceTime.month
    )) {
      if (currentInvoiceTime.month === 12) {
        currentInvoiceTime.year++;
        currentInvoiceTime.month = 1;
      } else {
        currentInvoiceTime.month++;
      }
      const invoice = new CreditCardInvoice(
        '', cardId,
        new Date(currentInvoiceTime.year, currentInvoiceTime.month - 1, 1),
        currentInvoiceTime.year, currentInvoiceTime.month,
        0,
      );
      futureInvoices.push(invoice);
    }

    return [...invoices, ...futureInvoices];
  }

  static getLastInvoiceTime(times: WithInvoiceTime[]): WithInvoiceTime {
    return times.reduce((acc, time) => {
      if (time.year > acc.year || time.month > acc.month) {
        return { year: time.year, month: time.month };
      }
      return acc;
    }, { year: 0, month: 0 });
  }
}
