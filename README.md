# FilledCard

**Fill Your Dance Card** — The social platform for competitive ballroom dancers.

Build your profile, showcase your competition history, find the perfect partner, and connect with professional teachers for Pro-Am partnerships.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk (email + Google OAuth)
- **File uploads**: Cloudinary
- **Search**: PostgreSQL full-text search
- **Scrapers**: Python (see `/scraper`)

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or cloud like Supabase/Neon)
- Python 3.9+ (for scrapers only)
- A [Clerk](https://clerk.com) account
- A [Cloudinary](https://cloudinary.com) account

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourorg/filledcard
cd filledcard
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/filledcard"

# Clerk — get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile/edit

# Cloudinary — get from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Create a PostgreSQL database named `filledcard`, then run:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 4. Seed with sample data

```bash
npm run db:seed
```

This creates:
- **3 verified professional teachers** (with rate cards, Pro-Am open)
- **8 amateur dancers** at various levels and styles
- **5 unclaimed seeded profiles** (simulating scraped data)
- Sample competition results

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (public) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL |

---

## Python Scrapers

The scrapers are in the `/scraper` folder and require Python 3.9+.

### Install scraper dependencies

```bash
cd scraper
pip install -r requirements.txt

# Install Playwright browsers (only needed if NDCA requires JS rendering)
playwright install chromium
```

### Run scrapers

**NDCA scraper** (competitor profiles):
```bash
python ndca_scraper.py
# Output: scraper/output/ndca_dancers.json
```

**O2CM scraper** (competition results):
```bash
python o2cm_scraper.py
# Output: scraper/output/o2cm_results.json
```

**Import to database**:
```bash
python import_to_db.py           # Import both
python import_to_db.py --ndca-only
python import_to_db.py --o2cm-only
```

The importer:
- Deduplicates by name + state
- Links O2CM results to existing dancer profiles where possible
- Creates unclaimed profiles for new names found in results
- Marks all imported profiles as `isClaimed: false`
- Logs a summary: X profiles inserted, Y duplicates skipped, Z results linked

---

## Pages

### Public (no auth required)
| Route | Description |
|---|---|
| `/` | Landing page with hero, stats, featured profiles |
| `/search` | Dancer discovery with style/level/location/status filters |
| `/dancer/[id]` | Public dancer profile |
| `/teachers` | Browse verified Pro-Am teachers |
| `/claim` | Profile claim flow |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |

### Authenticated
| Route | Description |
|---|---|
| `/dashboard` | Your matches, activity feed, partner requests |
| `/matches` | Full compatibility matches (amateur + Pro-Am) |
| `/profile/edit` | Full profile editor with all fields |
| `/messages` | Inbox — thread list + message view |
| `/competitions` | Your competition history + add results |

### Admin
| Route | Description |
|---|---|
| `/admin` | Password-protected admin dashboard |

Admin password: `filledcard-admin` (change before deploying)

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/search` | Search and filter dancers |
| GET/PATCH | `/api/dancer/me` | Get or update current user's profile |
| POST | `/api/dancer/styles` | Add a dance style |
| DELETE | `/api/dancer/styles/[id]` | Remove a dance style |
| POST | `/api/dancer/videos` | Add a video link |
| GET/POST | `/api/competitions` | List or add competition results |
| GET/POST | `/api/messages` | Get thread messages or send |
| GET | `/api/messages/threads` | Get all message threads |
| POST | `/api/partner-requests` | Send a partner request |
| PATCH | `/api/partner-requests/[id]` | Accept or decline a request |
| POST | `/api/upload/photo` | Upload profile photo to Cloudinary |
| POST | `/api/claim` | Claim an unclaimed profile |
| POST | `/api/teachers/[id]/reviews` | Leave a teacher review |
| GET | `/api/admin/stats` | Admin stats |
| POST | `/api/admin/verify-teacher/[id]` | Verify a teacher |

---

## Matching Algorithm

`src/lib/matching.ts` implements `calculateMatchScore(dancer1, dancer2)` returning 0–100.

**Amateur-Amateur scoring:**
- Shared dance styles: +30 (hard requirement — 0 if no overlap)
- Level compatibility (within 1): +20
- Geographic proximity: +20
- Competition frequency alignment: +15
- Budget compatibility: +10
- Partnership type overlap: +5

**Pro-Am scoring** (when dancer has PRO_AM in partnershipType and target isTeacher + openToProAm):
- Style overlap: +40
- Location / travel compatibility: +30
- Level fit: +30

Both modes return `{ score, reasons[], mode }`.

---

## Branding

- **App name**: FilledCard
- **Tagline**: Fill Your Dance Card
- **Primary**: Deep navy `#0F172A`
- **Accent**: Gold `#D4AF37`
- **Fonts**: Inter (UI), Playfair Display (headings)

---

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:generate  # Re-generate Prisma client after schema changes
npm run db:push      # Push schema changes to DB (no migration file)
npm run db:migrate   # Create and run a migration
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:reset     # Reset DB and re-apply migrations
```
