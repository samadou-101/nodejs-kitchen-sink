import { useState } from "react";
import {
  useCreateCategory,
  useDeleteCategory,
} from "../api/use-admin-products";
import { useCategories } from "../../product-catalog/api/use-products";
import { getErrorMessage } from "#shared/lib/error-map";

export function CategoryManagement() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { data: categories } = useCategories();
  const create = useCreateCategory();
  const del = useDeleteCategory();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({
        name,
        description: description || undefined,
      });
      setName("");
      setDescription("");
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Category Management</h2>

      <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-lg border p-4">
        <h3 className="font-semibold">Create Category</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="block w-full rounded border p-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded border p-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {create.isPending ? "Creating..." : "Create Category"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {categories?.map((c: { categoryId?: number; name: string; description?: string }) => (
          <div key={c.categoryId} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{c.name}</p>
              {c.description && (
                <p className="text-sm text-muted-foreground">{c.description}</p>
              )}
            </div>
            <button
              onClick={() => del.mutate(c.categoryId!)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
