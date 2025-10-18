import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ArrowLeft, Plus, ChevronRight, LucideIcon } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";

export default function CategoriesList({
  model: {
    navigate,
    categories,
  }
}: {
  model: CategoriesListViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
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
                <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
                <p className="text-sm text-muted-foreground">{categories.length} categorias cadastradas</p>
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

        <div className="p-4 space-y-3 animate-fade-in">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50"
                onClick={() => navigate(new ToEditCategoryRoute(category.id.toString()))}
              >
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon className="h-6 w-6" style={{ color: category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.transactionCount} transações
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Card>
            );
          })}
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

export interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  transactionCount: number;
}

export interface CategoriesListViewModel {
  navigate: (route: CategoriesRoute) => void;
  categories: Category[];
}

// Navigation Routes
export class CategoriesRoute {}

export class ToMoreRoute extends CategoriesRoute {}
export class ToCreateCategoryRoute extends CategoriesRoute {}
export class ToEditCategoryRoute extends CategoriesRoute {
  constructor(public categoryId: string) { super() }
}
