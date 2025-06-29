export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'provider' | 'admin'
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'provider' | 'admin'
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'provider' | 'admin'
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          gradient: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          gradient?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          gradient?: string | null
          created_at?: string
        }
      }
      service_providers: {
        Row: {
          id: string
          user_id: string | null
          business_name: string | null
          category_id: string | null
          hourly_rate: number
          experience_years: number
          description: string | null
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          availability: 'online' | 'offline' | 'busy'
          response_time: string
          rating: number
          total_reviews: number
          total_jobs: number
          verification_documents: Json
          business_license: string | null
          certifications: string[]
          portfolio_images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          business_name?: string | null
          category_id?: string | null
          hourly_rate?: number
          experience_years?: number
          description?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          availability?: 'online' | 'offline' | 'busy'
          response_time?: string
          rating?: number
          total_reviews?: number
          total_jobs?: number
          verification_documents?: Json
          business_license?: string | null
          certifications?: string[]
          portfolio_images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          business_name?: string | null
          category_id?: string | null
          hourly_rate?: number
          experience_years?: number
          description?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          availability?: 'online' | 'offline' | 'busy'
          response_time?: string
          rating?: number
          total_reviews?: number
          total_jobs?: number
          verification_documents?: Json
          business_license?: string | null
          certifications?: string[]
          portfolio_images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      provider_services: {
        Row: {
          id: string
          provider_id: string | null
          service_name: string
          description: string | null
          price_range: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider_id?: string | null
          service_name: string
          description?: string | null
          price_range?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string | null
          service_name?: string
          description?: string | null
          price_range?: string | null
          created_at?: string
        }
      }
      provider_availability: {
        Row: {
          id: string
          provider_id: string | null
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider_id?: string | null
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string | null
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string | null
          provider_id: string | null
          service_name: string
          booking_date: string
          booking_time: string
          duration_hours: number
          total_cost: number
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          customer_phone: string
          customer_email: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          provider_id?: string | null
          service_name: string
          booking_date: string
          booking_time: string
          duration_hours?: number
          total_cost: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          customer_phone: string
          customer_email: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          provider_id?: string | null
          service_name?: string
          booking_date?: string
          booking_time?: string
          duration_hours?: number
          total_cost?: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          customer_phone?: string
          customer_email?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string | null
          amount: number
          payment_method: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id: string | null
          mpesa_receipt_number: string | null
          phone_number: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          amount: number
          payment_method?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          amount?: number
          payment_method?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string | null
          customer_id: string | null
          provider_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          customer_id?: string | null
          provider_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          customer_id?: string | null
          provider_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'provider' | 'admin'
      provider_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      booking_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      availability_status: 'online' | 'offline' | 'busy'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}