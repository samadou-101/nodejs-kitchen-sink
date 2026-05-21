import { Badge } from "#components/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface ActiveFiltersProps {
  search: string;
  categoryId: number | undefined;
  categoryName?: string;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  search,
  categoryId,
  categoryName,
  onClearSearch,
  onClearCategory,
  onClearAll,
}: ActiveFiltersProps) {
  const filtersActive = search.length > 0 || categoryId !== undefined;
  if (!filtersActive) return null;

  const count = (search.length > 0 ? 1 : 0) + (categoryId !== undefined ? 1 : 0);

  return (
    <div className="flex items-center gap-2 transition-all duration-200">
      {search && (
        <Badge variant="secondary" className="flex items-center gap-1 pr-1">
          <span>{search}</span>
          <button
            type="button"
            onClick={onClearSearch}
            className="ml-0.5 inline-flex rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        </Badge>
      )}
      {categoryId && categoryName && (
        <Badge variant="secondary" className="flex items-center gap-1 pr-1">
          <span>{categoryName}</span>
          <button
            type="button"
            onClick={onClearCategory}
            className="ml-0.5 inline-flex rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        </Badge>
      )}
      {count >= 2 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
