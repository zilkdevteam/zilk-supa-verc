-- Add views column to deals table
alter table public.deals add column if not exists views integer default 0;

-- Add indices for better query performance
create index if not exists deals_views_idx on public.deals(views);

-- Add function to increment views
create or replace function increment_deal_views()
returns trigger as $$
begin
    update public.deals
    set views = views + 1
    where id = new.deal_id;
    return new;
end;
$$ language plpgsql security definer;

-- Create a table to track deal views
create table if not exists public.deal_views (
    id uuid default gen_random_uuid() primary key,
    deal_id uuid references public.deals(id) on delete cascade,
    viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_device_id text, -- Anonymous identifier for unique view counting
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indices for better query performance
create index if not exists deal_views_deal_id_idx on public.deal_views(deal_id);
create index if not exists deal_views_user_device_id_idx on public.deal_views(user_device_id);

-- Enable RLS on deal_views
alter table public.deal_views enable row level security;

-- Create policies for deal_views
create policy "Anyone can create deal views"
    on public.deal_views
    for insert
    with check (true);

create policy "Business owners can view their deal views"
    on public.deal_views
    for select
    using (
        exists (
            select 1 from public.deals
            where deals.id = deal_views.deal_id
            and deals.business_id = auth.uid()
        )
    );

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.deal_views to anon, authenticated; 