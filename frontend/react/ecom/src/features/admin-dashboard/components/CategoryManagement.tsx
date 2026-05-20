import { useState } from "react";
import {
  useCreateCategory,
  useDeleteCategory,
} from "../api/use-admin-products";
import { useCategories } from "../../product-catalog/api/use-products";
import { getErrorMessage } from "#shared/lib/error-map";
import { Field } from "#shared/components/Field";
import { Input } from "#components/components/ui/input";
import { Textarea } from "#components/components/ui/textarea";
import { Button } from "#components/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "#components/components/ui/table";

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

      <form onSubmit={handleCreate} className="mt-4 space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Create Category</h3>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Field label="Name" error={null}>
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Description" error={null}>
          <Textarea
            placeholder="Category description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Category"}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((c: { categoryId?: number; name: string; description?: string }) => (
              <TableRow key={c.categoryId}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.description ?? "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => del.mutate(c.categoryId!)}
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
