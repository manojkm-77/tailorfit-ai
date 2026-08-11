-- TailorFit AI — Supabase PostgreSQL schema (Phase 3)
-- users, customer_profiles, scan_logs, measurement_records, tailor_orders
-- with foreign keys, indexes, and Row Level Security (RLS) policies.

-- ---------------------------------------------------------------------------
-- 1. USERS (extends Supabase auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
    id          uuid primary key references auth.users(id) on delete cascade,
    email       text not null unique,
    full_name   text,
    role        text not null default 'customer' check (role in ('customer', 'tailor', 'admin')),
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. CUSTOMER PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.customer_profiles (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references public.users(id) on delete cascade,
    gender           text check (gender in ('male', 'female', 'unisex')),
    height_cm        numeric(5, 1),
    weight_kg        numeric(5, 1),
    unit_preference  text not null default 'cm' check (unit_preference in ('cm', 'inches')),
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. SCAN LOGS (async job lifecycle mirror of the Redis status)
-- ---------------------------------------------------------------------------
create table if not exists public.scan_logs (
    id                   uuid primary key default gen_random_uuid(),
    customer_profile_id  uuid references public.customer_profiles(id) on delete set null,
    scan_external_id     text not null unique,
    status               text not null default 'queued'
        check (status in ('queued', 'processing', 'completed', 'failed')),
    progress             smallint not null default 0 check (progress between 0 and 100),
    mesh_url             text,
    front_image_url      text,
    side_image_url       text,
    back_image_url       text,
    perimeters           jsonb,
    error_message        text,
    created_at           timestamptz not null default now(),
    updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. MEASUREMENT RECORDS (per-scan metric grid, mirrors BodyMeasurementItem[])
-- ---------------------------------------------------------------------------
create table if not exists public.measurement_records (
    id                uuid primary key default gen_random_uuid(),
    scan_log_id       uuid not null references public.scan_logs(id) on delete cascade,
    measurement_key   text not null,
    name              text not null,
    category          text not null
        check (category in ('neck', 'upper_body', 'arms', 'torso', 'lower_body', 'full_body')),
    value_cm          numeric(6, 1) not null,
    value_inches      numeric(6, 1) not null,
    confidence_score  numeric(5, 2) not null,
    tailor_notes      text,
    unique (scan_log_id, measurement_key)
);

-- ---------------------------------------------------------------------------
-- 5. TAILOR ORDERS (workflow state machine)
-- ---------------------------------------------------------------------------
create table if not exists public.tailor_orders (
    id                  uuid primary key default gen_random_uuid(),
    customer_profile_id uuid not null references public.customer_profiles(id) on delete cascade,
    scan_log_id         uuid references public.scan_logs(id) on delete set null,
    garment_type        text not null,
    fit_profile         text not null default 'regular'
        check (fit_profile in ('slim', 'regular', 'relaxed')),
    status              text not null default 'Pending'
        check (status in ('Pending', 'In Cutting', 'Stitching', 'Fitting Ready', 'Completed')),
    assigned_tailor_id  uuid references public.users(id) on delete set null,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
create index if not exists idx_customer_profiles_user_id   on public.customer_profiles (user_id);
create index if not exists idx_scan_logs_customer_profile  on public.scan_logs (customer_profile_id, status);
create index if not exists idx_scan_logs_external_id       on public.scan_logs (scan_external_id);
create index if not exists idx_measurement_records_scan    on public.measurement_records (scan_log_id);
create index if not exists idx_tailor_orders_status        on public.tailor_orders (status);
create index if not exists idx_tailor_orders_customer      on public.tailor_orders (customer_profile_id);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.users              enable row level security;
alter table public.customer_profiles  enable row level security;
alter table public.scan_logs          enable row level security;
alter table public.measurement_records enable row level security;
alter table public.tailor_orders      enable row level security;

-- Users: self-service on their own row
create policy "users_select_own" on public.users
    for select using (auth.uid() = id);
create policy "users_update_own" on public.users
    for update using (auth.uid() = id);

-- Customer profiles: owner access
create policy "profiles_select_own" on public.customer_profiles
    for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.customer_profiles
    for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.customer_profiles
    for update using (auth.uid() = user_id);

-- Scan logs: owner (via profile) + assigned tailors + service role
create policy "scan_logs_select_owner" on public.scan_logs
    for select using (
        exists (
            select 1 from public.customer_profiles cp
            where cp.id = scan_logs.customer_profile_id and cp.user_id = auth.uid()
        )
    );
create policy "scan_logs_insert_service" on public.scan_logs
    for insert with check (auth.role() = 'service_role');

-- Measurements: owner
create policy "measurements_select_owner" on public.measurement_records
    for select using (
        exists (
            select 1 from public.scan_logs sl
            join public.customer_profiles cp on cp.id = sl.customer_profile_id
            where sl.id = measurement_records.scan_log_id and cp.user_id = auth.uid()
        )
    );

-- Tailor orders: owner + assigned tailor + admin
create policy "orders_select_owner" on public.tailor_orders
    for select using (
        exists (
            select 1 from public.customer_profiles cp
            where cp.id = tailor_orders.customer_profile_id and cp.user_id = auth.uid()
        )
        or auth.uid() = tailor_orders.assigned_tailor_id
        or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );