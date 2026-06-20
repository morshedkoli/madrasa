'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { EXPENSE_CATEGORIES } from '@/lib/types'

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [incomeData, setIncomeData] = useState<any[]>([])
  const [expenseData, setExpenseData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [feeCollectionData, setFeeCollectionData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [iRes, eRes] = await Promise.all([
        sql`SELECT * FROM income WHERE date >= ${year + '-01-01'} AND date <= ${year + '-12-31'}`,
        sql`SELECT * FROM expenses WHERE date >= ${year + '-01-01'} AND date <= ${year + '-12-31'}`,
      ])

      const incomeRows = (iRes.data || []) as any[]
      const expenseRows = (eRes.data || []) as any[]
      setIncomeData(incomeRows)
      setExpenseData(expenseRows)

      // Monthly aggregation
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      setMonthlyData(months.map((m, i) => {
        const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`
        return {
          name: m,
          income: incomeRows.filter(d => d.date.startsWith(monthStr)).reduce((s, d) => s + d.amount, 0),
          expense: expenseRows.filter(d => d.date.startsWith(monthStr)).reduce((s, d) => s + d.amount, 0),
        }
      }))

      // Fee collection by class
      const paymentsRes = await sql`SELECT fp.*, s.class_id FROM fee_payments fp JOIN students s ON s.id = fp.student_id WHERE fp.payment_date >= ${year + '-01-01'}`
      const { data: classes } = await db('classes').select('id, name')
      const payments = paymentsRes.data || []
      setFeeCollectionData((classes || []).map(c => ({
        name: c.name,
        collected: payments.filter((p: any) => p.class_id === c.id).reduce((s: number, p: any) => s + p.amount_paid, 0),
      })))
    }
    load()
  }, [year])

  const totalIncome = incomeData.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenseData.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="প্রতিবেদন" description="আর্থিক প্রতিবেদন এবং বিশ্লেষণ">
        <Select options={['2024', '2025', '2026'].map(y => ({ value: y, label: y }))} value={year} onChange={(e) => setYear(e.target.value)} className="w-24" />
        <Button variant="outline"><Download className="w-4 h-4" /> পিডিএফ এক্সপোর্ট</Button>
        <Button variant="outline"><Download className="w-4 h-4" /> এক্সেল এক্সপোর্ট</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-600" /><div><p className="text-sm text-gray-500">মোট আয়</p><p className="text-xl font-bold">{formatCurrency(totalIncome)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><TrendingDown className="w-5 h-5 text-red-600" /><div><p className="text-sm text-gray-500">মোট ব্যয়</p><p className="text-xl font-bold">{formatCurrency(totalExpense)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-blue-600" /><div><p className="text-sm text-gray-500">নেট ব্যালেন্স</p><p className="text-xl font-bold">{formatCurrency(totalIncome - totalExpense)}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">পিএন্ডএল বিবরণী</TabsTrigger>
          <TabsTrigger value="fee-collection">ফি সংগ্রহ</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <Card>
            <CardHeader><CardTitle>মাসিক আয় বনাম ব্যয়</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="income" fill="#1B6B3A" radius={[4, 4, 0, 0]} name="আয়" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="ব্যয়" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee-collection">
          <Card>
            <CardHeader><CardTitle>শ্রেণি অনুযায়ী ফি সংগ্রহ</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                  <BarChart data={feeCollectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="collected" fill="#C9A84C" radius={[4, 4, 0, 0]} name="সংগৃহীত" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
