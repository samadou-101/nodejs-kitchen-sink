import { useState } from "react";
import {
  useCreateProduct,
  useDeleteProduct,
  useAllProducts,
} from "../api/use-admin-products";
import { useCategories } from "../../product-catalog/api/use-products";
import { getErrorMessage } from "#ecom/shared/lib/error-map";
import { Field } from "#ecom/shared/components/Field";
import { Input } from "#components/ui/input";
import { Textarea } from "#components/ui/textarea";
import { Select } from "#components/ui/select";
import { Button } from "#components/ui/button";
import { ProductImage } from "#ecom/shared/components/ProductImage";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "#components/ui/table";

export function ProductManagement() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
        imageUrl: imageUrl || undefined,
        initialStock: initialStock ? Number(initialStock) : undefined,
      });
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setImageUrl("");
      setInitialStock("");
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Product Management</h2>

      <form onSubmit={handleCreate} className="mt-4 space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Create Product</h3>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={null}>
            <Input
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="Price (DZD)" error={null}>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Field>
          <Field label="Category" error={null}>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories?.map((c: { categoryId?: number; name: string }) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Image URL" error={null}>
            <Input
              placeholder="https://picsum.photos/seed/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Field>
          <Field label="Description" error={null}>
            <Textarea
              placeholder="Product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Initial Stock" error={null}>
            <Input
              type="number"
              placeholder="Optional"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex items-center gap-4">
          {imageUrl && (
            <ProductImage src={imageUrl} alt="Preview" aspect="1:1" size="sm" />
          )}
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((p) => (
              <TableRow key={p.productId}>
                <TableCell>
                  <ProductImage src={p.imageUrl} alt={p.name} aspect="1:1" size="sm" />
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.price.toFixed(2)} DZD</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.category?.name ?? "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => del.mutate(p.productId)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
