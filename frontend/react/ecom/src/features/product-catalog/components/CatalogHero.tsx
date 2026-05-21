import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";

interface CatalogHeroProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: number | undefined;
  onCategoryChange: (categoryId: number | undefined) => void;
}

export function CatalogHero({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
}: CatalogHeroProps) {
  return (
    <div className="bg-gradient-to-b from-primary/[0.03] to-background pb-8 pt-12">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Discover Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find what you need
        </p>
        <div className="mt-6 flex gap-4">
          <div className="flex-1">
            <SearchBar value={search} onChange={onSearchChange} />
          </div>
          <CategoryFilter value={categoryId} onChange={onCategoryChange} />
        </div>
      </div>
    </div>
  );
}
