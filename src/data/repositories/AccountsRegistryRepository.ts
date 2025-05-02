import BaseRepository from "./Repository";

import { Collections } from "../firebase/Collections";
import AccountsRegistry from '../models/AccountRegistry';

export default class AccountsRegistryRepository extends BaseRepository<AccountsRegistry> {

  protected cacheDuration = 24 * 60 * 60 * 1000; // 1 dia

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.AccountsRegistries}`, AccountsRegistry.firestoreConverter);
  }
}