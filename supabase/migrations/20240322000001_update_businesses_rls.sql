-- Enable RLS on businesses table
alter table public.businesses enable row level security;

-- Drop existing policies if any
drop policy if exists "Businesses are viewable by everyone" on public.businesses;
drop policy if exists "Business owners can manage their own business" on public.businesses;

-- Create policy for public read access to businesses
create policy "Businesses are viewable by everyone"
  on public.businesses
  for select
  using (true);

-- Create policy for business owners to manage their own business
create policy "Business owners can manage their own business"
  on public.businesses
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.businesses to anon, authenticated;
grant all on public.businesses to authenticated; 