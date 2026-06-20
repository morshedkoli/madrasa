'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { DashboardShell } from '@/components/shared/DashboardShell'
import { LayoutDashboard, BookOpen, ClipboardCheck, FileSpreadsheet, Users, Bell } from 'lucide-react'

const navItems = [
  { label: 'ওভারভিউ', href: '/teacher', icon: LayoutDashboard },
  { label: 'আমার শ্রেণি', href: '/teacher/classes', icon: BookOpen },
  { label: 'উপস্থিতি', href: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'গ্রেড', href: '/teacher/grades', icon: FileSpreadsheet },
  { label: 'শিক্ষার্থী', href: '/teacher/students', icon: Users },
  { label: 'নোটিশ', href: '/teacher/notices', icon: Bell },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen bg-[#FAF7F0]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C]"></div></div>
  }

  return (
    <DashboardShell
      role="teacher"
      navItems={navItems}
      user={{ name: user.name, email: user.email, avatar: user.image || undefined }}
    >
      {children}
    </DashboardShell>
  )
}
