import Importer from "./Importer";

import Bank from "../data/models/Bank";
import { Collections } from "../data/firebase/Collections";

export default class BanksImporter extends Importer<Bank, Bank> {

  constructor(db: FirebaseFirestore.Firestore) {
    super(db,db.collection(Collections.Banks), Bank);
  }

  public async process(): Promise<void> {
    const batch = this.db.batch();

    for (const [key, data] of Object.entries(this.items)) {
      const docRef = this.collection.doc(key);
      batch.set(docRef, this.toFirestore(data));
    }

    await batch.commit();
    console.log('Processamento concluído.', this.collection.id);
  }

  async loadFrom(db: FirebaseFirestore.Firestore) {
    const snapshot = await db
      .collection(Collections.Banks)
      .get();
    snapshot.forEach(doc => {
      this.items[doc.id] = this.fromFirestore(doc.id, doc.data());
    });
    console.log('Bancos existentes carregados:', Object.keys(this.items).length);
  }

  public getByName(name?: string): Bank | undefined {
    return Object.values(this.items).find(bank => 
      bank.name?.toLowerCase()?.trim() === name?.toLowerCase().trim()
      || bank.fullName?.toLowerCase()?.trim() === name?.toLowerCase().trim()
    );
  }
}