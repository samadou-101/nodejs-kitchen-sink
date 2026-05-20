import { useState } from "react";
import {
  usePreviewPayroll,
  useCreatePayroll,
  useConfirmPayroll,
  useMarkPayrollPaid,
  usePayrollRuns,
  usePayrollRunDetail,
} from "../api/use-admin-payroll";
import { getErrorMessage } from "#shared/lib/error-map";

export function PayrollManagement() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");

  const preview = usePreviewPayroll();
  const create = useCreatePayroll();
  const confirm = useConfirmPayroll();
  const markPaid = useMarkPayrollPaid();
  const { data: runs } = usePayrollRuns();
  const { data: detail } = usePayrollRunDetail(selectedId ?? 0);

  const handlePreview = async () => {
    try {
      const result = await preview.mutateAsync({ startDate, endDate });
      alert(`Preview result: ${JSON.stringify(result)}`);
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(getErrorMessage((err as { code?: string }).code ?? "", err.message));
    }
  };

  const handleCreate = async () => {
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

      <div className="mt-4 space-y-3 rounded-lg border p-4">
        <h3 className="font-semibold">Payroll Run</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="rounded border p-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="rounded border p-2"
          />
          <button
            onClick={handlePreview}
            disabled={preview.isPending || !startDate || !endDate}
            className="rounded border px-3 py-2"
          >
            Preview
          </button>
          <button
            onClick={handleCreate}
            disabled={create.isPending || !startDate || !endDate}
            className="rounded bg-primary px-3 py-2 text-primary-foreground"
          >
            Create Draft
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Payroll Runs</h3>
        <div className="mt-2 space-y-2">
          {runs?.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <p className="font-medium">
                  {run.startDate} &mdash; {run.endDate}
                </p>
                <p className="text-sm text-muted-foreground">Status: {run.status}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedId(run.id)}
                  className="text-sm text-primary underline"
                >
                  View
                </button>
                {run.status === "DRAFT" && (
                  <button
                    onClick={() => confirm.mutate(run.id)}
                    className="text-sm text-green-600 underline"
                  >
                    Confirm
                  </button>
                )}
                {run.status === "CONFIRMED" && (
                  <button
                    onClick={() => markPaid.mutate(run.id)}
                    className="text-sm text-blue-600 underline"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {detail && (
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="font-semibold">Run Details</h3>
          <div className="mt-2 space-y-1 text-sm">
            {detail.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.employeeName}</span>
                <span>
                  {item.amount.toFixed(2)} DZD ({item.calcStatus}, {item.payStatus})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
