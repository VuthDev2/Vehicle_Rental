export interface Review {
  _id: string;
  bookingId: string;
  vehicleId: string;
  userId: string | { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}
