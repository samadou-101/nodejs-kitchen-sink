import { useCategories } from "../api/use-products";
import { Badge } from "#components/components/ui/badge";

interface CategoryPillsProps {
  categoryId: number | undefined;
  onCategoryChange: (categoryId: number | undefined) => void;
}

export function CategoryPills({ categoryId, onCategoryChange }: CategoryPillsProps) {
  const { data: categories } = useCategories();

  if (!categories || categories.length === 0) return null;

  const visible = categories.slice(0, 8);

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex gap-2">
        {visible.map((cat) => (
          <Badge
            key={cat.categoryId}
            variant={categoryId === cat.categoryId ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap shrink-0 select-none"
            onClick={() =>
              onCategoryChange(
                categoryId === cat.categoryId ? undefined : cat.categoryId,
              )
            }
          >
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
