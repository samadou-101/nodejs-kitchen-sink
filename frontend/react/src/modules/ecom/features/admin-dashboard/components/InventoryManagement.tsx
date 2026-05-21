import { useState } from "react";
import { useAdjustStock, useLowStock } from "../api/use-admin-inventory";
import { getErrorMessage } from "#ecom/shared/lib/error-map";
import { Field } from "#ecom/shared/components/Field";
import { Input } from "#components/ui/input";
import { Select } from "#components/ui/select";
import { Button } from "#components/ui/button";
import { Badge } from "#components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "#components/ui/table";

export function InventoryManagement() {
  const [productId, setProductId] = useState("");
  const [action, setAction] = useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const adjust = useAdjustStock();
  const { data: lowStock } = useLowStock();

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await adjust.mutateAsync({
        productId: Number(productId),
        action,
        amount: Number(amount),
      });
      setProductId("");
      setAmount("");
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Inventory Management</h2>

      <form onSubmit={handleAdjust} className="mt-4 space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Adjust Stock</h3>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Product ID" error={null}>
            <Input
              type="number"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            />
          </Field>
          <Field label="Action" error={null}>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value as "increase" | "decrease")}
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </Select>
          </Field>
          <Field label="Amount" error={null}>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </Field>
        </div>
        <Button type="submit" disabled={adjust.isPending}>
          {adjust.isPending ? "Adjusting..." : "Adjust Stock"}
        </Button>
      </form>

      <div className="mt-6">
        <h3 className="mb-4 font-semibold">Low Stock Alerts (threshold: 10)</h3>
        {lowStock && lowStock.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">#{item.productId}</TableCell>
                    <TableCell>
                      <Badge variant="red">Low Stock</Badge>
                    </TableCell>
                    <TableCell>{item.quantityAvailable}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No low stock items</p>
        )}
      </div>
    </div>
  );
}
