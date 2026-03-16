-- Add auth_provider column to user_roles
ALTER TABLE public.user_roles
  ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'email'
  CHECK (auth_provider IN ('email', 'google'));

-- Backfill existing rows from auth.users metadata
UPDATE public.user_roles ur
SET auth_provider = COALESCE(
  (SELECT raw_app_meta_data->>'provider' FROM auth.users WHERE id = ur.user_id),
  'email'
);

-- RPC to check a user's auth provider (SECURITY DEFINER to read auth.users)
CREATE OR REPLACE FUNCTION public.check_auth_provider(lookup_email TEXT, login_method TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_provider TEXT;
BEGIN
  SELECT ur.auth_provider INTO stored_provider
  FROM auth.users au
  JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE au.email = lookup_email;

  -- User not found: return allowed (don't reveal existence)
  IF stored_provider IS NULL THEN
    RETURN json_build_object('allowed', true);
  END IF;

  -- Provider mismatch
  IF stored_provider <> login_method THEN
    RETURN json_build_object('allowed', false);
  END IF;

  RETURN json_build_object('allowed', true);
END;
$$;

-- Trigger: auto-create user_roles row on new auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider TEXT;
BEGIN
  provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  -- Normalize: anything not 'google' is 'email'
  IF provider <> 'google' THEN
    provider := 'email';
  END IF;

  INSERT INTO public.user_roles (user_id, role, auth_provider)
  VALUES (NEW.id, 'user', provider)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: users can read their own user_roles row
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());
