import BaseRepository from "./Repository";

import { Collections } from "../firebase/Collections";
import AccountsRegistry from '../models/AccountRegistry';

export default class AccountsRegistryRepository extends BaseRepository<AccountsRegistry> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.AccountsRegistries}`, AccountsRegistry.firestoreConverter, true);
  }
}
