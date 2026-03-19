-- ============================================================================
-- ADMIN USER SETUP
-- ============================================================================
-- JALANKAN INI SETELAH 00_SCHEMA_COMPLETE_FIXED.sql SELESAI
-- Run AFTER schema is complete
-- ============================================================================

-- STEP 1: Create admin user in Supabase Auth
-- 1. Go to Supabase Dashboard
-- 2. Click "Authentication" > "Users"
-- 3. Click "Create new user"
-- 4. Email: admin@rutesuro.com
-- 5. Password: (set your own password)
-- 6. Click "Create user"

-- STEP 2: After admin user is created, run this query:
-- This will set the role to 'admin' for the admin user

INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Admin Rute Suro', 'admin', true
FROM auth.users
WHERE email = 'admin@rutesuro.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin Rute Suro';

-- Verify the admin user was created
SELECT id, email, full_name, role, is_active 
FROM public.profiles 
WHERE email = 'admin@rutesuro.com';
