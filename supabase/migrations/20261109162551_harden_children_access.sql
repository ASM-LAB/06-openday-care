ALTER FUNCTION public.set_children_updated_at()
  SET search_path = '';

REVOKE DELETE, TRUNCATE ON TABLE public.rooms, public.children FROM service_role;
