import fs from "fs";
import path from "path";

import Importer, { FileInfo } from "./Importer";

import Bank from "../data/models/Bank";
import { Collections } from "../data/firebase/Collections";
import Encryptor from '../data/crypt/Encryptor';

export const BancosFile = {type: "json", name: "bancos.json"};

export default class BanksImporter extends Importer<Bank, Bank> {

  private static readonly fileName = 'bancos.json';

  constructor(db: FirebaseFirestore.Firestore, encryptor: Encryptor) {
    super(db,db.collection(Collections.Banks), Bank, encryptor, false);
  }

  public async process(): Promise<void> {
    const batch = this.db.batch();

    for (const [key, data] of Object.entries(this.items)) {
      const docRef = this.collection.doc(key);
      batch.set(docRef, await this.toFirestore(data));
    }

    await batch.commit();
    console.log('Processamento concluído.', this.collection.id);
  }

  async loadFrom(db: FirebaseFirestore.Firestore) {
    const cache = this.readJsonFile(BancosFile);

    if(cache) {
      this.items = cache as any;
    } else {
      const snapshot = await db
        .collection(Collections.Banks)
        .get();
      for (const doc of snapshot.docs) {
        this.items[doc.id] = await this.fromFirestore(doc.id, doc.data());
      }
      this.writeToFile(BancosFile, this.items);
    }
    console.log('Bancos existentes carregados:', Object.keys(this.items).length);
  }

  public getByName(name?: string): Bank | undefined {
    return Object.values(this.items).find(bank => 
      bank.name?.toLowerCase()?.trim() === name?.toLowerCase().trim()
      || bank.fullName?.toLowerCase()?.trim() === name?.toLowerCase().trim()
    );
  }

  private writeToFile(info: FileInfo, data: any) {
    const filePath = path.join(__dirname, '..', 'converter', 'result', info.type, info.name);
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Escrevendo arquivo: ${filePath}`);
  }
}