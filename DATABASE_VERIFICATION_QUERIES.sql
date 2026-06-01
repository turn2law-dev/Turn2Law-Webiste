-- ============================================================================
-- TURN2LAW DATABASE VERIFICATION QUERIES
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify your setup
-- ============================================================================

-- 1. CHECK IF ALL TABLES EXIST
-- ============================================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'lawyer_profiles',
    'consultations',
    'queries',
    'transactions',
    'wallet',
    'lawgpt_sessions',
    'lawgpt_messages',
    'reviews'
  )
ORDER BY table_name;

-- Expected: Should show all 9 tables


-- 2. VERIFY PROFILES TABLE STRUCTURE
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected fields:
-- id, email, full_name, phone, user_type, city, created_at, updated_at


-- 3. VERIFY LAWYER_PROFILES TABLE STRUCTURE
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lawyer_profiles'
ORDER BY ordinal_position;

-- Expected fields:
-- id, user_id, bar_number, experience_years, specialization, education,
-- court_practice, languages, bio, consultation_fee, profile_image_url,
-- verified, rating, total_reviews, total_consultations, availability_status,
-- is_active, created_at, updated_at


-- 4. CHECK FOREIGN KEY RELATIONSHIPS
-- ============================================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'lawyer_profiles', 'consultations', 'queries', 'transactions', 'wallet')
ORDER BY tc.table_name;

-- Expected: All foreign keys should reference public.profiles, not auth.users


-- 5. VERIFY RLS IS ENABLED
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'lawyer_profiles',
    'consultations',
    'queries',
    'transactions',
    'wallet',
    'lawgpt_sessions',
    'lawgpt_messages',
    'reviews'
  )
ORDER BY tablename;

-- Expected: rowsecurity = true for all tables


-- 6. LIST ALL RLS POLICIES
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Should see policies for each table


-- 7. CHECK TRIGGERS
-- ============================================================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  OR (trigger_schema = 'auth' AND event_object_table = 'users')
ORDER BY event_object_table, trigger_name;

-- Expected: on_auth_user_created trigger on auth.users


-- 8. VERIFY INDEXES
-- ============================================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'lawyer_profiles', 'consultations', 'queries')
ORDER BY tablename, indexname;

-- Expected: Indexes on email, user_type, city, user_id, etc.


-- 9. TEST PROFILE CREATION (MANUAL VERIFICATION)
-- ============================================================================
-- This query helps verify that profiles are being created correctly
-- Run AFTER you've created some test accounts

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.city,
  p.created_at,
  CASE 
    WHEN lp.id IS NOT NULL THEN 'Has lawyer profile'
    ELSE 'No lawyer profile'
  END as lawyer_profile_status
FROM profiles p
LEFT JOIN lawyer_profiles lp ON lp.user_id = p.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Expected: Should show recent signups with correct data


-- 10. CHECK FOR ORPHANED AUTH USERS
-- ============================================================================
-- Find auth.users without profiles (should be none if trigger is working)

SELECT 
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- Expected: Should return 0 rows (no orphaned users)


-- 11. CHECK FOR ORPHANED PROFILES
-- ============================================================================
-- Find profiles without auth.users (should be none)

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.id IS NULL;

-- Expected: Should return 0 rows (no orphaned profiles)


-- 12. VERIFY LAWYER PROFILES HAVE CORRECT USER_ID REFERENCE
-- ============================================================================
SELECT 
  lp.id as lawyer_profile_id,
  lp.user_id,
  p.id as profile_id,
  p.full_name,
  p.user_type,
  lp.bar_number,
  lp.specialization
FROM lawyer_profiles lp
JOIN profiles p ON p.id = lp.user_id
ORDER BY lp.created_at DESC
LIMIT 10;

-- Expected: All lawyer_profiles should have matching profiles with user_type='lawyer'


-- 13. CHECK CONSULTATIONS REFERENCE PROFILES
-- ============================================================================
SELECT 
  c.id as consultation_id,
  c.client_id,
  client.full_name as client_name,
  c.lawyer_id,
  lawyer.full_name as lawyer_name,
  c.status,
  c.created_at
FROM consultations c
LEFT JOIN profiles client ON client.id = c.client_id
LEFT JOIN profiles lawyer ON lawyer.id = c.lawyer_id
ORDER BY c.created_at DESC
LIMIT 10;

-- Expected: All consultations should have valid client and lawyer references


-- 14. CHECK QUERIES REFERENCE PROFILES
-- ============================================================================
SELECT 
  q.id,
  q.user_id,
  p.full_name,
  p.email,
  q.query,
  q.created_at
