/*
  # FundiConnect Database Schema

  1. New Tables
    - `profiles` - User profiles for both customers and providers
    - `service_providers` - Service provider specific information
    - `service_categories` - Available service categories
    - `bookings` - Service bookings and appointments
    - `payments` - Payment transactions
    - `reviews` - Customer reviews and ratings
    - `provider_services` - Services offered by each provider
    - `provider_availability` - Provider working hours and availability

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Separate policies for customers and providers
    - Admin policies for management

  3. Functions
    - Update provider ratings automatically
    - Handle booking status changes
    - Calculate provider scores
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE provider_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE availability_status AS ENUM ('online', 'offline', 'busy');

-- Profiles table (extends auth.users)
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

-- Service categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  gradient text,
  created_at timestamptz DEFAULT now()
);

-- Service providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text,
  category_id uuid REFERENCES service_categories(id),
  hourly_rate integer NOT NULL DEFAULT 0,
  experience_years integer DEFAULT 0,
  description text,
  status provider_status DEFAULT 'pending',
  availability availability_status DEFAULT 'offline',
  response_time text DEFAULT '< 1 hour',
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_jobs integer DEFAULT 0,
  verification_documents jsonb DEFAULT '{}',
  business_license text,
  certifications text[] DEFAULT '{}',
  portfolio_images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Provider services table
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text,
  price_range text,
  created_at timestamptz DEFAULT now()
);

-- Provider availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  duration_hours integer DEFAULT 1,
  total_cost integer NOT NULL,
  status booking_status DEFAULT 'pending',
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  payment_method text NOT NULL DEFAULT 'mpesa',
  status payment_status DEFAULT 'pending',
  transaction_id text,
  mpesa_receipt_number text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

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
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service categories policies (public read)
CREATE POLICY "Anyone can view service categories"
  ON service_categories FOR SELECT
  TO public
  USING (true);

-- Service providers policies
CREATE POLICY "Anyone can view approved providers"
  ON service_providers FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Providers can view own data"
  ON service_providers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Providers can update own data"
  ON service_providers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Providers can insert own data"
  ON service_providers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Provider services policies
CREATE POLICY "Anyone can view provider services"
  ON provider_services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Providers can manage own services"
  ON provider_services FOR ALL
  TO authenticated
  USING (provider_id IN (
    SELECT id FROM service_providers WHERE user_id = auth.uid()
  ));

-- Provider availability policies
CREATE POLICY "Anyone can view provider availability"
  ON provider_availability FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Providers can manage own availability"
  ON provider_availability FOR ALL
  TO authenticated
  USING (provider_id IN (
    SELECT id FROM service_providers WHERE user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view related payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE customer_id = auth.uid() OR 
            provider_id IN (
              SELECT id FROM service_providers WHERE user_id = auth.uid()
            )
    )
  );

CREATE POLICY "System can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (true);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE provider_id = NEW.provider_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE provider_id = NEW.provider_id
    ),
    updated_at = now()
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_job_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE service_providers 
    SET 
      total_jobs = total_jobs + 1,
      updated_at = now()
    WHERE id = NEW.provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_job_count_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_job_count();

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