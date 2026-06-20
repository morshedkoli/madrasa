'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db, sql, queryOne } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import type { Student, Attendance, Grade, FeePayment } from '@/lib/types'

export default function StudentProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])

  useEffect(() => {
    async function load() {
      const { data: s } = await queryOne`SELECT s.*, c.name as class_name FROM students s JOIN classes c ON c.id = s.class_id WHERE s.id = ${id}`
      setStudent(s)

      if (s) {
        const [attRes, gradeRes, payRes] = await Promise.all([
          db('attendance').where('student_id', String(id)).order('date', 'desc').select(),
          sql`SELECT g.*, sub.name as subject_name FROM grades g JOIN subjects sub ON sub.id = g.subject_id WHERE g.student_id = ${id} ORDER BY g.created_at DESC`,
          sql`SELECT fp.*, fs.fee_type, fs.amount as fee_amount FROM fee_payments fp LEFT JOIN fee_structures fs ON fs.id = fp.fee_structure_id WHERE fp.student_id = ${id} ORDER BY fp.payment_date DESC`,
        ])
        setAttendance(attRes.data || [])
        setGrades((gradeRes.data || []) as any[])
        setPayments((payRes.data || []) as any[])
      }
    }
    load()
  }, [id])

  if (!student) return <div className="animate-pulse">লোড হচ্ছে...</div>

  const presentCount = attendance.filter(a => a.status === 'present').length
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader title={student.name}>
        <Button variant="outline" onClick={() => router.push('/admin/students')}><ArrowLeft className="w-4 h-4" /> পিছনে</Button>
        <Button variant="outline"><Download className="w-4 h-4" /> আইডি কার্ড</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>ব্যক্তিগত তথ্য</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">পিতা:</span><span className="font-medium">{student.father_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">মাতা:</span><span className="font-medium">{student.mother_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">জন্ম তারিখ:</span><span className="font-medium">{new Date(student.dob).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">লিঙ্গ:</span><span className="font-medium capitalize">{student.gender}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">স্ট্যাটাস:</span><Badge variant={student.status === 'active' ? 'success' : 'destructive'}>{student.status}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>উপস্থিতির সারাংশ</CardTitle></CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-[#1B6B3A]">{attendancePct}%</div>
            <p className="text-sm text-gray-500 mt-1">সামগ্রিক উপস্থিতি</p>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span>উপস্থিত:</span><span className="text-green-600 font-medium">{presentCount}</span></div>
              <div className="flex justify-between"><span>অনুপস্থিত:</span><span className="text-red-500 font-medium">{attendance.filter(a => a.status === 'absent').length}</span></div>
              <div className="flex justify-between"><span>বিলম্বে:</span><span className="text-yellow-500 font-medium">{attendance.filter(a => a.status === 'late').length}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>ফি সারাংশ</CardTitle></CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-[#C9A84C]">৳{payments.reduce((s, p) => s + p.amount_paid, 0)}</div>
            <p className="text-sm text-gray-500 mt-1">মোট পরিশোধিত</p>
            <div className="mt-4 text-sm text-gray-500">{payments.length} টি পেমেন্ট রেকর্ড করা হয়েছে</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">উপস্থিতি</TabsTrigger>
          <TabsTrigger value="grades">গ্রেড</TabsTrigger>
          <TabsTrigger value="fees">ফি ইতিহাস</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle>উপস্থিতির রেকর্ড</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">তারিখ</th><th className="pb-2 font-medium">স্ট্যাটাস</th></tr></thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="py-2"><Badge variant={a.status === 'present' ? 'success' : a.status === 'late' ? 'warning' : 'destructive'}>{a.status === 'present' ? 'উপস্থিত' : a.status === 'absent' ? 'অনুপস্থিত' : 'বিলম্বে'}</Badge></td>
                    </tr>
                  ))}
                  {attendance.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-gray-400">কোনো রেকর্ড নেই</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader><CardTitle>গ্রেডের রেকর্ড</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">বিষয়</th><th className="pb-2 font-medium">পরীক্ষা</th><th className="pb-2 font-medium">নম্বর</th><th className="pb-2 font-medium">মন্তব্য</th></tr></thead>
                <tbody>
                  {grades.map(g => (
                    <tr key={g.id} className="border-b last:border-0">
                      <td className="py-2">{(g as any).subject_name || 'N/A'}</td>
                      <td className="py-2">{g.exam_type}</td>
                      <td className="py-2">{g.marks_obtained}/{g.total_marks}</td>
                      <td className="py-2 text-gray-500">{g.remarks || '-'}</td>
                    </tr>
                  ))}
                  {grades.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">কোনো গ্রেড রেকর্ড করা হয়নি</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader><CardTitle>পেমেন্ট ইতিহাস</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">ফি ধরন</th><th className="pb-2 font-medium">পরিমাণ</th><th className="pb-2 font-medium">পদ্ধতি</th><th className="pb-2 font-medium">তারিখ</th><th className="pb-2 font-medium">রসিদ</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">{(p as any).fee_type || 'N/A'}</td>
                      <td className="py-2 font-medium">৳{p.amount_paid}</td>
                      <td className="py-2 capitalize">{p.payment_method}</td>
                      <td className="py-2 text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td className="py-2 text-xs text-gray-400">{p.receipt_number}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-400">কোনো পেমেন্ট রেকর্ড করা হয়নি</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
