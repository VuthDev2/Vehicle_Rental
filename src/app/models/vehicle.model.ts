export interface Vehicle {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  type: string;
  fuel: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual';
  seats: number;
  location: string;
  description: string;
  images: string[];
  available: boolean;
  rating: number;
  trips: number;
}

export interface VehicleFilter {
  query: string;
  location: string;
  type: string;
  transmission: string;
  maxPrice: number;
}
