-- Keep all database-admin capabilities locked until TOTP AAL2 is completed.
-- app_metadata.role is server-controlled; JWT aal must be at least aal2 for admin.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text LANGUAGE sql STABLE SET search_path = ''
AS $$
  SELECT CASE
    WHEN COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','user') = 'admin'
         AND COALESCE(auth.jwt() ->> 'aal','') <> 'aal2'
    THEN 'user'
    ELSE COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','user')
  END;
$$;