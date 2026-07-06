import { Injectable, computed, signal } from '@angular/core';
import { Booking } from '../../models/booking.model';
import { Payment, PaymentMethod } from '../../models/payment.model';
import { User } from '../../models/user.model';
import { Vehicle, VehicleFilter } from '../../models/vehicle.model';

const vehicleImages = [
  'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
];

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly users = signal<User[]>([
    { _id: 'u1', name: 'Maya Chen', email: 'maya@example.com', phone: '+1 555 0148', role: 'customer', createdAt: '2026-01-12' },
    { _id: 'u2', name: 'Admin Team', email: 'admin@rental.test', phone: '+1 555 0100', role: 'admin', createdAt: '2025-11-02' },
  ]);

  readonly vehicles = signal<Vehicle[]>([
    {
      _id: 'v1',
      name: 'Tesla Model Y Long Range',
      brand: 'Tesla',
      model: 'Model Y',
      year: 2025,
      type: 'SUV',
      fuel: 'Electric',
      transmission: 'Automatic',
      seats: 5,
      location: 'Los Angeles',
      description: 'Quiet electric SUV with generous range, glass roof, premium audio, and plenty of luggage space.',
      images: [vehicleImages[0], vehicleImages[2]],
      available: true,
      rating: 4.9,
      trips: 84,
      pricing: { hour: 15, day: 109, week: 650, month: 2400, year: 24000 },
      features: ['GPS', 'Autopilot', 'Supercharging']
    },
    {
      _id: 'v2',
      name: 'BMW 330i Sport',
      brand: 'BMW',
      model: '330i',
      year: 2024,
      type: 'Car',
      fuel: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      location: 'San Diego',
      description: 'Balanced sport sedan for business trips, weekend drives, and smooth city cruising.',
      images: [vehicleImages[1], vehicleImages[3]],
      available: true,
      rating: 4.8,
      trips: 61,
      pricing: { hour: 12, day: 92, week: 550, month: 2000, year: 20000 },
      features: ['Leather Seats', 'Sunroof', 'M Sport Package']
    },
    {
      _id: 'v3',
      name: 'Toyota Corolla Hybrid',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      type: 'Car',
      fuel: 'Hybrid',
      transmission: 'Automatic',
      seats: 5,
      location: 'Austin',
      description: 'Efficient, practical, and simple to park. A dependable pick for daily errands or longer stays.',
      images: [vehicleImages[3], vehicleImages[0]],
      available: true,
      rating: 4.7,
      trips: 128,
      pricing: { hour: 7, day: 48, week: 280, month: 1000, year: 10000 },
      features: ['Apple CarPlay', 'Lane Assist']
    },
    {
      _id: 'v4',
      name: 'Ford Transit Passenger',
      brand: 'Ford',
      model: 'Transit',
      year: 2022,
      type: 'Van',
      fuel: 'Diesel',
      transmission: 'Automatic',
      seats: 12,
      location: 'Chicago',
      description: 'Roomy passenger van for group travel, airport transfers, events, and team logistics.',
      images: [vehicleImages[2], vehicleImages[1]],
      available: false,
      rating: 4.6,
      trips: 39,
      pricing: { hour: 20, day: 135, week: 800, month: 3000, year: 30000 },
      features: ['Backup Camera', 'Tow Hitch']
    },
  ]);

  readonly bookings = signal<Booking[]>([
    { _id: 'b1', userId: 'u1', vehicleId: 'v1', startDate: '2026-07-04', endDate: '2026-07-08', rentalType: 'day', quantity: 4, totalPrice: 436, discount: 0, status: 'confirmed', paymentStatus: 'paid' },
    { _id: 'b2', userId: 'u1', vehicleId: 'v3', startDate: '2026-06-08', endDate: '2026-06-10', rentalType: 'day', quantity: 2, totalPrice: 96, discount: 0, status: 'completed', paymentStatus: 'paid' },
  ]);

  readonly payments = signal<Payment[]>([
    { _id: 'p1', bookingId: 'b1', userId: 'u1', amount: 436, method: 'Card', status: 'succeeded', transactionId: 'SIM-873920', createdAt: '2026-06-28T00:00:00Z' },
    { _id: 'p2', bookingId: 'b2', userId: 'u1', amount: 96, method: 'PayPal', status: 'succeeded', transactionId: 'SIM-719244', createdAt: '2026-06-07T00:00:00Z' },
  ]);

  readonly totalRevenue = computed(() => this.payments().filter((payment) => payment.status === 'succeeded').reduce((sum, payment) => sum + payment.amount, 0));

  filterVehicles(filter: VehicleFilter): Vehicle[] {
    const query = filter.query.trim().toLowerCase();
    return this.vehicles().filter((vehicle) => {
      const matchesQuery = !query || [vehicle.name, vehicle.brand, vehicle.model, vehicle.location].some((value) => value.toLowerCase().includes(query));
      const matchesLocation = !filter.location || vehicle.location === filter.location;
      const matchesType = !filter.type || vehicle.type === filter.type;
      const matchesTransmission = !filter.transmission || vehicle.transmission === filter.transmission;
      const matchesPrice = !filter.maxPrice || vehicle.pricing.day <= filter.maxPrice;
      return matchesQuery && matchesLocation && matchesType && matchesTransmission && matchesPrice;
    });
  }

  vehicleById(id: string): Vehicle | undefined {
    return this.vehicles().find((vehicle) => vehicle._id === id);
  }

  createBooking(userId: string, vehicleId: string, startDate: string, endDate: string): Booking {
    const vehicle = this.vehicleById(vehicleId);
    const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000));
    const booking: Booking = {
      _id: crypto.randomUUID(),
      userId,
      vehicleId,
      startDate,
      endDate,
      rentalType: 'day',
      quantity: days,
      totalPrice: days * (vehicle?.pricing.day ?? 0),
      discount: 0,
      status: 'pending',
      paymentStatus: 'unpaid',
    };
    this.bookings.update((bookings) => [booking, ...bookings]);
    return booking;
  }

  simulatePayment(bookingId: string, method: PaymentMethod): Payment {
    const booking = this.bookings().find((item) => item._id === bookingId);
    const payment: Payment = {
      _id: crypto.randomUUID(),
      bookingId,
      userId: booking?.userId as string || 'u1',
      amount: booking?.totalPrice ?? 0,
      method,
      status: 'succeeded',
      transactionId: `SIM-${Math.floor(100000 + Math.random() * 899999)}`,
      createdAt: new Date().toISOString(),
    };
    this.payments.update((payments) => [payment, ...payments]);
    this.bookings.update((bookings) => bookings.map((item) => item._id === bookingId ? { ...item, status: 'confirmed', paymentStatus: 'paid' } : item));
    return payment;
  }

  cancelBooking(id: string): void {
    this.bookings.update((bookings) => bookings.map((booking) => booking._id === id ? { ...booking, status: 'cancelled' } : booking));
  }
}
