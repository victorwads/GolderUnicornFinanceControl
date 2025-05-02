import { CollectionReference } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

export default abstract class Importer<T, JT> {
  protected items: Record<string, T> = {};

  constructor(
    protected db: FirebaseFirestore.Firestore,
    protected collection: CollectionReference<T>
  ) { }

  abstract process(): Promise<void>;

  protected async loadExistentes() {
    const snapshot = await this.collection.get();
    snapshot.forEach(doc => {
      const data = doc.data();
      this.items[doc.id] = data;
    });
  }

  protected readJsonFile(fileInfo: {type: string, name: string}): JT[] {
    const filePath = path.join(__dirname, '..', 'converter', 'result', fileInfo.type, fileInfo.name);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`Lendo arquivo: ${filePath}`);
    return JSON.parse(content) as JT[];
  }
}