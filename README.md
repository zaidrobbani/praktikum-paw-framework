# 🐾 PAW — Praktikum Pemrograman Aplikasi Web

Aplikasi web full-stack yang dibangun menggunakan **Next.js 16**, **Prisma ORM**, dan **PostgreSQL**. Proyek ini merupakan monorepo yang menggabungkan frontend dan backend dalam satu codebase Next.js dengan arsitektur modular.

---

## 🧰 Tech Stack

| Kategori | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL 17 (via Docker) |
| **ORM** | Prisma 7 + `@prisma/adapter-pg` |
| **Auth** | JWT (Access Token + Refresh Token) |
| **State Management** | Zustand |
| **Data Fetching** | TanStack React Query + Axios |
| **Form** | React Hook Form + Zod |
| **Styling** | Tailwind CSS v4 |
| **Container** | Docker & Docker Compose |

---

## 📁 Struktur Proyek

```
paw/
├── prisma/
│   ├── schema.prisma        # Definisi model database
│   ├── seed.ts              # Data awal (seed) database
│   └── migrations/          # File migrasi database
├── src/
│   ├── app/
│   │   ├── (auth)/          # Halaman login & register
│   │   ├── products/        # Halaman produk
│   │   ├── api/
│   │   │   ├── auth/        # Endpoint: login, register, logout, refresh, me
│   │   │   └── products/    # Endpoint CRUD produk
│   │   └── layout.tsx
│   ├── backend/
│   │   ├── config/          # Konfigurasi (DB, JWT, dll.)
│   │   ├── lib/             # Library & utilitas backend
│   │   ├── middleware/      # Middleware autentikasi
│   │   └── modules/         # Modul bisnis (auth, product)
│   └── frontend/
│       ├── components/      # Komponen UI reusable
│       ├── feataure/        # Fitur-fitur halaman
│       ├── hooks/           # Custom React hooks
│       ├── layout/          # Layout komponen
│       ├── lib/             # Utilitas frontend
│       ├── repository/      # Layer pemanggilan API
│       ├── shared/          # Tipe & konstanta bersama
│       └── stores/          # Zustand stores
├── .env.example             # Contoh variabel lingkungan
├── docker-compose.yml       # Konfigurasi Docker Compose
├── Dockerfile               # Dockerfile multi-stage build
├── next.config.ts
├── prisma.config.ts
└── package.json
```

---

## ⚙️ Prasyarat

Pastikan tools berikut sudah terinstal di sistemmu:

