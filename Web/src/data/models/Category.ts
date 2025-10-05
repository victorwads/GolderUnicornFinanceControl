import CategoriesRepository from '../repositories/CategoriesRepository';
import { DocumentModel } from './DocumentModel';
import { ModelMetadata } from './metadata';

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

  static metadata: ModelMetadata<Category> = {
    aiToolCreator: {
      description: "Cria ou atualiza uma categoria do usuário.",
      name: "categories",
      properties: {},
      required: [],
    },
    from: (data: any) => 
      ({ success: false, error: "Category manipulation not implemented" }
    ),
  }
}

export interface RootCategory extends Category {
	children: Category[];
}
