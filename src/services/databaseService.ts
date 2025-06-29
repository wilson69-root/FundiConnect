import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { ServiceProvider, ProviderRegistrationData, BookingData } from '../types';

type Tables = Database['public']['Tables'];
type ServiceProviderRow = Tables['service_providers']['Row'];
type ProfileRow = Tables['profiles']['Row'];
type ServiceCategoryRow = Tables['service_categories']['Row'];
type BookingRow = Tables['bookings']['Row'];
type PaymentRow = Tables['payments']['Row'];

export class DatabaseService {
  // Auth methods
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      await this.createProfile({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'customer',
      });
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Profile methods
  async createProfile(profile: Tables['profiles']['Insert']) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Tables['profiles']['Update']) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Service categories
  async getServiceCategories() {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  // Service providers
  async getServiceProviders(filters?: {
    category?: string;
    location?: string;
    status?: string;
  }) {
    let query = supabase
      .from('service_providers')
      .select(`
        *,
        profiles!service_providers_user_id_fkey(full_name, phone, avatar_url, location),
        service_categories!service_providers_category_id_fkey(name),
        provider_services(service_name)
      `)
      .eq('status', 'approved');

    if (filters?.category) {
      query = query.eq('service_categories.name', filters.category);
    }

    if (filters?.location) {
      query = query.ilike('profiles.location', `%${filters.location}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;

    // Transform to ServiceProvider format
    return data?.map(this.transformToServiceProvider) || [];
  }

  async getServiceProvider(id: string) {
    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        profiles!service_providers_user_id_fkey(full_name, phone, avatar_url, location),
        service_categories!service_providers_category_id_fkey(name),
        provider_services(service_name),
        provider_availability(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.transformToServiceProvider(data) : null;
  }

  async createServiceProvider(registrationData: ProviderRegistrationData, userId: string) {
    // Get category ID
    const { data: category } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', registrationData.businessInfo.category)
      .single();

    if (!category) throw new Error('Invalid service category');

    // Create service provider
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .insert({
        user_id: userId,
        business_name: registrationData.businessInfo.description,
        category_id: category.id,
        hourly_rate: registrationData.businessInfo.hourlyRate,
        experience_years: registrationData.businessInfo.experience,
        description: registrationData.businessInfo.description,
        response_time: registrationData.businessInfo.responseTime,
        certifications: registrationData.credentials.certifications,
        portfolio_images: registrationData.credentials.portfolio,
        status: 'pending',
      })
      .select()
      .single();

    if (providerError) throw providerError;

    // Add services
    if (registrationData.businessInfo.services.length > 0) {
      const services = registrationData.businessInfo.services.map(service => ({
        provider_id: provider.id,
        service_name: service,
      }));

      await supabase.from('provider_services').insert(services);
    }

    // Add availability
    if (registrationData.availability.workingDays.length > 0) {
      const availability = registrationData.availability.workingDays.map(day => ({
        provider_id: provider.id,
        day_of_week: this.getDayOfWeek(day),
        start_time: registrationData.availability.workingHours.start,
        end_time: registrationData.availability.workingHours.end,
      }));

      await supabase.from('provider_availability').insert(availability);
    }

    // Update profile role
    await this.updateProfile(userId, { role: 'provider' });

    return provider;
  }

  // Bookings
  async createBooking(bookingData: BookingData, customerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        provider_id: bookingData.providerId,
        service_name: bookingData.service,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        duration_hours: bookingData.duration,
        total_cost: bookingData.totalCost,
        customer_phone: bookingData.contactPhone,
        customer_email: bookingData.contactEmail,
        notes: bookingData.notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBookings(userId: string, role: 'customer' | 'provider') {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_customer_id_fkey(full_name, phone),
        service_providers!bookings_provider_id_fkey(
          *,
          profiles!service_providers_user_id_fkey(full_name)
        ),
        payments(*)
      `);

    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else {
      // For providers, get bookings for their service provider profile
      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (provider) {
        query = query.eq('provider_id', provider.id);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateBookingStatus(bookingId: string, status: BookingRow['status']) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Payments
  async createPayment(payment: Tables['payments']['Insert']) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePaymentStatus(
    paymentId: string, 
    status: PaymentRow['status'],
    transactionData?: Partial<PaymentRow>
  ) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        ...transactionData,
        completed_at: status === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reviews
  async createReview(review: Tables['reviews']['Insert']) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProviderReviews(providerId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_customer_id_fkey(full_name, avatar_url)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Helper methods
  private transformToServiceProvider(data: any): ServiceProvider {
    return {
      id: data.id,
      name: data.profiles?.full_name || 'Unknown Provider',
      category: data.service_categories?.name || 'Unknown',
      rating: data.rating || 0,
      reviews: data.total_reviews || 0,
      hourlyRate: data.hourly_rate || 0,
      location: data.profiles?.location || 'Unknown Location',
      image: data.profiles?.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: data.status === 'approved',
      responseTime: data.response_time || '< 1 hour',
      description: data.description || '',
      services: data.provider_services?.map((s: any) => s.service_name) || [],
      availability: data.availability || 'offline',
      joinDate: new Date(data.created_at),
      completedJobs: data.total_jobs || 0,
      phone: data.profiles?.phone,
      email: data.profiles?.email,
      experience: data.experience_years,
      certifications: data.certifications || [],
      portfolio: data.portfolio_images || [],
    };
  }

  private getDayOfWeek(day: string): number {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
  }
}

export const databaseService = new DatabaseService();