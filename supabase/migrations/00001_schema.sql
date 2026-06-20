-- Madrasha Management System - Database Schema
-- Run this in Supabase SQL Editor

-- 1. PROFILES TABLE (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'accountant')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false
);

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

-- 3. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 4. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- 5. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  address TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 6. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  UNIQUE(student_id, class_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 7. GRADES
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  marks_obtained NUMERIC(5,2) NOT NULL,
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- 8. FEE STRUCTURES
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  academic_year TEXT NOT NULL
);

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

-- 9. FEE PAYMENTS
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank', 'bKash')),
  receipt_number TEXT NOT NULL UNIQUE,
  remarks TEXT,
  collected_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- 10. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receipt_url TEXT
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 11. INCOME
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- 12. NOTICES
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'all' CHECK (target_role IN ('all', 'teachers', 'accountants')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 13. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_notices_target ON notices(target_role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- SECURITY DEFINER helpers (bypass RLS to avoid infinite recursion)
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

-- RLS POLICIES
-- Profiles: users can read own profile, admin can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- Students: admin full access, teachers read own class students
CREATE POLICY "Admin full access students" ON students
  USING (public.is_admin());

CREATE POLICY "Teachers view own class students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = students.class_id
      AND classes.teacher_id = public.current_profile_id()
    )
  );

-- Attendance: admin full, teachers manage own classes
CREATE POLICY "Admin full access attendance" ON attendance
  USING (public.is_admin());

CREATE POLICY "Teachers manage own class attendance" ON attendance
  USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = attendance.class_id
      AND classes.teacher_id = public.current_profile_id()
    )
  );

-- Fee payments: admin and accountant full access
CREATE POLICY "Finance fee access" ON fee_payments
  USING (public.is_admin() OR public.is_accountant());

-- Expenses/Income: admin and accountant full access
CREATE POLICY "Finance expenses access" ON expenses
  USING (public.is_admin() OR public.is_accountant());

CREATE POLICY "Finance income access" ON income
  USING (public.is_admin() OR public.is_accountant());

-- Seed function to create demo accounts
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS void AS $$
DECLARE
  admin_id UUID;
  teacher_id UUID;
  acc_id UUID;
  class1_id UUID;
  class2_id UUID;
BEGIN
  -- Create demo users if they don't exist
  -- Note: Users must be created via Supabase Auth API
  -- This function assumes users already exist and creates profiles

  -- Insert profiles (run after creating auth users)
  INSERT INTO academic_years (name, start_date, end_date, is_current)
  VALUES ('2026', '2026-01-01', '2026-12-31', true)
  ON CONFLICT DO NOTHING;

  -- Sample classes
  INSERT INTO classes (name, section, academic_year) VALUES
    ('Class 1', 'A', '2026'),
    ('Class 2', 'A', '2026'),
    ('Class 3', 'A', '2026'),
    ('Class 4', 'A', '2026'),
    ('Class 5', 'A', '2026')
  ON CONFLICT DO NOTHING;
  
  -- Sample fee structures
  INSERT INTO fee_structures (class_id, fee_type, amount, academic_year)
  SELECT id, 'Tuition', 500, '2026' FROM classes WHERE name = 'Class 1'
  UNION ALL
  SELECT id, 'Tuition', 600, '2026' FROM classes WHERE name = 'Class 2'
  UNION ALL
  SELECT id, 'Tuition', 700, '2026' FROM classes WHERE name = 'Class 3'
  UNION ALL
  SELECT id, 'Tuition', 800, '2026' FROM classes WHERE name = 'Class 4'
  UNION ALL
  SELECT id, 'Tuition', 1000, '2026' FROM classes WHERE name = 'Class 5'
  ON CONFLICT DO NOTHING;

  -- Expense categories sample
  INSERT INTO expenses (category, description, amount, date) VALUES
    ('Salary', 'Teacher salaries for January', 50000, '2026-01-05'),
    ('Utilities', 'Electricity bill', 5000, '2026-01-10'),
    ('Maintenance', 'Building repair', 15000, '2026-01-15'),
    ('Books/Supplies', 'Textbooks purchase', 20000, '2026-01-20'),
    ('Events', 'Annual sports day', 10000, '2026-02-01')
  ON CONFLICT DO NOTHING;

  -- Sample income
  INSERT INTO income (source, description, amount, date) VALUES
    ('Donation', 'Community donation', 100000, '2026-01-05'),
    ('Fees', 'Monthly tuition collection', 75000, '2026-01-15'),
    ('Grant', 'Government grant', 50000, '2026-02-01')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
