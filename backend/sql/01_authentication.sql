-- ============================================================================
-- 1. AUTHENTICATION & PROFILES (User Management)
-- ============================================================================

-- 1.1 Create Profiles Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.2 Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.3 Policies for Profiles Table
DROP POLICY IF EXISTS "profile_read_own" ON public.profiles;
CREATE POLICY "profile_read_own" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
CREATE POLICY "profile_update_own" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profile_insert_admin" ON public.profiles;
CREATE POLICY "profile_insert_admin" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 1.4 Auto-Create Profile on New User (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1.5 Helper Function to Check Admin Role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

-- 1.6 Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- SETUP ADMIN USER - RUN THIS ONCE
-- ============================================================================
-- Note: First create a user with email 'admin@rutesuro.com' in Supabase Auth,
-- then run this query to set the role to 'admin'

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin Rute Suro', 'admin'
FROM auth.users
WHERE email = 'admin@rutesuro.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
