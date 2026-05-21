import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon } from "@hugeicons/core-free-icons";
import { Button } from "#components/ui/button";

interface EmptyCatalogStateProps {
  search: string;
  categoryName?: string;
  onClearAll: () => void;
}

export function EmptyCatalogState({
  search,
  categoryName,
  onClearAll,
}: EmptyCatalogStateProps) {
  const hasSearch = search.length > 0;
  const hasCategory = !!categoryName;

  let subtitle: string;
  if (hasSearch && hasCategory) {
    subtitle = `No results for "${search}" in ${categoryName} — try a different search term or clear your filters.`;
  } else if (hasSearch) {
    subtitle = `No results for "${search}" — try a different search term or clear your filters.`;
  } else if (hasCategory) {
    subtitle = "No products in this category yet. Try a different category or clear your filters.";
  } else {
    subtitle = "No products are available at the moment. Please check back later.";
  }

  const showClear = hasSearch || hasCategory;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-muted-foreground/40">
        <HugeiconsIcon icon={PackageIcon} size={64} />
      </div>
      <h3 className="mt-4 text-lg font-medium">No products found</h3>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        {subtitle}
      </p>
      {showClear && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={onClearAll}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
