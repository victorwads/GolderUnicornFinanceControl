import Importer from "./Importer";
import BanksImporter from "./BanksImporter";

import { Collections } from "../data/firebase/Collections";
import Account, { AccountType } from "../data/models/Account";

import { Contas, ContasFile } from '../converter/result/xlsx/contas';
import Encryptor from "../data/crypt/Encryptor";

const TiposToTypes = {
  "Conta Corrente": AccountType.CURRENT,
  "Poupança": AccountType.SAVINGS,
  "Investimentos": AccountType.INVESTMENT,
  "Dinheiro": AccountType.CASH,
};

export default class AccountsImporter extends Importer<Account, Contas> {

  constructor(
    private banks: BanksImporter,
    db: FirebaseFirestore.Firestore, userPath: string,
    encryptor: Encryptor,
  ) {
    super(db, db.collection(userPath + Collections.Accounts), Account, encryptor);
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile(ContasFile) as Contas[];

    const batch = this.db.batch();

    for (const jsonAccount of data) {
      const existing = this.findByName(jsonAccount.nome);
      if (existing) {
        return;
      }

      const docRef = this.collection.doc();
      const bank = this.banks.getByName(jsonAccount.instituicao);
      if (!bank?.id)
        console.error(`Banco ${jsonAccount.instituicao} não encontrado para a conta ${jsonAccount.nome}`);

      this.items[docRef.id] = new Account(
        docRef.id,
        jsonAccount.nome,
        jsonAccount.saldo_inicial,
        bank?.id!,
        TiposToTypes[jsonAccount.tipo as keyof typeof TiposToTypes],
        jsonAccount.arquivado ? true : false,
      );

      batch.set(docRef, await this.toFirestore(this.items[docRef.id]));
    }

    await batch.commit();

    console.log('Processamento concluído.', this.collection.id);
  }

  protected alreadyExists(item: Account): number {
    return Object.values(this.items).filter(account => {
      return account.name.toLowerCase() === item.name.toLowerCase() &&
        account.bankId === item.bankId &&
        account.type === item.type;
    }).length;
  }

  public findByName(name: string): Account | undefined {
    return Object.values(this.items).find(account => account.name.toLowerCase() === name.toLowerCase());
  }

  public findNameById(accountId: string): string {
    const card = this.items[accountId];
    if (!card) return '';
    return card.name;
  }
}