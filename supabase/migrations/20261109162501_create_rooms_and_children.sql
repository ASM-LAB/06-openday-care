DO $daycare_guard$
DECLARE
  daycare_count bigint;
BEGIN
  LOCK TABLE public.daycares IN SHARE MODE;

  SELECT count(*)
  INTO daycare_count
  FROM public.daycares;

  IF daycare_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one daycare before creating rooms; found %', daycare_count;
  END IF;
END;
$daycare_guard$;

CREATE TYPE public.child_status AS ENUM ('active', 'archived');

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES public.daycares (id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rooms_name_allowed CHECK (name IN ('Soles', 'Nubes', 'Prados')),
  CONSTRAINT rooms_daycare_id_name_key UNIQUE (daycare_id, name)
);

CREATE TABLE public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms (id),
  full_name text NOT NULL,
  birth_date date NOT NULL,
  enrolled_at date NOT NULL,
  medical_notes text,
  allergy_tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  photo_consent boolean NOT NULL DEFAULT true,
  status public.child_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT children_full_name_nonempty CHECK (btrim(full_name) <> ''),
  CONSTRAINT children_allergy_tags_allowed CHECK (
    allergy_tags <@ ARRAY['peanut', 'lactose', 'gluten']::text[]
  )
);

CREATE INDEX children_room_id_idx ON public.children (room_id);

CREATE FUNCTION public.set_children_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_children_updated_at() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER set_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.set_children_updated_at();

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active daycare staff can read rooms"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users AS profile
      WHERE profile.id = (SELECT auth.uid())
        AND profile.daycare_id = rooms.daycare_id
        AND profile.status = 'active'
        AND profile.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Active daycare staff can read children"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rooms AS room
      JOIN public.users AS profile ON profile.daycare_id = room.daycare_id
      WHERE room.id = children.room_id
        AND profile.id = (SELECT auth.uid())
        AND profile.status = 'active'
        AND profile.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Active daycare staff can create children"
  ON public.children
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.rooms AS room
      JOIN public.users AS profile ON profile.daycare_id = room.daycare_id
      WHERE room.id = children.room_id
        AND profile.id = (SELECT auth.uid())
        AND profile.status = 'active'
        AND profile.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Active daycare staff can update children"
  ON public.children
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rooms AS room
      JOIN public.users AS profile ON profile.daycare_id = room.daycare_id
      WHERE room.id = children.room_id
        AND profile.id = (SELECT auth.uid())
        AND profile.status = 'active'
        AND profile.role IN ('staff', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.rooms AS room
      JOIN public.users AS profile ON profile.daycare_id = room.daycare_id
      WHERE room.id = children.room_id
        AND profile.id = (SELECT auth.uid())
        AND profile.status = 'active'
        AND profile.role IN ('staff', 'admin')
    )
  );

REVOKE ALL PRIVILEGES ON TABLE public.rooms, public.children FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.children TO authenticated;

INSERT INTO public.rooms (daycare_id, name)
SELECT daycare.id, room_names.name
FROM public.daycares AS daycare
CROSS JOIN (VALUES ('Soles'::text), ('Nubes'::text), ('Prados'::text)) AS room_names(name)
ON CONFLICT (daycare_id, name) DO NOTHING;
