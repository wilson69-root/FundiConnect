/*
  # Complete FundiConnect Database Schema

  This migration creates the complete database schema for FundiConnect with:
  
  1. New Tables
     - `profiles` - User profiles for customers and providers
     - `service_categories` - Available service categories
     - `service_providers` - Provider business information
     - `provider_services` - Services offered by each provider
     - `provider_availability` - Provider working schedules
     - `bookings` - Service bookings and appointments
     - `payments` - Payment transactions
     - `reviews` - Customer reviews and ratings

  2. Security
     - Enable RLS on all tables
     - Add comprehensive policies for data access
     - Secure user data with proper authentication checks

  3. Indexes
     - Performance optimization for common queries
     - Search functionality support

  4. Functions
     - Helper functions for common operations
     - Triggers for automatic updates
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE provider_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_status AS ENUM ('online', 'offline', 'busy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  role user_role DEFAULT 'customer',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  gradient text,
  created_at timestamptz DEFAULT now()
);

-- Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text,
  category_id uuid REFERENCES service_categories(id),
  hourly_rate numeric DEFAULT 0,
  experience_years integer DEFAULT 0,
  description text,
  status provider_status DEFAULT 'approved',
  availability availability_status DEFAULT 'online',
  response_time text DEFAULT '< 1 hour',
  rating numeric DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 1,
  total_jobs integer DEFAULT 0,
  verification_documents jsonb DEFAULT '{}',
  business_license text,
  certifications text[] DEFAULT '{}',
  portfolio_images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create provider_services table
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text,
  price_range text,
  created_at timestamptz DEFAULT now()
);

-- Create provider_availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id),
  provider_id uuid REFERENCES service_providers(id),
  service_name text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  duration_hours integer DEFAULT 1,
  total_cost numeric NOT NULL,
  status booking_status DEFAULT 'pending',
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_method text DEFAULT 'mpesa',
  status payment_status DEFAULT 'pending',
  transaction_id text,
  mpesa_receipt_number text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  customer_id uuid REFERENCES profiles(id),
  provider_id uuid REFERENCES service_providers(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Insert default service categories
INSERT INTO service_categories (name, description, icon, gradient) VALUES
  ('Plumbing', 'Professional plumbing services', 'Wrench', 'from-blue-500 to-blue-600'),
  ('Cleaning', 'Home and office cleaning', 'Sparkles', 'from-emerald-500 to-emerald-600'),
  ('Electrical', 'Electrical installations and repairs', 'Zap', 'from-yellow-500 to-orange-500'),
  ('Beauty', 'Beauty and wellness services', 'Sparkles', 'from-pink-500 to-rose-500'),
  ('Carpentry', 'Furniture and woodwork', 'Hammer', 'from-amber-600 to-orange-600'),
  ('Tutoring', 'Educational tutoring services', 'BookOpen', 'from-purple-500 to-indigo-500'),
  ('Masonry', 'Construction and stonework', 'HardHat', 'from-gray-500 to-gray-600')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service categories policies (public read)
CREATE POLICY "Anyone can read service categories"
  ON service_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service providers policies (public read for approved providers)
CREATE POLICY "Anyone can read approved providers"
  ON service_providers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Providers can read own data"
  ON service_providers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Providers can update own data"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create provider profiles"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Provider services policies
CREATE POLICY "Anyone can read provider services"
  ON provider_services
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Providers can manage own services"
  ON provider_services
  FOR ALL
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Provider availability policies
CREATE POLICY "Anyone can read provider availability"
  ON provider_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Providers can manage own availability"
  ON provider_availability
  FOR ALL
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE customer_id = auth.uid()
    ) OR
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN service_providers sp ON b.provider_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "System can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE customer_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_user ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider ON provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE ON service_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update provider rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE service_providers 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 4.5) 
            FROM reviews 
            WHERE provider_id = NEW.provider_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE provider_id = NEW.provider_id
        )
    WHERE id = NEW.provider_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update provider rating when review is added
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();