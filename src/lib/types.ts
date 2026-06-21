export type ProductVariation = {
  variationId?: string | number;
  variationName?: string;
  sku?: string;
  price?: number;
  stock?: number;
  minPurchase?: number;
};

export type ProductShipping = {
  weight?: number | string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category?: string;
  customCategory?: string;
  price?: number;
  images: string[];
  variations: ProductVariation[];
  shipping?: ProductShipping;
  // Shopee import hint: fulfillment channels available on Shopee (e.g. "蝦皮店到店").
  // Used only as a signal that the item is small/light enough for CVS pickup.
  shopeeLogistics?: string[];
  // DB override fields
  shopeeUrl?: string;
  isActive?: boolean;
  allowCvsPickup?: boolean; // 可超商取貨（綠界物流）
};
