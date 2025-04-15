import Importer from './Importer';
import CategoriesImporter from './CategoriesImporter';
import { Collections } from '../data/firebase/Collections';
import AccountsImporter from './AccountsImporter';
import AccountsRegistry from '../data/models/AccountRegistry';

interface JsonAccountRegistry {
  valor: number;
  descricao: string;
  data_despesa: string;
  categoria: string;
  sub_categoria?: string;
  conta: string;
  observacao?: string;
}


export default class AccountRegistriesImporter extends Importer<AccountsRegistry, JsonAccountRegistry> {

  constructor(
    private accounts: AccountsImporter,
    private categorias: CategoriesImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string
  ) {
    super(db, db
      .collection(userPath + Collections.AccountsRegistries)
      .withConverter<AccountsRegistry>(AccountsRegistry.firestoreConverter as any)
    );
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile('despesas.json');

    const batch = this.db.batch();

    let equals = 0;
    data.forEach((json, idx) => {
      const docRef = this.collection.doc();

      const account = this.accounts.findByName(json.conta);
      if (!account?.id) {
        console.error(`Bank account ${json.conta} não encontrado.`);
        return;
      }
      const categoria = this.categorias.findByName(json.categoria, json.sub_categoria);
      if (!categoria?.id) {
        console.error(`Categoria ${json.categoria} > ${json.sub_categoria} não encontrada.`);
        return;
      }

      const registro = new AccountsRegistry(
        docRef.id,
        account.id,
        json.valor,
        json.descricao,
        new Date(json.data_despesa),
        categoria.id,
        json.observacao,
        idx
      );

      if (this.alreadyExists(registro) > 0) {
        equals++;
        return;
      }

      this.items[docRef.id] = registro;
      batch.set(docRef, registro);
    });
    await batch.commit();

    this.sumAndPrint();
    console.log(`Registros iguais encontrados: ${equals} de ${data.length}`);
    console.log('Importação de despesas de conta finalizada.', Object.keys(this.items).length);
  }
  
  private alreadyExists(registro: AccountsRegistry): number {
    return Object.values(this.items).filter(item =>
      item.accountId === registro.accountId &&
      item.value === registro.value &&
      item.description === registro.description &&
      item.categoryId === registro.categoryId &&
      item.date.getTime() === registro.date.getTime() &&
      item.importInfo === registro.importInfo
    ).length;
  }
  
  private sumAndPrint() {
    const total = Object.values(this.items).reduce((acc, item) => acc + item.value, 0);
    console.log('Total de despesas em contas:', total);
    const totalPorConta = Object.values(this.items).reduce((acc, item) => {
      const card = this.accounts.findNameById(item.accountId);
      if(!acc[card]) {
        acc[card] = 0;
      }
      acc[card] += item.value;
      return acc;
    }, {} as any);
    console.log('Total por conta:', totalPorConta);
  }

  private async loadExistentes() {
    const snapshot = await this.collection.get();
    snapshot.forEach(doc => {
      const data = doc.data();
      this.items[doc.id] = data;
    });
  }
}
