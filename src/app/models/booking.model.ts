export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Booking {
  _id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}
