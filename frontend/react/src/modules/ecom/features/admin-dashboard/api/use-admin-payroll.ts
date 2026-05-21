import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { PayrollRun } from "#ecom/shared/lib/types";

export function usePreviewPayroll() {
  return useMutation({
    mutationFn: (data: { startDate: string; endDate: string; employeeIds?: number[] }) =>
      api.post("/api/ecom/admin/payroll/preview", data),
  });
}

export function useCreatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { startDate: string; endDate: string; employeeIds?: number[] }) =>
      api.post<PayrollRun>("/api/ecom/admin/payroll", data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.payroll.all }),
  });
}

export function useConfirmPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/api/ecom/admin/payroll/${id}/confirm`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.payroll.all }),
  });
}

export function useMarkPayrollPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/api/ecom/admin/payroll/${id}/paid`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.payroll.all }),
  });
}

export function usePayrollRuns() {
  return useQuery({
    queryKey: queryKeys.admin.payroll.list(),
    queryFn: () => api.get<PayrollRun[]>("/api/ecom/admin/payroll"),
  });
}

export function usePayrollRunDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.admin.payroll.detail(id),
    queryFn: () => api.get<PayrollRun>(`/api/ecom/admin/payroll/${id}`),
    enabled: !!id,
  });
}
