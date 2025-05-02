import Importer from "./Importer";

import { Collections } from "../data/firebase/Collections";
import Category from "../data/models/Category";

import {Categorias, CategoriasFile} from '../converter/result/xlsx/categorias';

function intToHexColor(color?: number): string | undefined {
  return color ? `#${color.toString(16).padStart(6, '0')}` : undefined;
}

export default class CategoriesImporter extends Importer<Category, Categorias> {
  
  constructor(db: FirebaseFirestore.Firestore, userPath: string) {
    super(db, db
      .collection(userPath + Collections.Categories)
      .withConverter<Category>(Category.firestoreConverter as any)
    );
  }

  async process(): Promise<void> {
    await this.loadExistentes();

    const data = this.readJsonFile(CategoriasFile) as Categorias[];
    this.processRoot(data.filter(d => !d.categoria_pai));
    this.processChildren(data.filter(d => d.categoria_pai));
    // this.printTree();
    console.log('Processamento concluído.', this.collection.id);
  }

  private printTree() {
    console.log('Arvore de Categorias:',
      Object.entries(this.items)
        .filter(([key]) => key.startsWith('root__'))
        .map(([key, ref]) => ({
          id: ref.id,
          key,
          children: Object.entries(this.items)
            .filter(([childKey]) => childKey.startsWith(ref.id!))
            .map(([childKey, childRef]) => childKey.replace(`${ref.id}__`, ''))
        }))
    );
  }

  protected async loadExistentes() {
    const snapshot = await this.collection.get();
    snapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.parentId || 'root'}__${data.name}`;
      this.items[key] = data;
    });
  }

  private async processRoot(raiz: Categorias[]): Promise<void> {
    const batchRaiz = this.db.batch();
    for (const item of raiz) {
      const key = `root__${item.nome}`;

      const ref = this.items[key]?.id ? this.collection.doc(this.items[key]?.id) : this.collection.doc();
      this.items[key] = new Category(ref.id, item.nome, undefined, intToHexColor(item.cor));

      batchRaiz.set(ref, this.items[key]);
      console.log(`Categoria raiz adicionada: ${key}`);
    }
    await batchRaiz.commit();
  }

  private async processChildren(filhas: Categorias[]): Promise<void> {
    const batchFilhas = this.db.batch();
    for (const item of filhas) {
      const parentKey = `root__${item.categoria_pai}`;
      const parentCategory = this.items[parentKey];
      if (!parentCategory) {
        console.warn(`Categoria pai não encontrada: ${item.categoria_pai}`);
        continue;
      }

      const key = `${parentCategory.id}__${item.nome}`;

      const ref = this.items[key]?.id ? this.collection.doc(this.items[key]?.id) : this.collection.doc();
      this.items[key] = new Category(ref.id, item.nome, undefined, intToHexColor(item.cor), parentCategory.id);

      batchFilhas.set(ref, this.items[key]);
      console.log(`Categoria filha adicionada: ${key}`);
    }

    await batchFilhas.commit();
    console.log(`Importação de categorias concluída.`);
  }

  public findByName(parentName: string, childName?: string): Category | undefined {
    const parent = Object.values(this.items).find(category => !category.parentId && category.name.toLowerCase() === parentName.toLowerCase());
    if (!parent) return;
    if (!childName) return parent;

    return Object.values(this.items).find(category => 
      category.name.toLowerCase() === childName.toLowerCase()
      && category.parentId === parent.id
    );
  }
}