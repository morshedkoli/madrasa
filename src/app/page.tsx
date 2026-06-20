import Link from 'next/link'
export const dynamic = 'force-dynamic'
import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  LogIn,
  ChevronRight,
  Star,
  Bookmark,
  Award,
  Shield,
  BarChart3,
  Bell,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { sql } from '@/lib/db-server'

// ─── Default branding (fallback when DB table doesn't exist) ─────────────────
const defaultBranding = {
  name: 'জামিয়া ইসলামিয়া সিরাজুল উলূম সূর্যকান্দি',
  tagline: 'ডিজিটাল শিক্ষা ব্যবস্থাপনা',
  established_year: '২০২৬',
  hero_title: 'প্রাথমিক ইসলামিক শিক্ষায় ডিজিটাল বিপ্লব',
  hero_subtitle:
    'মাদ্রাসা পরিচালনার সমস্ত জটিলতা এক প্ল্যাটফর্মে সমাধান করুন। শিক্ষার্থীর রেকর্ড, শিক্ষক ব্যবস্থাপনা, আর্থিক লেনদেন ও রিপোর্টিং — সবকিছু আধুনিক ও সহজ উপায়ে।',
  about_text_1:
    'আমাদের মাদ্রাসা ইসলামী মূল্যবোধে প্রোথিত মানসম্পন্ন প্রাথমিক শিক্ষা প্রদানে নিবেদিত। আমরা ঐতিহ্যবাহী ইসলামিক শিক্ষাকে আধুনিক একাডেমিক কারিকুলামের সাথে সমন্বয় করে সু-বিকশিত ব্যক্তিত্ব গঠনে কাজ করি।',
  about_text_2:
    'এই ম্যানেজমেন্ট সিস্টেম প্রশাসক, শিক্ষক ও হিসাবরক্ষকদের জন্য ডিজিটাল টুল সরবরাহ করে — সবকিছু একটি একক প্ল্যাটফর্ম থেকে।',
  address: '১২৩ ইসলামিক স্ট্রিট, ঢাকা',
  phone: '+৮৮০-XXX-XXXXXX',
  email: 'info@madrasa.edu',
  office_hours: 'শনি-বৃহস্পতি ৮:০০–২:০০',
  footer_tagline: 'প্রযুক্তির মাধ্যমে ইসলামিক শিক্ষাকে শক্তিশালীকরণ',
}

// ─── Branding data fetching ──────────────────────────────────────────────────
async function getBrandingSettings() {
  try {
    const rows = await sql`SELECT * FROM madrasa_settings WHERE id = 1 LIMIT 1`
    if ((rows as any[]).length === 0) return defaultBranding
    return { ...defaultBranding, ...(rows as any[])[0] }
  } catch {
    return defaultBranding
  }
}

