export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (params?: Record<string, unknown>) =>
      ["products", "list", params] as const,
    detail: (id: number) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => ["categories", "list"] as const,
    detail: (id: number) => ["categories", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params?: Record<string, unknown>) =>
      ["orders", "list", params] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
    track: (phone: string) => ["orders", "track", phone] as const,
  },
  admin: {
    all: ["admin"] as const,
    employees: {
      all: ["admin", "employees"] as const,
      list: () => ["admin", "employees", "list"] as const,
      performance: (id: number) =>
        ["admin", "employees", "performance", id] as const,
    },
    payroll: {
      all: ["admin", "payroll"] as const,
      list: () => ["admin", "payroll", "list"] as const,
      detail: (id: number) => ["admin", "payroll", "detail", id] as const,
    },
    inventory: {
      all: ["admin", "inventory"] as const,
      lowStock: (threshold?: number) =>
        ["admin", "inventory", "lowStock", threshold] as const,
    },
  },
  employee: {
    all: ["employee"] as const,
    orders: {
      all: ["employee", "orders"] as const,
      list: () => ["employee", "orders", "list"] as const,
      detail: (id: number) => ["employee", "orders", "detail", id] as const,
    },
  },
  auth: {
    all: ["auth"] as const,
    session: () => ["auth", "session"] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
};
