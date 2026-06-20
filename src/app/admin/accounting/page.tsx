'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { EXPENSE_CATEGORIES } from '@/lib/types'

const COLORS = ['#1B6B3A', '#C9A84C', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AccountingPage() {
  const { user } = useUser()
  const [income, setIncome] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [incomeModal, setIncomeModal] = useState(false)
  const [expenseModal, setExpenseModal] = useState(false)
  const [incomeForm, setIncomeForm] = useState({ source: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: iData } = await db('income').order('date', 'desc').limit(50).select()
    const { data: eData } = await db('expenses').order('date', 'desc').limit(50).select()
    setIncome(iData || [])
    setExpenses(eData || [])
  }

  const totalIncome = income.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const netBalance = totalIncome - totalExpense

  const categoryData = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(d => d.value > 0)

  async function addIncome() {
    const { error } = await insert('income', {
      source: incomeForm.source,
      description: incomeForm.description,
      amount: Number(incomeForm.amount),
      date: incomeForm.date,
      received_by: user?.id,
    })
    if (error) { toast.error(error.message); return }
    toast.success('আয় রেকর্ড করা হয়েছে')
    setIncomeModal(false)
    setIncomeForm({ source: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
    loadData()
  }

  async function addExpense() {
    const { error } = await insert('expenses', {
      category: expenseForm.category,
      description: expenseForm.description,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      approved_by: user?.id,
    })
    if (error) { toast.error(error.message); return }
    toast.success('ব্যয় রেকর্ড করা হয়েছে')
    setExpenseModal(false)
    setExpenseForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
    loadData()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="হিসাবরক্ষণ" description="আয় ও ব্যয় ব্যবস্থাপনা">
        <Button onClick={() => setIncomeModal(true)}><TrendingUp className="w-4 h-4" /> আয় যোগ করুন</Button>
        <Button variant="outline" onClick={() => setExpenseModal(true)}><Plus className="w-4 h-4" /> ব্যয় যোগ করুন</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="মোট আয়" value={formatCurrency(totalIncome)} icon={TrendingUp} />
        <StatCard title="মোট ব্যয়" value={formatCurrency(totalExpense)} icon={TrendingDown} />
        <StatCard title="নেট ব্যালেন্স" value={formatCurrency(netBalance)} icon={Wallet} className={netBalance >= 0 ? '' : 'border-red-200'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Tabs defaultValue="income" className="w-full">
          <TabsList><TabsTrigger value="income">আয়</TabsTrigger><TabsTrigger value="expenses">ব্যয়</TabsTrigger></TabsList>
          <TabsContent value="income">
            <Card>
              <CardContent className="pt-6">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">উৎস</th><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">তারিখ</th></tr></thead>
                  <tbody>
                    {income.map(i => (
                      <tr key={i.id} className="border-b last:border-0">
                        <td className="py-2">{i.source}</td>
                        <td className="py-2 font-medium text-green-600">{formatCurrency(i.amount)}</td>
                        <td className="py-2 text-gray-500">{new Date(i.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses">
            <Card>
              <CardContent className="pt-6">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">বিভাগ</th><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">তারিখ</th></tr></thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="py-2">{e.category}</td>
                        <td className="py-2 font-medium text-red-600">{formatCurrency(e.amount)}</td>
                        <td className="py-2 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader><CardTitle>ব্যয় বিভাজন</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal open={incomeModal} onOpenChange={setIncomeModal} title="আয় রেকর্ড করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">উৎস</label>
            <Input value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} placeholder="যেমন: দান, ফি" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পরিমাণ (৳)</label>
            <Input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">তারিখ</label>
            <Input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">বর্ণনা</label>
            <Input value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setIncomeModal(false)}>বাতিল</Button><Button onClick={addIncome}>আয় সংরক্ষণ</Button></div>
      </Modal>

      <Modal open={expenseModal} onOpenChange={setExpenseModal} title="ব্যয় রেকর্ড করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">বিভাগ</label>
            <Select options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))} value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পরিমাণ (৳)</label>
            <Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">তারিখ</label>
            <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">বর্ণনা</label>
            <Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setExpenseModal(false)}>বাতিল</Button><Button onClick={addExpense}>ব্যয় সংরক্ষণ</Button></div>
      </Modal>
    </div>
  )
}
