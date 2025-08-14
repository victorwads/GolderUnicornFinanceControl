import {
  doc, DocumentData,
  Query,
  writeBatch,
} from "firebase/firestore";

import { DocumentModel } from "@models";

import Encryptor from "../crypt/Encryptor";
import BaseRepository from "./RepositoryBase";
import { addResourceUse } from "./ResourcesUseRepositoryShared";

export default abstract class RepositoryWithCrypt<Model extends DocumentModel> extends BaseRepository<Model> {

  private encryptor?: Encryptor = undefined;

  public init(encryptor: Encryptor) {
    this.encryptor = encryptor;
  }

  private encryptionDisabled(): boolean {
    return window.isDevelopment && localStorage.getItem('disableEncryption') === 'true';
  }

  protected override async createQuery(fields: Partial<Model>): Promise<Query<Model, DocumentData>> {
    if (!this.encryptor) throw new Error('Encryptor not initialized');
    const encryptedFields = await this.encryptor.encrypt(fields, [], 1);
    delete (encryptedFields as any).encrypted;

    return super.createQuery(encryptedFields);
  }

  protected override async fromFirestore(id: string, data: DocumentData): Promise<Model> {
    if (!this.encryptor) throw new Error('Encryptor not initialized');

    if (data && data.encrypted === true) {
      const newData = await this.encryptor.decrypt(data);
      return await super.fromFirestore(id, newData);
    }
    const model = await super.fromFirestore(id, data);

    if (!this.encryptionDisabled()) {
      this.encryptQueeue.push(model);
    }
    return model;
  }

  protected override async toFirestore(model: Model): Promise<DocumentData> {
    if (!this.encryptor) throw new Error('Encryptor not initialized');

    const data = await super.toFirestore(model);
    if (this.encryptionDisabled()) {
      const result = { ...data };
      delete result.encrypted;
      return result;
    }
    return await this.encryptor.encrypt(data);
  }

  protected override postQueryProcess(items: Model[]): void {
    super.postQueryProcess(items);
    this.proccessEncryptionQueue();
  }

  private encryptQueeue: Model[] = [];

  private async proccessEncryptionQueue() {
    if (!this.encryptor) throw new Error('Encryptor not initialized');

    if (this.encryptQueeue.length > 0) {
      const batch = writeBatch(this.db);

      let writes = 0;
      while (true) {
        let model = this.encryptQueeue.pop();
        if (!model) break;
        if (writes > 100) {
          setTimeout(() => this.proccessEncryptionQueue(), 5000);
          break;
        }

        const data = await this.toFirestore(model);
        batch.set(doc(this.ref, model.id), data);
        model = this.encryptQueeue.pop();
        writes++;
      }

      await batch.commit();
      addResourceUse({
        db: { remote: { writes } }
      });
    }
  }
}
