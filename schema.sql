CREATE TABLE bales (
    id TEXT PRIMARY KEY,
    bale_type TEXT CHECK (bale_type IN ('Cream', 'First-Class')),
    department TEXT CHECK (department IN ('Men', 'Women', 'Kids')),
    cost REAL,
    arrival_date TEXT DEFAULT (date('now')),
    status TEXT DEFAULT 'Open'
);

CREATE TABLE items (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    bale_id TEXT REFERENCES bales(id),
    category TEXT,
    size TEXT,
    price REAL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold')),
    reserved_at TEXT,
    image_urls TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sales (
    id TEXT PRIMARY KEY,
    item_id TEXT REFERENCES items(id),
    sale_date TEXT DEFAULT (datetime('now')),
    amount REAL,
    channel TEXT CHECK (channel IN ('Walk-in', 'WhatsApp', 'Instagram', 'TikTok')),
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Mobile Money')),
    transaction_id TEXT,
    customer_phone TEXT
);

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    social_handle TEXT
);

CREATE TABLE reservations (
    id TEXT PRIMARY KEY,
    item_id TEXT UNIQUE NOT NULL REFERENCES items(id),
    customer_phone TEXT NOT NULL,
    channel TEXT NOT NULL,
    reserved_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted'))
);

CREATE INDEX idx_items_bale_id ON items(bale_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_sales_item_id ON sales(item_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_channel ON sales(channel);
CREATE UNIQUE INDEX idx_items_sku ON items(sku);
