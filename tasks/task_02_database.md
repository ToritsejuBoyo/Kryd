# task_02_database.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 2 | Can run in parallel with: nothing yet (auth depends on this)

---

## Goal
Create the full Supabase database — all 8 tables, all seed data, all RLS policies — ready for the app to connect to.

---

## Instructions

### 1. Write the SQL migration file
Create `/supabase/migrations/001_schema.sql` with all 8 tables exactly as defined in KRYD_SPEC.md.

Include these additions:
- All tables use `uuid` primary keys with `gen_random_uuid()`
- All tables have `created_at timestamptz default now()`
- Add a `updated_at` trigger on `user_courses` that updates automatically on row change

### 2. Write the seed data file
Create `/supabase/seed.sql` with INSERT statements for:
- All 6 courses from KRYD_SPEC.md
- All 6 jobs from KRYD_SPEC.md
- All 6 community posts from KRYD_SPEC.md (use a placeholder UUID for user_id — `'00000000-0000-0000-0000-000000000001'`)

### 3. Write the RLS policies file
Create `/supabase/rls_policies.sql` with all policies from KRYD_SPEC.md.

Use this pattern for each table:
```sql
-- Enable RLS
alter table profiles enable row level security;

-- Read own row
create policy "Users can read own profile"
on profiles for select
using (auth.uid() = user_id);

-- Update own row
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = user_id);
```

Write the full policy set for all 8 tables.

### 4. Write a database helper file
Create `/lib/db.ts` with typed helper functions:

```ts
// Example pattern to follow for all tables
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw new Error('Could not load your profile. Please try again.')
  return data
}
```

Write helpers for:
- `getProfile(userId)`
- `updateProfile(userId, updates)`
- `getCourses()`
- `getUserCourses(userId)`
- `getJobs()`
- `getUserApplications(userId)`
- `getCommunityPosts(group?: string)`
- `getPointTransactions(userId)`
- `addPoints(userId, amount, reason)`

All helpers must throw human-readable error strings, never raw Supabase errors.

---

## Done when
- All 3 SQL files exist in the repo
- Running `001_schema.sql` in Supabase SQL Editor creates all 8 tables with no errors
- Running `seed.sql` populates the tables
- Running `rls_policies.sql` enables RLS on all tables
- `lib/db.ts` exports all helper functions with no TypeScript errors
