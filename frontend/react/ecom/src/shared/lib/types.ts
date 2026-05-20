export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  initialStock?: number;
}

export interface Category {
  categoryId?: number;
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

export interface Order {
  orderId?: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  orderItems: OrderItem[];
  orderDate: string;
  orderStatusId: number;
  employeeId?: number | null;
  notes?: string | null;
}

export interface OrderItem {
  productId: number;
  price: number;
  quantity: number;
  orderItemId?: number;
}

export interface Employee {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  password: string;
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
