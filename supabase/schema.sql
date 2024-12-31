-- Create tables for Zilk app

-- Enable PostGIS for location-based queries
create extension if not exists postgis;

-- Businesses table
create table if not exists businesses (
  id uuid references auth.users on delete cascade,
  name text not null,
  address text not null,
  location geography(point) not null,
  phone text,
  operating_hours jsonb not null,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Business staff table
create table if not exists business_staff (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references businesses on delete cascade,
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(business_id, user_id)
);

-- Deals table
create table if not exists deals (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references businesses on delete cascade,
  title text not null,
  description text not null,
  terms text not null,
  expiration_date timestamp with time zone not null,
  is_active boolean default true,
  requires_spin boolean default false,
  redemption_count integer default 0,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Spin attempts table
create table if not exists spin_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_phone text not null,
  nfc_tag_id text not null,
  deal_id uuid references deals on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_phone, nfc_tag_id, date_trunc('day', created_at))
);

-- NFC tags table
create table if not exists nfc_tags (
  id text primary key,
  business_id uuid references businesses on delete cascade,
  type text not null check (type in ('activation', 'redemption')),
  location geography(point) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deal redemptions table
create table if not exists deal_redemptions (
  id uuid default uuid_generate_v4() primary key,
  deal_id uuid references deals on delete cascade,
  user_phone text,
  redemption_code text not null,
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Create indexes
create index if not exists businesses_location_idx on businesses using gist (location);
create index if not exists nfc_tags_location_idx on nfc_tags using gist (location);
create index if not exists deals_business_id_idx on deals(business_id);
create index if not exists deals_active_idx on deals(is_active) where is_active = true;
create index if not exists spin_attempts_user_phone_idx on spin_attempts(user_phone);
create index if not exists deal_redemptions_deal_id_idx on deal_redemptions(deal_id);
create index if not exists deal_redemptions_redemption_code_idx on deal_redemptions(redemption_code);

-- Create functions
create or replace function increment_view_count()
returns trigger as $$
begin
  update deals
  set view_count = view_count + 1
  where id = new.deal_id;
  return new;
end;
$$ language plpgsql;

create or replace function increment_redemption_count()
returns trigger as $$
begin
  update deals
  set redemption_count = redemption_count + 1
  where id = new.deal_id;
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger deal_viewed
  after insert on deal_redemptions
  for each row
  execute function increment_view_count();

create trigger deal_redeemed
  after update of redeemed_at on deal_redemptions
  for each row
  when (old.redeemed_at is null and new.redeemed_at is not null)
  execute function increment_redemption_count();

-- Row Level Security policies
alter table businesses enable row level security;
alter table business_staff enable row level security;
alter table deals enable row level security;
alter table spin_attempts enable row level security;
alter table nfc_tags enable row level security;
alter table deal_redemptions enable row level security;

-- Business policies
create policy "Public businesses are viewable by everyone"
  on businesses for select
  using (true);

create policy "Users can insert their own business"
  on businesses for insert
  with check (auth.uid() = id);

create policy "Users can update their own business"
  on businesses for update
  using (auth.uid() = id);

-- Business staff policies
create policy "Business owners can manage staff"
  on business_staff for all
  using (exists (
    select 1 from businesses
    where id = business_staff.business_id
    and businesses.id = auth.uid()
  ));

-- Deals policies
create policy "Active deals are viewable by everyone"
  on deals for select
  using (is_active = true);

create policy "Business staff can view all business deals"
  on deals for select
  using (exists (
    select 1 from business_staff
    where business_id = deals.business_id
    and user_id = auth.uid()
  ));

create policy "Business staff can insert deals"
  on deals for insert
  with check (exists (
    select 1 from business_staff
    where business_id = deals.business_id
    and user_id = auth.uid()
  ));

create policy "Business staff can update deals"
  on deals for update
  using (exists (
    select 1 from business_staff
    where business_id = deals.business_id
    and user_id = auth.uid()
  )); 