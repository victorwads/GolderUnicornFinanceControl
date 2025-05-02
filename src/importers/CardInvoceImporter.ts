import Importer from './Importer';
import CardsImporter from './CardsImporter';
import AccountsImporter from './AccountsImporter';

import CreditCardInvoice from '../data/models/CreditCardInvoice';
import { Collections } from '../data/firebase/Collections';

import {Faturas, FaturasFile} from '../converter/result/xlsx/faturas';

export default class CardInvoceImporter extends Importer<CreditCardInvoice, Faturas> {
  constructor(
    private cards: CardsImporter,
    private accounts: AccountsImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string
  ) {
    super(db, db
      .collection(userPath + Collections.CreditCardInvoices)
      .withConverter<CreditCardInvoice>(CreditCardInvoice.firestoreConverter as any));
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile(FaturasFile) as Faturas[];

    const batch = this.db.batch();

    for (const json of data) {
      const docRef = this.collection.doc();
      const invoiceDate = new Date(json.data_fatura);
      const card = this.cards.findByName(json.cartao);
      if(!card) {
        console.error(`Cartão ${json.cartao} não encontrado.`);
        return;
      }

      const account = this.accounts.findByName(json.conta);
      if (!account) {
        console.error(`Conta ${json.conta} não encontrada.`);
        return;
      }

      const invoice = new CreditCardInvoice(
        docRef.id,
        card.id,
        invoiceDate,
        invoiceDate.getUTCFullYear(),
        invoiceDate.getUTCMonth() + 1,
        json.valor,
        new Date(json.data_pagamento),
        account?.id,
        json.valor_pago,
      );

      this.items[docRef.id] = invoice;
      batch.set(docRef, invoice);
    }

    await batch.commit();

    console.log('Importação de faturas finalizada.');
  }
}
