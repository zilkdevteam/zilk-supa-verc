-- Enable necessary extensions
create extension if not exists "postgis";

-- Clean up existing tables if needed (comment out in production)
drop table if exists deal_redemptions;
drop table if exists spin_attempts;
drop table if exists nfc_tags;
drop table if exists deals;
drop table if exists business_staff;
drop table if exists businesses;

-- Create tables
create table businesses (
    id uuid references auth.users on delete cascade primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    address text not null,
    phone text not null,
    location geography(point) not null,
    operating_hours jsonb not null,
    logo_url text,
    website text,
    is_active boolean default true not null,
    settings jsonb default '{}'::jsonb not null
);

create table business_staff (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_id uuid references businesses on delete cascade not null,
    user_id uuid references auth.users on delete cascade not null,
    role text not null check (role in ('owner', 'manager', 'staff')),
    permissions jsonb default '{}'::jsonb not null,
    is_active boolean default true not null,
    unique(business_id, user_id)
);

create table deals (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    business_id uuid references businesses on delete cascade not null,
    title text not null,
    description text not null,
    terms text not null,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    redemption_limit integer,
    current_redemptions integer default 0 not null,
    requires_spin boolean default false not null,
    spin_probability decimal check (spin_probability >= 0 and spin_probability <= 1),
    is_active boolean default true not null,
    image_url text,
    deal_type text not null check (deal_type in ('discount', 'bogo', 'freebie', 'other')),
    deal_value jsonb not null -- stores structured data about the deal value (e.g., percentage, amount)
);

create table nfc_tags (
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

create table spin_attempts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deal_id uuid references deals on delete cascade not null,
    user_device_id text not null, -- anonymous identifier for users
    result boolean not null, -- true if won, false if lost
    location geography(point) -- where the spin was attempted
);

create table deal_redemptions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deal_id uuid references deals on delete cascade not null,
    business_id uuid references businesses on delete cascade not null,
    user_device_id text not null,
    redeemed_by uuid references auth.users on delete set null, -- staff member who processed
    nfc_tag_id uuid references nfc_tags on delete set null,
    spin_attempt_id uuid references spin_attempts on delete set null,
    status text not null check (status in ('pending', 'completed', 'cancelled')),
    redemption_code text unique not null,
    location geography(point) not null
);

-- Create indexes for performance
create index deals_business_id_idx on deals(business_id);
create index deals_is_active_idx on deals(is_active) where is_active = true;
create index nfc_tags_business_id_idx on nfc_tags(business_id);
create index nfc_tags_tag_id_idx on nfc_tags(tag_id);
create index spin_attempts_deal_id_idx on spin_attempts(deal_id);
create index deal_redemptions_deal_id_idx on deal_redemptions(deal_id);
create index deal_redemptions_business_id_idx on deal_redemptions(business_id);
create index deal_redemptions_status_idx on deal_redemptions(status);

-- Create spatial indexes
create index businesses_location_idx on businesses using gist(location);
create index spin_attempts_location_idx on spin_attempts using gist(location);
create index deal_redemptions_location_idx on deal_redemptions using gist(location);

-- Create functions for analytics
create or replace function increment_deal_redemptions()
returns trigger as $$
begin
    update deals
    set current_redemptions = current_redemptions + 1
    where id = new.deal_id;
    return new;
end;
$$ language plpgsql security definer;

create or replace function increment_nfc_scan_count()
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

-- Row Level Security (RLS) policies
alter table businesses enable row level security;
alter table business_staff enable row level security;
alter table deals enable row level security;
alter table nfc_tags enable row level security;
alter table spin_attempts enable row level security;
alter table deal_redemptions enable row level security;

-- Business access policies
create policy "Public businesses are viewable by everyone"
    on businesses for select
    using (true);

create policy "Businesses can be updated by staff"
    on businesses for update
    using (
        auth.uid() in (
            select user_id from business_staff
            where business_id = id
            and is_active = true
            and role in ('owner', 'manager')
        )
    );

-- Business staff access policies
create policy "Staff members can view their own businesses"
    on business_staff for select
    using (
        auth.uid() = user_id
        or
        auth.uid() in (
            select user_id from business_staff
            where business_id = business_id
            and role in ('owner', 'manager')
            and is_active = true
        )
    );

-- Deals access policies
create policy "Active deals are viewable by everyone"
    on deals for select
    using (
        is_active = true
        and
        start_date <= now()
        and
        end_date >= now()
    );

create policy "Deals can be managed by business staff"
    on deals for all
    using (
        auth.uid() in (
            select user_id from business_staff
            where business_id = business_id
            and is_active = true
        )
    );

-- NFC tags access policies
create policy "NFC tags can be managed by business staff"
    on nfc_tags for all
    using (
        auth.uid() in (
            select user_id from business_staff
            where business_id = business_id
            and is_active = true
        )
    );

-- Spin attempts access policies
create policy "Spin attempts are viewable by business staff"
    on spin_attempts for select
    using (
        auth.uid() in (
            select user_id from business_staff bs
            join deals d on d.business_id = bs.business_id
            where d.id = deal_id
            and bs.is_active = true
        )
    );

create policy "Spin attempts can be created by anyone"
    on spin_attempts for insert
    with check (true);

-- Deal redemptions access policies
create policy "Redemptions are viewable by business staff"
    on deal_redemptions for select
    using (
        auth.uid() in (
            select user_id from business_staff
            where business_id = business_id
            and is_active = true
        )
    );

create policy "Redemptions can be created by anyone"
    on deal_redemptions for insert
    with check (true);

create policy "Redemptions can be updated by business staff"
    on deal_redemptions for update
    using (
        auth.uid() in (
            select user_id from business_staff
            where business_id = business_id
            and is_active = true
        )
    ); 