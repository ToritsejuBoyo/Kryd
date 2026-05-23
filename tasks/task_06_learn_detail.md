# task_06_learn_detail.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 7 | Depends on: task_05 | Parallel: can run alongside task_08

---

## Goal
Build the Course Detail screen and the module completion flow — the core learning experience where users earn points.

---

## File
`/app/course/[id].tsx`

---

## Layout (top to bottom)

### Course header
- Category badge + level pill in a row
- Course title (large, bold)
- Duration and skills count — "18 hrs · 6 skills"
- Skills list — horizontal scrollable pill row

### Enrolment section
**If not enrolled:**
- Free course: "Enrol for Free" button (lime green)
- Pro course: "Unlock with Pro" button (purple) — opens upgrade modal

**If enrolled:**
- Progress bar showing overall completion percentage
- Text: "Module 2 of 3 complete"

### Module list
3 modules per course (hardcoded for MVP):

```
Module 1 — Introduction          (20 min)
Module 2 — Core Concepts         (20 min)
Module 3 — Practice & Assessment (20 min)
```

Each module row shows:
- Module number and title
- Estimated time
- Status icon:
  - 🔒 Locked — gray, not tappable
  - ▶ Available — white, tappable
  - ✓ Completed — lime green checkmark

**Unlock logic:**
- Module 1 unlocks on enrolment
- Module 2 unlocks when Module 1 is completed
- Module 3 unlocks when Module 2 is completed

---

## Module completion flow

Tapping an available module opens a full-screen modal:

1. Module title and a short description (2 sentences, hardcode per module)
2. A "Mark as Complete" button

On tapping "Mark as Complete":
1. Update `user_courses.progress_percent` — add 33 per module (34 for the last one to reach 100)
2. Call `addPoints(userId, 50, 'module_completed')` from `lib/db.ts`
3. Update Zustand store points immediately
4. Show a celebration screen inside the modal:
   - Large ✓ in lime green
   - "+50 points earned!"
   - "Module complete — keep going!"
   - A **Continue** button that closes the modal
5. On modal close, the module list updates to show the new completed state and unlocks the next module

---

## Pro upgrade modal

Triggered by tapping "Unlock with Pro" on a pro course.

Show 3 plan cards:
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Learn, earn, and build your profile |
| Pro | $9.99/mo | Premium courses, analytics, visibility boosts |
| Enterprise | Contact us | Team training and hiring at scale |

Pro card is highlighted with lime green border.

"Upgrade to Pro" button shows a toast: "Payment integration coming soon — we'll notify you when Pro launches!"

---

## Done when
- Course detail shows correct info for each of the 6 seed courses
- Enrolling creates a `user_courses` row and unlocks Module 1
- Completing a module updates progress and awards +50 points
- Points update is reflected immediately on the Dashboard stats card
- Module unlock chain works correctly (1 → 2 → 3)
- Pro gate modal appears for the Cybersecurity Fundamentals course
