-- Replace 'YOUR_EMAIL@example.com' with your actual admin email
INSERT INTO public.user_roles (user_id, role, auth_provider)
SELECT id, 'admin', COALESCE(raw_app_meta_data->>'provider', 'email')
FROM auth.users WHERE email = 'gaastontimchuk@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin',
  auth_provider = COALESCE(
    (SELECT raw_app_meta_data->>'provider' FROM auth.users WHERE email = 'gaastontimchuk@gmail.com'),
    'email'
  );
