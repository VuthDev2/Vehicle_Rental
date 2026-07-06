export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentMethod = 'Card' | 'PayPal' | 'Cash' | 'ABA Pay' | 'Wing';

export interface Payment {
  _id: string;
  bookingId: string | { _id: string; rentalType: string; startDate: string; endDate: string; totalPrice: number };
  userId: string | { _id: string; name: string; email: string };
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  notes?: string;
  createdAt: string;
}
