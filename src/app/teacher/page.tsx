'use client'

import { useEffect, useState } from 'react'
import { db, sql, queryOne } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ClipboardCheck, FileSpreadsheet, Bell } from 'lucide-react'
import type { Class, Notice } from '@/lib/types'

export default function TeacherOverview() {
  const { user } = useUser()
  const [classes, setClasses] = useState<Class[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [todayAttendance, setTodayAttendance] = useState(false)
  const [stats, setStats] = useState({ students: 0, subjects: 0 })

  useEffect(() => {
    async function load() {
      const teacherId = user?.id
      if (!teacherId) return

      const { data: classesData } = await db('classes').where('teacher_id', teacherId).select()
      setClasses(classesData || [])

      const { data: subjectsData } = await db('subjects').where('teacher_id', teacherId).select()
      const classIds = classesData?.map(c => c.id) || []

      let studentCount = 0
      if (classIds.length > 0) {
        const countData = await sql`SELECT COUNT(*) as count FROM students WHERE class_id = ANY(${classIds}) AND status = 'active'`
        studentCount = Number(countData.data?.[0]?.count || 0)
      }

      setStats({ students: studentCount || 0, subjects: subjectsData?.length || 0 })

      const today = new Date().toISOString().split('T')[0]
      const attData = await sql`
        SELECT id FROM attendance 
        WHERE class_id = ANY(${classIds}) 
        AND date = ${today} 
        LIMIT 1
      `
      setTodayAttendance((attData.data?.length || 0) > 0)

      const noticeData = await sql`
        SELECT * FROM notices 
        WHERE target_role IN ('all', 'teachers') 
        ORDER BY created_at DESC 
        LIMIT 5
      `
      setNotices(noticeData.data || [])
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <PageHeader title="শিক্ষক ড্যাশবোর্ড" description="আপনার ড্যাশবোর্ডে স্বাগতম" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="আমার শ্রেণি" value={classes.length} icon={BookOpen} />
        <StatCard title="আমার বিষয়" value={stats.subjects} icon={FileSpreadsheet} />
        <StatCard title="মোট শিক্ষার্থী" value={stats.students} icon={BookOpen} />
        <StatCard
          title="আজকের উপস্থিতি"
          value={todayAttendance ? 'জমা দেওয়া হয়েছে' : 'বাকি'}
          icon={ClipboardCheck}
          description={todayAttendance ? 'উপস্থিতি চিহ্নিত করা হয়েছে' : 'এখনও জমা দেওয়া হয়নি'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>আজকের শ্রেণি</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classes.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{c.name} {c.section ? `- ${c.section}` : ''}</span>
                  <Badge>{c.academic_year}</Badge>
                </div>
              ))}
              {classes.length === 0 && <p className="text-center text-gray-400 py-4">কোনো শ্রেণি বরাদ্দ নেই</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>সাম্প্রতিক নোটিশ</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm">{n.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {notices.length === 0 && <p className="text-center text-gray-400 py-4">কোনো নোটিশ নেই</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
