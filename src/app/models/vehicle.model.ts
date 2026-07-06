export interface VehiclePricing {
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
}

export interface Vehicle {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  fuel: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'N/A';
  transmission: 'Automatic' | 'Manual';
  seats: number;
  location: string;
  description: string;
  images: string[];
  available: boolean;
  rating: number;
  trips: number;
  pricing: VehiclePricing;
  features: string[];
}

export interface VehicleFilter {
  query: string;
  location: string;
  type: string;
  fuel: string;
  transmission: string;
  minPrice: number;
  maxPrice: number;
  available: boolean;
  sort: string;
}
