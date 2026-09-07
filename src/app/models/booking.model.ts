export type BookingStatus = 'pending' | 'pending_approval' | 'pending_verification' | 'confirmed' | 'active' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
export type RentalType = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface Booking {
  _id: string;
  userId: string | { _id: string; name: string; email: string; phone: string };
  vehicleId: string | { _id: string; name: string; brand: string; images: string[]; pricing: any };
  startDate: string;
  endDate: string;
  rentalType: RentalType;
  quantity: number;
  totalPrice: number;
  discount: number;
  status: BookingStatus;
  paymentMethod?: 'online' | 'pay_at_store';
  paymentStatus: PaymentStatus;
  paymentType?: 'full' | 'deposit';
  amountPaid?: number;
  balanceDue?: number;
  notes?: string;
  promoCode?: string;
  createdAt?: string;
}
