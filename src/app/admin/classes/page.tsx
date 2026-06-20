'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Class, Profile } from '@/lib/types'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', section: '', teacher_id: '', academic_year: '2026' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [cRes, tRes] = await Promise.all([
      sql`SELECT c.*, p.full_name as teacher_name FROM classes c LEFT JOIN profiles p ON p.id = c.teacher_id ORDER BY c.name`,
      db('profiles').where('role', 'teacher').select(),
    ])
    setClasses((cRes.data || []) as any[])
    setTeachers(tRes.data || [])
  }

  async function handleSubmit() {
    const { error } = await insert('classes', form)
    if (error) { toast.error(error.message); return }
    toast.success('শ্রেণি তৈরি করা হয়েছে')
    setModalOpen(false)
    setForm({ name: '', section: '', teacher_id: '', academic_year: '2026' })
    loadData()
  }

  const columns = [
    { key: 'name', header: 'শ্রেণির নাম', sortable: true },
    { key: 'section', header: 'শাখা', sortable: true },
    { key: 'academic_year', header: 'শিক্ষাবর্ষ' },
    { key: 'teacher_id', header: 'প্রধান শিক্ষক', render: (c: any) => c.teacher_name || 'নিযুক্ত করা হয়নি' },
    { key: 'actions', header: '', render: (c: any) => (
      <Button variant="ghost" size="sm"><Users className="w-4 h-4" /> শিক্ষার্থী দেখুন</Button>
    )},
  ]

  return (
    <div>
      <PageHeader title="শ্রেণি ব্যবস্থাপনা" description="শ্রেণি তৈরি ও পরিচালনা করুন">
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> শ্রেণি যোগ করুন</Button>
      </PageHeader>
      <DataTable columns={columns} data={classes} />
      <Modal open={modalOpen} onOpenChange={setModalOpen} title="নতুন শ্রেণি যোগ করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">শ্রেণির নাম</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="যেমন: প্রথম শ্রেণি" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">শাখা</label>
            <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="যেমন: ক" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">প্রধান শিক্ষক</label>
            <Select options={teachers.map(t => ({ value: t.id, label: t.full_name }))} placeholder="শিক্ষক নির্বাচন" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">শিক্ষাবর্ষ</label>
            <Input value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} placeholder="২০২৬" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button>
          <Button onClick={handleSubmit}>শ্রেণি তৈরি করুন</Button>
        </div>
      </Modal>
    </div>
  )
}
