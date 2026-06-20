'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/shared/Modal'
import { DataTable } from '@/components/shared/DataTable'
import { Plus, Download, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import type { FeeStructure, Class } from '@/lib/types'

export default function FeesPage() {
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ class_id: '', fee_type: '', amount: '', academic_year: '2026' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const feeStructuresRes = await sql`SELECT fs.*, c.name as class_name FROM fee_structures fs JOIN classes c ON c.id = fs.class_id ORDER BY fs.fee_type`
    const { data: classes } = await db('classes').order('name').select()
    const paymentsRes = await sql`SELECT fp.*, s.name as student_name, fs.fee_type FROM fee_payments fp JOIN students s ON s.id = fp.student_id LEFT JOIN fee_structures fs ON fs.id = fp.fee_structure_id ORDER BY fp.payment_date DESC LIMIT 20`
    setFeeStructures(feeStructuresRes.data || [])
    setClasses(classes || [])
    setPayments(paymentsRes.data || [])
  }

  async function createFeeStructure() {
    const { error } = await insert('fee_structures', { class_id: form.class_id, fee_type: form.fee_type, amount: Number(form.amount), academic_year: form.academic_year })
    if (error) { toast.error(error.message); return }
    toast.success('ফি কাঠামো তৈরি করা হয়েছে')
    setModalOpen(false)
    setForm({ class_id: '', fee_type: '', amount: '', academic_year: '2026' })
    loadData()
  }

  const columns = [
    { key: 'class_id', header: 'শ্রেণি', render: (f: any) => f.class_name || 'N/A' },
    { key: 'fee_type', header: 'ফি ধরন', sortable: true },
    { key: 'amount', header: 'পরিমাণ', render: (f: FeeStructure) => formatCurrency(f.amount) },
    { key: 'academic_year', header: 'বছর' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="ফি ব্যবস্থাপনা" description="ফি কাঠামো ও পেমেন্ট পরিচালনা করুন">
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> ফি কাঠামো যোগ করুন</Button>
        <Button variant="outline"><Download className="w-4 h-4" /> এক্সপোর্ট</Button>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle>ফি কাঠামো</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={feeStructures} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>সাম্প্রতিক পেমেন্ট</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">শিক্ষার্থী</th><th className="pb-2 font-medium">ফি ধরন</th><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">পদ্ধতি</th><th className="pb-2 font-medium">তারিখ</th><th className="pb-2 font-medium">রসিদ</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.student_name}</td>
                  <td className="py-2">{p.fee_type}</td>
                  <td className="py-2 font-medium">{formatCurrency(p.amount_paid)}</td>
                  <td className="py-2"><Badge variant="secondary">{p.payment_method}</Badge></td>
                  <td className="py-2 text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="py-2">
                    <Button variant="ghost" size="sm"><Receipt className="w-3 h-3" /> {p.receipt_number}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="ফি কাঠামো তৈরি করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">শ্রেণি</label>
            <Select options={classes.map(c => ({ value: c.id, label: c.name }))} placeholder="শ্রেণি নির্বাচন" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ফি ধরন</label>
            <Select options={[{ value: 'Tuition', label: 'টিউশন' }, { value: 'Admission', label: 'ভর্তি' }, { value: 'Exam', label: 'পরীক্ষা' }, { value: 'Library', label: 'লাইব্রেরি' }, { value: 'Sports', label: 'ক্রীড়া' }, { value: 'Other', label: 'অন্যান্য' }]} value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পরিমাণ (৳)</label>
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">শিক্ষাবর্ষ</label>
            <Input value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button>
          <Button onClick={createFeeStructure}>তৈরি করুন</Button>
        </div>
      </Modal>
    </div>
  )
}
