'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import type { Class, Student } from '@/lib/types'

export default function TeacherStudentsPage() {
  const { user } = useUser()
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      const teacherId = user?.id
      const { data: classes } = await db('classes').where('teacher_id', teacherId).select('id')
      const classIds = classes?.map(c => c.id) || []
      if (classIds.length === 0) { setStudents([]); return }

      const result = await sql`
        SELECT s.*, c.name as class_name 
        FROM students s 
        JOIN classes c ON c.id = s.class_id 
        WHERE s.class_id = ANY(${classIds}) 
        AND s.status = 'active' 
        ORDER BY s.name
      `
      setStudents(result.data || [])
    }
    load()
  }, [user])

  const columns = [
    { key: 'name', header: 'নাম', sortable: true },
    { key: 'father_name', header: 'পিতার নাম', sortable: true },
    { key: 'class_id', header: 'শ্রেণি', render: (s: any) => s.class_name || 'N/A' },
    { key: 'phone', header: 'ফোন' },
    { key: 'status', header: 'স্ট্যাটাস', render: (s: Student) => <Badge variant="success">{s.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="শিক্ষার্থী" description="আপনার শ্রেণির শিক্ষার্থী দেখুন (শুধু-পঠনযোগ্য)" />
      <DataTable columns={columns} data={students} searchKeys={['name', 'father_name', 'phone']} />
    </div>
  )
}
