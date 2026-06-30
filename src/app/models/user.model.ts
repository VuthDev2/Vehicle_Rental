export type UserRole = 'customer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}
