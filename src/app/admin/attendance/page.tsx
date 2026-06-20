'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Download, AlertTriangle } from 'lucide-react'
import type { Class, Student, Attendance } from '@/lib/types'

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    db('classes').order('name').select().then(r => setClasses(r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    db('students').where('class_id', selectedClass).where('status', 'active').select().then(async (sRes) => {
      setStudents(sRes.data || [])
      const { data: attData } = await db('attendance')
        .where('class_id', selectedClass)
        .where('date', selectedDate)
        .select()
      const attMap: Record<string, string> = {}
      attData?.forEach(a => { attMap[a.student_id] = a.status })
      setAttendance(attMap)
    })
  }, [selectedClass, selectedDate])

  async function saveAttendance() {
    try {
      await sql`DELETE FROM attendance WHERE class_id = ${selectedClass} AND date = ${selectedDate}`
      for (const [student_id, status] of Object.entries(attendance)) {
        await sql`INSERT INTO attendance (student_id, class_id, date, status) VALUES (${student_id}, ${selectedClass}, ${selectedDate}, ${status})`
      }
    } catch (err: any) {
      alert(err.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const lowAttendance = students.filter(s => {
    // Simplified: in production query actual attendance %
    return false
  })

  return (
    <div className="space-y-6">
      <PageHeader title="উপস্থিতি ব্যবস্থাপনা" description="শ্রেণির উপস্থিতি দেখুন ও পরিচালনা করুন">
        <Button variant="outline"><Download className="w-4 h-4" /> প্রতিবেদন এক্সপোর্ট</Button>
      </PageHeader>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">শ্রেণি</label>
          <Select options={classes.map(c => ({ value: c.id, label: c.name }))} placeholder="শ্রেণি নির্বাচন" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-48" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">তারিখ</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="flex h-9 w-48 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm" />
        </div>
      </div>

      {lowAttendance.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{lowAttendance.length} শিক্ষার্থীর উপস্থিতি ৭৫% এর কম</p>
          </CardContent>
        </Card>
      )}

      {selectedClass && (
        <Card>
          <CardHeader><CardTitle>উপস্থিতি চিহ্নিত করুন</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{s.name}</span>
                  <div className="flex gap-2">
                    {['present', 'absent', 'late'].map(status => (
                      <button
                        key={status}
                        onClick={() => setAttendance({ ...attendance, [s.id]: status })}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          attendance[s.id] === status
                            ? status === 'present' ? 'bg-green-100 text-green-700 border border-green-300'
                              : status === 'absent' ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {status === 'present' ? 'উপস্থিত' : status === 'absent' ? 'অনুপস্থিত' : 'বিলম্বে'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {students.length === 0 && <p className="text-center text-gray-400 py-4">এই শ্রেণিতে কোনো শিক্ষার্থী নেই</p>}
            </div>
            {students.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                <Button onClick={saveAttendance}>উপস্থিতি সংরক্ষণ</Button>
                {saved && <Badge variant="success">সফলভাবে সংরক্ষিত!</Badge>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
