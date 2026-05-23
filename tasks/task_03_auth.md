# task_03_auth.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 3 | Depends on: task_01, task_02

---

## Goal
Build the full authentication flow — Welcome, Sign Up, and Login screens — plus session persistence and route protection.

---

## Screens to build

### /app/(auth)/welcome.tsx
The first screen a new user sees.

Layout (centred, full screen, background `#0B2D2C`):
- Kryd logo at top: geometric "K" in `#CCDF1A` + "ryd" in white — build as an SVG or styled text component
- Tagline: "The Next Evolution in IT Support is Here."
- Two buttons stacked:
  - **Get Started** (primary — lime green `#CCDF1A` background, dark text)
  - **Sign In** (ghost — white border, white text)
- Small print below: "Join 500+ IT professionals on Kryd"

### /app/(auth)/signup.tsx
Form fields (in order):
1. Full Name — text input
2. Email — email keyboard, lowercase
3. Password — secure text, minimum 8 characters
4. Role — segmented selector with 3 options: `IT Support Specialist` / `Student` / `Employer`

On submit:
1. Validate all fields — show inline error under each invalid field
2. Call `supabase.auth.signUp({ email, password })`
3. On success — insert a row into `profiles` with `user_id`, `full_name`, `role`
4. Navigate to `/(tabs)/` (the main app)

### /app/(auth)/login.tsx
Form fields:
1. Email
2. Password

On submit:
1. Call `supabase.auth.signInWithPassword({ email, password })`
2. On success — navigate to `/(tabs)/`
3. On failure — show a friendly message: `"Email or password is incorrect. Please try again."`

Add a "Forgot password?" link (no functionality for MVP — just shows a toast: "Password reset coming soon").

---

## Session persistence

In `/app/_layout.tsx`:
1. On mount, call `supabase.auth.getSession()`
2. If session exists → render `/(tabs)/`
3. If no session → render `/(auth)/welcome`
4. Subscribe to `supabase.auth.onAuthStateChange` to react to login/logout in real time

---

## Auth guard

In `/app/(tabs)/_layout.tsx`:
- If no active session, redirect to `/(auth)/welcome`
- This protects all 4 tabs automatically

---

## Done when
- Opening the app with no session shows the Welcome screen
- Signing up with a new email creates a row in the Supabase `profiles` table
- Logging in with correct credentials navigates to the tab navigator
- Logging in with wrong credentials shows the friendly error message
- Closing and reopening the app keeps the user logged in
