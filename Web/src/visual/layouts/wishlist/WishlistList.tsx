import { ArrowLeft, ArrowUpDown, Gem, Plus } from "lucide-react";

import { TransactionItem } from "@components/TransactionItem";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

export default function WishlistList({
  model: {
    navigate,
    items,
    sortMode,
    setSortMode,
  }
}: {
  model: WishlistListViewModel
}) {
  return (
    <div className="min-h-full bg-background">
      <div className="min-h-full w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate(new ToHomeRoute())}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold text-foreground">{Lang.wishlist.title}</h1>
                <p className="text-sm text-muted-foreground">{Lang.wishlist.itemCount(items.length)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title={Lang.wishlist.sort.label}>
                    <ArrowUpDown className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setSortMode("priority")}>
                    {sortMode === "priority" ? "✓ " : ""}{Lang.wishlist.sort.priority}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode("value")}>
                    {sortMode === "value" ? "✓ " : ""}{Lang.wishlist.sort.value}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode("targetDate")}>
                    {sortMode === "targetDate" ? "✓ " : ""}{Lang.wishlist.sort.targetDate}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="icon" onClick={() => navigate(new ToCreateWishlistItemRoute())}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 animate-fade-in">
          {items.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-8 text-center">
              <Gem className="h-10 w-10 text-muted-foreground" />
              <div>
                <h2 className="font-semibold text-foreground">{Lang.wishlist.emptyTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{Lang.wishlist.emptyDescription}</p>
              </div>
              <Button onClick={() => navigate(new ToCreateWishlistItemRoute())}>
                <Plus className="mr-2 h-4 w-4" />
                {Lang.wishlist.newItem}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <TransactionItem
                  key={item.id}
                  title={item.title}
                  category={item.category}
                  amount={item.amount}
                  date={item.targetDate}
                  type="expense"
                  tags={[item.priorityLabel, ...item.tags]}
                  categoryIconName={item.categoryIconName}
                  categoryColor={item.categoryColor}
                  account={item.observation || undefined}
                  onClick={() => navigate(new ToEditWishlistItemRoute(item.id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type WishlistSortMode = "priority" | "value" | "targetDate";

export interface WishlistListItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  targetDate: string;
  targetDateTime: number;
  priority: "low" | "medium" | "high";
  priorityLabel: string;
  tags: string[];
  categoryIconName?: string;
  categoryColor?: string;
  observation?: string;
}

export interface WishlistListViewModel {
  navigate: (route: WishlistRoute) => void;
  items: WishlistListItem[];
  sortMode: WishlistSortMode;
  setSortMode: (mode: WishlistSortMode) => void;
}

export class WishlistRoute {}
export class ToHomeRoute extends WishlistRoute {}
export class ToCreateWishlistItemRoute extends WishlistRoute {}
export class ToEditWishlistItemRoute extends WishlistRoute {
  constructor(public itemId: string) { super() }
}
