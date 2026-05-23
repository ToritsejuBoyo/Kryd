# task_13_testing.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 13 | Depends on: task_12 | Run as ONE focused agent

---

## Goal
Lock down security and verify that every core user journey works correctly end to end.

---

## 1. RLS policy audit

Check and correct all RLS policies against the rules in KRYD_SPEC.md.

Test each policy by temporarily logging in as two different users and confirming:
- User A cannot read or modify User B's `profiles`, `user_courses`, `job_applications`, `point_transactions`, or `notifications`
- Both users can read all `courses` and `jobs`
- Both users can read all `community_posts` but can only update/delete their own

If any policy is missing or incorrect, write and apply the fix.

---

## 2. End-to-end journey tests

Test each journey completely. Do not skip steps.

**Journey 1 — New user onboarding:**
1. Open app with no session → Welcome screen appears
2. Tap Get Started → Sign Up screen
3. Fill all fields, select a role → submit
4. Profile row created in Supabase ✓
5. Dashboard shows user's name ✓
6. Stats show 0 points, 0 courses ✓

**Journey 2 — Learning and earning:**
1. Go to Learn tab → 6 courses visible
2. Tap a free course → Course Detail screen
3. Tap Enrol → `user_courses` row created, Module 1 unlocked ✓
4. Tap Module 1 → Mark as Complete → progress +33%, points +50 ✓
5. Return to Dashboard → Active Courses stat updated ✓
6. Points badge updated ✓

**Journey 3 — Job application:**
1. Go to Jobs tab → 6 jobs visible
2. Tap a job → Job Detail screen
3. Tap Apply → `job_applications` row created, points +5 ✓
4. Button changes to "Application Submitted" ✓
5. Navigate away and come back → button still shows "Applied" ✓
6. Go to Profile → My Applications shows the job ✓

**Journey 4 — Community:**
1. Go to Community tab → 6 seed posts visible
2. Tap heart on a post → `likes_count` increments in Supabase ✓
3. Tap + button → Create Post screen
4. Select group, write 30+ character post → Post ✓
5. `community_posts` row created, points +10 ✓
6. New post appears at top of feed ✓
7. Check Leaderboard tab → current user appears with correct points ✓

**Journey 5 — Returning user:**
1. Force close the app
2. Reopen → goes straight to Dashboard (no login screen) ✓
3. All data is intact ✓

---

## 3. Edge case tests

Test each of these and fix any failures:

| Scenario | Expected behaviour |
|----------|--------------------|
| Tap Apply twice rapidly | Only one `job_applications` row created |
| Submit post with 15 characters | Blocked — inline error shown |
| Tap daily challenge twice (same day) | Second attempt shows "Already completed" |
| Open app with no internet | Shows friendly offline message, no crash |
| Enter wrong password at login | Shows friendly error, does not crash |
| Submit sign up form with empty fields | Inline errors under each empty field |
| Complete all 3 modules of a course | `progress_percent` reaches 100, course marked completed |
| Convert more points than balance | Convert button remains disabled |

---

## 4. Fix everything found

For each failure in sections 2 and 3, write the fix clearly as a comment before applying it:
```
// FIX: double-tap on Apply was creating duplicate rows
// Solution: disable button immediately on first tap, re-enable on error
```

---

## Done when
- All 5 end-to-end journeys pass without any errors
- All 8 edge cases behave as expected
- No RLS violations are possible between different user accounts
- All fixes are applied and the full journey tests are re-run and pass
