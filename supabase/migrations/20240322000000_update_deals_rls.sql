-- Enable RLS on deals table
alter table public.deals enable row level security;

-- Drop existing policies if any
drop policy if exists "Deals are viewable by everyone" on public.deals;
drop policy if exists "Business owners can manage their own deals" on public.deals;

-- Create policy for public read access to active deals
create policy "Deals are viewable by everyone"
  on public.deals
  for select
  using (true);

-- Create policy for business owners to manage their own deals
create policy "Business owners can manage their own deals"
  on public.deals
  for all
  using (auth.uid() = business_id)
  with check (auth.uid() = business_id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.deals to anon, authenticated;
grant all on public.deals to authenticated; 