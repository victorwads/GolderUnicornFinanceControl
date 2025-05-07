import {
  doc, runTransaction,
  Timestamp, DocumentData,
} from "firebase/firestore";

import { EncryptorSingletone } from "../crypt/Encryptor";
import DocumentModel from "../models/DocumentModel";
import BaseRepository from "./RepositoryBase";

export default abstract class RepositoryWithCrypt<Model extends DocumentModel> extends BaseRepository<Model> {

  protected override async fromFirestore(id: string, data: DocumentData): Promise<Model> {
    if (data.encrypted === true) {
      const newData = await EncryptorSingletone.decrypt(data, this.dataValueDecryptor);
      return await super.fromFirestore(id, newData);
    }
    const model = await super.fromFirestore(id, data);

    // this.encryptQueeue.push(model);
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

  private dataValueDecryptor(value: any): any {
    if (value instanceof Date) {
      return Timestamp.fromDate(value);
    }
    return value;
  }

  private encryptQueeue: Model[] = [];

  private proccessEncryptionQueue() {
    if (this.encryptQueeue.length > 0) {
      runTransaction(this.db, async (transaction) => {
        let model = this.encryptQueeue.pop()
        while (model) {
          const data = this.toFirestore(model);
          const encryptedData = await EncryptorSingletone.encrypt(data);
          transaction.set(doc(this.ref, model.id), encryptedData);
          BaseRepository.updateUse((use) => {
            use.remote.writes++;
          });      

          model = this.encryptQueeue.pop();
        }
      }).catch((error) => {
        console.error("Transaction failed: ", error);
      });
    }
  }

}
