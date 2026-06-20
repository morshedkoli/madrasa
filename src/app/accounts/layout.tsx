'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { DashboardShell } from '@/components/shared/DashboardShell'
import { LayoutDashboard, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const navItems = [
  { label: 'ওভারভিউ', href: '/accounts', icon: LayoutDashboard },
  { label: 'ফি সংগ্রহ', href: '/accounts/fees', icon: DollarSign },
  { label: 'আয়', href: '/accounts/income', icon: TrendingUp },
  { label: 'ব্যয়', href: '/accounts/expenses', icon: TrendingDown },
  { label: 'প্রতিবেদন', href: '/accounts/reports', icon: BarChart3 },
]

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'accountant')) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen bg-[#FAF7F0]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
  }

  return (
    <DashboardShell
      role="accountant"
      navItems={navItems}
      user={{ name: user.name, email: user.email, avatar: user.image || undefined }}
    >
      {children}
    </DashboardShell>
  )
}