FROM queries q
LEFT JOIN profiles p ON p.id = q.user_id
ORDER BY q.created_at DESC
LIMIT 10;

-- Expected: All queries should have valid user references


-- 15. VERIFY WALLET ENTRIES
-- ============================================================================
SELECT 
  w.id,
  w.user_id,
  p.full_name,
  w.balance,
  w.created_at
FROM wallet w
JOIN profiles p ON p.id = w.user_id
ORDER BY w.created_at DESC
LIMIT 10;

-- Expected: Wallets should be created for all users


-- 16. CHECK USER TYPES DISTRIBUTION
-- ============================================================================
SELECT 
  user_type,
  COUNT(*) as count
FROM profiles
GROUP BY user_type;

-- Expected: Should show count of 'client' and 'lawyer' users


-- 17. VERIFY EMAIL UNIQUENESS
-- ============================================================================
-- Check for duplicate emails (should be none)

SELECT 
  email,
  COUNT(*) as count
FROM profiles
GROUP BY email
HAVING COUNT(*) > 1;

-- Expected: Should return 0 rows (no duplicate emails)


-- 18. CHECK LAWGPT SESSIONS
-- ============================================================================
SELECT 
  ls.id,
  ls.user_id,
  p.full_name,
  ls.title,
  ls.message_count,
  ls.created_at
FROM lawgpt_sessions ls
JOIN profiles p ON p.id = ls.user_id
ORDER BY ls.created_at DESC
LIMIT 10;

-- Expected: LawGPT sessions linked to valid users


-- 19. VERIFY DATA TYPES AND CONSTRAINTS
-- ============================================================================
SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'lawyer_profiles', 'consultations')
ORDER BY table_name, constraint_type;

-- Expected: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK constraints


-- 20. FULL SYSTEM HEALTH CHECK
-- ============================================================================
-- Comprehensive check of all critical elements

WITH table_check AS (
  SELECT COUNT(*) as table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'lawyer_profiles', 'consultations', 'queries', 
                       'transactions', 'wallet', 'lawgpt_sessions', 'lawgpt_messages', 'reviews')
),
rls_check AS (
  SELECT COUNT(*) as rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename IN ('profiles', 'lawyer_profiles', 'consultations', 'queries', 
                      'transactions', 'wallet', 'lawgpt_sessions', 'lawgpt_messages', 'reviews')
),
trigger_check AS (
  SELECT COUNT(*) as trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
    AND trigger_schema = 'auth'
),
profile_check AS (
  SELECT COUNT(*) as profile_count
  FROM profiles
),
orphan_check AS (
  SELECT COUNT(*) as orphan_count
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL
)
SELECT 
  table_check.table_count as tables_created,
  9 as expected_tables,
  CASE WHEN table_check.table_count = 9 THEN '✅' ELSE '❌' END as tables_status,
  
  rls_check.rls_enabled_count as rls_enabled,
  9 as expected_rls,
  CASE WHEN rls_check.rls_enabled_count = 9 THEN '✅' ELSE '❌' END as rls_status,
  
  trigger_check.trigger_count as triggers_active,
  1 as expected_triggers,
  CASE WHEN trigger_check.trigger_count = 1 THEN '✅' ELSE '❌' END as trigger_status,
  
  profile_check.profile_count as total_users,
  
  orphan_check.orphan_count as orphaned_users,
  CASE WHEN orphan_check.orphan_count = 0 THEN '✅' ELSE '⚠️' END as orphan_status
FROM table_check, rls_check, trigger_check, profile_check, orphan_check;

-- Expected: All statuses should show ✅


-- ============================================================================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- ONLY USE THESE IF YOU NEED TO RESET YOUR DATABASE
-- ⚠️ THESE WILL DELETE ALL DATA ⚠️

-- Clean up orphaned auth users (if any exist)
-- DELETE FROM auth.users 
-- WHERE id NOT IN (SELECT id FROM public.profiles);

-- Clean up orphaned profiles (if any exist)
-- DELETE FROM public.profiles 
-- WHERE id NOT IN (SELECT id FROM auth.users);

-- Delete all test data (CAUTION: THIS DELETES EVERYTHING)
-- TRUNCATE TABLE public.reviews, public.lawgpt_messages, public.lawgpt_sessions, 
--                 public.transactions, public.wallet, public.queries, 
--                 public.consultations, public.lawyer_profiles, public.profiles CASCADE;

-- ============================================================================
-- END OF VERIFICATION QUERIES
-- ============================================================================
