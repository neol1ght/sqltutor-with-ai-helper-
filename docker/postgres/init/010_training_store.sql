CREATE DATABASE sqltutor_training_store OWNER postgres;

\connect sqltutor_training_store

CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                            name VARCHAR(100) NOT NULL UNIQUE,

                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                           first_name VARCHAR(100) NOT NULL,
                           last_name VARCHAR(100) NOT NULL,

                           email VARCHAR(255) NOT NULL UNIQUE,

                           city VARCHAR(100),
                           country VARCHAR(100),

                           registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE products (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          category_id UUID NOT NULL,

                          name VARCHAR(255) NOT NULL,

                          description TEXT,

                          price NUMERIC(10, 2) NOT NULL,

                          stock INTEGER NOT NULL DEFAULT 0,

                          is_active BOOLEAN NOT NULL DEFAULT TRUE,

                          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                          CONSTRAINT fk_products_category
                              FOREIGN KEY (category_id)
                                  REFERENCES categories(id)
                                  ON DELETE RESTRICT,

                          CONSTRAINT products_price_check
                              CHECK (price >= 0),

                          CONSTRAINT products_stock_check
                              CHECK (stock >= 0)
);
CREATE TABLE orders (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                        customer_id UUID NOT NULL,

                        status VARCHAR(30) NOT NULL,

                        total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

                        ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                        CONSTRAINT fk_orders_customer
                            FOREIGN KEY (customer_id)
                                REFERENCES customers(id)
                                ON DELETE RESTRICT,

                        CONSTRAINT orders_total_amount_check
                            CHECK (total_amount >= 0)
);

CREATE TABLE order_items (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                             order_id UUID NOT NULL,
                             product_id UUID NOT NULL,

                             quantity INTEGER NOT NULL,

                             unit_price NUMERIC(10, 2) NOT NULL,

                             CONSTRAINT fk_order_items_order
                                 FOREIGN KEY (order_id)
                                     REFERENCES orders(id)
                                     ON DELETE CASCADE,

                             CONSTRAINT fk_order_items_product
                                 FOREIGN KEY (product_id)
                                     REFERENCES products(id)
                                     ON DELETE RESTRICT,

                             CONSTRAINT order_items_quantity_check
                                 CHECK (quantity > 0),

                             CONSTRAINT order_items_unit_price_check
                                 CHECK (unit_price >= 0),

                             CONSTRAINT order_items_order_product_unique
                                 UNIQUE (order_id, product_id)
);

CREATE INDEX products_category_id_idx
    ON products(category_id);

CREATE INDEX orders_customer_id_idx
    ON orders(customer_id);

CREATE INDEX orders_ordered_at_idx
    ON orders(ordered_at);

CREATE INDEX order_items_order_id_idx
    ON order_items(order_id);

CREATE INDEX order_items_product_id_idx
    ON order_items(product_id);