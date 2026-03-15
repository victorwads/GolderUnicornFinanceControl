import CategoriesList from "@layouts/categories/CategoriesList";
import { useCategoriesListModel } from "./CategoriesList.model";

export default function CategoriesListPage() {
  const model = useCategoriesListModel();
  return <CategoriesList model={model} />;
}
