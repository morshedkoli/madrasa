'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert } from '@/lib/db'
import { hash } from 'bcryptjs'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/lib/types'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await db('profiles').where('role', 'teacher').select()
    setTeachers(data || [])
  }

  async function handleSubmit() {
    const hashedPassword = await hash(form.password, 10)
    const { error } = await insert('profiles', {
      full_name: form.full_name, email: form.email, password_hash: hashedPassword, role: 'teacher', phone: form.phone,
    })
    if (error) { toast.error(error.message); return }
    toast.success('শিক্ষক যোগ করা হয়েছে')
    setModalOpen(false)
    setForm({ full_name: '', email: '', password: '', phone: '' })
    loadData()
  }

  const columns = [
    { key: 'full_name', header: 'নাম', sortable: true },
    { key: 'phone', header: 'ফোন' },
    { key: 'created_at', header: 'যোগদান', render: (t: Profile) => new Date(t.created_at).toLocaleDateString() },
  ]

  return (
    <div>
      <PageHeader title="শিক্ষক ব্যবস্থাপনা" description="শিক্ষকের প্রোফাইল পরিচালনা করুন">
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> শিক্ষক যোগ করুন</Button>
      </PageHeader>
      <DataTable columns={columns} data={teachers} searchKeys={['full_name', 'phone']} />
      <Modal open={modalOpen} onOpenChange={setModalOpen} title="শিক্ষক যোগ করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">পূর্ণ নাম</label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ইমেইল</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পাসওয়ার্ড</label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ফোন</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button>
          <Button onClick={handleSubmit}>শিক্ষক যোগ করুন</Button>
        </div>
      </Modal>
    </div>
  )
}
