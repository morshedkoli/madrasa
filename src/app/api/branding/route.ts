import { NextResponse } from 'next/server'
import { sql } from '@/lib/db-server'

// ─── Default branding ─────────────────────────────────────────────────────────
export const defaultBranding = {
  name: 'মাদ্রাসা ম্যানেজমেন্ট',
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

// ─── GET /api/branding ────────────────────────────────────────────────────────
export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM madrasa_settings WHERE id = 1 LIMIT 1
    `
    if ((rows as any[]).length === 0) {
      return NextResponse.json(defaultBranding)
    }
    return NextResponse.json((rows as any[])[0])
  } catch {
    // Table may not exist yet — return defaults
    return NextResponse.json(defaultBranding)
  }
}

// ─── PUT /api/branding ────────────────────────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      tagline,
      established_year,
      hero_title,
      hero_subtitle,
      about_text_1,
      about_text_2,
      address,
      phone,
      email,
      office_hours,
      footer_tagline,
    } = body

    const rows = await sql`
      INSERT INTO madrasa_settings (
        id, name, tagline, established_year,
        hero_title, hero_subtitle,
        about_text_1, about_text_2,
        address, phone, email, office_hours,
        footer_tagline, updated_at
      ) VALUES (
        1,
        ${name}, ${tagline}, ${established_year},
        ${hero_title}, ${hero_subtitle},
        ${about_text_1}, ${about_text_2},
        ${address}, ${phone}, ${email}, ${office_hours},
        ${footer_tagline}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        established_year = EXCLUDED.established_year,
        hero_title = EXCLUDED.hero_title,
        hero_subtitle = EXCLUDED.hero_subtitle,
        about_text_1 = EXCLUDED.about_text_1,
        about_text_2 = EXCLUDED.about_text_2,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        office_hours = EXCLUDED.office_hours,
        footer_tagline = EXCLUDED.footer_tagline,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json((rows as any[])[0])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
