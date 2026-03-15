import CreateCategory from "@layouts/categories/CreateCategory";
import { useCreateCategoryModel } from "./CreateCategory.model";

export default function CreateCategoryPage() {
  const model = useCreateCategoryModel();
  return <CreateCategory model={model} />;
}
