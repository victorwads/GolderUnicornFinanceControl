import { iconNamesList } from '@componentsDeprecated/Icons';
import { DocumentModel } from './DocumentModel';
import { ModelMetadata } from './metadata';
import ModelContext from './metadata/ModelContext';

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

  static metadata: ModelMetadata<Category> = {
    aiToolCreator: {
      description: "Cria ou atualiza uma categoria do usuário para organizar lançamentos financeiros. Cada categoria pode ter nome, ícone, cor e categoria pai.",
      properties: {
        name: {
          type: "string",
          description: "Nome da categoria, como 'Alimentação', 'Transporte', etc."
        },
        icon: {
          type: "string",
          description: "Ícone representativo da categoria, deve ser o nome de um ícone da font awesome somente o suffixo (sem o 'fa-' ou 'fas fa-'). exemplo: 'burger', 'money-bill'..."
        },
        color: {
          type: "string",
          description: "Cor associada à categoria, em formato hexadecimal ou nome."
        },
        parentId: {
          type: "string",
          description: "Identificador da categoria pai, caso esta seja uma subcategoria."
        },
      },
      required: ["name", "icon", "color"],
    },
    from: (params, repositories, update) => {
      const { assignId, assignString, assignColor, ensureUnique, toResult, errors } = new ModelContext(
        repositories.categories.modelClass,
        update
      );

      ensureUnique(["parentId", "name"], repositories.categories, [params.parentId, params.name]);
      assignId("parentId", repositories.categories, params.parentId);
      assignString("name", params.name);
      assignString("icon", params.icon);
      assignColor("color", params.color);

      const icon = params.icon;
      if (icon && !iconNamesList.includes(String(icon))) {
        errors.push(`Ícone inválido. Use um dos nomes válidos da font awesome.`);
      }

      return toResult();
    },
  }
}

export interface RootCategory extends Category {
	children: Category[];
}