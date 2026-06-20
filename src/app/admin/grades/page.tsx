'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert, update } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { Plus, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Class, Subject, Student } from '@/lib/types'

export default function GradesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [examType, setExamType] = useState('Half-yearly')
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    db('classes').order('name').select().then(r => setClasses(r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    db('subjects').where('class_id', selectedClass).select().then(r => setSubjects(r.data || []))
    db('students').where('class_id', selectedClass).where('status', 'active').select().then(r => setStudents(r.data || []))
  }, [selectedClass])

  useEffect(() => {
    if (!selectedSubject || !selectedClass) return
    db('grades').where('subject_id', selectedSubject).where('exam_type', examType).select().then(r => {
      const gMap: Record<string, string> = {}
      r.data?.forEach(g => { gMap[g.student_id] = String(g.marks_obtained) })
      setGrades(gMap)
    })
  }, [selectedSubject, examType, selectedClass])

  async function saveGrade(studentId: string) {
    const marks = Number(grades[studentId])
    if (!marks) return
    const existing = await db('grades').where('student_id', studentId).where('subject_id', selectedSubject).where('exam_type', examType).maybeSingle()
    if (existing.data) {
      await update('grades', { marks_obtained: marks }, 'id', existing.data.id)
    } else {
      await insert('grades', { student_id: studentId, subject_id: selectedSubject, exam_type: examType, marks_obtained: marks, total_marks: 100 })
    }
    toast.success('গ্রেড সংরক্ষণ করা হয়েছে')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="গ্রেড ও পরীক্ষা" description="শিক্ষার্থীর গ্রেড ও পরীক্ষার ফলাফল পরিচালনা করুন">
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> পরীক্ষা তৈরি করুন</Button>
        <Button variant="outline"><Download className="w-4 h-4" /> এক্সপোর্ট</Button>
      </PageHeader>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">শ্রেণি</label>
          <Select options={classes.map(c => ({ value: c.id, label: c.name }))} placeholder="শ্রেণি নির্বাচন" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-44" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">বিষয়</label>
          <Select options={subjects.map(s => ({ value: s.id, label: s.name }))} placeholder="বিষয় নির্বাচন" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-44" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">পরীক্ষার ধরন</label>
          <Select options={[{ value: 'Monthly Test', label: 'মাসিক পরীক্ষা' }, { value: 'Half-yearly', label: 'অর্ধবার্ষিক' }, { value: 'Annual', label: 'বার্ষিক' }]} value={examType} onChange={(e) => setExamType(e.target.value)} className="w-44" />
        </div>
      </div>

      {selectedSubject && (
        <Card>
          <CardHeader><CardTitle>নম্বর দিন - {examType}</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">শিক্ষার্থী</th><th className="pb-2 font-medium">নম্বর (১০০ এর মধ্যে)</th><th className="pb-2 font-medium"></th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={grades[s.id] || ''}
                        onChange={(e) => setGrades({ ...grades, [s.id]: e.target.value })}
                        className="w-24"
                        min={0}
                        max={100}
                      />
                    </td>
                    <td className="py-2">
                      <Button size="sm" onClick={() => saveGrade(s.id)}>সংরক্ষণ</Button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">কোনো শিক্ষার্থী নেই</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="নতুন পরীক্ষা তৈরি করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">পরীক্ষার ধরন</label>
            <Select options={[{ value: 'Monthly Test', label: 'মাসিক পরীক্ষা' }, { value: 'Half-yearly', label: 'অর্ধবার্ষিক' }, { value: 'Annual', label: 'বার্ষিক' }]} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">শ্রেণি</label>
            <Select options={classes.map(c => ({ value: c.id, label: c.name }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button>
          <Button>পরীক্ষা তৈরি করুন</Button>
        </div>
      </Modal>
    </div>
  )
}
