-- Cities and neighborhoods lookup tables
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_en text,
  name_ar text,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
  name_fr text NOT NULL,
  name_en text,
  name_ar text,
  slug text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS city_slug text;

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cities"
  ON cities FOR SELECT USING (true);
CREATE POLICY "Public read neighborhoods"
  ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Admin manage cities"
  ON cities FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin manage neighborhoods"
  ON neighborhoods FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Agent manage cities"
  ON cities FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'agent');
CREATE POLICY "Agent manage neighborhoods"
  ON neighborhoods FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'agent');

-- CITIES SEED
INSERT INTO cities (name_fr, name_en, name_ar, slug) VALUES
('Marrakech','Marrakech','مراكش','marrakech'),
('Casablanca','Casablanca','الدار البيضاء','casablanca'),
('Rabat','Rabat','الرباط','rabat'),
('Agadir','Agadir','أكادير','agadir'),
('Tanger','Tangier','طنجة','tanger'),
('Fès','Fez','فاس','fes'),
('Meknès','Meknes','مكناس','meknes'),
('Essaouira','Essaouira','الصويرة','essaouira'),
('Ouarzazate','Ouarzazate','ورزازات','ouarzazate'),
('Ifrane','Ifrane','إفران','ifrane'),
('El Jadida','El Jadida','الجديدة','el-jadida'),
('Tétouan','Tetouan','تطوان','tetouan'),
('Chefchaouen','Chefchaouen','شفشاون','chefchaouen'),
('Dakhla','Dakhla','الداخلة','dakhla'),
('Laâyoune','Laayoune','العيون','laayoune')
ON CONFLICT (slug) DO NOTHING;

-- MARRAKECH NEIGHBORHOODS
INSERT INTO neighborhoods (city_id, name_fr, name_en, name_ar, slug)
SELECT c.id, n.name_fr, n.name_en, n.name_ar, n.slug
FROM cities c,
(VALUES
  ('Guéliz','Gueliz','كليز','gueliz'),
  ('Palmeraie','Palmeraie','النخيل','palmeraie'),
  ('Hivernage','Hivernage','الهيفرناج','hivernage'),
  ('Médina','Medina','المدينة العتيقة','medina'),
  ('Agdal','Agdal','أكدال','agdal'),
  ('Targa','Targa','تارقا','targa'),
  ('Mellah','Mellah','الملاح','mellah'),
  ('Route de Fès','Route de Fes','طريق فاس','route-de-fes'),
  ('Route d''Ourika','Route d''Ourika','طريق أوريكا','route-ourika'),
  ('Sidi Ghanem','Sidi Ghanem','سيدي غانم','sidi-ghanem'),
  ('M''hamid','M''hamid','المحاميد','mhamid'),
  ('Hay Hassani','Hay Hassani','حي الحسني','hay-hassani'),
  ('Semlalia','Semlalia','السملالية','semlalia'),
  ('Massira','Massira','المسيرة','massira'),
  ('Amelkis','Amelkis','أملكيس','amelkis'),
  ('Route de Casablanca','Route de Casablanca','طريق الدار البيضاء','route-casablanca'),
  ('Bab Doukkala','Bab Doukkala','باب دكالة','bab-doukkala'),
  ('Mouassine','Mouassine','مواسين','mouassine')
) AS n(name_fr, name_en, name_ar, slug)
WHERE c.slug = 'marrakech'
ON CONFLICT DO NOTHING;

-- CASABLANCA NEIGHBORHOODS
INSERT INTO neighborhoods (city_id, name_fr, name_en, name_ar, slug)
SELECT c.id, n.name_fr, n.name_en, n.name_ar, n.slug
FROM cities c,
(VALUES
  ('Anfa','Anfa','أنفا','anfa'),
  ('CIL','CIL','سيل','cil'),
  ('Maârif','Maarif','المعاريف','maarif'),
  ('Ain Diab','Ain Diab','عين الذياب','ain-diab'),
  ('Bourgogne','Bourgogne','بورقون','bourgogne'),
  ('Racine','Racine','راسين','racine'),
  ('California','California','كاليفورنيا','california'),
  ('Gauthier','Gauthier','غوتييه','gauthier'),
  ('Hay Riad','Hay Riad','حي الرياض','hay-riad-casa'),
  ('Sidi Maarouf','Sidi Maarouf','سيدي معروف','sidi-maarouf')
) AS n(name_fr, name_en, name_ar, slug)
WHERE c.slug = 'casablanca'
ON CONFLICT DO NOTHING;

-- RABAT NEIGHBORHOODS
INSERT INTO neighborhoods (city_id, name_fr, name_en, name_ar, slug)
SELECT c.id, n.name_fr, n.name_en, n.name_ar, n.slug
FROM cities c,
(VALUES
  ('Agdal','Agdal','أكدال','agdal-rabat'),
  ('Hassan','Hassan','حسان','hassan'),
  ('Souissi','Souissi','السويسي','souissi'),
  ('Hay Riad','Hay Riad','حي الرياض','hay-riad-rabat'),
  ('Océan','Ocean','المحيط','ocean'),
  ('Médina','Medina','المدينة العتيقة','medina-rabat')
) AS n(name_fr, name_en, name_ar, slug)
WHERE c.slug = 'rabat'
ON CONFLICT DO NOTHING;

-- AGADIR NEIGHBORHOODS
INSERT INTO neighborhoods (city_id, name_fr, name_en, name_ar, slug)
SELECT c.id, n.name_fr, n.name_en, n.name_ar, n.slug
FROM cities c,
(VALUES
  ('Centre Ville','City Center','وسط المدينة','centre-agadir'),
  ('Talborjt','Talborjt','تالبرجت','talborjt'),
  ('Tilila','Tilila','تيليلا','tilila'),
  ('Founty','Founty','فونتي','founty'),
  ('Hay Mohammadi','Hay Mohammadi','حي المحمدي','hay-mohammadi-agadir')
) AS n(name_fr, name_en, name_ar, slug)
WHERE c.slug = 'agadir'
ON CONFLICT DO NOTHING;
