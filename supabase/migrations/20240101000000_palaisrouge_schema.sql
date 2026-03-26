-- ============================================
-- PALAIS ROUGE IMMO — Supabase Schema
-- ============================================

CREATE TABLE properties (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr      text NOT NULL,
  title_en      text,
  title_ar      text,
  description_fr text,
  description_en text,
  description_ar text,
  price         numeric NOT NULL,
  currency      text DEFAULT 'MAD',
  listing_type  text NOT NULL CHECK (listing_type IN ('sale','rent')),
  property_type text NOT NULL,
  status        text DEFAULT 'available' CHECK (status IN ('available','sold','rented','reserved')),
  location      text,
  city          text DEFAULT 'Marrakech',
  area_sqm      numeric,
  bedrooms      int,
  bathrooms     int,
  images        text[],
  features      text[],
  is_featured   boolean DEFAULT false,
  is_published  boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE contact_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text,
  phone         text,
  whatsapp      text,
  message       text NOT NULL,
  property_id   uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_title text,
  source        text DEFAULT 'contact_form',
  is_read       boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE newsletter (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now()
);

CREATE TABLE valuation_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text,
  phone         text,
  property_type text,
  location      text,
  area_sqm      numeric,
  message       text,
  is_read       boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE blog_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr      text NOT NULL,
  title_en      text,
  title_ar      text,
  content_fr    text,
  content_en    text,
  content_ar    text,
  excerpt_fr    text,
  cover_image   text,
  slug          text UNIQUE,
  is_published  boolean DEFAULT false,
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE site_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text UNIQUE NOT NULL,
  value         text,
  updated_at    timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('agency_phone',     '+212600000000'),
  ('agency_whatsapp',  '+212600000000'),
  ('agency_email',     'contact@palaisrouge.online'),
  ('agency_address',   'Marrakech, Maroc'),
  ('whatsapp_message', 'Bonjour, je suis intéressé par cette propriété : ');

ALTER TABLE properties          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter          ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read properties"
  ON properties FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published blogs"
  ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can submit contact"
  ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe"
  ON newsletter FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can request valuation"
  ON valuation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access properties"
  ON properties FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access contacts"
  ON contact_submissions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access newsletter"
  ON newsletter FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access valuation"
  ON valuation_requests FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access blogs"
  ON blog_posts FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access settings"
  ON site_settings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
