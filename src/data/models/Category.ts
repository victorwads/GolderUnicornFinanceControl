import { DocumentModel } from './DocumentModel';

export class Category extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public icon?: string,
    public color?: string,
    public parentId?: string
  ) {
    super(id);
  }
}
