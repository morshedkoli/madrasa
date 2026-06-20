import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) { console.error('Missing DATABASE_URL'); process.exit(1) }

const sql = neon(databaseUrl)

async function main() {
  console.log('=== Madrasha DB Migration ===\n')

  // Read and clean the SQL
  let sqlText = readFileSync('supabase/migrations/00001_neon_schema.sql', 'utf-8')

  // Remove all comment lines starting with --
  sqlText = sqlText.replace(/^\s*--.*$/gm, '')

  console.log('  Creating tables...')

  // Execute entire SQL in one batch
  try {
    await sql.query(sqlText)
    console.log('  \u2713 Tables created successfully\n')
  } catch (err) {
    // If batch fails, try individual statements
    console.log('  Batch failed, trying individual statements...')
    const stmts = sqlText.split(';').map(s => s.trim()).filter(s => s.length > 0)
    let ok = 0, fail = 0
    for (const stmt of stmts) {
      try {
        await sql.query(stmt)
        ok++
      } catch (e) {
        if (e.message?.includes('already exists')) { ok++; continue }
        console.log(`  \u2717 ${stmt.substring(0, 50)}... ${e.message?.substring(0, 60)}`)
        fail++
      }
    }
    console.log(`  \u2713 ${ok} statements executed, ${fail} failed\n`)
  }

  // Add auth columns to profiles
  console.log('  Adding auth columns...')
  try {
    await sql.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE')
    await sql.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT')
    await sql.query('ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL')
    await sql.query('ALTER TABLE profiles ALTER COLUMN user_id SET DEFAULT gen_random_uuid()')
    console.log('  \u2713 Auth columns added\n')
  } catch (err) {
    if (!err.message?.includes('already exists')) {
      console.log('  \u2717 ' + err.message?.substring(0, 100) + '\n')
    } else {
      console.log('  \u2713 Already have auth columns\n')
    }
  }

  // Verify profiles exists
  try {
    await sql.query('SELECT id FROM profiles LIMIT 1')
  } catch {
    console.log('  \u2717 profiles table still does not exist. Migration failed.')
    process.exit(1)
  }

  // Check/create demo users
  const existing = await sql`SELECT email FROM profiles WHERE email LIKE '%@madrasa.com'`
  if (existing.length >= 3) {
    console.log('  \u2713 Demo users already exist\n')
  } else {
    console.log('  Creating demo users...')
    const hash = await bcrypt.hash('password123', 10)
    const users = [
      ['Admin User', 'admin@madrasa.com', 'admin'],
      ['Teacher User', 'teacher@madrasa.com', 'teacher'],
      ['Accountant User', 'accounts@madrasa.com', 'accountant'],
    ]
    for (const [name, email, role] of users) {
      const exists = await sql`SELECT id FROM profiles WHERE email = ${email}`
      if (exists.length === 0) {
        await sql`INSERT INTO profiles (full_name, email, password_hash, role) VALUES (${name}, ${email}, ${hash}, ${role})`
      }
    }
    console.log('  \u2713 Demo users created\n')
  }

  // Seed reference data
  console.log('  Seeding reference data...')

  await sql`INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES ('2026', '2026-01-01', '2026-12-31', true) ON CONFLICT DO NOTHING`

  for (const n of ['Class 1','Class 2','Class 3','Class 4','Class 5']) {
    await sql`INSERT INTO classes (name, section, academic_year) VALUES (${n}, 'A', '2026') ON CONFLICT DO NOTHING`
  }

  const classes = await sql`SELECT id, name FROM classes`
  for (const c of classes) {
    await sql`INSERT INTO fee_structures (class_id, fee_type, amount, academic_year) VALUES (${c.id}, 'Tuition', ${({ 'Class 1':500, 'Class 2':600, 'Class 3':700, 'Class 4':800, 'Class 5':1000 })[c.name] || 500}, '2026') ON CONFLICT DO NOTHING`
  }

  const hasExpenses = await sql`SELECT id FROM expenses LIMIT 1`
  if (hasExpenses.length === 0) {
    await sql`INSERT INTO expenses (category, description, amount, date) VALUES
      ('Salary', 'Teacher salaries', 50000, '2026-01-05'),
      ('Utilities', 'Electricity bill', 5000, '2026-01-10'),
      ('Maintenance', 'Building repair', 15000, '2026-01-15'),
      ('Books/Supplies', 'Textbooks', 20000, '2026-01-20'),
      ('Events', 'Sports day', 10000, '2026-02-01')`
  }

  const hasIncome = await sql`SELECT id FROM income LIMIT 1`
  if (hasIncome.length === 0) {
    await sql`INSERT INTO income (source, description, amount, date) VALUES
      ('Donation', 'Community donation', 100000, '2026-01-05'),
      ('Fees', 'Monthly tuition', 75000, '2026-01-15'),
      ('Grant', 'Government grant', 50000, '2026-02-01')`
  }

  console.log('  \u2713 Reference data seeded\n')
  console.log('\u2714 Migration complete!\n')
  console.log('  Demo credentials:')
  console.log('    Admin:      admin@madrasa.com / password123')
  console.log('    Teacher:    teacher@madrasa.com / password123')
  console.log('    Accountant: accounts@madrasa.com / password123')
}

main().catch(err => { console.error('\n  Migration failed:', err.message); process.exit(1) })
