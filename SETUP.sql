-- 007 Phone Shop - Run once in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS shop_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name TEXT DEFAULT '007',
  logo_url TEXT,
  cover_url TEXT,
  whatsapp TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  admin_password TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO shop_settings (id, shop_name) VALUES (1, '007') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hidden BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  price_usd NUMERIC DEFAULT 0,
  price_syp NUMERIC DEFAULT 0,
  image_url TEXT,
  hidden BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_settings" ON shop_settings;
DROP POLICY IF EXISTS "public_all_categories" ON categories;
DROP POLICY IF EXISTS "public_all_products" ON products;
CREATE POLICY "public_all_settings" ON shop_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_products" ON products FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_read_shop_images" ON storage.objects;
DROP POLICY IF EXISTS "public_upload_shop_images" ON storage.objects;
DROP POLICY IF EXISTS "public_update_shop_images" ON storage.objects;
DROP POLICY IF EXISTS "public_delete_shop_images" ON storage.objects;
CREATE POLICY "public_read_shop_images" ON storage.objects FOR SELECT USING (bucket_id = 'shop-images');
CREATE POLICY "public_upload_shop_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-images');
CREATE POLICY "public_update_shop_images" ON storage.objects FOR UPDATE USING (bucket_id = 'shop-images');
CREATE POLICY "public_delete_shop_images" ON storage.objects FOR DELETE USING (bucket_id = 'shop-images');
