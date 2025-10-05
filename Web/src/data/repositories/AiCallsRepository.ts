import BaseRepository from "./RepositoryBase";

import { AiCall } from "@models";
import { Collections } from "../firebase/Collections";

export default class AiCallsRepository extends BaseRepository<AiCall> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.AiCalls}`, AiCall);
  }
}
