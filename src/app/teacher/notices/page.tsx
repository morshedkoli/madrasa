'use client'

import { useEffect, useState } from 'react'
import { db, sql } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import type { Notice } from '@/lib/types'

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    async function load() {
      const result = await sql`SELECT * FROM notices WHERE target_role IN ('all', 'teachers') ORDER BY created_at DESC`
      setNotices(result.data || [])
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader title="নোটিশ" description="প্রশাসন থেকে নোটিশ দেখুন" />

      <div className="space-y-4">
        {notices.map(n => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-[#C9A84C] mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    <Badge variant={n.target_role === 'all' ? 'default' : 'secondary'}>{n.target_role}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {notices.length === 0 && <p className="text-center text-gray-400 py-8">কোনো নোটিশ নেই</p>}
      </div>
    </div>
  )
}
