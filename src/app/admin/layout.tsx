'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { DashboardShell } from '@/components/shared/DashboardShell'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  DollarSign,
  Receipt,
  Bell,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'ওভারভিউ', href: '/admin', icon: LayoutDashboard },
  { label: 'শিক্ষার্থী', href: '/admin/students', icon: Users },
  { label: 'শ্রেণি', href: '/admin/classes', icon: GraduationCap },
  { label: 'শিক্ষক', href: '/admin/teachers', icon: BookOpen },
  { label: 'উপস্থিতি', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'গ্রেড ও পরীক্ষা', href: '/admin/grades', icon: FileSpreadsheet },
  { label: 'ফি', href: '/admin/fees', icon: DollarSign },
  { label: 'হিসাবরক্ষণ', href: '/admin/accounting', icon: Receipt },
  { label: 'নোটিশ', href: '/admin/notices', icon: Bell },
  { label: 'সেটিংস', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen bg-[#FAF7F0]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B6B3A]"></div></div>
  }

  return (
    <DashboardShell
      role="admin"
      navItems={navItems}
      user={{ name: user.name, email: user.email, avatar: user.image || undefined }}
    >
      {children}
    </DashboardShell>
  )
}
