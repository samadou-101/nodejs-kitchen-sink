import { useState } from "react";

export function useCatalogFilters() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setCategoryId(undefined);
  };

  return {
    page,
    setPage,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    resetFilters,
  };
}
