'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'
import type { Class, Student } from '@/lib/types'

export default function TeacherAttendancePage() {
  const { user } = useUser()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [date] = useState(new Date().toISOString().split('T')[0])
  const [saved, setSaved] = useState(false)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    async function load() {
      const teacherId = user?.id
      if (!teacherId) return
      const { data } = await db('classes').where('teacher_id', teacherId).select()
      setClasses(data || [])
    }
    load()
  }, [user])

  useEffect(() => {
    if (!selectedClass) return
    db('students').where('class_id', selectedClass).where('status', 'active').select().then(async (sRes) => {
      setStudents(sRes.data || [])
      const { data: attData } = await db('attendance').where('class_id', selectedClass).where('date', date).select()
      const attMap: Record<string, string> = {}
      attData?.forEach(a => { attMap[a.student_id] = a.status })
      setAttendance(attMap)
      if (Object.keys(attMap).length > 0) setLocked(true)
    })
  }, [selectedClass, date])

  async function saveAttendance() {
    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id, class_id: selectedClass, date, status,
    }))
    await sql`DELETE FROM attendance WHERE class_id = ${selectedClass} AND date = ${date}`
    for (const rec of records) {
      await sql`INSERT INTO attendance (student_id, class_id, date, status) VALUES (${rec.student_id}, ${rec.class_id}, ${rec.date}, ${rec.status})`
    }
    toast.success('উপস্থিতি সংরক্ষিত হয়েছে')
    setSaved(true)
    setLocked(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="উপস্থিতি চিহ্নিত করুন" description="দৈনিক শিক্ষার্থীর উপস্থিতি রেকর্ড করুন">
        <div className="flex gap-2">
          {locked && <Badge variant="warning">লক করা হয়েছে</Badge>}
          {saved && <Badge variant="success">সংরক্ষিত</Badge>}
        </div>
      </PageHeader>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">শ্রেণি</label>
          <Select options={classes.map(c => ({ value: c.id, label: c.name }))} placeholder="শ্রেণি নির্বাচন করুন" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-48" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">তারিখ</label>
          <input type="date" defaultValue={date} className="flex h-9 w-48 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" disabled />
        </div>
      </div>

      {selectedClass && (
        <Card>
          <CardHeader><CardTitle>শিক্ষার্থী</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{s.name}</span>
                  <div className="flex gap-2">
                    {['present', 'absent', 'late'].map(status => (
                      <button
                        key={status}
                        onClick={() => !locked && setAttendance({ ...attendance, [s.id]: status })}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          attendance[s.id] === status
                            ? status === 'present' ? 'bg-green-100 text-green-700 border border-green-300'
                              : status === 'absent' ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                        disabled={locked}
                      >
                        {status === 'present' ? 'উপস্থিত' : status === 'absent' ? 'অনুপস্থিত' : 'বিলম্বে'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {students.length === 0 && <p className="text-center text-gray-400 py-4">এই শ্রেণিতে কোনো শিক্ষার্থী নেই</p>}
            </div>
            {students.length > 0 && !locked && (
              <Button onClick={saveAttendance} className="mt-4">উপস্থিতি সংরক্ষণ</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
