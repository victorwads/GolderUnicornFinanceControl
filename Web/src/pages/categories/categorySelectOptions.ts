import { SelectListOption } from "@components/ui/select-list";
import { Category } from "@models";

export function buildHierarchicalCategoryOptions(categories: Category[]): SelectListOption[] {
  const roots = categories.filter((category) => !category.parentId);

  return roots.map((root) => ({
    label: root.name,
    value: root.id,
    iconName: root.icon,
    backgroundColor: root.color,
    subOptions: categories
      .filter((category) => category.parentId === root.id)
      .map((child) => ({
        label: child.name,
        value: child.id,
        iconName: child.icon || root.icon,
        backgroundColor: child.color || root.color,
      })),
  }));
}
