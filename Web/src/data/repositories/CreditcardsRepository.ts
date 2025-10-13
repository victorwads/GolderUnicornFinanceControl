import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../firebase/Collections'

import { CreditCard } from "@models";
import { Bank } from '../models/Bank';

export default class CreditcardsRepository extends RepositoryWithCrypt<CreditCard> {
    constructor() {
      super(
        'Credit Card',
        `${Collections.Users}/{userId}/${Collections.CreditCards}`,
        CreditCard,
      );
    }

    getCacheWithBank(): CreditCardWithInfos[] {
        return this.getCache().map(creditCard => ({
      ...creditCard,
      bank: new Bank('', creditCard.name, '', creditCard.brand.toLowerCase() + '.png')
    }));
    }
}

export interface CreditCardWithInfos extends CreditCard {
  bank: Bank
}
