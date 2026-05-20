import { useState } from "react";
import {
  useAddEmployeeEmail,
  useListEmployees,
  useAssignPaymentType,
} from "../api/use-admin-employees";
import { getErrorMessage } from "#shared/lib/error-map";
import { Field } from "#shared/components/Field";
import { Input } from "#components/components/ui/input";
import { Select } from "#components/components/ui/select";
import { Button } from "#components/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "#components/components/ui/table";

export function EmployeeManagement() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const add = useAddEmployeeEmail();
  const { data: employees } = useListEmployees();
  const assignPayment = useAssignPaymentType();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await add.mutateAsync({ email });
      setEmail("");
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Employee Management</h2>

      <form onSubmit={handleAdd} className="mt-4 space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Add Employee Email (Pending)</h3>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Field label="Email" error={null}>
          <Input
            type="email"
            placeholder="employee@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" disabled={add.isPending}>
          {add.isPending ? "Adding..." : "Add Email"}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Payment Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.map((emp) => (
              <TableRow key={emp.userId}>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                <TableCell>
                  <Select
                    onChange={(e) =>
                      assignPayment.mutate({
                        employeeId: emp.userId,
                        paymentType: e.target.value,
                      })
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>Select type</option>
                    <option value="salary">Salary</option>
                    <option value="per-order">Per Order</option>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
