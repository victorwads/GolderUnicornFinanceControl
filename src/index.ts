import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccountKey from "./serviceAccountKey";

import CategoriesImporter from "./importers/CategoriesImporter";
import BanksImporter from './importers/BanksImporter';
import AccountsImporter from "./importers/AccountsImporter";
import CardsImporter from "./importers/CardsImporter";
import CardsRegistriesImporter from "./importers/CardsRegistriesImporter";
import AccountRegistriesImporter from "./importers/AccountRegistriesImporter";
import CardInvoceImporter from "./importers/CardInvoceImporter";
import Encryptor from "./data/crypt/Encryptor";

const prodApp = initializeApp({credential: cert(serviceAccountKey as any)}, 'prod');
const dbProd = getFirestore(prodApp);

const local = initializeApp({credential: cert(serviceAccountKey as any)}, 'local');
const db = getFirestore(local);
db.settings({
  ignoreUndefinedProperties: true,
  host: "localhost:8008",
  ssl: false,
});


async function main() {

  const encryptor = new Encryptor();
  await encryptor.init('fUztrRAGqQZ3lzT5AmvIki5x0443');

  const banks = new BanksImporter(db);
  await banks.loadFrom(dbProd);
  await banks.process();
  
  const userPath = 'Users/fUztrRAGqQZ3lzT5AmvIki5x0443/';
  const categorias = new CategoriesImporter(db, userPath, encryptor);  
  await categorias.process();

  const accounts = new AccountsImporter(banks, db, userPath, encryptor);
  await accounts.process();

  const cards = new CardsImporter(accounts, db, userPath, encryptor);
  await cards.process();

  const cardRegistries = new CardsRegistriesImporter(cards, categorias, db, userPath, encryptor);
  await cardRegistries.process();

  const cardInvoices = new CardInvoceImporter(cards, accounts, db, userPath, encryptor);
  await cardInvoices.process();

  const accountRegistries = new AccountRegistriesImporter(accounts, categorias, db, userPath, encryptor);
  await accountRegistries.process();


}
main();

