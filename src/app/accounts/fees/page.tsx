'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/shared/Modal'
import { Search, Printer, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateReceiptNumber, formatCurrency } from '@/lib/utils'
import type { Student, FeeStructure, FeePayment, Class } from '@/lib/types'

export default function FeesPage() {
  const { user } = useUser()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    fee_structure_id: '', amount_paid: '', payment_method: 'cash', remarks: '',
  })

  useEffect(() => {
    Promise.all([
      db('students').where('status', 'active').order('name').select(),
      db('classes').order('name').select(),
      db('fee_structures').select(),
    ]).then(([sRes, cRes, fRes]: any) => {
      setStudents(sRes.data || [])
      setClasses(cRes.data || [])
      setFeeStructures(fRes.data || [])
    })
  }, [])

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  async function selectStudent(student: Student) {
    setSelectedStudent(student)
    const { data } = await db('fee_payments').where('student_id', student.id).order('payment_date', 'desc').select()
    setPayments(data || [])
  }

  async function recordPayment() {
    if (!selectedStudent) return

    const { error } = await insert('fee_payments', {
      student_id: selectedStudent.id,
      fee_structure_id: paymentForm.fee_structure_id,
      amount_paid: Number(paymentForm.amount_paid),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentForm.payment_method,
      receipt_number: generateReceiptNumber(),
      remarks: paymentForm.remarks,
      collected_by: user?.id || '',
    })

    if (error) { toast.error(error.message); return }
    toast.success('পেমেন্ট রেকর্ড করা হয়েছে')
    setModalOpen(false)
    setPaymentForm({ fee_structure_id: '', amount_paid: '', payment_method: 'cash', remarks: '' })
    selectStudent(selectedStudent)
  }

  const getClassFee = (student: Student) => {
    const fees = feeStructures.filter(f => f.class_id === student.class_id)
    return fees.reduce((s, f) => s + f.amount, 0)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ফি সংগ্রহ" description="ফি পেমেন্ট রেকর্ড এবং পরিচালনা করুন" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>শিক্ষার্থী অনুসন্ধান</CardTitle></CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="নামে অনুসন্ধান..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    selectedStudent?.id === s.id ? 'bg-[#1B6B3A]/10 text-[#1B6B3A]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.father_name}</div>
                </button>
              ))}
              {filteredStudents.length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {selectedStudent ? selectedStudent.name : 'একজন শিক্ষার্থী নির্বাচন করুন'}
            </CardTitle>
            {selectedStudent && (
              <Button onClick={() => setModalOpen(true)}><Receipt className="w-4 h-4" /> পেমেন্ট রেকর্ড করুন</Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">পিতার নাম:</span> <span className="font-medium">{selectedStudent.father_name}</span></div>
                  <div><span className="text-gray-500">মোট ফি:</span> <span className="font-medium">{formatCurrency(getClassFee(selectedStudent))}</span></div>
                  <div><span className="text-gray-500">মোট পরিশোধিত:</span> <span className="font-medium">{formatCurrency(payments.reduce((s, p) => s + p.amount_paid, 0))}</span></div>
                  <div><span className="text-gray-500">ব্যালেন্স:</span> <span className="font-medium">{formatCurrency(getClassFee(selectedStudent) - payments.reduce((s, p) => s + p.amount_paid, 0))}</span></div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">পেমেন্ট ইতিহাস</h4>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">পদ্ধতি</th><th className="pb-2 font-medium">তারিখ</th><th className="pb-2 font-medium">রসিদ</th></tr></thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 font-medium">{formatCurrency(p.amount_paid)}</td>
                          <td className="py-2 capitalize">{p.payment_method}</td>
                          <td className="py-2 text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td className="py-2 text-xs text-gray-400">{p.receipt_number}</td>
                        </tr>
                      ))}
                      {payments.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">কোনো পেমেন্ট নেই</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-12">ফি বিবরণ দেখতে একজন শিক্ষার্থী অনুসন্ধান এবং নির্বাচন করুন</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="পেমেন্ট রেকর্ড করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ফি ধরন</label>
            <Select
              options={feeStructures.filter(f => f.class_id === selectedStudent?.class_id).map(f => ({ value: f.id, label: `${f.fee_type} (${formatCurrency(f.amount)})` }))}
              placeholder="Select fee type"
              value={paymentForm.fee_structure_id}
              onChange={(e) => setPaymentForm({ ...paymentForm, fee_structure_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পরিমাণ (৳)</label>
            <Input type="number" value={paymentForm.amount_paid} onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পেমেন্ট পদ্ধতি</label>
            <Select
              options={[{ value: 'cash', label: 'নগদ' }, { value: 'bank', label: 'ব্যাংক' }, { value: 'bKash', label: 'bKash' }]}
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">মন্তব্য</label>
            <Input value={paymentForm.remarks} onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button>
          <Button onClick={recordPayment}>পেমেন্ট রেকর্ড করুন</Button>
        </div>
      </Modal>
    </div>
  )
}
