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

  static idAiExtractor = "Identificador da categoria associada ao lançamento. você pode testar varios termos no search_categories para ver se tem uma categoria que faça sentido e usar o ID dela. se não encontrar, deixe em branco.";
}

export interface RootCategory extends Category {
	children: Category[];
}
