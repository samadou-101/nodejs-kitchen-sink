import { useState } from "react";
import {
  useCreateProduct,
  useDeleteProduct,
  useAllProducts,
} from "../api/use-admin-products";
import { useCategories } from "../../product-catalog/api/use-products";
import { getErrorMessage } from "#shared/lib/error-map";

export function ProductManagement() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [error, setError] = useState("");
  const { data: products } = useAllProducts();
  const { data: categories } = useCategories();
  const create = useCreateProduct();
  const del = useDeleteProduct();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({
        name,
        description: description || undefined,
        price: Number(price),
        categoryId: Number(categoryId),
        initialStock: initialStock ? Number(initialStock) : undefined,
      });
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setInitialStock("");
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Product Management</h2>

      <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-lg border p-4">
        <h3 className="font-semibold">Create Product</h3>
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
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="block w-full rounded border p-2"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="block w-full rounded border p-2"
        >
          <option value="">Select category</option>
          {categories?.map((c: { categoryId?: number; name: string }) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Initial stock (optional)"
          value={initialStock}
          onChange={(e) => setInitialStock(e.target.value)}
          className="block w-full rounded border p-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {create.isPending ? "Creating..." : "Create Product"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {products?.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.price.toFixed(2)} DZD</p>
            </div>
            <button
              onClick={() => del.mutate(p.id!)}
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
