import Importer from "./Importer";
import AccountsImporter from "./AccountsImporter";

import { CreditCard } from "../data/models/CreditCard";
import { Collections } from "../data/firebase/Collections";

import {Cartoes, CartoesFile} from '../converter/result/xlsx/cartoes';
import Encryptor from "../data/crypt/Encryptor";

export default class CardsImporter extends Importer<CreditCard, Cartoes> {

  constructor(
    private accounts: AccountsImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string, encryptor: Encryptor,
  ) {
    super(db, db.collection(userPath + Collections.CreditCards), CreditCard, encryptor);
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile(CartoesFile) as Cartoes[];

    const batch = this.db.batch();

    for (const jsonCard of data) {
      const existing = this.findByName(jsonCard.nome);
      if (existing) continue;

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
        jsonCard.arquivado ? true : false,
        jsonCard.conta_id?.toString(),
      );

      batch.set(docRef, await this.toFirestore(this.items[docRef.id]));
    }

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
