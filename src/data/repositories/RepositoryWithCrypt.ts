import {
  doc, runTransaction,
  Timestamp, DocumentData,
  writeBatch,
} from "firebase/firestore";

import { EncryptorSingletone } from "../crypt/Encryptor";
import DocumentModel from "../models/DocumentModel";
import BaseRepository from "./RepositoryBase";

export default abstract class RepositoryWithCrypt<Model extends DocumentModel> extends BaseRepository<Model> {

  protected override async fromFirestore(id: string, data: DocumentData): Promise<Model> {
    if (data.encrypted === true) {
      const newData = await EncryptorSingletone.decrypt(data);
      return await super.fromFirestore(id, newData);
    }
    const model = await super.fromFirestore(id, data);

    this.encryptQueeue.push(model);
    return model;
  }

  protected override async toFirestore(model: Model): Promise<DocumentData> {
    const data = await super.toFirestore(model);
    return await EncryptorSingletone.encrypt(data);
  }

  protected override postQueryProcess(items: Model[]): void {
    super.postQueryProcess(items);
    this.proccessEncryptionQueue();
  }

  private encryptQueeue: Model[] = [];

  private async proccessEncryptionQueue() {
    if (this.encryptQueeue.length > 0) {
      const batch = writeBatch(this.db);

      let writes = 0;      
      while (true) {
        let model = this.encryptQueeue.pop();
        if(!model) break;
        if(writes > 100) {
          setTimeout(() => this.proccessEncryptionQueue(), 5000);
          break;
        }

        const data = this.toFirestore(model);
        const encryptedData = await EncryptorSingletone.encrypt(data);
        batch.set(doc(this.ref, model.id), encryptedData);
        model = this.encryptQueeue.pop();
        writes++;
      }

      await batch.commit();
      BaseRepository.updateUse((use) => {
        use.remote.writes += writes;
      });
    }
  }
}
