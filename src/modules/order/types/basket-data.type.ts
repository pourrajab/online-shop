export interface BasketProduct {
  id: number;
  slug: string;
  title: string;
  active_discount: boolean;
  discount: number;
  price: number;
  count: number;
  sizeId?: number;
  size?: string;
  colorId?: number;
  color_code?: string;
  color_name?: string;
}

export interface BasketDiscount {
  percent?: number;
  amount?: number;
  code: string;
  type: string;
  productId?: number;
}

export interface BasketData {
  totalPrice: number;
  finalAmount: number;
  totalDiscountAmount: number;
  products: BasketProduct[];
  discounts: BasketDiscount[];
  productDiscounts?: unknown[];
}


