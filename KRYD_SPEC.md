# KRYD_SPEC.md
> This file lives permanently in the Antigravity workspace.
> Every agent must read this file before starting any task.

---

## What is Kryd?

Kryd is an AI-powered professional ecosystem for IT Support specialists, tech professionals, and enthusiasts worldwide. It brings together skill development, global job opportunities, and a real earning economy in one platform.

**Tagline:** "The Next Evolution in IT Support is Here."

---

## Brand

| Token | Value |
|-------|-------|
| Primary background | `#0B2D2C` — deep dark teal |
| Accent / highlight | `#CCDF1A` — electric lime green |
| Primary text | `#FFFFFF` — white |
| Secondary text | `rgba(255,255,255,0.6)` — muted white |
| Card surface | `rgba(255,255,255,0.05)` with `rgba(255,255,255,0.08)` border |
| Success green | `#1D9E75` |

**Font:** Inter from Google Fonts. Weight 400 body, 500 subheadings, 700 headings.

**Logo:** Bold geometric "K" in `#CCDF1A` followed by "ryd" in white.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo (TypeScript) |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind for React Native) |
| State | Zustand |
| Backend | Supabase |
| Database | PostgreSQL via Supabase |
| Deployment | EAS (Expo Application Services) |
| Web hosting | Vercel or Netlify |

---

## Folder Structure

```
/app
  /(auth)
    welcome.tsx
    signup.tsx
    login.tsx
  /(tabs)
    index.tsx          ← Dashboard
    learn.tsx          ← Learning Hub
    jobs.tsx           ← Job Marketplace
    community.tsx      ← Community Hub
  /course/[id].tsx
  /job/[id].tsx
  /community/create.tsx
  /post-job.tsx
  /wallet.tsx
  /profile.tsx
  /notifications.tsx
/lib
  supabase.ts
  theme.ts
/store
  userStore.ts
/components
  (shared UI components)
/supabase
  /migrations
    001_schema.sql
```

---

## Database Schema

### profiles
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users not null unique
full_name text
role text  -- 'IT Support Specialist' | 'Student' | 'Employer'
avatar_url text
bio text
points int default 0
coins int default 0
is_pro boolean default false
created_at timestamptz default now()
```

### courses
```sql
id uuid primary key default gen_random_uuid()
title text not null
description text
category text  -- 'IT Support' | 'Cloud' | 'Security' | 'Fundamentals'
level text     -- 'Beginner' | 'Intermediate' | 'Advanced'
duration_hrs numeric
is_free boolean default true
skills text[]
created_at timestamptz default now()
```

### user_courses
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users not null
course_id uuid references courses not null
progress_percent int default 0
completed_at timestamptz
updated_at timestamptz default now()
unique(user_id, course_id)
```

### jobs
```sql
id uuid primary key default gen_random_uuid()
title text not null
company text
location text
type text  -- 'Remote' | 'Freelance' | 'Full-time' | 'Hybrid'
salary_min numeric
salary_max numeric
description text
skills_required text[]
posted_by uuid references auth.users
created_at timestamptz default now()
```

### job_applications
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users not null
job_id uuid references jobs not null
status text default 'pending'  -- 'pending' | 'viewed' | 'rejected'
applied_at timestamptz default now()
unique(user_id, job_id)
```

### community_posts
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users not null
group_name text  -- 'IT Support' | 'Cloud' | 'Security' | 'Helpdesk' | 'Career'
content text not null
likes_count int default 0
created_at timestamptz default now()
```

### point_transactions
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users not null
amount int not null   -- positive = earn, negative = spend
reason text
created_at timestamptz default now()
```

### notifications
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users not null
message text
is_read boolean default false
created_at timestamptz default now()
```

---

## Zustand Store (userStore.ts)

