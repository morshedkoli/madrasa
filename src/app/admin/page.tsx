'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db, sql } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Bell,
  UserPlus,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#1B6B3A', '#C9A84C', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminOverview() {
  const router = useRouter()
  const [stats, setStats] = useState({ students: 0, teachers: 0, monthlyIncome: 0, monthlyExpense: 0 })
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { count: students } = await db('students').where('status', 'active').count()
      const { count: teachers } = await db('profiles').where('role', 'teacher').count()

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const startStr = startOfMonth.toISOString().split('T')[0]

      const incomeRows = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ${startStr}`
      const expenseRows = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ${startStr}`

      const monthlyIncome = Number(incomeRows.data?.[0]?.total || 0)
      const monthlyExpense = Number(expenseRows.data?.[0]?.total || 0)
      setStats({ students: students || 0, teachers: teachers || 0, monthlyIncome, monthlyExpense })

      const payments = await sql`
        SELECT fp.*, s.name as student_name
        FROM fee_payments fp
        JOIN students s ON s.id = fp.student_id
        ORDER BY fp.payment_date DESC
        LIMIT 5
      `
      setRecentPayments(payments.data || [])

      // Generate sample chart data (in production, query actual data)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      setIncomeExpenseData(months.map((m, i) => ({
        name: m,
        income: Math.floor(80000 + Math.random() * 40000),
        expense: Math.floor(50000 + Math.random() * 30000),
      })))

      setAttendanceData([
        { name: 'Class 1', present: 85, absent: 10, late: 5 },
        { name: 'Class 2', present: 78, absent: 15, late: 7 },
        { name: 'Class 3', present: 92, absent: 5, late: 3 },
        { name: 'Class 4', present: 70, absent: 20, late: 10 },
        { name: 'Class 5', present: 88, absent: 8, late: 4 },
      ])
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="অ্যাডমিন ড্যাশবোর্ড" description="আপনার মাদ্রাসার ওভারভিউ">
        <Button onClick={() => router.push('/admin/students')}><UserPlus className="w-4 h-4" /> শিক্ষার্থী যোগ করুন</Button>
        <Button variant="outline" onClick={() => router.push('/admin/teachers')}><Plus className="w-4 h-4" /> শিক্ষক যোগ করুন</Button>
        <Button variant="secondary" onClick={() => router.push('/admin/notices')}><Bell className="w-4 h-4" /> নোটিশ পাঠান</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="মোট শিক্ষার্থী" value={stats.students} icon={Users} description="সক্রিয় শিক্ষার্থী" />
        <StatCard title="মোট শিক্ষক" value={stats.teachers} icon={GraduationCap} description="সক্রিয় শিক্ষক" />
        <StatCard title="মাসিক আয়" value={'BDT ' + stats.monthlyIncome.toLocaleString()} icon={TrendingUp} description="এই মাস" />
        <StatCard title="মাসিক ব্যয়" value={'BDT ' + stats.monthlyExpense.toLocaleString()} icon={TrendingDown} description="এই মাস" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>মাসিক আয় বনাম ব্যয়</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                <BarChart data={incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="income" fill="#1B6B3A" radius={[4, 4, 0, 0]} name="আয়" />
                  <Bar dataKey="expense" fill="#C9A84C" radius={[4, 4, 0, 0]} name="ব্যয়" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>শ্রেণি অনুযায়ী উপস্থিতি</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    dataKey="present"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, value }: any) => name + ' ' + value + '%'}
                  >
                    {attendanceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>সাম্প্রতিক ফি পেমেন্ট</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">শিক্ষার্থী</th>
                  <th className="pb-2 font-medium">পরিমাণ</th>
                  <th className="pb-2 font-medium">পদ্ধতি</th>
                  <th className="pb-2 font-medium">তারিখ</th>
                  <th className="pb-2 font-medium">রসিদ</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{p.student_name || 'N/A'}</td>
                    <td className="py-2 font-medium">৳{p.amount_paid}</td>
                    <td className="py-2"><Badge variant="secondary">{p.payment_method}</Badge></td>
                    <td className="py-2 text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="py-2 text-xs text-gray-400">{p.receipt_number}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-400">এখনো কোনো পেমেন্ট রেকর্ড করা হয়নি</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
