'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert, remove as dbRemove } from '@/lib/db'
import { useUser } from '@/hooks/useUser'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/shared/Modal'
import { Plus, Bell, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Notice } from '@/lib/types'

export default function NoticesPage() {
  const { user } = useUser()
  const [notices, setNotices] = useState<Notice[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await db('notices').order('created_at', 'desc').select()
    setNotices(data || [])
  }

  async function handleSubmit() {
    const { error } = await insert('notices', {
      title: form.title,
      content: form.content,
      target_role: form.target_role,
      created_by: user?.id,
    })
    if (error) { toast.error(error.message); return }
    toast.success('নোটিশ পোস্ট করা হয়েছে')
    setModalOpen(false)
    setForm({ title: '', content: '', target_role: 'all' })
    loadData()
  }

  async function deleteNotice(id: string) {
    const { error } = await dbRemove('notices', 'id', id)
    if (error) { toast.error(error.message); return }
    toast.success('নোটিশ মুছে ফেলা হয়েছে')
    loadData()
  }

  return (
    <div>
      <PageHeader title="নোটিশ" description="নোটিশ পোস্ট ও পরিচালনা করুন">
        <Button onClick={() => setModalOpen(true)}><Bell className="w-4 h-4" /> নোটিশ পাঠান</Button>
      </PageHeader>

      <div className="space-y-4">
        {notices.map(n => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    <Badge variant={n.target_role === 'all' ? 'default' : 'secondary'}>{n.target_role}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{n.content}</p>
                  <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => deleteNotice(n.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
        {notices.length === 0 && <p className="text-center text-gray-400 py-8">এখনো কোনো নোটিশ পোস্ট করা হয়নি</p>}
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="নোটিশ পাঠান">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">শিরোনাম</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">বিষয়বস্তু</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1B6B3A]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">লক্ষ্য দর্শক</label>
            <Select options={[{ value: 'all', label: 'সব' }, { value: 'teachers', label: 'শুধুমাত্র শিক্ষক' }, { value: 'accountants', label: 'শুধুমাত্র হিসাবরক্ষক' }]} value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button><Button onClick={handleSubmit}>নোটিশ পাঠান</Button></div>
      </Modal>
    </div>
  )
}
