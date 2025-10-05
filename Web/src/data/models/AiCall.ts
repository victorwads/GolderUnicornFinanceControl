import { DocumentModel } from "./DocumentModel";

export class AiCall extends DocumentModel {
  constructor(
    public id: string,
    public messages: object[],
  ) {
    super(id);
  }
}
