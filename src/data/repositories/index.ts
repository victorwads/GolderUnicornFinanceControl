import { getAuth } from "firebase/auth";

import UserRepository from "./UserRepository";
import BanksRepository from "./BanksRepository";
import AccountsRepository from './AccountsRepository';
import CategoriesRepository from "./CategoriesRepository";
import AccountsRegistryRepository from "./AccountsRegistryRepository";
import CreditCardInvoicesRepository from "./CreditCardsInvoicesRepository";
import CreditCardsRegistryRepository from "./CreditCardsRegistryRepository";

import Encryptor from '../crypt/Encryptor';
import RepositoryWithCrypt from "./RepositoryWithCrypt";
import CreditcardsRepository from "./CreditCardsRepository";

export type Repositories = {
  user: UserRepository;
  banks: BanksRepository;
  categories: CategoriesRepository;
  accounts: AccountsRepository;
  accountRegistries: AccountsRegistryRepository;
  creditCards: CreditcardsRepository;
  creditCardsRegistries: CreditCardsRegistryRepository;
  creditCardsInvoices: CreditCardInvoicesRepository;
  cardsInvoices: CreditCardInvoicesRepository;
}
let repositorieInstances: Repositories | null = null;

export async function resetRepositories(): Promise<void> {
  const { uid } = getAuth().currentUser!;
  if (!uid) throw new Error('User not authenticated');

  repositorieInstances = {
    user: new UserRepository(),
    banks: new BanksRepository(),
    categories: new CategoriesRepository(),
    accounts: new AccountsRepository(),
    accountRegistries: new AccountsRegistryRepository(),
    creditCards: new CreditcardsRepository(),
    creditCardsRegistries: new CreditCardsRegistryRepository(),
    creditCardsInvoices: new CreditCardInvoicesRepository(),
    cardsInvoices: new CreditCardInvoicesRepository(),
  }

  const encryptorInstance = new Encryptor();
  await encryptorInstance.init(uid);

  for (const key in repositorieInstances) {
    const repo = repositorieInstances[key as keyof Repositories];
    if (repo instanceof RepositoryWithCrypt) repo.init(encryptorInstance);
    await repo.reset();
  }
}

export function clearRepositories(): void {
  repositorieInstances = null;
}

export default function getRepositories(): Repositories {
  if (!repositorieInstances) throw new Error('Repositories not initialized. Call resetRepositories() first.');
  return repositorieInstances;
}
