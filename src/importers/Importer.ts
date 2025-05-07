import fs from 'fs';
import path from 'path';
import { CollectionReference } from 'firebase-admin/firestore';
import DocumentModel from '../data/models/DocumentModel';

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
  ) { }

  abstract process(): Promise<void>;

  protected async loadExistentes() {
    const snapshot = await this.collection.get();
    snapshot.forEach(doc => {
      const data = this.fromFirestore(doc.id, doc.data());
      this.items[doc.id] = data;
    });
  }

  protected readJsonFile(fileInfo: FileInfo): JT[] {
    const filePath = path.join(__dirname, '..', 'converter', 'result', fileInfo.type, fileInfo.name);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`Lendo arquivo: ${filePath}`);
    return JSON.parse(content) as JT[];
  }

  protected fromFirestore(id: string, data: object): T {
    return Object.assign(
        new (this.modelClass)(),
        data, { id }
    );
  }

  protected toFirestore(model: T): object {
      const data = { 
          ...model,
          _updatedAt: new Date(),
      } as any;
      delete data.id;
      return data
  }

}