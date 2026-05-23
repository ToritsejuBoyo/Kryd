# task_signup_roles.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_03_auth | Replaces the current single signup screen

---

## Goal
Rebuild the signup flow to support two distinct roles — Freelancer and Client — each with their own signup fields, onboarding flow, and default dashboard. Also implement the dashboard toggle so users can switch between modes at any time.

---

## Database changes — run these in Supabase first

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS default_mode text DEFAULT 'freelancer',
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS work_types text[],
ADD COLUMN IF NOT EXISTS experience_years text,
ADD COLUMN IF NOT EXISTS looking_for text,
ADD COLUMN IF NOT EXISTS hiring_as text,
ADD COLUMN IF NOT EXISTS it_needs text[],
ADD COLUMN IF NOT EXISTS budget_range text,
ADD COLUMN IF NOT EXISTS availability text DEFAULT 'available',
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS profile_complete int DEFAULT 25,
ADD COLUMN IF NOT EXISTS community_groups text[] DEFAULT ARRAY['Hiring & Projects'];
```

---

## Signup flow — 3 screens

### Screen 1 — Role selection (new first screen)
File: `/app/(auth)/welcome.tsx` — add role selection before the form

Show two large tappable cards side by side:

**Freelancer card:**
- Icon: laptop emoji or code icon
- Title: "I am a Freelancer"
- Subtitle: "I am an IT professional looking for work and clients"
- Border colour when selected: `#1D9E75` (green)

**Client card:**
- Icon: building emoji or briefcase icon  
- Title: "I am a Client"
- Subtitle: "I want to hire IT professionals for my projects"
- Border colour when selected: `#185FA5` (blue)

One card must be selected before the Continue button activates.
Store the selected role in component state.
Tapping Continue navigates to Screen 2.

---

### Screen 2 — Common fields (same for both roles)
File: `/app/(auth)/signup.tsx`

Show the selected role at the top as a pill badge so user remembers their choice.

Fields:
1. Full Name — text input, required
2. Email Address — email keyboard, required
3. Password — secure entry, minimum 8 characters, strength indicator, show/hide toggle

Continue button navigates to Screen 3.

---

### Screen 3A — Freelancer specific fields
File: `/app/(auth)/signup-freelancer.tsx`

Heading: "Tell us about your IT work"

Fields:
1. **What type of IT work do you do?** — multi-select checkboxes, at least 1 required:
   - IT Support & Helpdesk
   - Network Administration
   - Cybersecurity
   - Cloud Engineering
   - System Administration
   - Software Development
   - Data Recovery
   - Hardware Repair
   - IT Training & Consulting
   - Other

2. **Years of IT experience** — radio selector, required:
   - No experience yet
   - Less than 1 year
   - 1–3 years
   - 3–5 years
   - 5+ years

3. **I am looking for** — radio selector, required:
   - Freelance / contract work
   - Full-time employment
   - Both

4. **Country** — dropdown, default Nigeria, required

On submit:
- Call `supabase.auth.signUp({ email, password })`
- Insert into profiles: `{ user_id, full_name, default_mode: 'freelancer', work_types, experience_years, looking_for, country, points: 0, coins: 0, is_verified: false, is_pro: false, profile_complete: 25 }`
- Navigate to freelancer onboarding flow

---

### Screen 3B — Client specific fields
File: `/app/(auth)/signup-client.tsx`

Heading: "Tell us about your hiring needs"

Fields:
1. **Are you hiring as** — radio selector, required:
   - An individual / personal project
   - A business or company
   - A startup

2. **Company or project name** — text input, required
   Placeholder: "e.g. MyTech Solutions or Personal Project"

3. **What kind of IT help do you need?** — multi-select checkboxes, at least 1 required:
   - IT Support & Helpdesk
   - Network Setup & Management
   - Cybersecurity
   - Cloud Services
   - Software Installation
   - Hardware Repair
   - Server Management
   - Website & Tech Support
   - Training for my team
   - Other

4. **Country** — dropdown, default Nigeria, required

On submit:
- Call `supabase.auth.signUp({ email, password })`
- Insert into profiles: `{ user_id, full_name, default_mode: 'client', hiring_as, company_name, it_needs, country, points: 0, coins: 0, is_verified: false, is_pro: false, profile_complete: 25 }`
- Navigate to client onboarding flow

---

## Onboarding flows (shown once after signup)

### Freelancer onboarding — 3 screens

**Onboarding screen 1 — Your skills**
Heading: "What are your top IT skills?"
Show a tappable tag grid based on their work_types selection.
Examples: Windows Server, Active Directory, CompTIA A+, Networking, VPN, Linux, AWS, Cisco, ServiceNow, ITIL, Azure, Terraform, Python, Office 365
Minimum 1, maximum 10 tags selected.
Save to `profiles.skills` array.

**Onboarding screen 2 — Your profile**
Heading: "Set up your profile"
- Profile photo — optional, camera roll upload. If skipped show initials avatar.
- Short bio — optional, max 160 characters. Placeholder: "e.g. IT Support Specialist with 3 years experience in Windows Server and networking"
- Availability — radio: Available now / Open to opportunities / Not available
Save to profiles table.

