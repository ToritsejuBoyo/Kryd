# task_07_jobs_listing.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 8 | Depends on: task_02, task_03 | Parallel: can run alongside task_05 or task_06

---

## Goal
Build the Job Marketplace listing screen — where IT professionals browse and filter global job opportunities.

---

## File
`/app/(tabs)/jobs.tsx`

---

## Layout (top to bottom)

### Header
- Title: "Job Marketplace"
- Subtitle: "Freelance & full-time IT roles"
- Top-right: "Post a Job" ghost button → navigates to `/post-job`

### Search bar
- Placeholder: "Search by title, company, or skill..."
- Filters the list locally as user types
- Match against `title`, `company`, `skills_required`

### Filter tabs
Horizontal scrollable row:
`All` · `Remote` · `Freelance` · `Full-time` · `Hybrid`

Filters by `jobs.type`. "All" shows everything.

### Job cards
For each job show:

**Top row:**
- Job title (bold, left)
- AI Match badge (right) — a pill showing e.g. "AI Match 94%"
  - Generate a random number 70–99 per job on first render
  - Store in component state so it does not change on re-render
  - Colour: lime green text, dark background

**Second row:**
- Company name · Location · Type badge

**Salary:**
- `$4,500 – $5,500 / mo` in `#1D9E75` green
- For fixed-price freelance: `$800 fixed`

**Skills:**
- Pill row showing required skills (max 4, "+n more" if needed)

**Bottom row:**
- Posted date (relative: "2 days ago")
- **Apply** button (primary) OR **Applied ✓** badge if already applied

Tapping the card body navigates to `/job/[id]`.

---

## Data fetching
1. Fetch all jobs from `jobs` table on mount
2. Fetch user's `job_applications` to know which jobs they have applied to
3. Combine into derived list for UI
4. Cache in component state

---

## Empty state
If no jobs match the search or filter: "No jobs match your search. Try a different filter or check back soon."

---

## Done when
- All 6 seed jobs appear with correct salary, skills, and type
- AI Match percentage shows for each job and does not change on re-render
- Already-applied jobs show the Applied badge
- Filter tabs work correctly
- Search works correctly
- Loading skeleton shows while fetching
