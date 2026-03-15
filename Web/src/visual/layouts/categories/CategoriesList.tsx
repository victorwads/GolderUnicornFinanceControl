import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ArrowLeft, Plus, PencilLine, ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@lib/utils";

export default function CategoriesList({
  model: {
    navigate,
    categories,
    selectedCategoryId,
  },
  embedded = false,
}: {
  model: CategoriesListViewModel;
  embedded?: boolean;
}) {
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedCategoryId) return;

    const parentCategory = categories.find((category) =>
      category.id === selectedCategoryId || category.children.some((child) => child.id === selectedCategoryId)
    );

    if (!parentCategory) return;

    setCollapsedCategoryIds((current) => current[parentCategory.id]
      ? { ...current, [parentCategory.id]: false }
      : current);
  }, [categories, selectedCategoryId]);

  function toggleCategory(categoryId: string) {
    setCollapsedCategoryIds((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  return (
    <div className={cn("mx-auto", embedded ? "min-h-full" : "max-w-4xl")}>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToMoreRoute())}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{Lang.categories.title}</h1>
              <p className="text-sm text-muted-foreground">{Lang.categories.rootCategoriesCount(categories.length)}</p>
            </div>
          </div>
          <Button
            size="icon"
            onClick={() => navigate(new ToCreateCategoryRoute())}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {categories.map((category) => {
          const RootIcon = category.icon;
          const isRootSelected = selectedCategoryId === category.id;
          const isCollapsed = !!collapsedCategoryIds[category.id];

          return (
            <Card
              key={category.id}
              className={cn(
                "overflow-hidden border-border/60 bg-card/80",
                isRootSelected ? "border-primary/50 ring-1 ring-primary/20" : ""
              )}
            >
              <div
                className="cursor-pointer border-b border-border/50 p-4"
                onClick={() => category.children.length > 0 && toggleCategory(category.id)}
                role={category.children.length > 0 ? "button" : undefined}
                tabIndex={category.children.length > 0 ? 0 : undefined}
                onKeyDown={(event) => {
                  if (category.children.length === 0) return;
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  toggleCategory(category.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <RootIcon className="h-6 w-6" style={{ color: category.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground">{category.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.children.length === 0
                        ? Lang.categories.noSubcategories
                        : Lang.categories.subcategoriesCount(category.children.length)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant={isRootSelected ? "default" : "outline"}
                      size="sm"
                      className="shrink-0"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(new ToEditCategoryRoute(category.id));
                      }}
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      {Lang.commons.edit}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(new ToCreateCategoryRoute(category.id));
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      {Lang.commons.add}
                    </Button>
                    {category.children.length > 0 && (
                      <span
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                        aria-label={isCollapsed ? `${Lang.commons.add} ${Lang.categories.title}` : `${Lang.commons.clear} ${Lang.categories.title}`}
                      >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {category.children.length > 0 && !isCollapsed && (
                <div className="p-4">
                  <div className="space-y-2 border-l border-dashed border-border pl-4">
                    {category.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildSelected = selectedCategoryId === child.id;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => navigate(new ToEditCategoryRoute(child.id))}
                          className={cn(
                            "group relative flex w-full items-center gap-3 rounded-2xl border border-transparent bg-background px-3 py-3 text-left transition-colors hover:border-border hover:bg-accent/40",
                            isChildSelected ? "border-primary/40 bg-accent/60 ring-1 ring-primary/15" : ""
                          )}
                        >
                          <span className="absolute -left-[1.3rem] top-1/2 h-px w-4 -translate-y-1/2 bg-border" />
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${child.color}20` }}
                          >
                            <ChildIcon className="h-5 w-5" style={{ color: child.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{child.name}</p>
                            <p className="text-xs text-muted-foreground">{Lang.categories.subcategory}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  parentId?: string;
}

export interface CategoryTreeNode extends Category {
  children: Category[];
}

export interface CategoriesListViewModel {
  navigate: (route: CategoriesRoute) => void;
  categories: CategoryTreeNode[];
  selectedCategoryId?: string;
}

// Navigation Routes
export class CategoriesRoute {}

export class ToMoreRoute extends CategoriesRoute {}
export class ToCreateCategoryRoute extends CategoriesRoute {
  constructor(public parentCategoryId?: string) { super() }
}
export class ToEditCategoryRoute extends CategoriesRoute {
  constructor(public categoryId: string) { super() }
}
