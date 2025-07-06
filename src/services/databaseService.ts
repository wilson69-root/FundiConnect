import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { ServiceProvider, ProviderRegistrationData, BookingData } from '../types';

type Tables = Database['public']['Tables'];
type BookingRow = Tables['bookings']['Row'];
type PaymentRow = Tables['payments']['Row'];

export class DatabaseService {
  // Auth methods
  async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Disable email confirmation for instant signup
          emailRedirectTo: undefined
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        // Handle specific Supabase auth errors
        if (error.message?.includes('User already registered') || error.message?.includes('user_already_exists')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw error;
      }

      // For instant signup without email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created successfully without email confirmation');
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signin error:', error);
        // Handle specific Supabase auth errors
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link.');
        }
        if (error.message?.includes('Too many requests')) {
          throw new Error('Too many sign-in attempts. Please wait a moment before trying again.');
        }
        throw error;
      }
      
      console.log('Sign in successful:', data.user?.email);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Profile methods
  async createProfile(profile: Tables['profiles']['Insert']) {
    try {
      console.log('Creating profile for user:', profile.id);
      
      // First check if profile already exists using maybeSingle()
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profile.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing profile:', checkError);
        throw checkError;
      }

      if (existingProfile) {
        console.log('Profile already exists, updating instead');
        return await this.updateProfile(profile.id, {
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role
        });
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }
      
      console.log('✅ Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createProfile:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<Tables['profiles']['Row'] | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Tables['profiles']['Update']) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
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

  // Service providers - Enhanced query with better error handling for deployment
  async getServiceProviders(filters?: {
    category?: string;
    location?: string;
    status?: string;
  }) {
    try {
      console.log('🔍 Fetching service providers with filters:', filters);
      
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('service_providers')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        throw new Error('Database connection failed');
      }

      // Build the query with proper error handling
      let query = supabase
        .from('service_providers')
        .select(`
          *,
          profiles!service_providers_user_id_fkey(
            full_name, 
            phone, 
            avatar_url, 
            location,
            email
          ),
          service_categories!service_providers_category_id_fkey(name),
          provider_services(service_name, description)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Apply category filter if provided
      if (filters?.category) {
        try {
          const { data: categoryData, error: categoryError } = await supabase
            .from('service_categories')
            .select('id')
            .eq('name', filters.category)
            .maybeSingle();
          
          if (categoryError) {
            console.warn('Category not found:', filters.category);
          } else if (categoryData) {
            query = query.eq('category_id', categoryData.id);
            console.log('✅ Applied category filter:', filters.category);
          }
        } catch (categoryError) {
          console.warn('Error applying category filter:', categoryError);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      console.log(`📊 Raw provider data from database (${data?.length || 0} records):`, data);

      if (!data || data.length === 0) {
        console.log('⚠️ No providers found in database');
        return [];
      }

      // Transform to ServiceProvider format with better error handling
      const providers = data
        .map((item, index) => {
          try {
            return this.transformToServiceProvider(item);
          } catch (transformError) {
            console.error(`❌ Error transforming provider ${index}:`, transformError, item);
            return null;
          }
        })
        .filter(Boolean) as ServiceProvider[];

      // Apply location filter after transformation
      let filteredProviders = providers;
      if (filters?.location) {
        filteredProviders = providers.filter(provider =>
          provider.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
        console.log(`📍 Applied location filter "${filters.location}": ${filteredProviders.length} matches`);
      }

      console.log(`✅ Successfully transformed ${filteredProviders.length} providers:`, 
        filteredProviders.map(p => ({ name: p.name, category: p.category, location: p.location })));
      
      return filteredProviders;
    } catch (error) {
      console.error('❌ Error in getServiceProviders:', error);
      throw error;
    }
  }

  async getServiceProvider(id: string) {
    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        profiles!service_providers_user_id_fkey(full_name, phone, avatar_url, location, email),
        service_categories!service_providers_category_id_fkey(name),
        provider_services(service_name, description),
        provider_availability(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.transformToServiceProvider(data) : null;
  }

  async createServiceProvider(registrationData: ProviderRegistrationData, userId: string) {
    try {
      console.log('🚀 Creating service provider with data:', registrationData);

      // Ensure we have a valid user profile first
      let profile;
      profile = await this.getProfile(userId);
      
      if (!profile) {
        console.log('⚠️ Profile not found, creating one...');
        profile = await this.createProfile({
          id: userId,
          email: registrationData.personalInfo.email,
          full_name: registrationData.personalInfo.fullName,
          role: 'provider',
          phone: registrationData.personalInfo.phone,
          location: registrationData.personalInfo.location,
        });
      } else {
        console.log('✅ Found existing profile:', profile);
      }

      // Get or create category
      let categoryResult = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', registrationData.businessInfo.category)
        .maybeSingle();

      if (!categoryResult.data) {
        console.log('📝 Creating new service category:', registrationData.businessInfo.category);
        const { data: newCategory, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: registrationData.businessInfo.category,
            description: `${registrationData.businessInfo.category} services`,
            icon: 'Wrench',
            gradient: 'from-blue-500 to-blue-600'
          })
          .select()
          .single();
        
        if (categoryError) {
          console.error('❌ Error creating category:', categoryError);
          throw categoryError;
        }
        
        categoryResult.data = newCategory;
        console.log('✅ Created new category:', newCategory);
      }

      if (!categoryResult.data) throw new Error('Failed to create or find service category');

      // Create service provider with INSTANT APPROVAL
      const providerData = {
        user_id: userId,
        business_name: registrationData.personalInfo.fullName,
        category_id: categoryResult.data.id,
        hourly_rate: registrationData.businessInfo.hourlyRate,
        experience_years: registrationData.businessInfo.experience,
        description: registrationData.businessInfo.description,
        response_time: registrationData.businessInfo.responseTime,
        certifications: registrationData.credentials.certifications,
        portfolio_images: registrationData.credentials.portfolio,
        status: 'approved' as const, // INSTANT APPROVAL
        availability: 'online' as const, // Set as online by default
        rating: 4.5, // Start with good rating
        total_reviews: 1, // Start with 1 review to show activity
        total_jobs: 0
      };

      console.log('📝 Inserting provider data:', providerData);

      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .insert(providerData)
        .select()
        .single();

      if (providerError) {
        console.error('❌ Error creating provider:', providerError);
        throw providerError;
      }

      console.log('✅ Created provider:', provider);

      // Add services
      if (registrationData.businessInfo.services.length > 0) {
        const services = registrationData.businessInfo.services.map(service => ({
          provider_id: provider.id,
          service_name: service,
          description: `Professional ${service.toLowerCase()} services`,
          price_range: `KSh ${registrationData.businessInfo.hourlyRate} - ${registrationData.businessInfo.hourlyRate * 2}`
        }));

        console.log('📝 Adding services:', services);

        const { error: servicesError } = await supabase
          .from('provider_services')
          .insert(services);

        if (servicesError) {
          console.error('❌ Error adding services:', servicesError);
        } else {
          console.log('✅ Services added successfully');
        }
      }

      // Add availability
      if (registrationData.availability.workingDays.length > 0) {
        const availability = registrationData.availability.workingDays.map(day => ({
          provider_id: provider.id,
          day_of_week: this.getDayOfWeek(day),
          start_time: registrationData.availability.workingHours.start,
          end_time: registrationData.availability.workingHours.end,
          is_available: true
        }));

        console.log('📝 Adding availability:', availability);

        const { error: availabilityError } = await supabase
          .from('provider_availability')
          .insert(availability);

        if (availabilityError) {
          console.error('❌ Error adding availability:', availabilityError);
        } else {
          console.log('✅ Availability added successfully');
        }
      }

      // Update profile role and location
      await this.updateProfile(userId, { 
        role: 'provider',
        location: registrationData.personalInfo.location,
        phone: registrationData.personalInfo.phone
      });

      console.log('🎉 Provider registration completed successfully!');
      return provider;
    } catch (error) {
      console.error('❌ Error in createServiceProvider:', error);
      throw error;
    }
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
        .maybeSingle();

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
  private transformToServiceProvider(data: any): ServiceProvider | null {
    try {
      if (!data) {
        console.warn('⚠️ No data provided to transform');
        return null;
      }

      // Handle missing profiles data gracefully
      const profileData = data.profiles || {};
      const categoryData = data.service_categories || {};
      const servicesData = data.provider_services || [];

      const provider: ServiceProvider = {
        id: data.id,
        name: profileData.full_name || data.business_name || 'Unknown Provider',
        category: categoryData.name || 'Unknown',
        rating: data.rating || 4.5,
        reviews: data.total_reviews || 1,
        hourlyRate: data.hourly_rate || 0,
        location: profileData.location || 'Kenya',
        image: profileData.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
        verified: data.status === 'approved',
        responseTime: data.response_time || '< 1 hour',
        description: data.description || 'Professional service provider',
        services: servicesData.map((s: any) => s.service_name).filter(Boolean),
        availability: data.availability || 'online',
        joinDate: new Date(data.created_at),
        completedJobs: data.total_jobs || 0,
        phone: profileData.phone,
        email: profileData.email,
        experience: data.experience_years || 1,
        certifications: data.certifications || [],
        portfolio: data.portfolio_images || [],
      };

      console.log('✅ Successfully transformed provider:', {
        id: provider.id,
        name: provider.name,
        category: provider.category,
        location: provider.location
      });

      return provider;
    } catch (error) {
      console.error('❌ Error transforming provider data:', error);
      console.error('Raw data that failed to transform:', data);
      return null;
    }
  }

  private getDayOfWeek(day: string): number {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
  }
}

export const databaseService = new DatabaseService();