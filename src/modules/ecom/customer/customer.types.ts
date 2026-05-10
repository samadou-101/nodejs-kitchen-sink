export type CartItem = {
  productId: number;
  quantity: number;
};

export type CheckoutData = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: CartItem[];
};
