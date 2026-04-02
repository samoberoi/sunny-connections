export type UserRole = 'customer' | 'cleaner' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'cleaning' | 'housekeeping';
  ratePerHour: number;
  minDuration: number;
  maxDuration: number;
  icon: string;
}

export interface Cleaner {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  specialisations: string[];
  verified: boolean;
  available: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  cleanerId: string;
  cleanerName: string;
  cleanerAvatar: string;
  serviceId: string;
  serviceName: string;
  address: Address;
  date: string;
  time: string;
  duration: number;
  recurring: 'none' | 'weekly' | 'fortnightly' | 'monthly';
  status: 'pending' | 'assigned' | 'en-route' | 'otp-verified' | 'in-progress' | 'completed' | 'cancelled';
  otp: string;
  totalCost: number;
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string;
}

export interface EnrolmentApplication {
  id: string;
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  postcode: string;
  rightToWork: string;
  idType: string;
  experience: number;
  specialisations: string[];
  references: { name: string; phone: string; relationship: string }[];
  dbsConsent: boolean;
  availability: { days: string[]; hours: string };
  bankSortCode: string;
  bankAccountNumber: string;
  agreedTerms: boolean;
  status: 'submitted' | 'under-review' | 'interview' | 'training' | 'active' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export interface TrainingModule {
  id: string;
  level: number;
  levelTitle: string;
  moduleNumber: number;
  title: string;
  content: string[];
  completed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'promo' | 'system';
  read: boolean;
  createdAt: string;
}
