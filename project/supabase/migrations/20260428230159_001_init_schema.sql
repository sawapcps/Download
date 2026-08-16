/*
  # Initial Database Schema for Delivery App
  
  1. New Tables
    - `users` (customers)
    - `drivers` (delivery drivers)
    - `orders` (delivery orders)
    - `order_items` (items in orders)
    - `cities` (West Bank cities and villages)
    - `payments` (payment records)
    - `driver_ratings` (driver reviews)
    - `app_settings` (configurable settings like mobile wallet number)
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for customers, drivers, and admin
  
  3. Features
    - Order tracking with status updates
    - Driver location tracking
    - Payment tracking
    - Driver rating system
    - Configurable mobile wallet settings
*/

-- Create users table (customers)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  city text NOT NULL,
  address text,
  latitude decimal(10, 8),
  longitude decimal(10, 8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  city text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(10, 8),
  is_active boolean DEFAULT false,
  rating decimal(3, 2) DEFAULT 5.00,
  total_orders integer DEFAULT 0,
  tier text DEFAULT 'beginner',
  verified boolean DEFAULT false,
  vehicle_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cities table (West Bank)
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(10, 8) NOT NULL,
  base_delivery_fee decimal(10, 2) DEFAULT 5.00,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  order_type text NOT NULL CHECK (order_type IN ('greeting_card', 'general_delivery')),
  city text NOT NULL,
  customer_latitude decimal(10, 8) NOT NULL,
  customer_longitude decimal(10, 8) NOT NULL,
  delivery_address text NOT NULL,
  item_description text NOT NULL,
  delivery_fee decimal(10, 2) NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  estimated_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer DEFAULT 1,
  price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  mobile_wallet_number text,
  payment_method text NOT NULL DEFAULT 'mobile_wallet',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create driver ratings table
CREATE TABLE IF NOT EXISTS driver_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create app settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for drivers table
CREATE POLICY "Drivers can view their own profile"
  ON drivers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own profile"
  ON drivers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active drivers"
  ON drivers FOR SELECT
  USING (is_active = true);

-- RLS Policies for orders table
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Drivers can view assigned orders"
  ON orders FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Drivers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- RLS Policies for order items
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR orders.driver_id = auth.uid())
    )
  );

-- RLS Policies for cities
CREATE POLICY "Anyone can view cities"
  ON cities FOR SELECT
  USING (true);

-- RLS Policies for payments
CREATE POLICY "Customers can view their payments"
  ON payments FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for driver ratings
CREATE POLICY "Users can view driver ratings"
  ON driver_ratings FOR SELECT
  USING (true);

CREATE POLICY "Customers can create ratings"
  ON driver_ratings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for app settings
CREATE POLICY "Anyone can view app settings"
  ON app_settings FOR SELECT
  USING (true);

-- Insert West Bank cities
INSERT INTO cities (name, latitude, longitude, base_delivery_fee) VALUES
('رام الله', 31.9454, 35.1956, 5.00),
('البيرة', 31.9409, 35.2039, 5.00),
('جنين', 32.2743, 35.3004, 6.00),
('نابلس', 32.2229, 35.2313, 6.00),
('طولكرم', 32.3155, 35.0279, 5.50),
('قلقيلية', 32.1943, 35.1854, 5.50),
('سلفيت', 32.0797, 35.2139, 5.50),
('بيت لحم', 31.7049, 35.2048, 5.00),
('الخليل', 31.5405, 35.2075, 6.50),
('أريحا', 31.8618, 35.4507, 8.00),
('قطاع غزة', 31.9474, 34.3569, 7.00),
('دورا', 31.6209, 35.2450, 5.50),
('بيت جالا', 31.9291, 35.2087, 5.00),
('بيت ساحور', 31.7368, 35.2087, 5.00),
('بيتونيا', 31.9316, 35.1722, 5.00),
('رامالله القرى', 31.9454, 35.1956, 5.50),
('عمّوريتا', 31.9316, 35.1656, 5.50),
('كفر عقب', 31.9674, 35.2104, 5.50),
('القدس', 31.7683, 35.2137, 6.00),
('العيسوية', 31.8099, 35.2402, 6.00)
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('mobile_wallet_number', '', 'Mobile wallet number for receiving payments'),
('admin_commission_percentage', '40', 'Admin commission percentage'),
('driver_commission_percentage', '60', 'Driver commission percentage'),
('minimum_driver_rating', '3', 'Minimum driver rating to accept orders'),
('app_name', 'توصيل الأفراح', 'Application name')
ON CONFLICT DO NOTHING;