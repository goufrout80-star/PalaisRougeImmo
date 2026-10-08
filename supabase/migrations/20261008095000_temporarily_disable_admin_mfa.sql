-- Temporary removal of mandatory two-factor authentication for Kamar Immob.
-- Roles remain read exclusively from protected auth.app_metadata (never user_metadata).
-- Restore the AAL2 check in a future migration before making MFA mandatory again.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'user');
$$;
