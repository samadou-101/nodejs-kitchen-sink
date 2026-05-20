export type CategoryData = {
  categoryId?: number;
  name: string;
  description?: string;
};

export type ProductData = {
  id?: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  initialStock?: number;
};

export type ProductFilter = {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
};
