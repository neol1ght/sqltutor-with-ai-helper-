\connect sqltutor_training_store

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (id, name)
VALUES
    (md5('category:1')::uuid, 'Electronics'),
    (md5('category:2')::uuid, 'Computers'),
    (md5('category:3')::uuid, 'Smartphones'),
    (md5('category:4')::uuid, 'Clothing'),
    (md5('category:5')::uuid, 'Books'),
    (md5('category:6')::uuid, 'Home'),
    (md5('category:7')::uuid, 'Sports'),
    (md5('category:8')::uuid, 'Accessories')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- CUSTOMERS
-- ============================================================

INSERT INTO customers (
    id,
    first_name,
    last_name,
    email,
    city,
    country,
    registered_at
)
SELECT
    md5('customer:' || gs)::uuid,

    (ARRAY[
         'Alex',
     'Daniel',
     'Michael',
     'James',
     'Robert',
     'Thomas',
     'William',
     'David',
     'Emma',
     'Olivia',
     'Sophia',
     'Anna',
     'Laura',
     'Maria',
     'Emily',
     'Chloe'
         ])[1 + ((gs - 1) % 16)],

    (ARRAY[
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Miller',
        'Davis',
        'Wilson',
        'Taylor',
        'Anderson',
        'Thomas',
        'Moore',
        'Martin',
        'Jackson',
        'White',
        'Harris'
    ])[1 + ((gs * 3 - 1) % 16)],

    'customer' || gs || '@example.com',

    (ARRAY[
        'Riga',
        'Tallinn',
        'Vilnius',
        'Berlin',
        'Warsaw',
        'Prague',
        'Helsinki',
        'Stockholm',
        'London',
        'Paris'
    ])[1 + ((gs - 1) % 10)],

    (ARRAY[
        'Latvia',
        'Estonia',
        'Lithuania',
        'Germany',
        'Poland',
        'Czech Republic',
        'Finland',
        'Sweden',
        'United Kingdom',
        'France'
    ])[1 + ((gs - 1) % 10)],

    NOW() - ((gs * 7) || ' days')::interval