- **Node.js** `>= 20.x` — [Download](https://nodejs.org)
- **npm** `>= 10.x`
- **Docker** & **Docker Compose** — [Download](https://www.docker.com/get-started)

---

## 🚀 Panduan Menjalankan Proyek (Development)

### Langkah 1 — Clone & Install Dependensi

```bash
git clone <repository-url>
cd paw
npm install
```

---

### Langkah 2 — Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env`, lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
# Secret untuk JWT (gunakan string acak yang panjang)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# URL API untuk frontend (tidak perlu diubah untuk development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Mode aplikasi
NODE_ENV=development

# Konfigurasi database PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=paw

# URL koneksi database (disesuaikan dengan nilai di atas)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/paw?schema=public
```

> **⚠️ Penting:** Pastikan nilai `DATABASE_URL` konsisten dengan `POSTGRES_USER`, `POSTGRES_PASSWORD`, dan `POSTGRES_DB`.

---

### Langkah 3 — Jalankan Database dengan Docker Compose

**Build image (hanya perlu dilakukan sekali atau jika ada perubahan Dockerfile):**

```bash
docker compose up -d --build
```

**Jalankan container (untuk penggunaan selanjutnya):**

```bash
docker compose up -d
```

Perintah ini akan menjalankan container **PostgreSQL 17** di background pada port `5432`.

Verifikasi container berjalan:

```bash
docker compose ps
```

---

### Langkah 4 — Jalankan Migrasi Database

Buat tabel-tabel database berdasarkan `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name init
```

Perintah ini akan:
1. Membuat file migrasi baru di `prisma/migrations/`
2. Menerapkan migrasi ke database
3. Meng-generate Prisma Client

---

### Langkah 5 — Isi Data Awal (Seed)

Isi database dengan data sample (user dan produk):

```bash
npx prisma db seed
```

Data yang akan dibuat:

| Email | Password | Role | Produk |
|---|---|---|---|
| `admin@example.com` | `password123` | Admin | Premium Dog Food, Cat Toy Mouse |
| `user@example.com` | `password123` | User | Bird Cage |

---

### Langkah 6 — Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di: **[http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Build untuk Production

### Build Aplikasi

```bash
npm run build
```

Perintah ini menghasilkan output **standalone** di `.next/standalone/` yang siap di-deploy.

### Jalankan Production Server

```bash
npm start
```

### Build Docker Image (Full Production)

```bash
docker compose up -d --build
```

---

## 🔌 API Endpoints

### Autentikasi (`/api/auth`)

| Method | Endpoint | Deskripsi | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Daftar akun baru | ❌ |
| `POST` | `/api/auth/login` | Login dan dapatkan token | ❌ |
| `POST` | `/api/auth/logout` | Logout (hapus refresh token) | ✅ |
| `POST` | `/api/auth/refresh` | Perbarui access token | ❌ (butuh refresh token) |
| `GET` | `/api/auth/me` | Ambil data user yang sedang login | ✅ |

### Produk (`/api/products`)

| Method | Endpoint | Deskripsi | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Ambil semua produk | ✅ |
| `POST` | `/api/products` | Buat produk baru | ✅ |
| `GET` | `/api/products/:id` | Ambil detail produk | ✅ |
| `PUT` | `/api/products/:id` | Update produk | ✅ |
| `DELETE` | `/api/products/:id` | Hapus produk | ✅ |

> **Auth Required ✅** → Sertakan header `Authorization: Bearer <access_token>`

---

## 🗄️ Skema Database

```
User
├── id           String   (cuid, primary key)
├── email        String   (unique)
├── name         String
├── password     String   (hashed dengan bcrypt)
├── refreshToken String?
├── createdAt    DateTime
└── products     Product[]

Product
├── id           String   (cuid, primary key)
├── name         String
├── description  String?
├── price        Float
├── stock        Int      (default: 0)
├── createdAt    DateTime
├── updatedAt    DateTime
├── userId       String   (foreign key)
└── user         User
```

---

## 🧪 Perintah Berguna Lainnya

```bash
# Melihat isi database via Prisma Studio (GUI)
npx prisma studio

# Membuat migrasi baru setelah mengubah schema.prisma
npx prisma migrate dev --name <nama_migrasi>

# Reset database (hapus semua data & migrasi, lalu migrate ulang)
npx prisma migrate reset

# Generate ulang Prisma Client
npx prisma generate

# Melihat log container Docker
docker compose logs -f

# Menghentikan container
docker compose down

# Menghentikan container dan hapus volume (data database terhapus)
docker compose down -v

# Linting
npm run lint
```

---

## 🔄 Urutan Perintah Lengkap (Quick Reference)

```bash
# 1. Install dependensi
npm install

# 2. Salin dan konfigurasi environment variables
cp .env.example .env
# (edit .env sesuai kebutuhan)

# 3. Jalankan PostgreSQL via Docker
docker compose up -d --build   # Pertama kali / ada perubahan Dockerfile
docker compose up -d           # Selanjutnya

# 4. Migrasi database
npx prisma migrate dev --name init

# 5. Seed data awal
npx prisma db seed

# 6. Jalankan development server
npm run dev
```

---

## ❗ Troubleshooting

### Port 5432 sudah digunakan
Jika PostgreSQL sudah berjalan di sistem lokal:
```bash
# Hentikan service PostgreSQL lokal (Linux)
sudo systemctl stop postgresql
```
Atau ubah port di `docker-compose.yml` (misal: `"5433:5432"`) dan sesuaikan `DATABASE_URL` di `.env`.

### Error koneksi database saat migrasi
Pastikan container Docker sudah berjalan dan healthy:
```bash
docker compose ps
docker compose logs postgres
```

### Prisma Client belum ter-generate
```bash
npx prisma generate
```

### Error `Cannot find module` setelah install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Praktikum Pemrograman Aplikasi Web (PAW)**.
