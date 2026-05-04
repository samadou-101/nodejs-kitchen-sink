export type OrderData = {
  orderId: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  orderItems: {
    productId: number;
    price: number;
    quantity: number;
  };
  orderDate: Date;
  orderStatusId: number;
  employeeId: number | null;
  notes: string | null;
};

export type OrderDTO = {
  orderId: number;
  customerId: number;
  orderDate: Date;
  orderStatusId: number;
  notes: string | null;
};
