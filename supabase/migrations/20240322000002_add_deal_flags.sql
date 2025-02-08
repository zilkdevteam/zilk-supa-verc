-- Add is_spin_exclusive column to deals table
alter table public.deals add column if not exists is_spin_exclusive boolean default false;

-- Add redemption tracking columns
alter table public.deals add column if not exists max_redemptions integer;
alter table public.deals add column if not exists current_redemptions integer default 0;

-- Create redemptions table to track individual redemptions
create table if not exists public.deal_redemptions (
    id uuid default gen_random_uuid() primary key,
    deal_id uuid references public.deals(id) on delete cascade,
    redeemed_by uuid references auth.users(id) on delete cascade,
    redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(deal_id, redeemed_by)
);

-- Enable RLS on redemptions table
alter table public.deal_redemptions enable row level security;

-- Create policies for redemptions
create policy "Users can view their own redemptions"
    on public.deal_redemptions
    for select
    using (auth.uid() = redeemed_by);

create policy "Users can create their own redemptions"
    on public.deal_redemptions
    for insert
    with check (auth.uid() = redeemed_by);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on public.deal_redemptions to authenticated; 