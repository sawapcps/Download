import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
};

export type Driver = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  rating: number;
  total_orders: number;
  tier: string;
  verified: boolean;
  vehicle_info?: string;
};

export type Order = {
  id: string;
  customer_id: string;
  driver_id?: string;
  order_type: 'greeting_card' | 'general_delivery';
  city: string;
  customer_latitude: number;
  customer_longitude: number;
  delivery_address: string;
  item_description: string;
  delivery_fee: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  estimated_time?: number;
  created_at: string;
  updated_at: string;
};

export type City = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  base_delivery_fee: number;
};