// ─── Server-side data fetching ───────────────────────────────────────────────
async function getHomeStats() {
  try {
    const [studentsRes, teachersRes, classesRes, incomeRes, noticesRes] = await Promise.all([
      // Active students count
      sql`SELECT COUNT(*) as count FROM students WHERE status = 'active'`,
      // Teachers count
      sql`SELECT COUNT(*) as count FROM profiles WHERE role = 'teacher'`,
      // Classes count
      sql`SELECT COUNT(*) as count FROM classes`,
      // Total income this year
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      // Latest 3 notices for all staff
      sql`SELECT title, content, created_at FROM notices WHERE target_role IN ('all', 'teachers') ORDER BY created_at DESC LIMIT 3`,
    ])

    const students = Number((studentsRes as any[])[0]?.count ?? 0)
    const teachers = Number((teachersRes as any[])[0]?.count ?? 0)
    const classes = Number((classesRes as any[])[0]?.count ?? 0)
    const yearlyIncome = Number((incomeRes as any[])[0]?.total ?? 0)
    const notices = (noticesRes as any[]) ?? []

    // Compute satisfaction rate from attendance (present / total * 100)
    const attRes = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) as total
      FROM attendance
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `
    const att = (attRes as any[])[0]
    const satisfactionRate =
      att?.total > 0 ? Math.round((Number(att.present) / Number(att.total)) * 100) : null

    return { students, teachers, classes, yearlyIncome, satisfactionRate, notices }
  } catch {
    // Return safe defaults if DB is unavailable
    return { students: 0, teachers: 0, classes: 0, yearlyIncome: 0, satisfactionRate: null, notices: [] }
  }
}

// ─── Helper: format Bengali numbers ──────────────────────────────────────────
function toBengaliDigits(n: number) {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(n).replace(/[0-9]/g, (d) => digits[parseInt(d)])
}

function formatCount(n: number) {
  if (n === 0) return '—'
  if (n >= 1000) return toBengaliDigits(Math.round(n / 100) * 100) + '+'
  return toBengaliDigits(n) + (n >= 10 ? '+' : '')
}

function formatCurrency(n: number) {
  if (n === 0) return '—'
  if (n >= 100000) return '৳' + toBengaliDigits(Math.round(n / 1000)) + 'k+'
  if (n >= 1000) return '৳' + toBengaliDigits(Math.round(n / 1000)) + 'k'
  return '৳' + toBengaliDigits(n)
}

const portals = [
  {
    title: 'এডমিন পোর্টাল',
    badge: 'প্রশাসক',
    desc: 'প্রতিষ্ঠানের সামগ্রিক নিয়ন্ত্রণ — শিক্ষার্থী ভর্তি, শিক্ষক নিয়োগ, ফি কাঠামো নির্ধারণ ও রিপোর্ট তৈরি।',
    features: ['শিক্ষার্থী ব্যবস্থাপনা', 'শ্রেণি ও শিক্ষক নিয়োগ', 'আর্থিক রিপোর্ট', 'নোটিশ বোর্ড'],
    href: '/auth/login',
    gradient: 'from-[#1B6B3A] to-[#0f4c27]',
    icon: Shield,
    barColor: '#1B6B3A',
  },
  {
    title: 'শিক্ষক পোর্টাল',
    badge: 'শিক্ষক',
    desc: 'আপনার শ্রেণি পরিচালনা — উপস্থিতি চিহ্নিত করুন, গ্রেড দিন ও শিক্ষার্থীদের প্রোফাইল দেখুন।',
    features: ['দৈনিক উপস্থিতি', 'গ্রেড এন্ট্রি', 'শিক্ষার্থীর তালিকা', 'মাদ্রাসা নোটিশ'],
    href: '/auth/login',
    gradient: 'from-amber-500 to-orange-500',
    icon: GraduationCap,
    barColor: '#f59e0b',
  },
  {
    title: 'হিসাব পোর্টাল',
    badge: 'হিসাবরক্ষক',
    desc: 'আর্থিক ব্যবস্থাপনার পূর্ণ নিয়ন্ত্রণ — ফি সংগ্রহ, আয়-ব্যয় ট্র্যাকিং ও মাসিক রিপোর্ট।',
    features: ['ফি সংগ্রহ', 'আয় ট্র্যাকিং', 'ব্যয় ব্যবস্থাপনা', 'মাসিক রিপোর্ট'],
    href: '/auth/login',
    gradient: 'from-blue-600 to-indigo-700',
    icon: BarChart3,
    barColor: '#3b82f6',
  },
]

const aboutItems = [
  { icon: Bookmark, title: 'কুরআন শিক্ষা', desc: 'তাজবিদ ও হিফজ' },
  { icon: BookOpen, title: 'একাডেমিক', desc: 'স্ট্যান্ডার্ড কারিকুলাম' },
  { icon: Award, title: 'চরিত্র গঠন', desc: 'ইসলামী নীতিশাস্ত্র' },
  { icon: Users, title: 'সম্প্রদায়', desc: 'অভিভাবকের অংশগ্রহণ' },
]

const featureItems = [
  { icon: Shield, title: 'সুরক্ষিত অ্যাক্সেস', desc: 'ভূমিকা-ভিত্তিক প্রবেশাধিকার ও এনক্রিপ্টেড ডেটা সুরক্ষা।' },
  { icon: BarChart3, title: 'রিয়েল-টাইম রিপোর্ট', desc: 'তাৎক্ষণিক আর্থিক ও শিক্ষামূলক বিশ্লেষণ ও চার্ট।' },
  { icon: Bell, title: 'স্মার্ট নোটিফিকেশন', desc: 'নোটিশ বোর্ডের মাধ্যমে নির্দিষ্ট দলে বার্তা প্রেরণ।' },
  { icon: BookOpen, title: 'সম্পূর্ণ ডিজিটাল', desc: 'কাগজবিহীন উপস্থিতি, গ্রেড ও ফি পরিচালনা।' },
]

// ─── Page Component (async Server Component) ─────────────────────────────────
export default async function HomePage() {
  const [{ students, teachers, classes, yearlyIncome, satisfactionRate, notices }, branding] =
    await Promise.all([getHomeStats(), getBrandingSettings()])

  const stats = [
    {
      value: formatCount(students),
      label: 'শিক্ষার্থী',
      sub: 'সক্রিয় ভর্তি রেকর্ড',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      value: formatCount(teachers),
      label: 'শিক্ষক',
      sub: 'অনুমোদিত স্টাফ',
      icon: GraduationCap,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      value: formatCount(classes),
      label: 'শ্রেণি',
      sub: 'চলতি শিক্ষাবর্ষ',
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      value:
        satisfactionRate !== null
          ? toBengaliDigits(satisfactionRate) + '%'
          : yearlyIncome > 0
          ? formatCurrency(yearlyIncome)
          : '—',
      label: satisfactionRate !== null ? 'উপস্থিতির হার' : 'বার্ষিক আয়',
      sub: satisfactionRate !== null ? 'গত ৩০ দিন' : 'চলতি বছর',
      icon: satisfactionRate !== null ? Award : TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif", background: '#FAF7F0' }}
    >
      {/* ── Navigation ── */}
      <header
        style={{
          background: 'rgba(250,247,240,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(27,107,58,0.08)',
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)' }}
            >
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <span
                className="font-bold text-[#1B6B3A] leading-none block"
                style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif", fontSize: '17px' }}
              >
                {branding.name}
              </span>
              <span className="text-xs text-gray-400 block leading-none mt-0.5">
                {branding.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            {[
              { href: '#about', label: 'আমাদের সম্পর্কে' },
              { href: '#portals', label: 'পোর্টালসমূহ' },
              { href: '#features', label: 'বৈশিষ্ট্যসমূহ' },
              { href: '#contact', label: 'যোগাযোগ' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#1B6B3A] transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)',
              boxShadow: '0 4px 14px rgba(27,107,58,0.35)',
            }}
          >
            <LogIn className="w-4 h-4" />
            লগইন করুন
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(27,107,58,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231B6B3A' fill-rule='evenodd'%3E%3Cpath d='M40 0L50 20H30L40 0zM40 80L30 60H50L40 80zM0 40L20 30V50L0 40zM80 40L60 50V30L80 40z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 border"
              style={{
                background: 'rgba(27,107,58,0.07)',
                color: '#1B6B3A',
                borderColor: 'rgba(27,107,58,0.15)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              প্রতিষ্ঠিত {branding.established_year} — ডিজিটাল শিক্ষা সমাধান
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 mb-6"
              style={{
                fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif",
                letterSpacing: '-0.5px',
              }}
            >
              <span className="relative inline-block" style={{ color: '#1B6B3A' }}>
                {branding.name}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C48 1.5 152 1.5 199 5.5"
                    stroke="#C9A84C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {branding.hero_subtitle}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2.5 text-white px-8 py-4 rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #1B6B3A 0%, #0f4c27 100%)',
                  boxShadow: '0 8px 30px rgba(27,107,58,0.4)',
                }}
              >
                শুরু করুন
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#portals"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base transition-all"
                style={{
                  background: 'white',
                  color: '#1B6B3A',
                  border: '2px solid rgba(27,107,58,0.15)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                }}
              >
                পোর্টালসমূহ দেখুন
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              {['Supabase Auth', 'Next.js 16', 'বাংলাদেশ-বান্ধব', 'রোল-ভিত্তিক অ্যাক্সেস'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#1B6B3A' }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats (from DB) ── */}
      <section className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl p-6 text-center group hover:-translate-y-1 transition-transform"
                style={{
                  background: 'white',
                  border: '1px solid rgba(27,107,58,0.07)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-gradient-to-br ${stat.gradient}`}
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div
                  className="text-3xl font-bold text-gray-900 mb-0.5"
                  style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-700">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Live data indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
            <span
              className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            />
            ডেটাবেস থেকে সরাসরি লাইভ তথ্য
          </div>
        </div>
      </section>

      {/* ── Latest Notices (from DB) ── */}
      {notices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(27,107,58,0.04), rgba(201,168,76,0.04))',
              border: '1px solid rgba(27,107,58,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4" style={{ color: '#1B6B3A' }} />
              <h3
                className="font-bold text-gray-800"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                সর্বশেষ নোটিশ
              </h3>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(27,107,58,0.1)', color: '#1B6B3A' }}
              >
                লাইভ
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {notices.map((n: any, i: number) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(27,107,58,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    className="font-bold text-sm text-gray-800 mb-1 line-clamp-1"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {n.title}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2">{n.content}</div>
                  <div className="text-xs mt-2" style={{ color: '#1B6B3A' }}>
                    {new Date(n.created_at).toLocaleDateString('bn-BD')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About ── */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
              style={{ background: 'rgba(27,107,58,0.08)', color: '#1B6B3A' }}
            >
              <Star className="w-3.5 h-3.5" />
              আমাদের প্রতিষ্ঠান
            </div>
            <h2
              className="text-4xl font-bold text-gray-900 mb-6 leading-snug"
              style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
            >
              ঐতিহ্যবাহী শিক্ষায়{' '}
              <span style={{ color: '#1B6B3A' }}>আধুনিক সমাধান</span>
            </h2>
            <div className="space-y-4 text-gray-500 leading-relaxed">
              <p>{branding.about_text_1}</p>
              <p>{branding.about_text_2}</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {aboutItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-4 rounded-xl hover:-translate-y-0.5 transition-transform"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(27,107,58,0.07)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(201,168,76,0.1)' }}>
                    <item.icon className="w-4 h-4" style={{ color: '#C9A84C' }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(27,107,58,0.15), rgba(201,168,76,0.1))',
              }}
            />
            <div
              className="relative rounded-3xl overflow-hidden p-10 text-center"
              style={{
                background: 'linear-gradient(135deg, #1B6B3A 0%, #0f4c27 100%)',
                boxShadow: '0 25px 50px rgba(27,107,58,0.3)',
              }}
            >
              <div
                className="absolute top-6 right-6 w-24 h-24 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
              <div
                className="absolute bottom-8 left-8 w-16 h-16 rounded-full"
                style={{ background: 'rgba(201,168,76,0.15)' }}
              />
              <School className="w-20 h-20 text-white mx-auto mb-6 relative z-10" />
              <h3
                className="text-2xl font-bold text-white mb-3 relative z-10"
                style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
              >
                {branding.name}
              </h3>
              <p
                className="text-sm relative z-10"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                শিক্ষায় উৎকর্ষতা, {branding.established_year} সাল থেকে
              </p>

              {/* Live stat pill inside the green card */}
              {students > 0 && (
                <div
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold relative z-10"
                  style={{
                    background: 'rgba(201,168,76,0.2)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.3)',
                  }}
                >
                  <Users className="w-4 h-4" />
                  {formatCount(students)} সক্রিয় শিক্ষার্থী
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Portals ── */}
      <section
        id="portals"
        style={{
          background: 'white',
          borderTop: '1px solid rgba(27,107,58,0.06)',
          borderBottom: '1px solid rgba(27,107,58,0.06)',
        }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
              style={{ background: 'rgba(27,107,58,0.08)', color: '#1B6B3A' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ভূমিকা-ভিত্তিক অ্যাক্সেস
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-5"
              style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
            >
              তিনটি ডেডিকেটেড পোর্টাল
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              প্রতিটি ব্যবহারকারীর ভূমিকা অনুযায়ী নির্দিষ্ট ড্যাশবোর্ড ও টুল — সহজ, নিরাপদ ও কার্যকর।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {portals.map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                className="group relative rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${portal.gradient}`}
                />
                <div className="p-8 bg-white border border-gray-100">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 text-white bg-gradient-to-r ${portal.gradient}`}
                  >
                    <portal.icon className="w-3.5 h-3.5" />
                    {portal.badge}
                  </div>
                  <h3
                    className="text-2xl font-bold text-gray-900 mb-3"
                    style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
                  >
                    {portal.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{portal.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {portal.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(27,107,58,0.08)' }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#1B6B3A' }} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="flex items-center gap-2 font-bold text-sm group-hover:gap-3 transition-all"
                    style={{ color: '#1B6B3A' }}
                  >
                    পোর্টালে প্রবেশ করুন
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
            style={{ background: 'rgba(27,107,58,0.08)', color: '#1B6B3A' }}
          >
            <Star className="w-3.5 h-3.5" />
            মূল সুবিধাসমূহ
          </div>
          <h2
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
          >
            কেন এই সিস্টেম বেছে নেবেন?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureItems.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl p-6 hover:-translate-y-1 transition-all"
              style={{
                background: 'white',
                border: '1px solid rgba(27,107,58,0.07)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #1B6B3A, #0f4c27)',
                  boxShadow: '0 4px 12px rgba(27,107,58,0.3)',
                }}
              >
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: '16px' }}>
                {f.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section
        id="contact"
        style={{ background: 'white', borderTop: '1px solid rgba(27,107,58,0.06)' }}
        className="py-24"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
            style={{ background: 'rgba(27,107,58,0.08)', color: '#1B6B3A' }}
          >
            যোগাযোগ
          </div>
          <h2
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif" }}
          >
            আমাদের সাথে যোগাযোগ করুন
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            মাদ্রাসা বা ম্যানেজমেন্ট সিস্টেম সম্পর্কে কোনো প্রশ্ন থাকলে আমরা সাহায্য করতে প্রস্তুত।
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'ঠিকানা', value: branding.address },
              { label: 'ফোন', value: branding.phone },
              { label: 'ইমেইল', value: branding.email },
              { label: 'সময়সূচি', value: branding.office_hours },
            ].map((item) => (
              <div
                key={item.label}
                className="p-5 rounded-2xl text-left"
                style={{ background: '#FAF7F0', border: '1px solid rgba(27,107,58,0.07)' }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: '#1B6B3A' }}
                >
                  {item.label}
                </div>
                <div className="text-sm text-gray-600 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #0f4c27 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <span
                  className="font-bold text-white block"
                  style={{
                    fontFamily: "'Anek Bangla', 'Hind Siliguri', sans-serif",
                    fontSize: '17px',
                  }}
                >
                  {branding.name}
                </span>
                <span
                  className="text-xs block"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {branding.footer_tagline}
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-6 text-sm"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {[
                { href: '#about', label: 'আমাদের সম্পর্কে' },
                { href: '#portals', label: 'পোর্টালসমূহ' },
                { href: '#contact', label: 'যোগাযোগ' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            <div
              className="text-sm text-center md:text-right"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              © {new Date().getFullYear()} মাদ্রাসা ম্যানেজমেন্ট সিস্টেম। সর্বস্বত্ব সংরক্ষিত।
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
