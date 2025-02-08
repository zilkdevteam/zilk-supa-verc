-- Create a comprehensive analytics events table
create table if not exists public.analytics_events (
    id uuid default gen_random_uuid() primary key,
    event_type text not null,
    business_id uuid references public.businesses(id) on delete cascade,
    deal_id uuid references public.deals(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    user_device_id text,
    event_data jsonb default '{}',
    ip_address text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indices for better query performance
create index if not exists analytics_events_event_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_business_id_idx on public.analytics_events(business_id);
create index if not exists analytics_events_deal_id_idx on public.analytics_events(deal_id);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Create policies for analytics_events
create policy "Anyone can create analytics events"
    on public.analytics_events
    for insert
    with check (true);

create policy "Business owners can view their analytics"
    on public.analytics_events
    for select
    using (
        business_id = auth.uid() or
        exists (
            select 1 from public.deals
            where deals.id = analytics_events.deal_id
            and deals.business_id = auth.uid()
        )
    );

-- Create helper function to track events
create or replace function track_analytics_event(
    p_event_type text,
    p_business_id uuid,
    p_deal_id uuid,
    p_user_device_id text,
    p_event_data jsonb default '{}'::jsonb,
    p_ip_address text default null,
    p_user_agent text default null
) returns uuid as $$
declare
    v_user_id uuid;
    v_event_id uuid;
begin
    -- Get current user if authenticated
    select auth.uid() into v_user_id;
    
    -- Insert event
    insert into public.analytics_events (
        event_type,
        business_id,
        deal_id,
        user_id,
        user_device_id,
        event_data,
        ip_address,
        user_agent
    ) values (
        p_event_type,
        p_business_id,
        p_deal_id,
        v_user_id,
        p_user_device_id,
        p_event_data,
        p_ip_address,
        p_user_agent
    ) returning id into v_event_id;
    
    return v_event_id;
end;
$$ language plpgsql security definer;

-- Create materialized view for business analytics
create materialized view if not exists business_analytics_summary as
select
    business_id,
    date_trunc('day', created_at) as date,
    event_type,
    count(*) as event_count,
    count(distinct user_device_id) as unique_users,
    count(distinct user_id) as unique_authenticated_users
from public.analytics_events
group by business_id, date_trunc('day', created_at), event_type;

-- Create index on materialized view
create unique index if not exists business_analytics_summary_idx 
on business_analytics_summary(business_id, date, event_type);

-- Function to refresh materialized view
create or replace function refresh_analytics_summary()
returns trigger as $$
begin
    refresh materialized view concurrently business_analytics_summary;
    return null;
end;
$$ language plpgsql;

-- Create trigger to refresh materialized view
create trigger refresh_analytics_summary_trigger
after insert or update or delete or truncate
on public.analytics_events
for each statement
execute function refresh_analytics_summary();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.analytics_events to anon, authenticated;
grant select on public.business_analytics_summary to authenticated; 