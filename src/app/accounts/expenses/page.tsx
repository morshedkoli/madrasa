'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert, query } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { EXPENSE_CATEGORIES } from '@/lib/types'
import type { Expense } from '@/lib/types'

export default function ExpensesPage() {
  const { user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
  const [filter, setFilter] = useState({ category: '', startDate: '', endDate: '' })

  useEffect(() => { loadExpenses() }, [])

  async function loadExpenses() {
    let q = db('expenses')
    if (filter.category) q = q.where('category', filter.category)
    if (filter.startDate) q = q.gte('date', filter.startDate)
    if (filter.endDate) q = q.lte('date', filter.endDate)
    const { data } = await q.order('date', 'desc').select()
    setExpenses(data || [])
  }

  useEffect(() => { loadExpenses() }, [filter])

  async function addExpense() {
    const { error } = await insert('expenses', {
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      approved_by: user?.id,
    })
    if (error) { toast.error(error.message); return }
    toast.success('ব্যয় রেকর্ড করা হয়েছে')
    setModalOpen(false)
    setForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
    loadExpenses()
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const categoryTotals = EXPENSE_CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0)

  return (
    <div className="space-y-6">
      <PageHeader title="ব্যয় ব্যবস্থাপনা" description="সমস্ত ব্যয় ট্র্যাক করুন">
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> ব্যয় যোগ করুন</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>মোট ব্যয়: {formatCurrency(total)}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Select options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))} placeholder="সব বিভাগ" value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="w-44" />
              <Input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="w-40" />
              <Input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="w-40" />
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">বিভাগ</th><th className="pb-2 font-medium">বর্ণনা</th><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">তারিখ</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">{e.category}</span></td>
                    <td className="py-2 text-gray-500">{e.description}</td>
                    <td className="py-2 text-red-600 font-medium">{formatCurrency(e.amount)}</td>
                    <td className="py-2 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">কোনো ব্যয় নেই</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>বিভাগ অনুযায়ী ভাঙ্গন</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryTotals.map(ct => (
                <div key={ct.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{ct.category}</span>
                    <span className="font-medium">{formatCurrency(ct.total)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (ct.total / total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {categoryTotals.length === 0 && <p className="text-sm text-gray-400">কোনো তথ্য নেই</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="ব্যয় রেকর্ড করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">বিভাগ</label><Select options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">পরিমাণ</label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">তারিখ</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="space-y-2 col-span-2"><label className="text-sm font-medium">বর্ণনা</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button><Button onClick={addExpense}>সংরক্ষণ</Button></div>
      </Modal>
    </div>
  )
}
