-- Drop dependent triggers first
drop trigger if exists nfc_scan_counter on public.deal_redemptions;

-- Remove only truly redundant fields from deal_redemptions
alter table public.deal_redemptions
    drop column if exists user_device_id,
    drop column if exists nfc_tag_id,
    drop column if exists spin_attempt_id;

-- Add indices for better query performance
create index if not exists deal_redemptions_deal_id_idx on public.deal_redemptions(deal_id);
create index if not exists deal_redemptions_redeemed_by_idx on public.deal_redemptions(redeemed_by);
create index if not exists deal_redemptions_business_id_idx on public.deal_redemptions(business_id);
create index if not exists deals_business_id_idx on public.deals(business_id);
create index if not exists deals_is_active_idx on public.deals(is_active);
create index if not exists deals_is_spin_exclusive_idx on public.deals(is_spin_exclusive);
create index if not exists deals_end_date_idx on public.deals(end_date);
create index if not exists spin_attempts_deal_id_idx on public.spin_attempts(deal_id);
create index if not exists spin_attempts_user_device_id_idx on public.spin_attempts(user_device_id);

-- Add constraints to ensure data integrity
alter table public.deals
    alter column business_id set not null,
    alter column title set not null,
    alter column discount_type set not null,
    alter column discount_amount set not null,
    alter column start_date set not null,
    alter column end_date set not null,
    alter column is_active set not null,
    alter column is_spin_exclusive set not null;

-- Set default values
alter table public.deals
    alter column is_active set default true,
    alter column is_spin_exclusive set default false;

-- Drop existing constraints if they exist
do $$
begin
    alter table public.deals drop constraint if exists deals_discount_type_check;
    alter table public.deals drop constraint if exists deals_dates_check;
    alter table public.deals drop constraint if exists deals_discount_amount_check;
exception when others then
    -- Ignore any errors when dropping constraints
    null;
end $$;

-- Add check constraints for valid values
alter table public.deals
    add constraint deals_discount_type_check 
    check (discount_type in ('percentage', 'fixed')),
    add constraint deals_dates_check
    check (end_date > start_date),
    add constraint deals_discount_amount_check
    check (
        (discount_type = 'percentage' and discount_amount between 0 and 100) or
        (discount_type = 'fixed' and discount_amount > 0)
    );

-- Create function to update deal status based on end date
create or replace function update_deal_status()
returns trigger as $$
begin
    -- Update is_active to false if end_date has passed
    update public.deals
    set is_active = false
    where id = new.id
    and end_date < current_timestamp
    and is_active = true;
    
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update deal status
create trigger deal_status_update_trigger
    after insert or update of end_date
    on public.deals
    for each row
    execute function update_deal_status();

-- Create function to periodically check and update expired deals
create or replace function check_expired_deals()
returns void as $$
begin
    update public.deals
    set is_active = false
    where end_date < current_timestamp
    and is_active = true;
end;
$$ language plpgsql;

-- Add status enum type for deal_redemptions if not exists
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'redemption_status') then
        create type redemption_status as enum ('pending', 'completed', 'expired', 'cancelled');
    end if;
exception
    when duplicate_object then null;
end $$;

-- Add new status column if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns 
                  where table_name = 'deal_redemptions' and column_name = 'status_enum') then
        alter table public.deal_redemptions add column status_enum redemption_status default 'pending';
        
        -- Copy existing status values to the new column
        update public.deal_redemptions
        set status_enum = case
            when status = 'pending' then 'pending'::redemption_status
            when status = 'completed' then 'completed'::redemption_status
            when status = 'expired' then 'expired'::redemption_status
            when status = 'cancelled' then 'cancelled'::redemption_status
            else 'pending'::redemption_status
        end;
    end if;
exception
    when duplicate_column then null;
end $$; 