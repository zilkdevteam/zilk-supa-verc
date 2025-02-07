-- Replace 'YOUR_USER_ID' with your actual Supabase user ID
DO $$
DECLARE
    business_id uuid;
BEGIN
    -- Get the business ID (this assumes you've already created a business record)
    SELECT id INTO business_id FROM businesses LIMIT 1;

    -- Create sample deals
    INSERT INTO deals (
        business_id,
        title,
        description,
        terms,
        start_date,
        end_date,
        max_redemptions,
        current_redemptions,
        discount_type,
        discount_amount,
        is_active
    ) VALUES
    (
        business_id, -- First deal
        'Summer Special: 20% Off All Items',
        'Beat the heat with our summer discount! Get 20% off on all regular-priced items.',
        'Cannot be combined with other offers. Valid for in-store purchases only.',
        NOW(), -- starts now
        NOW() + INTERVAL '30 days', -- ends in 30 days
        100, -- max 100 redemptions
        0, -- current redemptions
        'percentage',
        20.00,
        true
    ),
    (
        business_id, -- Second deal
        'Flash Sale: $50 Off on $200+',
        'Limited time offer! Get $50 off when you spend $200 or more.',
        'Minimum purchase of $200 required. Excludes sale items and gift cards.',
        NOW() - INTERVAL '1 day', -- started yesterday
        NOW() + INTERVAL '7 days', -- ends in 7 days
        50, -- max 50 redemptions
        12, -- some redemptions already
        'fixed',
        50.00,
        true
    );
END $$; 