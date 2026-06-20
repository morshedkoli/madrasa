'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert, query } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/shared/Modal'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import type { Income } from '@/lib/types'

export default function IncomePage() {
  const { user } = useUser()
  const [income, setIncome] = useState<Income[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ source: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
  const [filter, setFilter] = useState({ source: '', startDate: '', endDate: '' })

  useEffect(() => { loadIncome() }, [])

  async function loadIncome() {
    let q = db('income')
    if (filter.source) q = q.ilike('source', `%${filter.source}%`)
    if (filter.startDate) q = q.gte('date', filter.startDate)
    if (filter.endDate) q = q.lte('date', filter.endDate)
    const { data } = await q.order('date', 'desc').select()
    setIncome(data || [])
  }

  useEffect(() => { loadIncome() }, [filter])

  async function addIncome() {
    const { error } = await insert('income', {
      source: form.source,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      received_by: user?.id,
    })
    if (error) { toast.error(error.message); return }
    toast.success('আয় যোগ করা হয়েছে')
    setModalOpen(false)
    setForm({ source: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] })
    loadIncome()
  }

  const total = income.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="আয় ব্যবস্থাপনা" description="সমস্ত আয়ের উৎস ট্র্যাক করুন">
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> আয় যোগ করুন</Button>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>মোট আয়: {formatCurrency(total)}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Input placeholder="উৎস অনুসারে ফিল্টার" value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })} className="w-44" />
            <Input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="w-40" />
            <Input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="w-40" />
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">উৎস</th><th className="pb-2 font-medium">বর্ণনা</th><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">তারিখ</th></tr></thead>
            <tbody>
              {income.map(i => (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{i.source}</td>
                  <td className="py-2 text-gray-500">{i.description}</td>
                  <td className="py-2 text-green-600 font-medium">{formatCurrency(i.amount)}</td>
                  <td className="py-2 text-gray-500">{new Date(i.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {income.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">কোনো আয় রেকর্ড করা হয়নি</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="আয় যোগ করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">উৎস</label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="যেমন: দান" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">পরিমাণ</label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">তারিখ</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">বর্ণনা</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button><Button onClick={addIncome}>সংরক্ষণ</Button></div>
      </Modal>
    </div>
  )
}