**Onboarding screen 3 — Certifications**
Heading: "Do you have any IT certifications?"
Toggle: Yes / No
If Yes, show up to 3 certification fields:
- Certification name (text input)
- Year obtained (year picker)
Examples shown as placeholders: CompTIA A+, AWS Cloud Practitioner, Google Cloud ACE
Save as JSON array to `profiles.certifications`.

After screen 3, show celebration screen:
- Large checkmark in lime green `#CCDF1A`
- "You are all set!"
- "Welcome to Kryd — your IT career platform"
- "Go to Dashboard" button
Navigate to the Freelancer dashboard.

---

### Client onboarding — 2 screens

**Onboarding screen 1 — Your hiring needs**
Heading: "Help us find the right IT professionals for you"
- How often do you need IT support? — radio:
  One-time project / Regularly / Ongoing monthly
- Budget range per project — radio:
  Under $500 / $500–$2,000 / $2,000–$5,000 / $5,000+
Save to `profiles.budget_range` and a new `hire_frequency` field.

**Onboarding screen 2 — Post your first job (optional)**
Heading: "Get started by posting a job"
Subtitle: "Optional — you can do this later from your dashboard"
Show a simplified quick-post form:
- Job title (text input)
- Brief description (multiline, max 300 chars)
- Budget (number input)
- Timeline: ASAP / 1 week / 2 weeks / 1 month+
Skip button and Post Job button.
If posted, save to jobs table and show "Your first job is live!" toast.

After screen 2 (or skip), navigate to Client dashboard.

---

## Two dashboard layouts

### Freelancer dashboard (default_mode = 'freelancer')
Show in this order:
1. Header — greeting, tier badge, notification bell, profile avatar
2. Client/Freelancer mode toggle pill
3. Stats row — Points, Active Courses, Total Earned
4. Tier progress bar
5. AI job recommendations — "Matched for you" horizontal scroll
6. Continue Learning card
7. Quick actions — Browse Jobs, Daily Challenge, Community, Wallet
8. Leaderboard snapshot
9. Recent activity

### Client dashboard (default_mode = 'client')
Show in this order:
1. Header — greeting, notification bell, profile avatar
2. Client/Freelancer mode toggle pill
3. Post a Job button — large, prominent, lime green, full width
4. My active jobs — list of jobs posted with application counts
5. AI recommended freelancers — "Top IT professionals for you" horizontal scroll showing verified freelancers matched to their it_needs
6. Quick actions — Post Job, Find Freelancers, Messages, Wallet
7. Pending escrow / transaction summary
8. Recently active verified IT professionals

Note: Client dashboard does NOT show the Learning Hub section, tier progress bar, or leaderboard. Those are freelancer features.

---

## The mode toggle

In both dashboards show a toggle pill in the header below the greeting:

```
[ 💻 Freelancer ]  [ 🏢 Client ]
```

Active mode is highlighted in lime green `#CCDF1A` with dark text.
Inactive mode is transparent with secondary text colour.

On toggle tap:
1. Update `isClientMode` in Zustand store
2. Save `default_mode` to `profiles` in Supabase
3. Re-render the dashboard with the correct layout
4. Show a brief toast: "Switched to Client mode" or "Switched to Freelancer mode"

The switch is instant — no page reload, no navigation. Just the content changes.

---

## Community access rules

### Freelancer mode — full community access
All groups visible and postable:
- IT Support
- Cloud
- Security
- Helpdesk
- Career
- Hiring & Projects (new group — for clients and freelancers to find each other)

Freelancers can read and post in all groups.

### Client mode — restricted community access
Clients in Client mode can only see and post in one group:
- **Hiring & Projects** — clients post IT questions, describe projects, find talent

All other groups (IT Support, Cloud, Security, Helpdesk, Career) are visible to read but the Post button is replaced with:
"Switch to Freelancer mode to post in this group"

This is the correct balance — clients feel welcome and can get value from the community, but the professional IT discussion groups stay clean and freelancer-focused.

Add the Hiring & Projects group to the community group filter tabs.
Add it as the first seed group in community_posts if posts exist there.

---

## Progress indicators

Add a `Step X of 3` indicator at the top of every onboarding screen.
Add a Skip button on every onboarding screen (top right).
Skipped screens still allow entry to the dashboard — the data is just missing and the profile_complete percentage reflects it.

---

## Done when
- Role selection screen shows before any signup fields
- Freelancer and client each see different Screen 3 fields
- Freelancer onboarding (3 screens) collects skills, profile, certifications
- Client onboarding (2 screens) collects hiring needs and optional first job
- Freelancer lands on provider dashboard after onboarding
- Client lands on client dashboard after onboarding
- Toggle in both dashboard headers switches mode instantly
- Mode switch persists in Zustand and Supabase
- Client in Client mode sees Hiring & Projects community group only for posting
- Client can read all community groups but cannot post outside Hiring & Projects
- Switching to Freelancer mode unlocks full community posting
- All new fields are saved to Supabase profiles table correctly
