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

  const banks = new BanksImporter(db);
  await banks.loadFrom(dbProd);
  await banks.process();
  
  const userPath = 'Users/fUztrRAGqQZ3lzT5AmvIki5x0443/';
  const categorias = new CategoriesImporter(db, userPath);  
  await categorias.process();

  const accounts = new AccountsImporter(banks, db, userPath);
  await accounts.process();

  const cards = new CardsImporter(accounts, db, userPath);
  await cards.process();

  const cardRegistries = new CardsRegistriesImporter(cards, categorias, db, userPath);
  await cardRegistries.process();

  const cardInvoices = new CardInvoceImporter(cards, accounts, db, userPath);
  await cardInvoices.process();

  const accountRegistries = new AccountRegistriesImporter(accounts, categorias, db, userPath);
  await accountRegistries.process();


}
main();

