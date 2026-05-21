import { useState } from "react";
import {
  usePayrollRuns,
  useCreatePayroll,
  useConfirmPayroll,
  useMarkPayrollPaid,
} from "../api/use-admin-payroll";
import { getErrorMessage } from "#ecom/shared/lib/error-map";
import { Field } from "#ecom/shared/components/Field";
import { Input } from "#components/ui/input";
import { Button } from "#components/ui/button";
import { Badge } from "#components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "#components/ui/table";

const statusBadge: Record<string, "amber" | "emerald" | "default"> = {
  DRAFT: "amber",
  CONFIRMED: "emerald",
  PAID: "default",
};

export function PayrollManagement() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const { data: payrollRuns } = usePayrollRuns();
  const create = useCreatePayroll();
  const confirm = useConfirmPayroll();
  const markPaid = useMarkPayrollPaid();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({ startDate, endDate });
      setStartDate("");
      setEndDate("");
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Payroll Management</h2>

      <form onSubmit={handleCreate} className="mt-4 space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Create Payroll Run</h3>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start Date" error={null}>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Field>
          <Field label="End Date" error={null}>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </Field>
        </div>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Payroll Run"}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollRuns?.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium">#{run.id}</TableCell>
                <TableCell>
                  {new Date(run.startDate).toLocaleDateString()} -{" "}
                  {new Date(run.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge[run.status] ?? "default"}>
                    {run.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {run.totalAmount ? `${run.totalAmount.toFixed(2)} DZD` : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {run.status === "DRAFT" && (
                      <Button
                        size="xs"
                        onClick={() => confirm.mutate(run.id)}
                        disabled={confirm.isPending}
                      >
                        Confirm
                      </Button>
                    )}
                    {run.status === "CONFIRMED" && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => markPaid.mutate(run.id)}
                        disabled={markPaid.isPending}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {run.status === "PAID" && (
                      <Badge variant="emerald">Paid</Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
