export interface Customer {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export interface OrderStatus {
  orderStatusId: number;
  name: string;
  description?: string;
}

export interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  inventory?: {
    inventoryId: number;
    productId: number;
    quantityAvailable: number;
    lastUpdated: string;
  };
  category?: {
    categoryId: number;
    name: string;
    description?: string;
  };
}

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CheckoutData {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: CartItem[];
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    productId: number;
    name: string;
    imageUrl?: string;
    price: number;
  };
}

export interface Order {
  orderId: number;
  customerId: number;
  orderDate: string;
  orderStatusId: number;
  employeeId?: number | null;
  notes?: string | null;
  customer?: Customer;
  status?: OrderStatus;
  employee?: { employeeId: number; user: { name: string } } | null;
  orderItems?: OrderItem[];
}

export interface Employee {
  employeeId: number;
  userId: number;
  isActive: boolean;
  paymentTypeId?: number;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
  };
  paymentType?: {
    paymentTypeId: number;
    name: string;
  } | null;
  contracts?: {
    contractId: number;
    employeeId: number;
    paymentTypeId: number;
    salaryAmount: number | null;
    perOrderRate: number | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    isActive: boolean;
  }[];
}

export interface Inventory {
  productId: number;
  quantityAvailable: number;
}

export type PayrollRunStatus = "DRAFT" | "CONFIRMED" | "PAID";
export type PayrollRunItemCalcStatus = "PENDING" | "INCLUDED" | "EXCLUDED";
export type PayrollRunItemPayStatus = "UNPAID" | "CONFIRMED" | "PAID";

export interface PayrollRunInput {
  startDate: string;
  endDate: string;
  employeeIds?: number[];
}

export interface PayrollRun {
  id: number;
  status: PayrollRunStatus;
  startDate: string;
  endDate: string;
  totalAmount?: number;
  items?: PayrollRunItem[];
}

export interface PayrollRunItem {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  calcStatus: PayrollRunItemCalcStatus;
  payStatus: PayrollRunItemPayStatus;
}

export interface AuthContext {
  userId: number;
  employeeId: number | null;
  roleNames: ("SUPERADMIN" | "ADMIN" | "EMPLOYEE")[];
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface InventoryAdjustInput {
  productId: number;
  action: "increase" | "decrease";
  amount: number;
}

export interface EmployeePerformance {
  userId: number;
  name: string;
  totalAssigned: number;
  totalConfirmed: number;
  totalRejected: number;
  totalEarned: number;
}
