'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert, update } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'
import type { Class, Subject, Student } from '@/lib/types'

export default function TeacherGradesPage() {
  const { user } = useUser()
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [examType, setExamType] = useState('Monthly Test')
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])

  useEffect(() => {
    async function load() {
      const teacherId = user?.id
      if (!teacherId) return
      const [cRes, sRes] = await Promise.all([
        db('classes').where('teacher_id', teacherId).select(),
        db('subjects').where('teacher_id', teacherId).select(),
      ])
      setClasses(cRes.data || [])
      setAllSubjects(sRes.data || [])
    }
    load()
  }, [user])

  useEffect(() => {
    if (!selectedClass) return
    db('students').where('class_id', selectedClass).where('status', 'active').select().then(r => setStudents(r.data || []))
    const filteredSubjects = (allSubjects || []).filter(s => s.class_id === selectedClass)
    setSubjects(filteredSubjects)
  }, [selectedClass, allSubjects])

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
    toast.success('গ্রেড সংরক্ষিত হয়েছে')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="গ্রেড দিন" description="আপনার বিষয়ের নম্বর রেকর্ড করুন" />

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2"><label className="text-sm font-medium">শ্রেণি</label><Select options={classes.map(c => ({ value: c.id, label: c.name }))} placeholder="নির্বাচন করুন" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-44" /></div>
        <div className="space-y-2"><label className="text-sm font-medium">বিষয়</label><Select options={subjects.map(s => ({ value: s.id, label: s.name }))} placeholder="নির্বাচন করুন" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-44" /></div>
        <div className="space-y-2"><label className="text-sm font-medium">পরীক্ষা</label><Select options={[{ value: 'Monthly Test', label: 'মাসিক পরীক্ষা' }, { value: 'Half-yearly', label: 'বার্ষিক পরীক্ষা' }, { value: 'Annual', label: 'সমাপনী পরীক্ষা' }]} value={examType} onChange={(e) => setExamType(e.target.value)} className="w-44" /></div>
      </div>

      {selectedSubject && (
        <Card>
          <CardHeader><CardTitle>নম্বর - {examType}</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">শিক্ষার্থী</th><th className="pb-2 font-medium">নম্বর (১০০)</th><th className="pb-2 font-medium"></th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2"><Input type="number" value={grades[s.id] || ''} onChange={(e) => setGrades({ ...grades, [s.id]: e.target.value })} className="w-24" min={0} max={100} /></td>
                            <td className="py-2"><Button size="sm" onClick={() => saveGrade(s.id)}>সংরক্ষণ</Button></td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">কোনো শিক্ষার্থী নেই</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