FROM generate_series(1, 40) AS gs

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO products (
    id,
    category_id,
    name,
    description,
    price,
    stock,
    is_active,
    created_at
)
VALUES
    (
        md5('product:1')::uuid,
        md5('category:1')::uuid,
        'Wireless Headphones',
        'Bluetooth over-ear headphones',
        129.99,
        35,
        TRUE,
        NOW() - INTERVAL '180 days'
    ),
    (
        md5('product:2')::uuid,
        md5('category:1')::uuid,
        'Bluetooth Speaker',
        'Portable wireless speaker',
        89.99,
        50,
        TRUE,
        NOW() - INTERVAL '170 days'
    ),
    (
        md5('product:3')::uuid,
        md5('category:1')::uuid,
        'Mechanical Keyboard',
        'RGB mechanical keyboard',
        119.99,
        24,
        TRUE,
        NOW() - INTERVAL '160 days'
    ),
    (
        md5('product:4')::uuid,
        md5('category:1')::uuid,
        'USB-C Hub',
        'Multi-port USB-C adapter',
        49.99,
        80,
        TRUE,
        NOW() - INTERVAL '150 days'
    ),
    (
        md5('product:5')::uuid,
        md5('category:1')::uuid,
        '4K Monitor',
        '27 inch 4K IPS monitor',
        399.99,
        12,
        TRUE,
        NOW() - INTERVAL '140 days'
    ),

    (
        md5('product:6')::uuid,
        md5('category:2')::uuid,
        'Gaming Laptop',
        'High-performance gaming laptop',
        1499.99,
        8,
        TRUE,
        NOW() - INTERVAL '135 days'
    ),
    (
        md5('product:7')::uuid,
        md5('category:2')::uuid,
        'Office Laptop',
        'Lightweight business laptop',
        899.99,
        15,
        TRUE,
        NOW() - INTERVAL '130 days'
    ),
    (
        md5('product:8')::uuid,
        md5('category:2')::uuid,
        'Desktop PC',
        'Performance desktop computer',
        1199.99,
        10,
        TRUE,
        NOW() - INTERVAL '125 days'
    ),
    (
        md5('product:9')::uuid,
        md5('category:2')::uuid,
        'Gaming Mouse',
        'Precision gaming mouse',
        59.99,
        70,
        TRUE,
        NOW() - INTERVAL '120 days'
    ),
    (
        md5('product:10')::uuid,
        md5('category:2')::uuid,
        'Webcam',
        'Full HD webcam',
        79.99,
        45,
        TRUE,
        NOW() - INTERVAL '115 days'
    ),

    (
        md5('product:11')::uuid,
        md5('category:3')::uuid,
        'Smartphone Pro',
        'Flagship smartphone',
        999.99,
        18,
        TRUE,
        NOW() - INTERVAL '110 days'
    ),
    (
        md5('product:12')::uuid,
        md5('category:3')::uuid,
        'Smartphone Lite',
        'Affordable smartphone',
        399.99,
        35,
        TRUE,
        NOW() - INTERVAL '105 days'
    ),
    (
        md5('product:13')::uuid,
        md5('category:3')::uuid,
        'Phone Charger',
        'Fast USB-C charger',
        29.99,
        120,
        TRUE,
        NOW() - INTERVAL '100 days'
    ),
    (
        md5('product:14')::uuid,
        md5('category:3')::uuid,
        'Wireless Charger',
        'Qi wireless charging pad',
        39.99,
        90,
        TRUE,
        NOW() - INTERVAL '95 days'
    ),
    (
        md5('product:15')::uuid,
        md5('category:3')::uuid,
        'Phone Case',
        'Protective smartphone case',
        24.99,
        150,
        TRUE,
        NOW() - INTERVAL '90 days'
    ),

    (
        md5('product:16')::uuid,
        md5('category:4')::uuid,
        'Classic T-Shirt',
        'Cotton everyday t-shirt',
        24.99,
        100,
        TRUE,
        NOW() - INTERVAL '85 days'
    ),
    (
        md5('product:17')::uuid,
        md5('category:4')::uuid,
        'Hoodie',
        'Warm cotton hoodie',
        59.99,
        70,
        TRUE,
        NOW() - INTERVAL '80 days'
    ),
    (
        md5('product:18')::uuid,
        md5('category:4')::uuid,
        'Running Shorts',
        'Lightweight running shorts',
        34.99,
        65,
        TRUE,
        NOW() - INTERVAL '75 days'
    ),
    (
        md5('product:19')::uuid,
        md5('category:4')::uuid,
        'Winter Jacket',
        'Insulated winter jacket',
        149.99,
        30,
        TRUE,
        NOW() - INTERVAL '70 days'
    ),
    (
        md5('product:20')::uuid,
        md5('category:4')::uuid,
        'Sneakers',
        'Everyday running sneakers',
        109.99,
        40,
        TRUE,
        NOW() - INTERVAL '65 days'
    ),

    (
        md5('product:21')::uuid,
        md5('category:5')::uuid,
        'SQL Fundamentals',
        'Introduction to SQL',
        34.99,
        60,
        TRUE,
        NOW() - INTERVAL '60 days'
    ),
    (
        md5('product:22')::uuid,
        md5('category:5')::uuid,
        'PostgreSQL Guide',
        'Practical PostgreSQL handbook',
        49.99,
        45,
        TRUE,
        NOW() - INTERVAL '55 days'
    ),
    (
        md5('product:23')::uuid,
        md5('category:5')::uuid,
        'Clean Code',
        'Software development book',
        44.99,
        55,
        TRUE,
        NOW() - INTERVAL '50 days'
    ),
    (
        md5('product:24')::uuid,
        md5('category:5')::uuid,
        'JavaScript Handbook',
        'Modern JavaScript reference',
        39.99,
        40,
        TRUE,
        NOW() - INTERVAL '45 days'
    ),
    (
        md5('product:25')::uuid,
        md5('category:5')::uuid,
        'Database Design',
        'Relational database design',
        54.99,
        30,
        TRUE,
        NOW() - INTERVAL '40 days'
    ),

    (
        md5('product:26')::uuid,
        md5('category:6')::uuid,
        'Desk Lamp',
        'Adjustable LED desk lamp',
        39.99,
        60,
        TRUE,
        NOW() - INTERVAL '35 days'
    ),
    (
        md5('product:27')::uuid,
        md5('category:6')::uuid,
        'Office Chair',
        'Ergonomic office chair',
        249.99,
        20,
        TRUE,
        NOW() - INTERVAL '30 days'
    ),
    (
        md5('product:28')::uuid,
        md5('category:6')::uuid,
        'Coffee Maker',
        'Automatic coffee machine',
        129.99,
        25,
        TRUE,
        NOW() - INTERVAL '25 days'
    ),
    (
        md5('product:29')::uuid,
        md5('category:6')::uuid,
        'Water Bottle',
        'Reusable stainless steel bottle',
        19.99,
        150,
        TRUE,
        NOW() - INTERVAL '20 days'
    ),
    (
        md5('product:30')::uuid,
        md5('category:6')::uuid,
        'Backpack',
        'Urban laptop backpack',
        69.99,
        75,
        TRUE,
        NOW() - INTERVAL '15 days'
    ),

    (
        md5('product:31')::uuid,
        md5('category:7')::uuid,
        'Yoga Mat',
        'Non-slip exercise mat',
        29.99,
        90,
        TRUE,
        NOW() - INTERVAL '14 days'
    ),
    (
        md5('product:32')::uuid,
        md5('category:7')::uuid,
        'Dumbbell Set',
        'Adjustable dumbbell set',
        149.99,
        18,
        TRUE,
        NOW() - INTERVAL '13 days'
    ),
    (
        md5('product:33')::uuid,
        md5('category:7')::uuid,
        'Football',
        'Professional training football',
        39.99,
        55,
        TRUE,
        NOW() - INTERVAL '12 days'
    ),
    (
        md5('product:34')::uuid,
        md5('category:7')::uuid,
        'Tennis Racket',
        'Lightweight tennis racket',
        119.99,
        22,
        TRUE,
        NOW() - INTERVAL '11 days'
    ),
    (
        md5('product:35')::uuid,
        md5('category:7')::uuid,
        'Jump Rope',
        'Speed jump rope',
        14.99,
        100,
        TRUE,
        NOW() - INTERVAL '10 days'
    ),

    -- These products intentionally have no orders.
    -- They will be useful for LEFT JOIN exercises.

    (
        md5('product:36')::uuid,
        md5('category:8')::uuid,
        'Leather Wallet',
        'Classic leather wallet',
        49.99,
        40,
        TRUE,
        NOW() - INTERVAL '9 days'
    ),
    (
        md5('product:37')::uuid,
        md5('category:8')::uuid,
        'Sunglasses',
        'Polarized sunglasses',
        79.99,
        30,
        TRUE,
        NOW() - INTERVAL '8 days'
    ),
    (
        md5('product:38')::uuid,
        md5('category:8')::uuid,
        'Travel Adapter',
        'Universal travel adapter',
        34.99,
        50,
        TRUE,
        NOW() - INTERVAL '7 days'
    ),
    (
        md5('product:39')::uuid,
        md5('category:8')::uuid,
        'Smart Watch',
        'Fitness tracking smartwatch',
        199.99,
        25,
        TRUE,
        NOW() - INTERVAL '6 days'
    ),
    (
        md5('product:40')::uuid,
        md5('category:8')::uuid,
        'Laptop Stand',
        'Aluminium laptop stand',
        59.99,
        35,
        TRUE,
        NOW() - INTERVAL '5 days'
    )

    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- ORDERS
