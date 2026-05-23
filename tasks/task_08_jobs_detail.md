# task_08_jobs_detail.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 8 (second agent, run in parallel with task_07) | Depends on: task_02, task_03

---

## Goal
Build two screens: the Job Detail screen (where users apply) and the Post a Job screen (where employers list jobs).

---

## Screen 1 — Job Detail
**File:** `/app/job/[id].tsx`

### Layout

**Header:**
- Back button (top left)
- Job title (large, bold)
- Company · Location · Type badge in a row
- Salary range in green `#1D9E75`

**Description section:**
- Heading: "About this role"
- Full job description text

**Skills section:**
- Heading: "Required skills"
- All skill tags in a pill row (no max here — show all)

**Application section (sticky at bottom of screen):**

If not yet applied:
- "Apply Now" button (full width, lime green)
- Small text below: "Your profile will be shared with the employer"

On tapping Apply:
1. Insert row into `job_applications`: `{ user_id, job_id, status: 'pending' }`
2. Call `addPoints(userId, 5, 'job_applied')` from `lib/db.ts`
3. Update Zustand points
4. Change button to "Application Submitted ✓" (disabled, gray)
5. Show toast: "Application submitted! The employer will review your profile."

If already applied (check on load):
- Show "Application Submitted ✓" button (disabled) immediately
- Show small text: "Applied on [date]"

---

## Screen 2 — Post a Job
**File:** `/app/post-job.tsx`

### Form fields (in order)
1. **Job Title** — text input, required
2. **Company Name** — text input, required
3. **Location** — text input (e.g. "Remote" or "Lagos, Nigeria")
4. **Job Type** — dropdown/picker: Remote · Freelance · Full-time · Hybrid
5. **Salary Min** — numeric input
6. **Salary Max** — numeric input (or "Fixed price" toggle for freelance)
7. **Job Description** — multiline text, min 50 characters
8. **Required Skills** — text input, comma separated (e.g. "AWS, Linux, Terraform")
9. **Contact Email** — email input

### Validation
- All fields required except Contact Email
- Job Description minimum 50 characters — show character count
- Show inline error under each invalid field on submit attempt

### On submit
1. Parse skills string into an array: `skills.split(',').map(s => s.trim())`
2. Insert into `jobs` table with `posted_by = currentUser.id`
3. Navigate to a confirmation screen

### Confirmation screen (inline, replace the form)
Show:
- Large ✓ icon in lime green
- "Your job is live!"
- "Kryd will notify matching IT professionals about this role."
- "View Job" button → navigates to the new job's detail screen
- "Post Another" button → resets the form

---

## Done when
- Applying to a job creates a `job_applications` row in Supabase
- Applying awards +5 points to the user
- Already-applied jobs show the correct disabled state on load
- Post a Job form validates all fields
- Submitting the form creates a new row in `jobs` table
- The new job appears in the Jobs listing after posting
