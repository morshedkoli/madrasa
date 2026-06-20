'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { Users, BookOpen } from 'lucide-react'
import type { Class, Subject, Student } from '@/lib/types'

export default function TeacherClassesPage() {
  const { user } = useUser()
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    async function load() {
      const teacherId = user?.id
      if (!teacherId) return

      const [cRes, sRes] = await Promise.all([
        db('classes').where('teacher_id', teacherId).select(),
        sql`SELECT sub.*, c.name as class_name FROM subjects sub JOIN classes c ON c.id = sub.class_id WHERE sub.teacher_id = ${teacherId}`,
      ])
      setClasses(cRes.data || [])
      setSubjects((sRes.data || []) as any[])
    }
    load()
  }, [user])

  useEffect(() => {
    if (!selectedClass) return
    db('students').where('class_id', selectedClass).where('status', 'active').select().then(r => setStudents(r.data || []))
  }, [selectedClass])

  const subjectColumns = [
    { key: 'name', header: 'বিষয়', sortable: true },
    { key: 'class_id', header: 'শ্রেণি', render: (s: any) => s.class_name || 'N/A' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="আমার শ্রেণি" description="আপনার বরাদ্দকৃত শ্রেণি এবং বিষয় দেখুন" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>বরাদ্দকৃত শ্রেণি</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classes.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClass(c.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClass === c.id ? 'border-[#1B6B3A] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      {c.section && <span className="text-gray-500 ml-1">- {c.section}</span>}
                    </div>
                    <Badge>{c.academic_year}</Badge>
                  </div>
                </div>
              ))}
              {classes.length === 0 && <p className="text-center text-gray-400 py-4">কোনো শ্রেণি বরাদ্দ নেই</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>বরাদ্দকৃত বিষয়</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={subjectColumns} data={subjects} searchable={false} />
          </CardContent>
        </Card>
      </div>

      {selectedClass && (
        <Card>
          <CardHeader><CardTitle>{classes.find(c => c.id === selectedClass)?.name} - শিক্ষার্থী</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">নাম</th><th className="pb-2 font-medium">পিতার নাম</th><th className="pb-2 font-medium">ফোন</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">{s.father_name}</td>
                    <td className="py-2">{s.phone || '-'}</td>
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
