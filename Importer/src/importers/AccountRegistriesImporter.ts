import Importer, { FileInfo } from './Importer';
import AccountsImporter from './AccountsImporter';
import CategoriesImporter from './CategoriesImporter';

import { Collections } from '../data/firebase/Collections';
import { AccountsRegistry } from '../data/models/AccountRegistry';

import {Transferencias, TransferenciasFile} from '../converter/result/xlsx/transferencias';
import {Despesas, DespesasFile} from '../converter/result/xlsx/despesas';
import {Receitas, ReceitasFile} from '../converter/result/xlsx/receitas';
import { RegistryType } from '../data/models/AccountRegistry/Registry';
import Encryptor from '../data/crypt/Encryptor';

type Items = { [key: string]: AccountsRegistry };

export default class AccountRegistriesImporter extends Importer<AccountsRegistry, Despesas|Receitas|Transferencias> {

  constructor(
    private accounts: AccountsImporter,
    private categorias: CategoriesImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string, encryptor: Encryptor,
  ) {
    super(db, db.collection(userPath + Collections.AccountsRegistries), AccountsRegistry, encryptor);
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    await this.processFile(DespesasFile, -1);
    await this.processFile(ReceitasFile, 1);
    await this.processFile(TransferenciasFile, 0, RegistryType.TRANSFER);
  }

  async processFile(file: FileInfo, multiplier: number, type?: RegistryType): Promise<void> {
    const data = await this.readJsonFile(file)!;
    console.log(`Importando ${file.name} de conta...`, data.length);

    const batch = this.db.batch();
    const tempItems: Items = {};

    let equals = 0;
    for (const json of data) {
      const account = this.accounts.findByName(json.conta);
      if (!account?.id) {
        console.error(`Bank account ${json.conta} não encontrado.`);
        continue;
      }

      let categoria = 'categoria' in json
        ? this.categorias.findByName(json.categoria, json.sub_categoria)
        : undefined;
      if ('categoria' in json && !categoria?.id) {
        console.error(`Categoria '${json.categoria}' -> '${json.sub_categoria}' não encontrada.`);
        continue;
      }

      if('data_transferencia' in json) {
        multiplier = json.descricao === "Transferência de Saída" ? -1 : 1
        categoria = this.categorias.findById(
          json.descricao === "Transferência de Saída"
          ? CategoriesImporter.transferOutId
          : CategoriesImporter.transferInId
        );
      }

      const registro = new AccountsRegistry(
        "",
        type || RegistryType.ACCOUNT,
        account.id,
        json.valor * multiplier,
        json.descricao,
        new Date(
          (json as Despesas).data_despesa ??
          (json as Receitas).data_receita ??
          (json as Transferencias).data_transferencia
        ),
        'situacao' in json
          ? json.situacao === 'PAGO' || json.situacao === "RECEBIDO"
          : true,
        json.tags ? json.tags.split(',').map(tag => tag.trim()) : [],
        categoria?.id,
        json.observacao?.toString(),
        json.id?.toString()
      );

      const some = this.alreadyExists(registro);
      if (some) {
        equals++;
      }

      const docRef = some?.id ? this.collection.doc(some?.id) : this.collection.doc();
      this.items[docRef.id] = registro;
      tempItems[docRef.id] = registro;
      registro.id = docRef.id;
      batch.set(docRef, await this.toFirestore(registro));
    }
    await batch.commit();

    this.sumAndPrint(tempItems);
    console.log(`Registros iguais encontrados: ${equals} de ${data.length}`);
    console.log(`Importação de ${file.name} de conta finalizada.`);
  }
  
  protected alreadyExists(registro: AccountsRegistry): AccountsRegistry | undefined {
    return Object.values(this.items).find(item =>
      (item.relatedInfo === registro.relatedInfo && item.description === registro.description) || (
      item.accountId === registro.accountId &&
      item.value === registro.value &&
      item.categoryId === registro.categoryId &&
      item.description === registro.description &&
      item.date.getTime() === registro.date.getTime()
      )
    );
  }
  
  private sumAndPrint(tempItems: Items) {
    const total = Object.values(tempItems).reduce((acc, item) => acc + item.value, 0);
    console.log('Total de despesas em contas:', total);
    const totalPorConta = Object.values(tempItems).reduce((acc, item) => {
      const card = this.accounts.findNameById(item.accountId);
      if(!acc[card]) {
        acc[card] = 0;
      }
      acc[card] += item.value;
      return acc;
    }, {} as any);
    console.log('Total por conta:', totalPorConta);
  }
}
