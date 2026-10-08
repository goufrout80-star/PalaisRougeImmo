-- Kamar Immob: complete legacy database schema and replace unsafe role policies.
-- Apply after 20240101000000_palaisrouge_schema.sql and 20260101000001_cities_neighborhoods.sql.
-- Roles must be provisioned through trusted Supabase Admin user.app_metadata, NEVER user_metadata.

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text LANGUAGE sql STABLE SET search_path = ''
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), 'user');
$$;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS agent_name text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;
ALTER TABLE public.properties ALTER COLUMN is_published SET DEFAULT false;
ALTER TABLE public.properties ADD CONSTRAINT properties_nonnegative_price CHECK (price >= 0);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_public ON public.properties(is_published,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_city_neighborhood ON public.properties(city,neighborhood);

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS excerpt_en text,
  ADD COLUMN IF NOT EXISTS excerpt_ar text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_blog_published ON public.blog_posts(is_published,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_property ON public.contact_submissions(property_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_valuation_created ON public.valuation_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_fr text NOT NULL,
  answer_fr text NOT NULL,
  question text GENERATED ALWAYS AS (question_fr) STORED,
  answer text GENERATED ALWAYS AS (answer_fr) STORED,
  category text NOT NULL DEFAULT 'buying',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_faq_public ON public.faq_items(is_published,sort_order);

CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  whatsapp text,
  bio text,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid,
  user_email text,
  user_role text NOT NULL DEFAULT 'visitor',
  event_type text NOT NULL,
  event_category text NOT NULL,
  event_label text,
  page_url text,
  page_title text,
  referrer text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_agent text,
  device_type text,
  ip_address text,
  is_error boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_category ON public.activity_logs(event_category,created_at DESC);

-- Data sanitation: legacy defaults should never impersonate the new company.
INSERT INTO public.site_settings(key,value) VALUES
  ('agency_email', 'dev@kamarimmob.com'),
  ('agency_phone', ''),
  ('agency_whatsapp', ''),
  ('agency_address', 'Marrakech, Maroc')
ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_blog_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_faq_updated_at BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Guard sensitive fields for direct authenticated agent access.
CREATE OR REPLACE FUNCTION public.guard_agent_properties()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF public.current_app_role() = 'agent' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.is_published IS TRUE OR NEW.is_featured IS TRUE OR NEW.agent_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Agent property publication and assignment require admin approval';
      END IF;
    ELSIF NEW.agent_id IS DISTINCT FROM OLD.agent_id OR
          NEW.is_published IS DISTINCT FROM OLD.is_published OR
          NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
      RAISE EXCEPTION 'Agent cannot change publication, featured status, or ownership';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER guard_agent_properties BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_agent_properties();

CREATE OR REPLACE FUNCTION public.guard_agent_lead_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF public.current_app_role() = 'agent' AND
     (to_jsonb(NEW) - 'is_read') IS DISTINCT FROM (to_jsonb(OLD) - 'is_read') THEN
    RAISE EXCEPTION 'Agent can only mark assigned leads read/unread';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER guard_agent_lead_update BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.guard_agent_lead_update();

-- Discard legacy policies based on JWT top-level role = 'admin'.
DROP POLICY IF EXISTS "Public read properties" ON public.properties;
DROP POLICY IF EXISTS "Public read published blogs" ON public.blog_posts;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter;
DROP POLICY IF EXISTS "Anyone can request valuation" ON public.valuation_requests;
DROP POLICY IF EXISTS "Admin full access properties" ON public.properties;
DROP POLICY IF EXISTS "Admin full access contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin full access newsletter" ON public.newsletter;
DROP POLICY IF EXISTS "Admin full access valuation" ON public.valuation_requests;
DROP POLICY IF EXISTS "Admin full access blogs" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin full access settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read cities" ON public.cities;
DROP POLICY IF EXISTS "Public read neighborhoods" ON public.neighborhoods;
DROP POLICY IF EXISTS "Admin manage cities" ON public.cities;
DROP POLICY IF EXISTS "Admin manage neighborhoods" ON public.neighborhoods;
DROP POLICY IF EXISTS "Agent manage cities" ON public.cities;
DROP POLICY IF EXISTS "Agent manage neighborhoods" ON public.neighborhoods;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY properties_public_read ON public.properties FOR SELECT TO anon,authenticated
  USING (is_published = true OR
    (auth.uid() IS NOT NULL AND
     (public.current_app_role() = 'admin' OR
      (public.current_app_role() = 'agent' AND agent_id = auth.uid()))));
CREATE POLICY properties_admin_all ON public.properties FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');
CREATE POLICY properties_agent_insert ON public.properties FOR INSERT TO authenticated
  WITH CHECK (public.current_app_role() = 'agent' AND agent_id = auth.uid()
    AND is_published = false AND is_featured = false);
CREATE POLICY properties_agent_update ON public.properties FOR UPDATE TO authenticated
  USING (public.current_app_role() = 'agent' AND agent_id = auth.uid())
  WITH CHECK (public.current_app_role() = 'agent' AND agent_id = auth.uid());
CREATE POLICY properties_agent_delete ON public.properties FOR DELETE TO authenticated
  USING (public.current_app_role() = 'agent' AND agent_id = auth.uid());

CREATE POLICY contact_public_insert ON public.contact_submissions FOR INSERT TO anon,authenticated
  WITH CHECK (true);
CREATE POLICY contact_admin_all ON public.contact_submissions FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');
CREATE POLICY contact_agent_read ON public.contact_submissions FOR SELECT TO authenticated
  USING (public.current_app_role() = 'agent' AND EXISTS
    (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.agent_id = auth.uid()));
CREATE POLICY contact_agent_update ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.current_app_role() = 'agent' AND EXISTS
    (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.agent_id = auth.uid()))
  WITH CHECK (public.current_app_role() = 'agent' AND EXISTS
    (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.agent_id = auth.uid()));

CREATE POLICY newsletter_public_insert ON public.newsletter FOR INSERT TO anon,authenticated WITH CHECK (true);
CREATE POLICY newsletter_admin_all ON public.newsletter FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');

CREATE POLICY valuation_public_insert ON public.valuation_requests FOR INSERT TO anon,authenticated WITH CHECK (true);
CREATE POLICY valuation_admin_all ON public.valuation_requests FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');

CREATE POLICY blogs_public_read ON public.blog_posts FOR SELECT TO anon,authenticated
  USING (is_published = true OR public.current_app_role() = 'admin');
CREATE POLICY blogs_admin_all ON public.blog_posts FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');

CREATE POLICY settings_public_read ON public.site_settings FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY settings_admin_all ON public.site_settings FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');

CREATE POLICY cities_read ON public.cities FOR SELECT TO anon,authenticated USING (is_active = true OR public.current_app_role() = 'admin');
CREATE POLICY cities_admin_all ON public.cities FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');
CREATE POLICY neighborhoods_read ON public.neighborhoods FOR SELECT TO anon,authenticated
  USING (is_active = true OR public.current_app_role() = 'admin');
CREATE POLICY neighborhoods_admin_all ON public.neighborhoods FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');

CREATE POLICY faq_public_read ON public.faq_items FOR SELECT TO anon,authenticated
  USING (is_published = true OR public.current_app_role() = 'admin');
CREATE POLICY faq_admin_all ON public.faq_items FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');

CREATE POLICY agent_profiles_public_read ON public.agent_profiles FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY agent_profiles_admin_all ON public.agent_profiles FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin')
  WITH CHECK (public.current_app_role() = 'admin');
CREATE POLICY agent_profiles_self_insert ON public.agent_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND public.current_app_role() = 'agent');
CREATE POLICY agent_profiles_self_update ON public.agent_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() AND public.current_app_role() = 'agent')
  WITH CHECK (id = auth.uid() AND public.current_app_role() = 'agent');

CREATE POLICY activity_admin_read ON public.activity_logs FOR SELECT TO authenticated
  USING (public.current_app_role() = 'admin');

-- A public counter that can only increase views on published listings.
CREATE OR REPLACE FUNCTION public.increment_view_count(property_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.properties SET view_count = view_count + 1
  WHERE id = property_id AND is_published = true;
END; $$;
REVOKE ALL ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;

-- RLS protects app roles; the service_role key must never be exposed in a browser.
