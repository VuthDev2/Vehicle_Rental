export type DiscountType = 'percent' | 'fixed';

export interface Promotion {
  _id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  value: number;
  minAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}
