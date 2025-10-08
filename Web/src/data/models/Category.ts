import { iconNamesList } from '@components/Icons';
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

  static metadata: ModelMetadata<Category> = {
    aiToolCreator: {
      name: "categories",
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
    from: (data, repositories) => {
      const { name, icon, color, parentId } = data;
      if (icon && !iconNamesList.includes(String(icon))) {
        return { success: false, error: `Ícone inválido. Use um dos nomes válidos da font awesome.` };
      }
      if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(String(color))) {
        return { success: false, error: "Cor inválida. Use formato hexadecimal, exemplo: #FFAA00." };
      }
      if (parentId) {
        const parent = repositories.categories.getLocalById(String(parentId));
        if (!parent) {
          return { success: false, error: `Categoria pai com id ${parentId} não encontrada.` };
        }
      }

      return {
        success: true,
        result: new Category(
          "", String(name), 
          String(icon), String(color)  , parentId as string
        )
      };
    },
  }
}

export interface RootCategory extends Category {
	children: Category[];
}