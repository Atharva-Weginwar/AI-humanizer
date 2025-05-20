/*
  # Initial schema setup for TextHuman application

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `full_name` (text)
      - `plan_type` (text)
      - `credits_remaining` (integer)
    
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `title` (text)
      - `original_text` (text)
      - `humanized_text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `character_count` (integer)
      - `ud_document_id` (text)
      - `humanization_settings` (json)
    
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `amount` (integer)
      - `description` (text)
      - `created_at` (timestamp)
      - `transaction_type` (text)
    
    - `plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `monthly_price` (decimal)
      - `annual_price` (decimal)
      - `monthly_credits` (integer)
      - `features` (json array)
      - `is_popular` (boolean)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  full_name text,
  plan_type text DEFAULT 'Free',
  credits_remaining integer DEFAULT 5000
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Untitled Document',
  original_text text,
  humanized_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  character_count integer,
  ud_document_id text,
  humanization_settings jsonb DEFAULT '{"readability": "High School", "purpose": "General Writing", "strength": "Balanced", "model": "v11"}'::jsonb
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  transaction_type text CHECK (transaction_type IN ('usage', 'purchase', 'plan_allocation', 'bonus'))
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  monthly_price decimal NOT NULL,
  annual_price decimal NOT NULL,
  monthly_credits integer NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false
);

-- Insert default plans
INSERT INTO plans (name, monthly_price, annual_price, monthly_credits, features, is_popular)
VALUES 
  ('Free', 0, 0, 5000, '["5,000 characters per month", "Basic humanization", "Standard processing speed", "Email support"]', false),
  ('Basic', 9.99, 99.99, 50000, '["50,000 characters per month", "Advanced humanization", "Faster processing speed", "Save up to 10 documents", "Priority email support"]', true),
  ('Premium', 19.99, 199.99, 150000, '["150,000 characters per month", "Premium humanization", "Fastest processing speed", "Unlimited document storage", "Priority support", "API access"]', false),
  ('Enterprise', 49.99, 499.99, 500000, '["500,000 characters per month", "Enterprise-grade humanization", "Dedicated account manager", "Custom integration options", "Advanced analytics", "Full API access"]', false);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Create RLS policies for documents table
CREATE POLICY "Users can view their own documents" 
  ON documents 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
  ON documents 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
  ON documents 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON documents 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create RLS policies for credit_transactions table
CREATE POLICY "Users can view their own transactions" 
  ON credit_transactions 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create RLS policies for plans table
CREATE POLICY "Anyone can view plans" 
  ON plans 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();