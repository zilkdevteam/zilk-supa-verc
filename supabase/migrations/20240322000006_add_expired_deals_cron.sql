-- Enable the pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Schedule the check_expired_deals function to run every hour
select cron.schedule(
    'check-expired-deals',  -- job name
    '0 * * * *',           -- every hour at minute 0
    $$select check_expired_deals()$$
);

-- Grant necessary permissions
grant usage on schema cron to postgres;
grant all on all tables in schema cron to postgres; 