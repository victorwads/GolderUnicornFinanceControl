import CategoriesImporter from "./importers/CategoriesImporter";
import BanksImporter from './importers/BanksImporter';
import AccountsImporter from "./importers/AccountsImporter";
import CardsImporter from "./importers/CardsImporter";
import CardsRegistriesImporter from "./importers/CardsRegistriesImporter";
import AccountRegistriesImporter from "./importers/AccountRegistriesImporter";
import CardInvoceImporter from "./importers/CardInvoceImporter";
import Encryptor from "./data/crypt/Encryptor";
import { current, prod } from "./utils/defaultdb";

const userId = process.argv[2];
if (!userId) {
  console.error("Please provide a user ID.");
  process.exit(1);
}
console.log(`User ID: ${userId}`);

async function main() {

  const encryptor = new Encryptor();
  await encryptor.initWithPass(userId);

  const banks = new BanksImporter(current);
  await banks.loadFrom(prod);
  await banks.process();

  const userPath = `Users/${userId}/`;
  const categorias = new CategoriesImporter(current, userPath, encryptor);  
  await categorias.process();

  const accounts = new AccountsImporter(banks, current, userPath, encryptor);
  await accounts.process();

  const cards = new CardsImporter(accounts, current, userPath, encryptor);
  await cards.process();

  const cardRegistries = new CardsRegistriesImporter(cards, categorias, current, userPath, encryptor);
  await cardRegistries.process();

  const cardInvoices = new CardInvoceImporter(cards, accounts, current, userPath, encryptor);
  await cardInvoices.process();

  const accountRegistries = new AccountRegistriesImporter(accounts, categorias, current, userPath, encryptor);
  await accountRegistries.process();

}
main();
