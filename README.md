<div align="center">

<img src="public/favicon.png" alt="Madrasha Logo" width="100" height="100" style="border-radius: 20px"/>

# 🕌 মাদ্রাসা ম্যানেজমেন্ট সিস্টেম
### Madrasha Management System

**A modern, full-stack Islamic school management platform built with Next.js 16 & PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Neon DB](https://img.shields.io/badge/Neon-PostgreSQL-00E5E5?style=for-the-badge&logo=postgresql)](https://neon.tech)

[Live Demo](http://localhost:3000) · [GitHub Issues](https://github.com/morshedkoli/madrasa/issues) · [Database Schema](supabase/migrations/00001_schema.sql)

---

</div>

## 📸 Screenshots

| Home Page | Admin Dashboard |
|-----------|----------------|
| ![Home](public/favicon.png) | ![Admin](public/favicon.png) |

| Teacher Portal | Accounts Portal |
|----------------|----------------|
| ![Teacher](public/favicon.png) | ![Accounts](public/favicon.png) |

---

## ✨ Overview

**মাদ্রাসা ম্যানেজমেন্ট সিস্টেম** is a comprehensive digital management platform designed specifically for Islamic primary schools (Madrasha). It eliminates paper-based operations by providing a unified, role-based digital solution for administrators, teachers, and accountants.

### 🎯 Key Goals
- **Paperless Operations** — Digital attendance, grades, and fee records
- **Role-based Access Control** — Each user sees only what they need
- **Real-time Data** — Live statistics fetched directly from PostgreSQL
- **Bangla-first UI** — Full Bengali language support with premium typography
- **Financial Transparency** — Complete income, expense, and fee tracking

---

## 🏗️ Architecture

```
madrasha_app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 🏠 Home / Landing page (Server Component)
│   │   ├── layout.tsx            # Root layout + Bangla fonts
│   │   ├── globals.css           # Global CSS + design tokens
│   │   │
│   │   ├── admin/                # 🛡️ Admin Portal
│   │   │   ├── page.tsx          # Dashboard with live stats
│   │   │   ├── students/         # Student enrollment & profiles
│   │   │   ├── teachers/         # Teacher management
│   │   │   ├── classes/          # Class & section management
│   │   │   ├── attendance/       # Attendance overview
│   │   │   ├── grades/           # Grade management
│   │   │   ├── fees/             # Fee structure setup
│   │   │   ├── accounting/       # Financial overview
│   │   │   ├── notices/          # Notice board management
│   │   │   └── settings/         # System configuration
│   │   │
│   │   ├── teacher/              # 👨‍🏫 Teacher Portal
│   │   │   ├── page.tsx          # Teacher dashboard
│   │   │   ├── attendance/       # Mark daily attendance
│   │   │   ├── grades/           # Enter student grades
│   │   │   ├── classes/          # View assigned classes
│   │   │   ├── students/         # View class students
│   │   │   └── notices/          # View school notices
│   │   │
│   │   ├── accounts/             # 💰 Accounts Portal
│   │   │   ├── page.tsx          # Finance dashboard
│   │   │   ├── fees/             # Collect fee payments
│   │   │   ├── income/           # Record income
│   │   │   ├── expenses/         # Record expenses
│   │   │   └── reports/          # Financial reports (PDF export)
│   │   │
│   │   ├── auth/login/           # 🔐 Authentication
│   │   └── api/                  # API Routes
│   │       ├── login/            # JWT-based login
│   │       ├── logout/           # Session termination
│   │       ├── me/               # Current user info
│   │       └── sql/              # Secure SQL proxy
│   │
│   ├── components/
│   │   ├── shared/               # Reusable UI components
│   │   │   ├── DashboardShell    # Portal layout wrapper
│   │   │   ├── DataTable         # Generic sortable table
│   │   │   ├── StatCard          # Metric display card
│   │   │   ├── Modal             # Overlay modal
│   │   │   ├── ConfirmDialog     # Delete confirmation
│   │   │   └── PageHeader        # Page title + actions
│   │   └── ui/                   # Radix UI primitives
│   │
│   ├── lib/
│   │   ├── db-server.ts          # Neon PostgreSQL (Server-side)
│   │   ├── db.ts                 # Client-side DB proxy
│   │   ├── auth.ts               # JWT session management
│   │   ├── bn.ts                 # Bengali utility functions
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── utils.ts              # Helper functions
│   │
│   ├── hooks/
│   │   └── useUser.ts            # Auth state hook
│   │
│   └── proxy.ts                  # Next.js 16 Proxy (route protection)
│
├── supabase/migrations/          # Database schema & migrations
├── public/                       # Static assets + favicons
└── scripts/                      # Setup & migration scripts
```

---

## 🚀 Features

### 🛡️ Admin Portal
| Feature | Description |
|---------|-------------|
| **Student Management** | Enroll, view, search, and manage student profiles with parent info |
| **Teacher Management** | Create and assign teacher accounts to classes |
| **Class Management** | Create classes, sections, and assign teachers |
| **Attendance Overview** | View attendance records across all classes |
| **Grade Management** | View and manage student exam grades |
| **Fee Structure** | Define tuition and other fees per class per academic year |
| **Accounting** | Overview of all income and expenses |
| **Notice Board** | Post notices targeting all staff, teachers, or accountants |
| **Settings** | Configure academic years and system preferences |
| **Reports** | Export financial and academic data as PDF |

### 👨‍🏫 Teacher Portal
| Feature | Description |
|---------|-------------|
| **Dashboard** | Quick overview of assigned classes and today's attendance |
| **Attendance** | Mark daily student attendance (Present / Absent / Late) |
| **Grade Entry** | Submit exam marks by subject |
| **My Classes** | View details of assigned classes and subjects |
| **Students** | Browse profiles of students in assigned classes |
| **Notices** | Read school-wide and teacher-targeted notices |

### 💰 Accounts Portal
| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time income, expense, and balance summary |
| **Fee Collection** | Record student fee payments with receipt generation |
| **Income Recording** | Log all income sources (fees, donations, grants) |
| **Expense Tracking** | Track expenses by category with approval workflow |
| **Financial Reports** | Monthly/yearly P&L reports with PDF export |

---

## 🗄️ Database Schema

```
PostgreSQL (Neon Serverless)
│
├── profiles          → User accounts (admin, teacher, accountant)
├── academic_years    → Academic year tracking
├── classes           → Classes with teacher assignments
├── subjects          → Subjects per class
├── students          → Student records with full family info
├── attendance        → Daily attendance records
├── grades            → Exam marks per student/subject
├── fee_structures    → Fee definitions per class
├── fee_payments      → Payment records with receipts
├── expenses          → Expense tracking
├── income            → Income recording
├── notices           → Role-targeted announcements
└── activity_logs     → Audit trail of all actions
```

**Row-Level Security (RLS)** is enforced on every table:
- Admins have full access to all data
- Teachers can only read/write their assigned class data
- Accountants can access all financial tables

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **UI Components** | [Radix UI](https://radix-ui.com) primitives |
| **Database** | [Neon PostgreSQL](https://neon.tech) (Serverless) |
| **Auth** | JWT via [jose](https://github.com/panva/jose) + bcryptjs |
| **Charts** | [Recharts](https://recharts.org) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + AutoTable |
| **Excel Export** | [SheetJS (xlsx)](https://sheetjs.com) |
| **Toast Alerts** | [react-hot-toast](https://react-hot-toast.com) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Bangla Fonts** | [Anek Bangla](https://fonts.google.com/specimen/Anek+Bangla) + [Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri) |

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v20.9 or later
- **npm** v10+
- A **Neon** (or compatible PostgreSQL) database

### 1. Clone the Repository

```bash
git clone https://github.com/morshedkoli/madrasa.git
cd madrasa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# PostgreSQL connection string (Neon, Supabase, or any Postgres)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT secret for session signing (generate with: openssl rand -hex 32)
AUTH_SECRET=your-random-secret-here
```

### 4. Set Up the Database

Run the schema migration in your database SQL editor:

```bash
# Option 1: Run the migration script
node scripts/migrate.mjs

# Option 2: Manually run the SQL file in your DB console
# Copy and paste contents of: supabase/migrations/00001_neon_schema.sql
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to see the application.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@madrasa.edu` | `admin123` |
| **Teacher** | `teacher@madrasa.edu` | `teacher123` |
| **Accountant** | `accountant@madrasa.edu` | `accountant123` |

> ⚠️ **Note:** Demo accounts must be seeded via the admin panel on first run, or by running `SELECT seed_demo_data();` in your database.

---

## 🔐 Authentication Flow

```
User submits credentials
        ↓
POST /api/login
        ↓
bcryptjs password verification
        ↓
JWT signed with AUTH_SECRET (jose)
        ↓
Secure HttpOnly cookie set
        ↓
proxy.ts checks cookie on every request
        ↓
Role-based redirect to /admin, /teacher, or /accounts
```

---

## 📱 Role-Based Access Control

```
/ (Public Landing Page)
│
├── /admin/**         → Admin only
├── /teacher/**       → Teacher only
├── /accounts/**      → Accountant only
└── /auth/login       → Unauthenticated only

All routes protected by proxy.ts (Next.js 16 Proxy)
Unauthorized requests → redirect to /auth/login
```

---

## 🌐 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | Authenticate user, issue JWT cookie |
| `POST` | `/api/logout` | Clear session cookie |
| `GET` | `/api/me` | Get current authenticated user |
| `POST` | `/api/sql` | Secure database query proxy |

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Build production bundle
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 🎨 Design System

The application uses a carefully crafted design system:

- **Primary Color:** `#1B6B3A` (Forest Green — Islamic tradition)
- **Accent Color:** `#C9A84C` (Gold — prestige and warmth)
- **Background:** `#FAF7F0` (Warm off-white — easy on the eyes)
- **Heading Font:** [Anek Bangla](https://fonts.google.com/specimen/Anek+Bangla) — bold, modern Bengali display font
- **Body Font:** [Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri) — highly legible Bengali text font
- **Border Radius:** Consistent 2xl/3xl for cards, xl for buttons
- **Shadows:** Subtle multi-layer shadows for depth

---

## 🗂️ Database Migrations

All migrations are located in [`supabase/migrations/`](supabase/migrations/):

| File | Description |
|------|-------------|
| `00001_schema.sql` | Core schema for Supabase (with auth.users) |
| `00001_neon_schema.sql` | Core schema for Neon (standalone users table) |
| `00002_fix_rls_recursion.sql` | RLS policy fixes for recursion issues |
| `00003_neon_auth.sql` | Custom auth tables for Neon deployment |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Morshed Koli**  
GitHub: [@morshedkoli](https://github.com/morshedkoli)

---

<div align="center">

**Built with ❤️ for Islamic education in Bangladesh**

*প্রযুক্তির মাধ্যমে ইসলামিক শিক্ষাকে শক্তিশালীকরণ*  
*(Empowering Islamic Education Through Technology)*

</div>
