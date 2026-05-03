# DesignFlow Tracker

> Sistem manajemen project design internal untuk tim FMCG — menggantikan Trello + 2 Google Sheets dengan satu platform terpadu.

---

## 🚀 Deploy ke Vercel (Step-by-Step)

### Prasyarat
- Akun [Vercel](https://vercel.com)
- Akun [Supabase](https://supabase.com) (PostgreSQL gratis)
- Google Cloud project dengan OAuth 2.0 credentials
- Git repo (GitHub / GitLab)

---

### Step 1: Setup Database di Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Pergi ke **Settings → Database → Connection string**
3. Copy **Transaction pooler** URL → ini jadi `DATABASE_URL`
4. Copy **Session pooler** URL → ini jadi `DIRECT_URL`
5. Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

### Step 2: Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru → **APIs & Services → Credentials**
3. Klik **Create Credentials → OAuth Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)
6. Download credentials → catat `Client ID` dan `Client Secret`

### Step 3: Push ke Git

```bash
git init
git add .
git commit -m "Initial commit: DesignFlow Tracker"
git branch -M main
git remote add origin https://github.com/[username]/designflow-tracker.git
git push -u origin main
```

### Step 4: Deploy ke Vercel

1. Login ke [vercel.com](https://vercel.com)
2. Klik **New Project** → Import repository Anda
3. Di **Environment Variables**, tambahkan:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | Transaction pooler URL dari Supabase |
| `DIRECT_URL` | Session pooler URL dari Supabase |
| `GOOGLE_CLIENT_ID` | Dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Dari Google Cloud Console |

4. Klik **Deploy**

### Step 5: Setup Database Schema

Setelah deploy pertama berhasil:

```bash
# Install dependencies lokal
npm install

# Copy env
cp .env.example .env.local
# Edit .env.local dengan nilai yang benar

# Push schema ke database
npm run db:push

# Seed data contoh (opsional tapi sangat disarankan)
npm run db:seed
```

Atau via Vercel CLI:
```bash
npx vercel env pull .env.local
npm run db:push
npm run db:seed
```

---

## 💻 Development Lokal

```bash
# Install dependencies
npm install

# Setup env
cp .env.example .env.local
# Edit .env.local

# Generate Prisma client
npm run db:generate

# Push schema
npm run db:push

# Seed data
npm run db:seed

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
designflow/
├── app/
│   ├── (dashboard)/          # Semua halaman dashboard
│   │   ├── dashboard/        # Halaman utama
│   │   ├── projects/         # List & detail project
│   │   │   └── [id]/         # Detail project per ID
│   │   ├── brief/            # Submit brief
│   │   ├── tasks/            # My Tasks (designer)
│   │   ├── workload/         # Team workload (manager/spv)
│   │   ├── calendar/         # Deadline timeline
│   │   ├── review/           # Approval queue
│   │   ├── kpi/              # KPI report
│   │   ├── assets/           # Asset library
│   │   ├── integrations/     # Setup integrasi
│   │   └── settings/         # User & roles
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth handler
│   │   ├── projects/         # CRUD project + feedback + approval
│   │   └── dashboard/        # Stats
│   └── login/                # Login page
├── components/
│   ├── auth/                 # Login button
│   ├── dashboard/            # Dashboard client components
│   ├── layout/               # Sidebar, Topbar
│   ├── projects/             # Project list & detail
│   ├── brief/                # Submit brief wizard
│   ├── kpi/                  # KPI report
│   ├── workload/             # Workload view
│   ├── shared/               # Badges, dll
│   └── ui/                   # Shadcn/UI primitives
├── lib/
│   ├── db.ts                 # Prisma client
│   └── utils.ts              # Helpers & constants
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data contoh
├── auth.ts                   # NextAuth config
├── middleware.ts             # Route protection
└── vercel.json               # Vercel config
```

---

## 👥 Akun Test (setelah seed)

Setelah `npm run db:seed`, akun berikut terdaftar:

| Nama | Email | Role |
|------|-------|------|
| Rahmat Hidayat | rahmat@company.com | Manager |
| Sari Dewi | sari@company.com | SPV |
| Andi Sutrisno | andi@company.com | Designer |
| Budi Raharjo | budi@company.com | Designer |
| Citra Noviana | citra@company.com | Designer |
| Deni Kurniawan | deni@company.com | Designer |
| Lisa Santoso | lisa@company.com | Brand (Indomilk) |
| Tomi Wijaya | tomi@company.com | Brand (Chitato) |

> ⚠️ Login menggunakan Google OAuth — email di atas harus terdaftar di Google Workspace perusahaan Anda, atau tambahkan email Google personal Anda ke database via Prisma Studio.

---

## 🔌 Integrasi (Opsional)

Lihat halaman `/integrations` setelah deploy untuk panduan setup:
- **Trello** — Sync status ke board BD Design Request
- **Google Sheets** — Update tracker otomatis
- **Google Drive** — Auto-create folder project
- **Google Calendar** — Sync deadline sebagai events

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (Google OAuth)
- **UI**: Tailwind CSS + Radix UI
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Deploy**: Vercel

---

## 📝 Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema (tanpa migration)
npm run db:migrate     # Create migration
npm run db:seed        # Seed contoh data
npm run db:studio      # Buka Prisma Studio (GUI DB)
```

---

## ❓ Troubleshooting

**Build gagal di Vercel?**
- Pastikan semua environment variables sudah diset
- Check bahwa `DATABASE_URL` adalah Transaction pooler (untuk build)

**Login tidak berfungsi?**
- Pastikan `NEXTAUTH_URL` = URL production yang benar
- Pastikan redirect URI di Google Cloud sudah ditambahkan

**Database error?**
- Jalankan `npm run db:push` setelah deploy pertama
- Check connection string format Supabase

---

*DesignFlow Tracker v1.0 · Internal Use Only*
