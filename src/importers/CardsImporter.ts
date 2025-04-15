import { Collections } from "../data/firebase/Collections";
import CreditCard from "../data/models/CreditCard";
import AccountsImporter from "./AccountsImporter";
import Importer from "./Importer";

interface JsonCartao {
  nome: string;
  limite: number;
  bandeira: string;
  fechamento: number;
  vencimento: number;
  conta: string;
}

export default class CardsImporter extends Importer<CreditCard, JsonCartao> {

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
    const data = this.readJsonFile('cartoes.json') as JsonCartao[];

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
        jsonCard.bandeira,
        account?.id!,
        jsonCard.fechamento,
        jsonCard.vencimento,
      );

      batch.set(docRef, this.items[docRef.id]);
    });

    await batch.commit();

    console.log('Importação de cartões concluída.', this.collection.id);
  }

  private async loadExistentes() {
    const snapshot = await this.collection.get();
    snapshot.forEach(doc => {
      const data = doc.data();
      const key = data.id;
      this.items[key] = data;
    });
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