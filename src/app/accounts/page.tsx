'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AccountantOverview() {
  const [stats, setStats] = useState({ income: 0, expense: 0, unpaidCount: 0, unpaidAmount: 0 })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const startStr = startOfMonth.toISOString().split('T')[0]

      const [iRes, eRes, pRes] = await Promise.all([
        sql`SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ${startStr}`,
        sql`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ${startStr}`,
        sql`SELECT fp.*, s.name as student_name FROM fee_payments fp JOIN students s ON s.id = fp.student_id ORDER BY fp.payment_date DESC LIMIT 10`,
      ])

      const income = Number(iRes.data?.[0]?.total || 0)
      const expense = Number(eRes.data?.[0]?.total || 0)

      setStats({ income, expense, unpaidCount: 0, unpaidAmount: 0 })
      setRecentTransactions(pRes.data || [])
    }
    load()
  }, [])

  const netBalance = stats.income - stats.expense

  return (
    <div className="space-y-6">
      <PageHeader title="হিসাবরক্ষক ড্যাশবোর্ড" description="আর্থিক ওভারভিউ" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="মাসিক আয়" value={formatCurrency(stats.income)} icon={TrendingUp} />
        <StatCard title="মাসিক ব্যয়" value={formatCurrency(stats.expense)} icon={TrendingDown} />
        <StatCard title="নেট ব্যালেন্স" value={formatCurrency(netBalance)} icon={Wallet} className={netBalance >= 0 ? '' : 'border-red-200'} />
        <StatCard title="বকেয়া ফি" value={`${stats.unpaidCount} শিক্ষার্থী`} icon={AlertTriangle} description={formatCurrency(stats.unpaidAmount)} />
      </div>

      <Card>
        <CardHeader><CardTitle>সাম্প্রতিক লেনদেন</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">শিক্ষার্থী</th>
                <th className="pb-2 font-medium">পরিমাণ</th>
                <th className="pb-2 font-medium">পদ্ধতি</th>
                <th className="pb-2 font-medium">তারিখ</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.student_name || 'N/A'}</td>
                  <td className="py-2 font-medium">৳{p.amount_paid}</td>
                  <td className="py-2 capitalize">{p.payment_method}</td>
                  <td className="py-2 text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">কোনো লেনদেন নেই</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
