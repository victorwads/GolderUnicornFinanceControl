import Importer from "./Importer";
import AccountsImporter from "./AccountsImporter";

import CreditCard from "../data/models/CreditCard";
import { Collections } from "../data/firebase/Collections";

import {Cartoes, CartoesFile} from '../converter/result/xlsx/cartoes';

export default class CardsImporter extends Importer<CreditCard, Cartoes> {

  constructor(
    private accounts: AccountsImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string
  ) {
    super(db, db
      .collection(userPath + Collections.CreditCards)
      .withConverter<CreditCard>(CreditCard.firestoreConverter as any));
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile(CartoesFile) as Cartoes[];

    const batch = this.db.batch();

    data.forEach(jsonCard => {
      const existing = this.findByName(jsonCard.nome);
      if (existing) return;

      const docRef = this.collection.doc();
      const account = this.accounts.findByName(jsonCard.conta);
      if (!account?.id)
        console.error(`Conta ${jsonCard.conta} não encontrada para o cartão ${jsonCard.nome}`);

      this.items[docRef.id] = new CreditCard(
        docRef.id,
        jsonCard.nome,
        jsonCard.limite,
        jsonCard.bandeira === "Outro" ? "elo" : jsonCard.bandeira.toLowerCase(),
        account?.id!,
        jsonCard.fechamento,
        jsonCard.vencimento,
      );

      batch.set(docRef, this.items[docRef.id]);
    });

    await batch.commit();

    console.log('Importação de cartões concluída.', this.collection.id);
  }

  public findByName(name: string): CreditCard | undefined {
    return Object.values(this.items).find(card => card.name.toLowerCase() === name.toLowerCase());
  }

  public findNameById(cardId: string): string {
    const card = this.items[cardId];
    if (!card) return '';
    return card.name;
  }

}