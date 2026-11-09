INSERT INTO public.daycares (name)
SELECT 'Daycare de prueba'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.daycares
  WHERE name = 'Daycare de prueba'
);