-- ============================================================

INSERT INTO orders (
    id,
    customer_id,
    status,
    total_amount,
    ordered_at
)
SELECT
    md5('order:' || gs)::uuid,

    -- Customers 1-35 receive orders.
    md5(
            'customer:' ||
            (1 + ((gs * 7) % 35))
    )::uuid,

    (
     ARRAY[
         'pending',
     'paid',
     'shipped',
     'completed',
     'cancelled'
         ]
        )[1 + ((gs - 1) % 5)],

    0,

    NOW() - ((gs % 120) || ' days')::interval

FROM generate_series(1, 120) AS gs

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- ORDER ITEMS
-- ============================================================

INSERT INTO order_items (
    id,
    order_id,
    product_id,
    quantity,
    unit_price
)
SELECT
    md5(
            'order-item:' || order_number || ':' || item_number
    )::uuid,

    md5('order:' || order_number)::uuid,

    md5(
            'product:' ||
            (1 + ((order_number * 3 + item_number * 7) % 35))
    )::uuid,

    1 + ((order_number + item_number) % 4),

    p.price

FROM generate_series(1, 120) AS order_number
    CROSS JOIN generate_series(1, 4) AS item_number

    JOIN products p
ON p.id = md5(
    'product:' ||
    (1 + ((order_number * 3 + item_number * 7) % 35))
    )::uuid

    ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- CALCULATE ORDER TOTALS
-- ============================================================

UPDATE orders o
SET total_amount = totals.total
    FROM (
    SELECT
        order_id,
        ROUND(
            SUM(quantity * unit_price),
            2
        ) AS total
    FROM order_items
    GROUP BY order_id
) AS totals
WHERE o.id = totals.order_id;