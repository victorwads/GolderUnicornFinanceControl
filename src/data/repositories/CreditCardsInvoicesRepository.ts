import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';

import CreditCardInvoice from "../models/CreditCardInvoice";

export default class CreditCardInvoicesRepository extends RepositoryWithCrypt<CreditCardInvoice> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.CreditCardInvoices}`, CreditCardInvoice);
  }
}
