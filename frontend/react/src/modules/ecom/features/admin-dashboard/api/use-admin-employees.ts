import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "#ecom/shared/api/http-client";
import { queryKeys } from "#ecom/shared/lib/query-keys";
import type { EmployeePerformance, Employee } from "#ecom/shared/lib/types";

export function useAddEmployeeEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.post("/api/ecom/admin/employee/add", data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.employees.all }),
  });
}

export function useAssignPaymentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeId: number; paymentType: string }) =>
      api.post(`/api/ecom/admin/employees/${data.employeeId}/payment-type`, {
        paymentType: data.paymentType,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.employees.all }),
  });
}

export function useEmployeePerformance(id: number) {
  return useQuery({
    queryKey: queryKeys.admin.employees.performance(id),
    queryFn: () =>
      api.get<EmployeePerformance>(
        `/api/ecom/admin/employees/${id}/performance`,
      ),
    enabled: !!id,
  });
}

export function useListEmployees() {
  return useQuery({
    queryKey: queryKeys.admin.employees.list(),
    queryFn: () => api.get<Employee[]>("/api/ecom/admin/employees"),
  });
}
