import { useState } from "react";
import {
  useAddEmployeeEmail,
  useListEmployees,
  useAssignPaymentType,
} from "../api/use-admin-employees";
import { getErrorMessage } from "#shared/lib/error-map";

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

      <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-lg border p-4">
        <h3 className="font-semibold">Add Employee Email (Pending)</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full rounded border p-2"
        />
        <button
          type="submit"
          disabled={add.isPending}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {add.isPending ? "Adding..." : "Add Email"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {employees?.map((emp) => (
          <div key={emp.userId} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{emp.name}</p>
              <p className="text-sm text-muted-foreground">{emp.email}</p>
            </div>
            <select
              onChange={(e) =>
                assignPayment.mutate({
                  employeeId: emp.userId,
                  paymentType: e.target.value,
                })
              }
              defaultValue=""
              className="rounded border p-1 text-sm"
            >
              <option value="" disabled>
                Payment type
              </option>
              <option value="salary">Salary</option>
              <option value="per-order">Per Order</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
