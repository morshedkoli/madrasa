'use client'

import { useEffect, useState } from 'react'
import { db, sql, insert, update as dbUpdate } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/shared/Modal'
import { Plus, Check, Palette, ArrowRight, Save, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { AcademicYear, Profile } from '@/lib/types'

const DEFAULT_MADRASA = 'জামিয়া ইসলামিয়া সিরাজুল উলূম সূর্যকান্দি'

export default function SettingsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [yearModal, setYearModal] = useState(false)
  const [userModal, setUserModal] = useState(false)
  const [yearForm, setYearForm] = useState({ name: '', start_date: '', end_date: '' })
  const [userForm, setUserForm] = useState({ email: '', password: '', full_name: '', role: 'teacher' })

  // Madrasa info state
  const [madrasaInfo, setMadrasaInfo] = useState({
    name: DEFAULT_MADRASA,
    tagline: 'ডিজিটাল শিক্ষা ব্যবস্থাপনা',
    address: '',
    phone: '',
    email: '',
    office_hours: '',
  })
  const [savingInfo, setSavingInfo] = useState(false)

  useEffect(() => {
    loadData()
    loadMadrasaInfo()
  }, [])

  async function loadMadrasaInfo() {
    try {
      const res = await fetch('/api/branding')
      if (res.ok) {
        const data = await res.json()
        setMadrasaInfo({
          name: data.name || DEFAULT_MADRASA,
          tagline: data.tagline || 'ডিজিটাল শিক্ষা ব্যবস্থাপনা',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          office_hours: data.office_hours || '',
        })
      }
    } catch {}
  }

  async function saveMadrasaInfo() {
    setSavingInfo(true)
    try {
      // Load full current branding first so we don’t overwrite other fields
      const getRes = await fetch('/api/branding')
      const current = getRes.ok ? await getRes.json() : {}
      const res = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, ...madrasaInfo }),
      })
      if (!res.ok) throw new Error('সংরক্ষণ ব্যর্থ হয়েছে')
      toast.success('মাদ্রাসার তথ্য সফলভাবে সংরক্ষিত হয়েছে! হোম পেজ আপডেট হয়েছে।')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingInfo(false)
    }
  }

  async function loadData() {
    const [yRes, uRes] = await Promise.all([
      db('academic_years').order('start_date', 'desc').select(),
      db('profiles').order('created_at', 'desc').select(),
    ])
    setAcademicYears(yRes.data || [])
    setUsers(uRes.data || [])
  }

  async function createYear() {
    const { error } = await insert('academic_years', yearForm)
    if (error) { toast.error(error.message); return }
    toast.success('শিক্ষাবর্ষ তৈরি করা হয়েছে')
    setYearModal(false)
    setYearForm({ name: '', start_date: '', end_date: '' })
    loadData()
  }

  async function setCurrentYear(id: string) {
    try {
      await sql`UPDATE academic_years SET is_current = false WHERE is_current = true`
      await sql`UPDATE academic_years SET is_current = true WHERE id = ${id}`
    } catch (err: any) {
      toast.error(err.message)
      return
    }
    toast.success('বর্তমান বছর হালনাগাদ করা হয়েছে')
    loadData()
  }

  async function createUser() {
    const bcrypt = await import('bcryptjs')
    const password_hash = await bcrypt.hash(userForm.password, 10)
    const { error } = await insert('profiles', {
      full_name: userForm.full_name,
      email: userForm.email,
      password_hash,
      role: userForm.role,
    })
    if (error) { toast.error(error.message); return }
    toast.success('ব্যবহারকারী তৈরি করা হয়েছে')
    setUserModal(false)
    setUserForm({ email: '', password: '', full_name: '', role: 'teacher' })
    loadData()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="সেটিংস" description="মাদ্রাসার তথ্য ও সিস্টেম সেটিংস" />

      <Tabs defaultValue="academic-years">
        <TabsList>
          <TabsTrigger value="academic-years">শিক্ষাবর্ষ</TabsTrigger>
          <TabsTrigger value="users">ব্যবহারকারী ব্যবস্থাপনা</TabsTrigger>
          <TabsTrigger value="school">মাদ্রাসার তথ্য</TabsTrigger>
          <TabsTrigger value="branding">ব্র্যান্ডিং</TabsTrigger>
        </TabsList>

        <TabsContent value="academic-years">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>শিক্ষাবর্ষ</CardTitle>
              <Button size="sm" onClick={() => setYearModal(true)}><Plus className="w-4 h-4" /> বছর যোগ করুন</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">নাম</th><th className="pb-2 font-medium">শুরু</th><th className="pb-2 font-medium">শেষ</th><th className="pb-2 font-medium">স্ট্যাটাস</th></tr></thead>
                <tbody>
                  {academicYears.map(y => (
                    <tr key={y.id} className="border-b last:border-0">
                      <td className="py-2">{y.name}</td>
                      <td className="py-2">{new Date(y.start_date).toLocaleDateString()}</td>
                      <td className="py-2">{new Date(y.end_date).toLocaleDateString()}</td>
                      <td className="py-2">
                        {y.is_current ? (
                          <span className="text-green-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> বর্তমান</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setCurrentYear(y.id)}>বর্তমান হিসেবে নির্ধারণ</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>ব্যবহারকারী</CardTitle>
              <Button size="sm" onClick={() => setUserModal(true)}><Plus className="w-4 h-4" /> ব্যবহারকারী যোগ করুন</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 font-medium">নাম</th><th className="pb-2 font-medium">ভূমিকা</th><th className="pb-2 font-medium">যোগদান</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2">{u.full_name}</td>
                      <td className="py-2"><span className="capitalize">{u.role}</span></td>
                      <td className="py-2 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>মাদ্রাসার তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-gray-500">
                মাদ্রাসার মূল তথ্য সম্পাদনা করুন — হোম পেজে সরাসরি প্রদর্শিত হবে।
              </p>

              {/* Madrasa Name — prominent */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">মাদ্রাসার পূর্ণ নাম</label>
                <Input
                  value={madrasaInfo.name}
                  onChange={(e) => setMadrasaInfo({ ...madrasaInfo, name: e.target.value })}
                  placeholder="মাদ্রাসার পূর্ণ নাম বাংলায় লিখুন"
                  className="text-base font-semibold h-11"
                />
                <p className="text-xs text-gray-400">নাভিগেশন বার, হিরো সেকশন, কার্ড ও ফুটারে প্রদর্শিত হবে।</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ট্যাগলাইন</label>
                  <Input
                    value={madrasaInfo.tagline}
                    onChange={(e) => setMadrasaInfo({ ...madrasaInfo, tagline: e.target.value })}
                    placeholder="যেমন: ডিজিটাল শিক্ষা ব্যবস্থাপনা"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ঠিকানা</label>
                  <Input
                    value={madrasaInfo.address}
                    onChange={(e) => setMadrasaInfo({ ...madrasaInfo, address: e.target.value })}
                    placeholder="যেমন: সূর্যকান্দি, ব্রাহ্মণবাডিয়া"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ফোন নম্বর</label>
                  <Input
                    value={madrasaInfo.phone}
                    onChange={(e) => setMadrasaInfo({ ...madrasaInfo, phone: e.target.value })}
                    placeholder="+৮৮০-XXXX-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ইমেইল</label>
                  <Input
                    value={madrasaInfo.email}
                    onChange={(e) => setMadrasaInfo({ ...madrasaInfo, email: e.target.value })}
                    placeholder="info@madrasa.edu"
                    type="email"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-gray-700">কার্যালয়ের সময়সূচি</label>
                  <Input
                    value={madrasaInfo.office_hours}
                    onChange={(e) => setMadrasaInfo({ ...madrasaInfo, office_hours: e.target.value })}
                    placeholder="যেমন: শনি-বৃহস্পতি ৮:০০-২:০০"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={saveMadrasaInfo}
                  disabled={savingInfo}
                  className="flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)' }}
                >
                  {savingInfo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingInfo ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </Button>
                <Link href="/admin/settings/branding">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    সম্পূর্ণ ব্র্যান্ডিং সেটিংস
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: '#1B6B3A' }} />
                মাদ্রাসার ব্র্যান্ডিং সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-6">
                মাদ্রাসার নাম, ট্যাগলাইন, হিরো টেক্সট, যোগাযোগ তথ্য বৃত্তিয় সম্পাদন করুন যা হোম পেজে সরাসরি প্রদর্শিত হবে।
              </p>
              <Link href="/admin/settings/branding">
                <Button className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  ব্র্যান্ডিং পেজে যান
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal open={yearModal} onOpenChange={setYearModal} title="শিক্ষাবর্ষ যোগ করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">বছরের নাম</label><Input value={yearForm.name} onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} placeholder="যেমন: ২০২৬" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">শুরুর তারিখ</label><Input type="date" value={yearForm.start_date} onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">শেষের তারিখ</label><Input type="date" value={yearForm.end_date} onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setYearModal(false)}>বাতিল</Button><Button onClick={createYear}>তৈরি করুন</Button></div>
      </Modal>

      <Modal open={userModal} onOpenChange={setUserModal} title="ব্যবহারকারী তৈরি করুন">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">পূর্ণ নাম</label><Input value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">ইমেইল</label><Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">পাসওয়ার্ড</label><Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">ভূমিকা</label>
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm">
              <option value="teacher">শিক্ষক</option>
              <option value="accountant">হিসাবরক্ষক</option>
              <option value="admin">অ্যাডমিন</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6"><Button variant="outline" onClick={() => setUserModal(false)}>বাতিল</Button><Button onClick={createUser}>ব্যবহারকারী তৈরি করুন</Button></div>
      </Modal>
    </div>
  )
}
