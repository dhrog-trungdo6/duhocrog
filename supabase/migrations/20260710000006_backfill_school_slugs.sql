-- Backfill #6 — Gán slug cho 22 trường đã seed trước khi có logic slug
-- Chạy trên Supabase Dashboard → SQL Editor. Idempotent: chỉ update row đang null.

update public.schools s
set slug = v.slug
from (
  values
    ('Ball State University', 'ball-state-university'),
    ('UMass Boston', 'umass-boston'),
    ('Green River College', 'green-river-college'),
    ('Texas Tech University', 'texas-tech-university'),
    ('University of Toronto', 'university-of-toronto'),
    ('Seneca Polytechnic', 'seneca-polytechnic'),
    ('Bodwell High School', 'bodwell-high-school'),
    ('University of Sydney', 'university-of-sydney'),
    ('Monash University', 'monash-university'),
    ('Griffith University', 'griffith-university'),
    ('University of Winchester', 'university-of-winchester'),
    ('University of Manchester', 'university-of-manchester'),
    ('Kaplan International London', 'kaplan-international-london'),
    ('MDIS Singapore', 'mdis-singapore'),
    ('Kaplan Singapore', 'kaplan-singapore'),
    ('Dublin City University', 'dublin-city-university'),
    ('University of Auckland', 'university-of-auckland'),
    ('EHL Hospitality Lausanne', 'ehl-hospitality-lausanne'),
    ('Sorbonne Université', 'sorbonne-universite'),
    ('Taylor''s University', 'taylor-s-university'),
    ('CIA Cebu — English Academy', 'cia-cebu-english-academy'),
    ('Assumption University', 'assumption-university')
) as v(name, slug)
where s.name = v.name
  and s.slug is null;