```ts
interface UserStore {
  profile: {
    id: string
    full_name: string
    role: string
    points: number
    coins: number
    is_pro: boolean
  } | null
  setProfile: (profile: UserStore['profile']) => void
  updatePoints: (amount: number) => void
  clearProfile: () => void
}
```

---

## Points Economy

| Action | Points |
|--------|--------|
| Complete a course module | +50 |
| Daily challenge (correct) | +50 |
| Create a community post | +10 |
| Apply to a job | +5 |

**Conversion:** 100 points = 1 coin. Minimum conversion: 500 points. Platform fee: 5%.

---

## Seed Data

### Courses (6)
1. CompTIA A+ Core 1 & 2 — IT Support, Beginner, 18hrs, **free**
2. Cybersecurity Fundamentals — Security, Beginner, 12hrs, **pro**
3. Google Cloud Associate Engineer — Cloud, Intermediate, 24hrs, **free**
4. Windows Server Administration — IT Support, Intermediate, 10hrs, **free**
5. Helpdesk Ticketing & ITSM — IT Support, Beginner, 6hrs, **free**
6. Linux for IT Professionals — Fundamentals, Beginner, 8hrs, **free**

### Jobs (6)
1. IT Support Specialist L2 — TechNova Inc, Remote, Full-time, $4,500–$5,500/mo
2. Cloud Support Engineer — CloudBase Ltd, Lagos Hybrid, $3,000–$4,000/mo
3. Freelance: Network Setup & Config — Remote, $800 fixed
4. Helpdesk Analyst — FinCorp, Remote Full-time, $2,500–$3,200/mo
5. Junior IT Support — GreenTech, Remote Full-time, $1,800–$2,500/mo
6. Freelance: Server Migration Project — Remote, $1,500 fixed

### Community Posts (6)
1. "Just passed my CompTIA A+ exam! What certification should I target next?" — IT Support
2. "Anyone struggling with AWS IAM policies? I keep getting AccessDenied errors." — Cloud
3. "Looking for a Security+ study partner. Planning to sit it in 6 weeks." — Security
4. "Tip: Always document every ticket resolution in detail. Future you will thank you." — Helpdesk
5. "Landed my first IT Support role through Kryd! The AI matching is surprisingly accurate." — Career
6. "What's everyone's go-to resource for learning Linux CLI?" — IT Support

---

## Daily Challenge Questions (rotate by day of week)
1. Monday — What does DNS stand for? *(Domain Name System)*
2. Tuesday — Which port does HTTPS use by default? *(443)*
3. Wednesday — What does RAID stand for? *(Redundant Array of Independent Disks)*
4. Thursday — What OSI layer does a switch operate at? *(Layer 2 — Data Link)*
5. Friday — What command shows active network connections on Windows? *(netstat)*
6. Saturday — What does DHCP assign to devices on a network? *(IP addresses)*
7. Sunday — What does SSD stand for? *(Solid State Drive)*

---

## RLS Rules (Row Level Security)

| Table | Read | Write |
|-------|------|-------|
| profiles | own row only | own row only |
| courses | all authenticated | nobody from app |
| user_courses | own rows only | own rows only |
| jobs | all authenticated | authenticated users can insert |
| job_applications | own rows only | own rows only |
| community_posts | all authenticated | own rows only |
| point_transactions | own rows only | own rows only |
| notifications | own rows only | own rows only |

---

## Key Rules for All Agents

1. Always use NativeWind classes for styling — no inline StyleSheet objects.
2. Always use Expo Router file-based navigation — no React Navigation.
3. Always read/write Supabase through the client in `lib/supabase.ts`.
4. Always update the Zustand store after any points change — never let the UI go stale.
5. All Supabase calls must be wrapped in try/catch with human-readable error messages.
6. Never show raw error codes to the user.
7. Use `KeyboardAvoidingView` on every screen with text inputs.
8. Every screen that fetches data must show a loading skeleton while fetching.
9. Every screen that can have no data must show a meaningful empty state.
