import BaseRepository from "./Repository";

import { Collections } from "../firebase/Collections";
import CreditCardInvoice from "../models/CreditCardInvoice";

export default class CreditCardInvoicesRepository extends BaseRepository<CreditCardInvoice> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.CreditCardInvoices}`, CreditCardInvoice.firestoreConverter, true);
  }
}
