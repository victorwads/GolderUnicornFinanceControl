import Importer from './Importer';
import CardsImporter from './CardsImporter';
import AccountsImporter from './AccountsImporter';

import CreditCardInvoice from '../data/models/CreditCardInvoice';
import { Collections } from '../data/firebase/Collections';

import {Faturas, FaturasFile} from '../converter/result/xlsx/faturas';
import Encryptor from '../data/crypt/Encryptor';

export default class CardInvoceImporter extends Importer<CreditCardInvoice, Faturas> {
  constructor(
    private cards: CardsImporter,
    private accounts: AccountsImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string, encryptor: Encryptor,
  ) {
    super(db, db.collection(userPath + Collections.CreditCardInvoices), CreditCardInvoice, encryptor);
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile(FaturasFile) as Faturas[];

    const batch = this.db.batch();

    for (const json of data) {
      const invoiceDate = new Date(json.data_fatura);
      const card = this.cards.findByName(json.cartao);
      if(!card) {
        console.error(`Cartão ${json.cartao} não encontrado.`);
        continue;
      }

      const account = this.accounts.findByName(json.conta);
      if (!account) {
        console.error(`Conta ${json.conta} não encontrada.`);
        continue;
      }

      const invoice = new CreditCardInvoice(
        "",
        card.id,
        invoiceDate,
        invoiceDate.getUTCFullYear(),
        invoiceDate.getUTCMonth() + 1,
        json.valor,
        new Date(json.data_pagamento),
        account?.id,
        json.valor_pago,
        json.id?.toString(),
      );

      const existing = this.alreadyExists(invoice);
      const docRef = existing ? this.collection.doc(existing.id) : this.collection.doc();
      invoice.id = docRef.id;

      this.items[docRef.id] = invoice;
      batch.set(docRef, await this.toFirestore(invoice));
    }

    await batch.commit();

    console.log('Importação de faturas finalizada.');
  }

    protected alreadyExists(registro: CreditCardInvoice): CreditCardInvoice | undefined {
      return Object.values(this.items).find(item =>
        (item.importInfo === registro.importInfo) || (
        item.cardId === registro.cardId &&
        item.year === registro.year &&
        item.month === registro.month &&
        item.paidValue === registro.paidValue &&
        item.paymentDate.getTime() === registro.paymentDate.getTime() &&
        item.value === registro.value
        )
      );
    }
}
