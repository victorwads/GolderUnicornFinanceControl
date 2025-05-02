import BaseRepository from "./Repository";

import { Collections } from "../firebase/Collections";
import CreditCardInvoice from "../models/CreditCardInvoice";

export default class CreditCardInvoicesRepository extends BaseRepository<CreditCardInvoice> {
  
  protected cacheDuration = 24 * 60 * 60 * 1000; // 1 dia

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.CreditCardInvoices}`, CreditCardInvoice.firestoreConverter);
  }
}
