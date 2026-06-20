import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('Missing DATABASE_URL. Run with:')
  console.error('  node --env-file=.env.local scripts/setup.mjs')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function main() {
  console.log('=== Madrasha Management System Setup ===\n')

  // Check connection
  console.log('  Checking database connection...')
  try {
    await sql`SELECT 1`
    console.log('  \u2713 Connection OK\n')
  } catch (err) {
    console.log('  \u2717 Connection failed:', err.message)
    console.log('\n  Check your DATABASE_URL in .env.local')
    process.exit(1)
  }

  // Check if tables exist
  try {
    await sql`SELECT id FROM profiles LIMIT 1`
    console.log('  \u2713 Tables exist\n')
  } catch {
    console.log('  Tables not found.\n')
    console.log('  Run the migration SQL in your Neon SQL Editor:')
    console.log('  1. Open supabase/migrations/00001_schema.sql')
    console.log('  2. Copy and paste into Neon SQL Editor')
    console.log('  3. Click Run\n')
    console.log('  Then run: supabase/migrations/00003_neon_auth.sql')
    console.log('  (or this script will create users for you)\n')
    process.exit(0)
  }

  // Create demo users with bcrypt hashes
  console.log('  Creating demo users...')
  const passwordHash = await bcrypt.hash('password123', 10)

  const DEMO_USERS = [
    { full_name: 'Admin User', email: 'admin@madrasa.com', role: 'admin' },
    { full_name: 'Teacher User', email: 'teacher@madrasa.com', role: 'teacher' },
    { full_name: 'Accountant User', email: 'accounts@madrasa.com', role: 'accountant' },
  ]

  for (const u of DEMO_USERS) {
    const rows = await sql`SELECT id FROM profiles WHERE email = ${u.email}`

    if (rows.length > 0) {
      console.log(`  \u2713 ${u.full_name} (${u.role}) already exists`)
      continue
    }

    await sql`
      INSERT INTO profiles (full_name, email, password_hash, role)
      VALUES (${u.full_name}, ${u.email}, ${passwordHash}, ${u.role})
    `
    console.log(`  \u2713 ${u.full_name} (${u.role})`)
  }

  // Seed reference data
  console.log('\n  Seeding reference data...')

  const { rows: years } = await sql`SELECT id FROM academic_years WHERE name = '2026'`
  if (years.length === 0) {
    await sql`
      INSERT INTO academic_years (name, start_date, end_date, is_current)
      VALUES ('2026', '2026-01-01', '2026-12-31', true)
    `
    console.log('  \u2713 Academic year: 2026')
  }

  for (const name of ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']) {
    const { rows: existing } = await sql`SELECT id FROM classes WHERE name = ${name}`
    if (existing.length === 0) {
      await sql`INSERT INTO classes (name, section, academic_year) VALUES (${name}, 'A', '2026')`
    }
  }
  console.log('  \u2713 Classes: 1-5')

  const classes = await sql`SELECT id, name FROM classes`
  const feeMap = { 'Class 1': 500, 'Class 2': 600, 'Class 3': 700, 'Class 4': 800, 'Class 5': 1000 }
  for (const c of classes) {
    const { rows: existing } = await sql`SELECT id FROM fee_structures WHERE class_id = ${c.id} AND fee_type = 'Tuition'`
    if (existing.length === 0) {
      await sql`
        INSERT INTO fee_structures (class_id, fee_type, amount, academic_year)
        VALUES (${c.id}, 'Tuition', ${feeMap[c.name] || 500}, '2026')
      `
    }
  }
  console.log('  \u2713 Fee structures')

  // Sample expenses & income (only if empty)
  const expenses = await sql`SELECT id FROM expenses LIMIT 1`
  if (expenses.length === 0) {
    await sql`
      INSERT INTO expenses (category, description, amount, date) VALUES
        ('Salary', 'Teacher salaries for January', 50000, '2026-01-05'),
        ('Utilities', 'Electricity bill', 5000, '2026-01-10'),
        ('Maintenance', 'Building repair', 15000, '2026-01-15'),
        ('Books/Supplies', 'Textbooks purchase', 20000, '2026-01-20'),
        ('Events', 'Annual sports day', 10000, '2026-02-01')
    `
    console.log('  \u2713 Sample expenses')
  }

  const income = await sql`SELECT id FROM income LIMIT 1`
  if (income.length === 0) {
    await sql`
      INSERT INTO income (source, description, amount, date) VALUES
        ('Donation', 'Community donation', 100000, '2026-01-05'),
        ('Fees', 'Monthly tuition collection', 75000, '2026-01-15'),
        ('Grant', 'Government grant', 50000, '2026-02-01')
    `
    console.log('  \u2713 Sample income')
  }

  console.log('\n\u2714 Setup complete!\n')
  console.log('  Demo credentials:')
  console.log('    Admin:      admin@madrasa.com / password123')
  console.log('    Teacher:    teacher@madrasa.com / password123')
  console.log('    Accountant: accounts@madrasa.com / password123')
  console.log('\n  Start the app:')
  console.log('    npm run dev')
}

main().catch((err) => {
  console.error(`\n  Error: ${err.message}`)
  process.exit(1)
})
