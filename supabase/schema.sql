-- Enable necessary extensions
create extension if not exists "postgis";

-- Drop existing policies first
drop policy if exists "Public businesses are viewable by everyone" on businesses;
drop policy if exists "Businesses can be updated by staff" on businesses;
drop policy if exists "Staff members can view their own businesses" on business_staff;
drop policy if exists "Deals can be managed by business staff" on deals;
drop policy if exists "Active deals are viewable by everyone" on deals;
drop policy if exists "NFC tags can be managed by business staff" on nfc_tags;
drop policy if exists "Spin attempts are viewable by business staff" on spin_attempts;
drop policy if exists "Spin attempts can be created by anyone" on spin_attempts;
drop policy if exists "Redemptions are viewable by business staff" on deal_redemptions;
drop policy if exists "Redemptions can be created by anyone" on deal_redemptions;
drop policy if exists "Redemptions can be updated by business staff" on deal_redemptions;
drop policy if exists "Users can view own business data" on businesses;
drop policy if exists "Users can update own business data" on businesses;
drop policy if exists "Users can insert own business data" on businesses;

-- Drop existing triggers
drop trigger if exists deal_redemption_counter on deal_redemptions;
drop trigger if exists nfc_scan_counter on deal_redemptions;
drop trigger if exists set_updated_at on businesses;

-- Drop existing functions
drop function if exists increment_deal_redemptions();
drop function if exists increment_nfc_scan_count();
drop function if exists handle_updated_at();

-- Clean up existing tables
drop table if exists deal_redemptions;
drop table if exists spin_attempts;
drop table if exists nfc_tags;
drop table if exists deals;
drop table if exists business_staff;
drop table if exists businesses;

-- Create businesses table
create table public.businesses (
    id uuid references auth.users on delete cascade primary key,
    name text,
    email text not null,
    phone text,
    address text,
    location geography(point),
    operating_hours jsonb default '{}'::jsonb,
    logo_url text,
    website text,
    is_active boolean default true not null,
    settings jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create business_staff table
create table public.business_staff (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_id uuid references businesses on delete cascade not null,
    user_id uuid references auth.users on delete cascade not null,
    role text not null check (role in ('owner', 'manager', 'staff')),
    permissions jsonb default '{}'::jsonb not null,
    is_active boolean default true not null,
    unique(business_id, user_id)
);

-- Create deals table
create table public.deals (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_id uuid references businesses on delete cascade not null,
    title text not null,
    description text not null,
    terms text,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    max_redemptions integer,
    current_redemptions integer default 0 not null,
    discount_type text not null check (discount_type in ('percentage', 'fixed')),
    discount_amount decimal not null,
    is_active boolean default true not null
);

-- Create nfc_tags table
create table public.nfc_tags (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_id uuid references businesses on delete cascade not null,
    tag_id text unique not null,
    name text not null,
    location text,
    is_active boolean default true not null,
    last_scan timestamp with time zone,
    scan_count integer default 0 not null
);

-- Create spin_attempts table
create table public.spin_attempts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deal_id uuid references deals on delete cascade not null,
    user_device_id text not null,
    result boolean not null,
    location geography(point)
);

-- Create deal_redemptions table
create table public.deal_redemptions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deal_id uuid references deals on delete cascade not null,
    business_id uuid references businesses on delete cascade not null,
    user_device_id text not null,
    redeemed_by uuid references auth.users on delete set null,
    nfc_tag_id uuid references nfc_tags on delete set null,
    spin_attempt_id uuid references spin_attempts on delete set null,
    status text not null check (status in ('pending', 'completed', 'cancelled')),
    redemption_code text unique not null,
    location geography(point) not null
);

-- Create updated_at trigger function
create function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create analytics functions
create function public.increment_deal_redemptions()
returns trigger as $$
begin
    update deals
    set current_redemptions = current_redemptions + 1
    where id = new.deal_id;
    return new;
end;
$$ language plpgsql security definer;

create function public.increment_nfc_scan_count()
returns trigger as $$
begin
    update nfc_tags
    set scan_count = scan_count + 1,
        last_scan = now()
    where id = new.nfc_tag_id;
    return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger set_updated_at
    before update on businesses
    for each row
    execute function public.handle_updated_at();

create trigger deal_redemption_counter
    after insert on deal_redemptions
    for each row
    when (new.status = 'completed')
    execute function increment_deal_redemptions();

create trigger nfc_scan_counter
    after insert on deal_redemptions
    for each row
    when (new.nfc_tag_id is not null)
    execute function increment_nfc_scan_count();

-- Enable Row Level Security
alter table businesses enable row level security;
alter table business_staff enable row level security;
alter table deals enable row level security;
alter table nfc_tags enable row level security;
alter table spin_attempts enable row level security;
alter table deal_redemptions enable row level security;

-- Create RLS Policies for businesses table
create policy "Enable read access for users to their own business"
    on businesses for select
    using (
        auth.uid() = id OR  -- Business owners can view their own business
        id in (             -- Staff members can view their business
            select business_id 
            from business_staff 
            where user_id = auth.uid() 
            and is_active = true
        )
    );

create policy "Enable insert access for users to their own business"
    on businesses for insert
    with check (auth.uid() = id);

create policy "Enable update access for users to their own business"
    on businesses for update
    using (
        auth.uid() = id OR  -- Business owners can update their own business
        id in (             -- Staff members can update their business
            select business_id 
            from business_staff 
            where user_id = auth.uid() 
            and is_active = true
            and role in ('owner', 'manager')
        )
    );

-- Create RLS Policies
create policy "Users can view own business data"
    on businesses for select
    using (auth.uid() = id);

create policy "Users can update own business data"
    on businesses for update
    using (auth.uid() = id);

create policy "Users can insert own business data"
    on businesses for insert
    with check (auth.uid() = id);

create policy "Staff members can view their own businesses"
    on business_staff for select
    using (auth.uid() = user_id);

create policy "Deals can be managed by business owners"
    on deals for all
    using (business_id in (
        select id from businesses where id = auth.uid()
    ));

create policy "NFC tags can be managed by business owners"
    on nfc_tags for all
    using (business_id in (
        select id from businesses where id = auth.uid()
    ));

create policy "Spin attempts are viewable by business owners"
    on spin_attempts for select
    using (deal_id in (
        select id from deals where business_id in (
            select id from businesses where id = auth.uid()
        )
    ));

create policy "Redemptions are viewable by business owners"
    on deal_redemptions for select
    using (business_id in (
        select id from businesses where id = auth.uid()
    )); 