export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
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
  paymentStatus: PaymentStatus;
  notes?: string;
  promoCode?: string;
  createdAt?: string;
}
