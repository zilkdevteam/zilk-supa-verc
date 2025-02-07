create table if not exists public.phone_numbers (
  id uuid default gen_random_uuid() primary key,
  phone text not null unique,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_subscribed boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS (Row Level Security)
alter table public.phone_numbers enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.phone_numbers
  for select using (true);

create policy "Enable insert for all users" on public.phone_numbers
  for insert with check (true);

-- Create indexes
create index if not exists phone_numbers_phone_idx on public.phone_numbers (phone);
create index if not exists phone_numbers_subscribed_idx on public.phone_numbers (is_subscribed);

-- Grant access to authenticated and anon users
grant usage on schema public to public;
grant all on public.phone_numbers to anon, authenticated; 