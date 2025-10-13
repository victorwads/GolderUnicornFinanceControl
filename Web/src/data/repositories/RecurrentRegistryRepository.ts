import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from "../firebase/Collections";
import { RecurrentTransaction } from '@models';

export default class RecurrentRegistryRepository extends RepositoryWithCrypt<RecurrentTransaction> {
  constructor() {
    super(
      "Recurrent Registry",
      `${Collections.Users}/{userId}/${Collections.RecurrentRegistries}`,
      RecurrentTransaction,
    );
  }
}
