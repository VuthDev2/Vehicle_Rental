export type PaymentMethod = 'Card' | 'PayPal' | 'Cash';
export type PaymentResult = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentResult;
  transactionId: string;
  date: string;
}
