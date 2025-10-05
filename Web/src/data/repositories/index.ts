import { getCurrentUser } from "@configs";
import Encryptor, { Hash } from '../crypt/Encryptor';
export type { Hash } from '../crypt/Encryptor';

export { User } from "./UserRepository";
import UserRepository from "./UserRepository";
import BanksRepository from "./BanksRepository";
import AccountsRepository from './AccountsRepository';
import CategoriesRepository from "./CategoriesRepository";
import AccountsRegistryRepository from "./AccountsRegistryRepository";
import CreditCardInvoicesRepository from "./CreditCardsInvoicesRepository";
import CreditCardsRegistryRepository from "./CreditCardsRegistryRepository";
import GroceriesProductsRepository from './GroceriesProductsRepository';
import GroceriesRepository from './GroceriesRepository';
import ResourcesUseRepository from './ResourcesUseRepository';
import CreditcardsRepository from "./CreditcardsRepository";
import RepositoryWithCrypt from "./RepositoryWithCrypt";
import CryptoPassRepository from "./CryptoPassRepository";
import AiCallsRepository from "./AiCallsRepository";
export { default as CryptoPassRepository } from './CryptoPassRepository';

export type Repositories = {
  user: UserRepository;
  banks: BanksRepository;
  categories: CategoriesRepository;
  accounts: AccountsRepository;
  accountRegistries: AccountsRegistryRepository;
  creditCards: CreditcardsRepository;
  creditCardsRegistries: CreditCardsRegistryRepository;
  creditCardsInvoices: CreditCardInvoicesRepository;
  products: GroceriesProductsRepository;
  groceries: GroceriesRepository;
  resourcesUse: ResourcesUseRepository;
  aiCalls: AiCallsRepository;
}

export type RepoName = keyof Repositories;
export type InitedRepositories = {
  [K in RepoName]: Promise<Repositories[K]>
}

export type RepositoriesInstance = {
  uid: string;
  instances: Repositories
  encryptor: Encryptor;
}
let repositorieInstances: RepositoriesInstance | null = null;

export const getCurrentRepositoryUserId = (): string | null => {
  if (!repositorieInstances) return null;
  return repositorieInstances.uid;
}

export async function resetRepositories(uid: string, secretHash?: Hash | null): Promise<Repositories> {
  if (repositorieInstances?.uid === uid) return repositorieInstances.instances;

  const instances: Repositories = {
    user: new UserRepository(),
    banks: new BanksRepository(),
    categories: new CategoriesRepository(),
    accounts: new AccountsRepository(),
    accountRegistries: new AccountsRegistryRepository(),
    creditCards: new CreditcardsRepository(),
    creditCardsRegistries: new CreditCardsRegistryRepository(),
    creditCardsInvoices: new CreditCardInvoicesRepository(),
    products: new GroceriesProductsRepository(),
    groceries: new GroceriesRepository(),
    resourcesUse: new ResourcesUseRepository(),
    aiCalls: new AiCallsRepository(),
  }

  const encryptor = new Encryptor(CryptoPassRepository.ENCRYPTION_VERSION);
  repositorieInstances = { uid, instances, encryptor };

  if(secretHash)
    await encryptor.initWithHash(secretHash);
  else
    await encryptor.initWithPass(uid, true);

  const toWait = Object.entries(instances).map(([, repo]) => {
    if (repo instanceof RepositoryWithCrypt) repo.config(encryptor);
    const init = Date.now();
    return repo.reset(uid);
  });
  
  await Promise.all(toWait);

  return instances;
}

export function getEncryptor(): Encryptor {
  if (!repositorieInstances) throw new Error('Repositories not initialized. Call resetRepositories() first.');
  return repositorieInstances?.encryptor;
}

export function clearRepositories(): void {
  if (repositorieInstances) {
    new CryptoPassRepository(repositorieInstances.uid).clear();
  }
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

const user = getCurrentUser()
if (user) {
  const sessionHash = CryptoPassRepository.getSyncHash(user.uid);
  if (sessionHash) resetRepositories(user.uid, sessionHash);
}
