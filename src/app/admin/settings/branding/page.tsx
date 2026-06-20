'use client'

import { useEffect, useState } from 'react'
import {
  School,
  Palette,
  MapPin,
  Phone,
  Mail,
  Clock,
  FileText,
  Globe,
  Save,
  Eye,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
interface BrandingForm {
  name: string
  tagline: string
  established_year: string
  hero_title: string
  hero_subtitle: string
  about_text_1: string
  about_text_2: string
  address: string
  phone: string
  email: string
  office_hours: string
  footer_tagline: string
}

const defaultForm: BrandingForm = {
  name: '',
  tagline: '',
  established_year: '',
  hero_title: '',
  hero_subtitle: '',
  about_text_1: '',
  about_text_2: '',
  address: '',
  phone: '',
  email: '',
  office_hours: '',
  footer_tagline: '',
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  accent = '#1B6B3A',
  children,
}: {
  icon: any
  title: string
  subtitle: string
  accent?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid rgba(27,107,58,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Card header */}
      <div
        className="px-6 py-5 border-b flex items-center gap-4"
        style={{ borderColor: 'rgba(27,107,58,0.07)', background: 'rgba(250,247,240,0.6)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 4px 12px ${accent}33` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            {title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-sm font-semibold text-gray-700 mb-1.5"
        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 outline-none transition-all'
const inputStyle = {
  background: '#FAF7F0',
  border: '1.5px solid rgba(27,107,58,0.12)',
  fontFamily: "'Hind Siliguri', sans-serif",
}
const inputFocusStyle = {
  borderColor: '#1B6B3A',
  boxShadow: '0 0 0 3px rgba(27,107,58,0.08)',
}

function StyledInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={inputCls}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
    />
  )
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${inputCls} resize-none leading-relaxed`}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
    />
  )
}

// ─── Live Preview strip ───────────────────────────────────────────────────────
function LivePreview({ form }: { form: BrandingForm }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid rgba(27,107,58,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="px-6 py-4 flex items-center gap-3 border-b"
        style={{ background: 'rgba(27,107,58,0.04)', borderColor: 'rgba(27,107,58,0.07)' }}
      >
        <Eye className="w-4 h-4" style={{ color: '#1B6B3A' }} />
        <span className="font-semibold text-sm text-gray-700">লাইভ প্রিভিউ — নেভিগেশন বার</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(27,107,58,0.1)', color: '#1B6B3A' }}
        >
          রিয়েল-টাইম
        </span>
      </div>
      {/* Nav preview */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ background: 'rgba(250,247,240,0.7)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)' }}
        >
          <School className="w-4 h-4 text-white" />
        </div>
        <div>
          <span
            className="font-bold leading-none block text-[#1B6B3A]"
            style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif", fontSize: '16px' }}
          >
            {form.name || 'মাদ্রাসার নাম'}
          </span>
          <span className="text-xs text-gray-400 block leading-none mt-0.5">
            {form.tagline || 'ট্যাগলাইন'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(27,107,58,0.08)', color: '#1B6B3A' }}
          >
            <Sparkles className="w-3 h-3" />
            প্রতিষ্ঠিত {form.established_year || '—'}
          </span>
        </div>
      </div>

      {/* Hero preview strip */}
      <div className="px-6 py-5 border-t" style={{ borderColor: 'rgba(27,107,58,0.06)' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">হিরো সেকশন</p>
        <h2
          className="text-xl font-bold text-gray-900 leading-snug mb-1.5"
          style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
        >
          {form.hero_title || 'হিরো শিরোনাম এখানে দেখাবে...'}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2">{form.hero_subtitle || 'হিরো বিবরণ...'}</p>
      </div>

      {/* Contact preview */}
      <div
        className="px-6 py-4 border-t grid grid-cols-2 gap-3"
        style={{ borderColor: 'rgba(27,107,58,0.06)', background: 'rgba(250,247,240,0.4)' }}
      >
        <p className="col-span-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">যোগাযোগ তথ্য</p>
        {[
          { icon: MapPin, v: form.address },
          { icon: Phone, v: form.phone },
          { icon: Mail, v: form.email },
          { icon: Clock, v: form.office_hours },
        ].map(({ icon: Ic, v }, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <Ic className="w-3.5 h-3.5 shrink-0" style={{ color: '#1B6B3A' }} />
            <span className="line-clamp-1">{v || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BrandingPage() {
  const [form, setForm] = useState<BrandingForm>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load current branding
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/branding')
        if (res.ok) {
          const data = await res.json()
          setForm((prev) => ({ ...prev, ...data }))
        }
      } catch {
        toast.error('ব্র্যান্ডিং তথ্য লোড করতে ব্যর্থ হয়েছে')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function set(key: keyof BrandingForm) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'সংরক্ষণ ব্যর্থ হয়েছে')
      }
      setLastSaved(new Date())
      toast.success('ব্র্যান্ডিং সফলভাবে সংরক্ষিত হয়েছে! হোম পেজ আপডেট হয়েছে।')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B6B3A]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)', boxShadow: '0 4px 12px rgba(27,107,58,0.3)' }}
            >
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
            >
              ব্র্যান্ডিং সেটিংস
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-13 pl-1">
            মাদ্রাসার নাম, পরিচিতি ও যোগাযোগ তথ্য — হোম পেজে সরাসরি দেখাবে।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastSaved && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              সর্বশেষ সংরক্ষণ: {lastSaved.toLocaleTimeString('bn-BD')}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)',
              boxShadow: '0 4px 14px rgba(27,107,58,0.35)',
            }}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Identity */}
          <SectionCard icon={School} title="পরিচয় তথ্য" subtitle="নেভিগেশন বার ও ফুটারে প্রদর্শিত হবে">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="মাদ্রাসার নাম" hint="নেভিগেশন বার ও হিরো কার্ডে দেখাবে">
                <StyledInput value={form.name} onChange={set('name')} placeholder="যেমন: জামিয়া ইসলামিয়া সিরাজুল উলূম সূর্যকান্দি" />
              </Field>
              <Field label="ট্যাগলাইন" hint="নামের নিচে ছোট বিবরণ">
                <StyledInput value={form.tagline} onChange={set('tagline')} placeholder="যেমন: ডিজিটাল শিক্ষা ব্যবস্থাপনা" />
              </Field>
              <Field label="প্রতিষ্ঠার সাল" hint="হিরো ব্যাজে দেখাবে">
                <StyledInput value={form.established_year} onChange={set('established_year')} placeholder="যেমন: ২০২৬" />
              </Field>
              <Field label="ফুটার বিবরণ" hint="ফুটারে লোগোর নিচে দেখাবে">
                <StyledInput value={form.footer_tagline} onChange={set('footer_tagline')} placeholder="যেমন: ইসলামিক শিক্ষাকে শক্তিশালীকরণ" />
              </Field>
            </div>
          </SectionCard>

          {/* Hero Section */}
          <SectionCard icon={Globe} title="হিরো সেকশন" subtitle="হোম পেজের মূল ব্যানার অংশ" accent="#3b82f6">
            <div className="space-y-5">
              <Field label="হিরো শিরোনাম (H1)" hint="পেজের মূল হেডলাইন — বড় ও আকর্ষণীয় রাখুন">
                <StyledTextarea value={form.hero_title} onChange={set('hero_title')} placeholder="যেমন: প্রাথমিক ইসলামিক শিক্ষায় ডিজিটাল বিপ্লব" rows={2} />
              </Field>
              <Field label="হিরো বিবরণ" hint="শিরোনামের নিচের অনুচ্ছেদ">
                <StyledTextarea value={form.hero_subtitle} onChange={set('hero_subtitle')} placeholder="মাদ্রাসার সংক্ষিপ্ত বিবরণ ও মিশন..." rows={3} />
              </Field>
            </div>
          </SectionCard>

          {/* About Section */}
          <SectionCard icon={FileText} title="আমাদের সম্পর্কে" subtitle="হোম পেজের 'আমাদের প্রতিষ্ঠান' সেকশনের লেখা" accent="#f59e0b">
            <div className="space-y-5">
              <Field label="প্রথম অনুচ্ছেদ" hint="মাদ্রাসার মিশন ও ইতিহাস সম্পর্কে">
                <StyledTextarea value={form.about_text_1} onChange={set('about_text_1')} placeholder="মাদ্রাসার ঐতিহ্য ও লক্ষ্য সম্পর্কে বিস্তারিত লিখুন..." rows={4} />
              </Field>
              <Field label="দ্বিতীয় অনুচ্ছেদ" hint="সিস্টেম বা অতিরিক্ত তথ্য সম্পর্কে">
                <StyledTextarea value={form.about_text_2} onChange={set('about_text_2')} placeholder="ম্যানেজমেন্ট সিস্টেম বা অন্যান্য তথ্য..." rows={3} />
              </Field>
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard icon={MapPin} title="যোগাযোগ তথ্য" subtitle="হোম পেজের যোগাযোগ সেকশনে প্রদর্শিত হবে" accent="#8b5cf6">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="ঠিকানা">
                <StyledInput value={form.address} onChange={set('address')} placeholder="যেমন: ১২৩ ইসলামিক স্ট্রিট, ঢাকা-১২০০" />
              </Field>
              <Field label="ফোন নম্বর">
                <StyledInput value={form.phone} onChange={set('phone')} placeholder="যেমন: +৮৮০-১৭XX-XXXXXX" type="tel" />
              </Field>
              <Field label="ইমেইল ঠিকানা">
                <StyledInput value={form.email} onChange={set('email')} placeholder="যেমন: info@madrasa.edu" type="email" />
              </Field>
              <Field label="কার্যালয়ের সময়সূচি">
                <StyledInput value={form.office_hours} onChange={set('office_hours')} placeholder="যেমন: শনি-বৃহস্পতি ৮:০০–২:০০" />
              </Field>
            </div>
          </SectionCard>

          {/* Save button bottom */}
          <div className="flex justify-end pt-2 pb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)',
                boxShadow: '0 8px 24px rgba(27,107,58,0.35)',
              }}
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'সংরক্ষণ হচ্ছে...' : 'সকল পরিবর্তন সংরক্ষণ করুন'}
            </button>
          </div>
        </div>

        {/* Right: Live Preview (sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <LivePreview form={form} />

            {/* Info box */}
            <div
              className="rounded-2xl p-5 text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(27,107,58,0.04), rgba(201,168,76,0.04))',
                border: '1px solid rgba(27,107,58,0.08)',
              }}
            >
              <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                কোথায় দেখাবে?
              </p>
              <ul className="space-y-2 text-gray-500 text-xs">
                {[
                  'নেভিগেশন বারে মাদ্রাসার নাম',
                  'হিরো সেকশনের শিরোনাম ও বিবরণ',
                  '"আমাদের সম্পর্কে" সেকশনের লেখা',
                  'যোগাযোগ সেকশনের তথ্য',
                  'ফুটারের নাম ও ট্যাগলাইন',
                  'প্রতিষ্ঠার সাল ব্যাজে',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* DB migration note */}
            <div
              className="rounded-2xl p-5 text-xs"
              style={{
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}
            >
              <p className="font-semibold text-amber-700 mb-2">⚠️ প্রথমবার ব্যবহারের আগে</p>
              <p className="text-amber-600 leading-relaxed">
                Supabase SQL Editor-এ <code className="bg-amber-100 px-1 rounded">madrasa_settings</code> টেবিল তৈরির SQL মাইগ্রেশন চালান।
                নিচের SQL কপি করুন ও Supabase-এ রান করুন।
              </p>
              <pre
                className="mt-3 p-3 rounded-lg text-amber-700 overflow-x-auto leading-relaxed"
                style={{ background: 'rgba(251,191,36,0.1)', fontSize: '10px' }}
              >
{`CREATE TABLE IF NOT EXISTS madrasa_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT,
  tagline TEXT,
  established_year TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  about_text_1 TEXT,
  about_text_2 TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  office_hours TEXT,
  footer_tagline TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO madrasa_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
