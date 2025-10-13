import BaseRepository from "./BaseRepository";

import { Bank } from "@models";
import { Collections } from "../../data/firebase/Collections";

class BanksRepository extends BaseRepository<Bank> {
  constructor() {
    super(
      "Bank",
      Collections.Banks,
      Bank,
    );
  }

  public getFiltered(search: string) {
    return this.getCache().filter(
      (bank) =>
        bank.name.prepareCompare().includes(search.prepareCompare()) ||
        bank.fullName.prepareCompare().includes(search.prepareCompare())
    );
  }
}

export default BanksRepository;
