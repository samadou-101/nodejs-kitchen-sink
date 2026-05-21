import { useCategories } from "../api/use-products";
import { Select } from "#components/ui/select";

interface CategoryFilterProps {
  value: number | undefined;
  onChange: (categoryId: number | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories } = useCategories();

  return (
    <Select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
    >
      <option value="">All Categories</option>
      {categories?.map((cat) => (
        <option key={cat.categoryId} value={cat.categoryId}>
          {cat.name}
        </option>
      ))}
    </Select>
  );
}
