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

export  { User } from "./UserRepository";

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
  
  debugTimestamp('Modules Initialization', initTime);
  const initEncryption = Date.now();
  const encryptorInstance = new Encryptor();
  await encryptorInstance.init(uid);
  debugTimestamp('Encryptor initialized', initEncryption);

  const initRepos = Date.now();
  let totalRepoTime = 0;
  const toWait = Object.entries(repositorieInstances).map(([key, repo]) => {
    if (repo instanceof RepositoryWithCrypt) repo.init(encryptorInstance);
    const init = Date.now();
    return repo.reset(uid).then(() => {
      totalRepoTime += debugTimestamp(`Repository ${key} initialized`, init);
    });
  });
  await Promise.all(toWait);
  debugTimestamp('Real Time repositories initialization', initRepos);
  console.log(`Total Parallel sum repositories initialization: ${totalRepoTime/1000}s`);
  debugTimestamp('Total initialization', initTime);
}

export function clearRepositories(): void {
  repositorieInstances = null;
}

export default function getRepositories(): Repositories {
  if (!repositorieInstances) throw new Error('Repositories not initialized. Call resetRepositories() first.');
  return repositorieInstances;
}

const initTime = Date.now();
function debugTimestamp(message: string, init: number): number {
  const time = Date.now() - init;
  console.log(`[${time/1000}s] ${message}`);
  return time;
}
