import UserRepository from "./UserRepository";
import BanksRepository from "./BanksRepository";
import AccountsRepository from './AccountsRepository';
import CategoriesRepository from "./CategoriesRepository";
import AccountsRegistryRepository from "./AccountsRegistryRepository";
import CreditCardInvoicesRepository from "./CreditCardsInvoicesRepository";
import CreditCardsRegistryRepository from "./CreditCardsRegistryRepository";
import GroceriesProductsRepository from './GroceriesProductsRepository';
import GroceriesRepository from './GroceriesRepository';

import Encryptor from '../crypt/Encryptor';
import RepositoryWithCrypt from "./RepositoryWithCrypt";
import ResourcesUseRepository from './ResourcesUseRepository';
import CreditcardsRepository from "./CreditcardsRepository";
import BaseRepository from "./RepositoryBase";
import { getCurrentUser } from "@configs";

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
  products: GroceriesProductsRepository;
  groceries: GroceriesRepository;
  resourcesUse: ResourcesUseRepository;
}

export type RepoName = keyof Repositories;
export type InitedRepositories = {
  [K in RepoName]: Promise<Repositories[K]>
}


export type RepositoriesInstance = {
  uid: string;
  promise: Promise<void[]>;
  instances: Repositories
}
let repositorieInstances: RepositoriesInstance | null = null;

export async function resetRepositories(): Promise<void> {
  const { uid } = getCurrentUser()!;
  if (!uid) throw new Error('User not authenticated');
  if (repositorieInstances?.uid === uid) return;

  const instances: Repositories = {
    user: new UserRepository(),
    banks: new BanksRepository(),
    categories: new CategoriesRepository(),
    accounts: new AccountsRepository(),
    accountRegistries: new AccountsRegistryRepository(),
    creditCards: new CreditcardsRepository(),
    creditCardsRegistries: new CreditCardsRegistryRepository(),
    creditCardsInvoices: new CreditCardInvoicesRepository(),
    cardsInvoices: new CreditCardInvoicesRepository(),
    products: new GroceriesProductsRepository(),
    groceries: new GroceriesRepository(),
    resourcesUse: new ResourcesUseRepository(),
  }

  debugTimestamp('Modules Initialization', initTime);
  const initEncryption = Date.now();
  const encryptorInstance = new Encryptor();
  await encryptorInstance.init(uid);
  debugTimestamp('Encryptor initialized', initEncryption);

  const initRepos = Date.now();
  let totalRepoTime = 0;
  const toWait = Object.entries(instances).map(([key, repo]) => {
    if (repo instanceof RepositoryWithCrypt) repo.config(encryptorInstance);
    const init = Date.now();
    return repo.reset(uid);
  });
  
  repositorieInstances = {
    uid,
    promise: Promise.all(toWait),
    instances: instances
  }
  await repositorieInstances?.promise;
}

export function clearRepositories(): void {
  repositorieInstances = null;
}

export default function getRepositories(): Repositories {
  if (!repositorieInstances) throw new Error('Repositories not initialized. Call resetRepositories() first.');
  return repositorieInstances.instances;
}

export function getRepositoriesWhenReady(): InitedRepositories {
  return new Proxy(getRepositories(), {
    get(target: Repositories, prop: RepoName): Promise<Repositories[RepoName]> {
      return (async () => {
        if(!target[prop].isReady) {
          await target[prop].waitUntilReady();
        }
        return target[prop];
      })();
    }
  }) as unknown as InitedRepositories;
}

export async function waitUntilReady(...names: RepoName[]): Promise<void> {
  const repos = getRepositories();
  const toWait = names.filter(name => !repos[name].isReady)
  if (toWait.length === 0) return;

  await Promise.all(toWait.map(name => repos[name].waitUntilReady()));
}

const initTime = Date.now();
function debugTimestamp(message: string, init: number): number {
  const time = Date.now() - init;
  console.log(`[${time/1000}s] ${message}`);
  return time;
}

if(getCurrentUser()) {
  resetRepositories();
}
