# task_05_learn_listing.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 6 | Depends on: task_02, task_03 | Parallel: can run alongside task_07

---

## Goal
Build the Learning Hub listing screen — where users browse, search, and filter all available courses.

---

## File
`/app/(tabs)/learn.tsx`

---

## Layout (top to bottom)

### Header
- Title: "Learning Hub"
- Subtitle: "Earn +50 pts per module"

### Search bar
- Placeholder: "Search courses — e.g. CompTIA, cloud..."
- Filters the course list in real time as the user types
- Match against `title` and `skills` array
- Filter is local — no new Supabase calls on each keystroke

### Category filter tabs
Horizontal scrollable row of pills:
`All` · `IT Support` · `Cloud` · `Security` · `Fundamentals`

Active tab: filled lime green `#CCDF1A` background, dark text
Inactive tab: transparent background, white border, white text

Tapping a tab filters the course list. "All" shows everything.

### Course cards
For each course show:
- **Title** (bold)
- **Category badge** — colour coded:
  - IT Support → blue
  - Cloud → teal
  - Security → amber
  - Fundamentals → gray
- **Level** and **Duration** — e.g. "Beginner · 18 hrs"
- **Free / Pro badge** — green for Free, purple for Pro
- **Skill tags** — pill row (show max 3, "+2 more" if needed)
- **Progress bar** — only if user is enrolled in this course (from `user_courses`)
- **Enrol / Resume / Locked** CTA button:
  - Not enrolled + free → "Enrol Free"
  - Not enrolled + pro → "Unlock with Pro"
  - Enrolled → "Resume" (shows progress %)
  - Completed → "Completed ✓"

Tapping a card navigates to `/course/[id]`.

### Daily Challenge card (pinned at bottom)
Separate styled card with trophy icon:
- Title: "Daily IT Challenge"
- Subtitle: "Answer correctly to earn +50 pts"
- **Start** button → opens the same challenge modal as the Dashboard
- If already completed today → shows "Completed today · Come back tomorrow ✓"

---

## Data fetching
1. Fetch all courses from `courses` table on mount
2. Fetch current user's `user_courses` rows to know enrollment and progress
3. Combine both into a single derived list for the UI
4. Cache in component state — do not re-fetch on every tab visit (use Zustand or React state with a flag)

---

## Done when
- All 6 seed courses appear with correct badges, levels, and skills
- Search filters the list correctly
- Category tabs filter correctly
- Enrolled courses show their progress bar
- Daily challenge card shows at the bottom
- Loading skeleton shows while fetching
- Empty state if no courses match search
