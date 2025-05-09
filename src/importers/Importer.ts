import fs from 'fs';
import path from 'path';
import { CollectionReference, Timestamp } from 'firebase-admin/firestore';
import DocumentModel from '../data/models/DocumentModel';
import Encryptor from '../data/crypt/Encryptor';

export interface FileInfo {
  type: string;
  name: string;
}

export default abstract class Importer<T extends DocumentModel, JT> {
  protected items: Record<string, T> = {};

  constructor(
    protected db: FirebaseFirestore.Firestore,
    protected collection: CollectionReference,
    protected modelClass: new (...args: any) => T,
    protected encryptor?: Encryptor,
  ) { }

  abstract process(): Promise<void>;

  protected async loadExistentes() {
    const snapshot = await this.collection.get();
    for (const doc of snapshot.docs) {
      const data = await this.fromFirestore(doc.id, doc.data());
      this.items[doc.id] = data;
    }
  }

  protected readJsonFile(fileInfo: FileInfo): JT[]|null {
    const filePath = path.join(__dirname, '..', 'converter', 'result', fileInfo.type, fileInfo.name);
    if (!fs.existsSync(filePath)) {
      console.error(`Arquivo não encontrado: ${fileInfo.name}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`Lendo arquivo: ${filePath}`);
    return JSON.parse(content) as JT[];
  }

  protected async fromFirestore(id: string, data: object): Promise<T> {
    if (this.encryptor) {
      data = await this.encryptor.decrypt(data);
    }
    function findAndReplaceTimestamps(obj: any): any {
      if (Array.isArray(obj)) return obj.map(findAndReplaceTimestamps);
      if (obj && typeof obj === "object") {
        if (obj instanceof Timestamp) return obj.toDate();
        if (obj.constructor === Object) {
          for (const key in obj) {
            obj[key] = findAndReplaceTimestamps(obj[key]);
          }
        }
      }
      return obj;
    }
    data = findAndReplaceTimestamps(data);

    return Object.assign(
      new (this.modelClass)(),
      data, { id }
    );
  }

  protected async toFirestore(model: T): Promise<object> {
    let data = {
      ...model,
      _updatedAt: new Date(),
    } as any;
    delete data.id;
    if (this.encryptor) {
      data = await this.encryptor.encrypt(data);
    }
    return data
  }
}