import BaseRepository from "./BaseRepository";

import { AiCallContext } from "@models";
import { Collections } from "../firebase/Collections";
import { arrayUnion } from "firebase/firestore";

export default class AiCallsRepository extends BaseRepository<AiCallContext> {
  constructor() {
    super(
      "AI Call",
      `${Collections.Users}/{userId}/${Collections.AiCalls}`,
      AiCallContext,
    );
  }

  public addMessage(callId: string, message: any) {
    return this.set(
      {
        id: callId,
        messages: arrayUnion(message),
      },
      true
    );
  }
}
