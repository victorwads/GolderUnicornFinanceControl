import CategoriesList from "@layouts/categories/CategoriesList";
import { useCategoriesListModel } from "./CategoriesList.model";

export default function CategoriesListPage({ embedded = false }: { embedded?: boolean }) {
  const model = useCategoriesListModel();
  return <CategoriesList model={model} embedded={embedded} />;
}
