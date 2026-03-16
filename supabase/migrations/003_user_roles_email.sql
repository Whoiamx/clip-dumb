-- Add email column to user_roles
ALTER TABLE public.user_roles
  ADD COLUMN email TEXT;

-- Backfill from auth.users
UPDATE public.user_roles ur
SET email = (SELECT email FROM auth.users WHERE id = ur.user_id);

-- Update trigger to also set email on new user creation
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
  IF provider <> 'google' THEN
    provider := 'email';
  END IF;

  INSERT INTO public.user_roles (user_id, role, auth_provider, email)
  VALUES (NEW.id, 'user', provider, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = NEW.email;

  RETURN NEW;
END;
$$;
