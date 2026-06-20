'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db, sql, insert, update } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Student, Class } from '@/lib/types'

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [form, setForm] = useState({
    name: '', father_name: '', mother_name: '', dob: '', gender: 'male',
    class_id: '', phone: '', address: '', photo_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [studentsRes, classesRes] = await Promise.all([
      sql`SELECT s.*, c.name as class_name FROM students s JOIN classes c ON c.id = s.class_id ORDER BY s.name`,
      db('classes').order('name').select(),
    ])
    setStudents((studentsRes.data || []) as any[])
    setClasses(classesRes.data || [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (editingStudent) {
      const { error } = await update('students', form, 'id', editingStudent.id)
      if (error) { toast.error(error.message); return }
      toast.success('শিক্ষার্থী হালনাগাদ করা হয়েছে')
    } else {
      const { error } = await insert('students', { ...form, enrollment_date: new Date().toISOString().split('T')[0], status: 'active' })
      if (error) { toast.error(error.message); return }
      toast.success('শিক্ষার্থী যোগ করা হয়েছে')
    }
    setModalOpen(false)
    setEditingStudent(null)
    setForm({ name: '', father_name: '', mother_name: '', dob: '', gender: 'male', class_id: '', phone: '', address: '', photo_url: '' })
    loadData()
  }

  const columns = [
    { key: 'name', header: 'নাম', sortable: true },
    { key: 'father_name', header: 'পিতার নাম', sortable: true },
    { key: 'mother_name', header: 'মাতার নাম', sortable: true },
    {
      key: 'class_id', header: 'শ্রেণি', sortable: true,
      render: (s: any) => s.class_name || 'N/A',
    },
    { key: 'phone', header: 'ফোন' },
    {
      key: 'status', header: 'স্ট্যাটাস',
      render: (s: Student) => (
        <Badge variant={s.status === 'active' ? 'success' : 'destructive'}>
          {s.status}
        </Badge>
      ),
    },
    {
      key: 'actions', header: 'কর্ম',
      render: (s: Student) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/students/${s.id}`)}>দেখুন</Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingStudent(s); setForm({ name: s.name, father_name: s.father_name, mother_name: s.mother_name, dob: s.dob, gender: s.gender, class_id: s.class_id, phone: s.phone || '', address: s.address || '', photo_url: s.photo_url || '' }); setModalOpen(true) }}>সম্পাদনা</Button>
        </div>
      ),
    },
  ]

  if (loading) return <div className="animate-pulse">লোড হচ্ছে...</div>

  return (
    <div>
      <PageHeader title="শিক্ষার্থী ব্যবস্থাপনা" description="সকল শিক্ষার্থী পরিচালনা করুন">
        <Button variant="outline"><Upload className="w-4 h-4" /> CSV ইমপোর্ট</Button>
        <Button variant="outline"><Download className="w-4 h-4" /> এক্সপোর্ট</Button>
        <Button onClick={() => { setEditingStudent(null); setForm({ name: '', father_name: '', mother_name: '', dob: '', gender: 'male', class_id: '', phone: '', address: '', photo_url: '' }); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> শিক্ষার্থী যোগ করুন
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={students} searchKeys={['name', 'father_name', 'mother_name', 'phone']} />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editingStudent ? 'শিক্ষার্থী সম্পাদনা' : 'শিক্ষার্থী যোগ করুন'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">শিক্ষার্থীর নাম</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="পূর্ণ নাম" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">পিতার নাম</label>
            <Input value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })} placeholder="পিতার নাম" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">মাতার নাম</label>
            <Input value={form.mother_name} onChange={(e) => setForm({ ...form, mother_name: e.target.value })} placeholder="মাতার নাম" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">জন্ম তারিখ</label>
            <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">লিঙ্গ</label>
            <Select options={[{ value: 'male', label: 'পুরুষ' }, { value: 'female', label: 'নারী' }]} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">শ্রেণি</label>
            <Select options={classes.map(c => ({ value: c.id, label: c.name }))} placeholder="শ্রেণি নির্বাচন" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ফোন</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="ফোন নম্বর" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ঠিকানা</label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="ঠিকানা" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setModalOpen(false)}>বাতিল</Button>
          <Button onClick={handleSubmit}>{editingStudent ? 'শিক্ষার্থী হালনাগাদ' : 'শিক্ষার্থী যোগ করুন'}</Button>
        </div>
      </Modal>
    </div>
  )
}
