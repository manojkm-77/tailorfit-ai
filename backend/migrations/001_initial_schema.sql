-- TailorFit AI — Supabase PostgreSQL Schema Migration (001_initial_schema.sql)
-- Complete Production Database Schema for Users, Customer Profiles, Scan Logs, Measurements & Tailor Orders

-- ---------------------------------------------------------------------------
-- 1. USERS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. CUSTOMER PROFILES TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Client',
    gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
    height_cm NUMERIC(5,2) NOT NULL,
    weight_kg NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. SCAN LOGS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    front_image_url TEXT NOT NULL,
    side_image_url TEXT,
    back_image_url TEXT,
    mesh_glb_url TEXT,
    status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')) DEFAULT 'PENDING',
    confidence_score NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. MEASUREMENT RECORDS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scan_logs(id) ON DELETE CASCADE,
    metrics JSONB NOT NULL, -- Stores all 18+ perimeters & linear lengths
    unit TEXT CHECK (unit IN ('cm', 'in')) DEFAULT 'cm',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. TAILOR ORDERS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tailor_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scan_logs(id) ON DELETE CASCADE,
    garment_type TEXT NOT NULL, -- e.g., 'suit', 'shirt', 'trousers', 'dress'
    fit_profile TEXT CHECK (fit_profile IN ('slim', 'regular', 'relaxed')) DEFAULT 'regular',
    cut_measurements JSONB NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- INDEXES FOR HIGH PERFORMANCE QUERYING
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_customer_id ON scan_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_status ON scan_logs(status);
CREATE INDEX IF NOT EXISTS idx_measurement_records_scan_id ON measurement_records(scan_id);
CREATE INDEX IF NOT EXISTS idx_tailor_orders_customer_id ON tailor_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_tailor_orders_scan_id ON tailor_orders(scan_id);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------------
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailor_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON customer_profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON customer_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "scan_logs_select_policy" ON scan_logs FOR SELECT USING (true);
CREATE POLICY "scan_logs_insert_policy" ON scan_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "measurement_records_select_policy" ON measurement_records FOR SELECT USING (true);
CREATE POLICY "measurement_records_insert_policy" ON measurement_records FOR INSERT WITH CHECK (true);
CREATE POLICY "tailor_orders_select_policy" ON tailor_orders FOR SELECT USING (true);
CREATE POLICY "tailor_orders_insert_policy" ON tailor_orders FOR INSERT WITH CHECK (true);