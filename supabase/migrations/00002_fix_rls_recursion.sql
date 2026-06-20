-- Fix RLS infinite recursion by using SECURITY DEFINER helper functions
-- Run this in Supabase SQL Editor

-- Helper: check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Helper: check if current user is accountant (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'accountant'
  );
END;
$$;

-- Helper: get current user's profile id (bypasses RLS)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pid uuid;
BEGIN
  SELECT id INTO pid FROM public.profiles WHERE user_id = auth.uid();
  RETURN pid;
END;
$$;

-- Helper: get current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  r text;
BEGIN
  SELECT role INTO r FROM public.profiles WHERE user_id = auth.uid();
  RETURN r;
END;
$$;

-- Drop old recursive policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;

-- New non-recursive policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "Admin can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- Drop and recreate other policies to use helpers (avoiding recursion everywhere)
DROP POLICY IF EXISTS "Admin full access students" ON public.students;
DROP POLICY IF EXISTS "Teachers view own class students" ON public.students;

CREATE POLICY "Admin full access students" ON public.students
  USING (public.is_admin());

CREATE POLICY "Teachers view own class students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS "Admin full access attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers manage own class attendance" ON public.attendance;

CREATE POLICY "Admin full access attendance" ON public.attendance
  USING (public.is_admin());

CREATE POLICY "Teachers manage own class attendance" ON public.attendance
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = attendance.class_id
      AND classes.teacher_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS "Admin and accountant fee access" ON public.fee_payments;

CREATE POLICY "Finance fee access" ON public.fee_payments
  USING (public.is_admin() OR public.is_accountant());

DROP POLICY IF EXISTS "Finance access" ON public.expenses;
DROP POLICY IF EXISTS "Finance access income" ON public.income;

CREATE POLICY "Finance expenses access" ON public.expenses
  USING (public.is_admin() OR public.is_accountant());

CREATE POLICY "Finance income access" ON public.income
  USING (public.is_admin() OR public.is_accountant());
