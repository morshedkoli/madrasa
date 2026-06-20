export type Role = 'admin' | 'teacher' | 'accountant'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: Role
  avatar_url?: string
  phone?: string
  created_at: string
}

export interface Student {
  id: string
  name: string
  father_name: string
  mother_name: string
  dob: string
  gender: 'male' | 'female'
  class_id: string
  enrollment_date: string
  photo_url?: string
  address?: string
  phone?: string
  status: 'active' | 'inactive'
}

export interface Class {
  id: string
  name: string
  section?: string
  teacher_id?: string
  academic_year: string
}

export interface Subject {
  id: string
  name: string
  class_id: string
  teacher_id?: string
}

export interface Attendance {
  id: string
  student_id: string
  class_id: string
  date: string
  status: 'present' | 'absent' | 'late'
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  exam_type: string
  marks_obtained: number
  total_marks: number
  remarks?: string
  created_at: string
}

export interface FeeStructure {
  id: string
  class_id: string
  fee_type: string
  amount: number
  academic_year: string
}

export interface FeePayment {
  id: string
  student_id: string
  fee_structure_id: string
  amount_paid: number
  payment_date: string
  payment_method: 'cash' | 'bank' | 'bKash'
  receipt_number: string
  remarks?: string
  collected_by: string
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  approved_by?: string
  receipt_url?: string
}

export interface Income {
  id: string
  source: string
  description: string
  amount: number
  date: string
  received_by?: string
}

export interface Notice {
  id: string
  title: string
  content: string
  target_role: 'all' | 'teachers' | 'accountants'
  created_by: string
  created_at: string
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export const EXPENSE_CATEGORIES = [
  'Salary',
  'Utilities',
  'Maintenance',
  'Books/Supplies',
  'Events',
  'Miscellaneous',
] as const
