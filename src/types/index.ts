export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  location: string;
  image: string;
  verified: boolean;
  responseTime: string;
  description: string;
  services: string[];
  availability: 'online' | 'offline' | 'busy';
  joinDate?: Date;
  completedJobs?: number;
  phone?: string;
  email?: string;
  experience?: number;
  certifications?: string[];
  portfolio?: string[];
}

export interface BookingData {
  providerId: string;
  date: string;
  time: string;
  duration: number;
  service: string;
  notes?: string;
  contactPhone: string;
  contactEmail: string;
  totalCost: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  transactionId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type: 'text' | 'quotation' | 'provider-match';
  data?: any;
}

export interface ServiceQuotation {
  id: string;
  providerId: string;
  providerName: string;
  service: string;
  estimatedCost: number;
  duration: string;
  responseTime: string;
  rating: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradient: string;
}

export interface ProviderRegistrationData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    profileImage?: string;
  };
  businessInfo: {
    category: string;
    services: string[];
    hourlyRate: number;
    experience: number;
    description: string;
    responseTime: string;
  };
  credentials: {
    certifications: string[];
    portfolio: string[];
    idDocument?: string;
    businessLicense?: string;
  };
  availability: {
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
    serviceAreas: string[];
  };
}

export interface ProviderProfile extends ServiceProvider {
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: Date;
  documentsVerified: boolean;
  backgroundCheckStatus: 'pending' | 'completed' | 'failed';
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  amount: number;
  method: 'mpesa' | 'card';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  mpesaReceiptNumber?: string;
  phoneNumber?: string;
  createdAt: Date;
  completedAt?: Date;
}