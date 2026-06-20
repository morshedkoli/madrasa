'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

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
  LogOut,
  Menu,
  X,
  ChevronLeft,
  School,
  BarChart3,
  Wallet,
  ScrollText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface DashboardShellProps {
  children: React.ReactNode
  role: 'admin' | 'teacher' | 'accountant'
  navItems: NavItem[]
  user: { name: string; email: string; avatar?: string }
}

export function DashboardShell({ children, role, navItems, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const roleColors = {
    admin: 'bg-[#1B6B3A]',
    teacher: 'bg-[#C9A84C]',
    accountant: 'bg-[#3b82f6]',
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F0]">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto bg-[#1B6B3A]">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
            <Link href={`/${role}`} className="flex items-center gap-2">
              <School className="w-7 h-7 text-[#C9A84C]" />
              <div>
                <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Amiri, serif' }}>
                  মাদ্রাসা
                </h2>
                <p className="text-[10px] text-white/60">ম্যানেজমেন্ট সিস্টেম</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-[#C9A84C] text-white text-xs">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/60 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              সাইন আউট
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu className="w-5 h-5" />
            </button>
            <div className={cn(
              'px-2 py-0.5 rounded text-xs font-medium text-white uppercase',
              roleColors[role]
            )}>
              {role === 'admin' ? 'প্রশাসক' : role === 'teacher' ? 'শিক্ষক' : 'হিসাবরক্ষক'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
