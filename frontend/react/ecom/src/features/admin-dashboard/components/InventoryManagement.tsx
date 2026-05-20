import { useState } from "react";
import { useAdjustStock, useLowStock } from "../api/use-admin-inventory";
import { getErrorMessage } from "#shared/lib/error-map";

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

      <form onSubmit={handleAdjust} className="mt-4 space-y-3 rounded-lg border p-4">
        <h3 className="font-semibold">Adjust Stock</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="number"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="block w-full rounded border p-2"
        />
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as "increase" | "decrease")}
          className="block w-full rounded border p-2"
        >
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
          className="block w-full rounded border p-2"
        />
        <button
          type="submit"
          disabled={adjust.isPending}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {adjust.isPending ? "Adjusting..." : "Adjust Stock"}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold">Low Stock Alerts (threshold: 10)</h3>
        {lowStock && lowStock.length > 0 ? (
          <div className="mt-2 space-y-2">
            {lowStock.map((item) => (
              <div
                key={item.productId}
                className="rounded border border-red-200 bg-red-50 p-3"
              >
                <p className="font-medium">Product #{item.productId}</p>
                <p className="text-sm text-red-600">
                  Available: {item.quantityAvailable}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No low stock items</p>
        )}
      </div>
    </div>
  );
}
