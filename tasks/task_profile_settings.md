# task_profile_settings.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> This is a FULL REBUILD of the profile page — the current one is too basic
> Match the same design quality and layout depth as the Learn and Community pages
> Two-column layout: left nav sidebar + right expandable content panel

---

## Goal
Replace the current basic profile screen with a proper two-column settings and profile hub. The left column is a navigation sidebar with grouped menu items. Clicking any item expands its full content in the right column. This is the same pattern used by Notion, Linear, GitHub Settings, and Upwork's profile editor — the industry standard for dense settings pages.

---

## Layout architecture

```
┌──────────────────────┬─────────────────────────────────────────┐
│  LEFT SIDEBAR        │  RIGHT CONTENT PANEL                    │
│  (w-72, fixed)       │  (flex-1, scrollable)                   │
│                      │                                         │
│  Profile header      │  [Selected section content]             │
│  ─────────────────   │                                         │
│  Nav groups          │  Content expands here based on          │
│  with menu items     │  which item is selected in the left     │
│                      │  sidebar                                │
└──────────────────────┴─────────────────────────────────────────┘
```

On mobile: left sidebar collapses to a horizontal tab strip at the top. Content shows below.

---

## Left sidebar structure

### Profile header (top of sidebar — always visible)
```
[Avatar 56px]
Full Name
Role badge  ·  Tier badge  ·  Availability dot
─────────────────────────────────────────────
Profile completeness bar
[████████████░░░] 82%  "Complete your profile →"
```

Avatar is tappable — opens image picker to upload a new photo.
"Complete your profile →" link scrolls to the first incomplete section.

### Navigation groups (below the header)

Each group has a small uppercase label and menu items below it.
The selected item has a lime green left border (3px) and slightly lighter background.

```
MY PROFILE
  ├─ Overview              ← default selected on page load
  ├─ Bio & Personal Info
  ├─ Skills
  ├─ Experience
  ├─ Certifications
  ├─ Portfolio
  └─ Work History

CAREER & JOBS
  ├─ Availability & Rate
  ├─ Resume / CV
  └─ Reviews & Ratings

VERIFICATION
  └─ Identity & Trust

APP SETTINGS
  ├─ Appearance
  ├─ Notifications
  ├─ Privacy
  ├─ Currency & Language
  └─ Account

DANGER ZONE
  └─ Delete Account
```

Each menu item shows:
- Icon (small, left of label)
- Label text
- A completion indicator on items that are incomplete:
  - Green checkmark ✓ if section is complete
  - Orange dot ● if section has some data but not complete
  - Gray circle ○ if section is empty

---

## Right content panel — each section

### 1. OVERVIEW (default view)

The overview is a read-only snapshot of the entire profile — a preview of how their public profile looks to clients and other users.

```
┌─────────────────────────────────────────────────────┐
│  PUBLIC PROFILE PREVIEW                             │
│  This is how your profile appears to others         │
│                                                     │
│  [Avatar]  Aminat                                   │
│            IT Support Specialist · New Talent       │
│            ● Available now                          │
│            Lagos, Nigeria                           │
│                                                     │
│  "Bio text appears here..."                         │
│                                                     │
│  Skills:  [Windows Server] [Active Directory] [VPN] │
│                                                     │
│  ⭐ 0 pts  ·  0 courses  ·  0 jobs  ·  0 reviews   │
│                                                     │
│  [View public profile →]                            │
└─────────────────────────────────────────────────────┘
```

Below the preview, show a completion checklist:
```
COMPLETE YOUR PROFILE

✓  Name and role added
○  Add a profile photo         [Add →]
○  Write your bio              [Add →]
○  Add at least 3 skills       [Add →]
○  Add work experience         [Add →]
○  Upload your CV              [Add →]
○  Add a certification         [Add →]
```

Each incomplete item has an "Add →" link that navigates to that section in the left sidebar.

---

### 2. BIO & PERSONAL INFO

Section heading: "Bio & Personal Info"
Subtitle: "Tell clients and the community who you are."

Fields (each with a label, current value, and Edit button):

```
Full Name
Aminat                                    [Edit]

Username
@aminat                                   [Edit]
Used in your profile URL: kryd.app/u/aminat

Bio
Write a short bio...                      [Edit]
Max 300 characters. Tell clients what you do and what makes you great.

Location
Lagos, Nigeria                            [Edit]

Phone number
Not added                                 [Add]
Only used for account verification. Never shown publicly.

Date of birth
Not added                                 [Add]
Required for KYC identity verification. Never shown publicly.

Languages spoken
Not added                                 [Add]
Multi-select: English, Yoruba, Igbo, Hausa, French, etc.

Website / Portfolio URL
Not added                                 [Add]

LinkedIn profile
Not added                                 [Add]

Twitter / X
Not added                                 [Add]
```

Clicking Edit on any field opens an inline edit mode — the value becomes an input field with Save and Cancel buttons. No separate edit page needed.

---

### 3. SKILLS

Section heading: "Your Skills"
Subtitle: "Skills are used to match you with jobs and courses. Be specific."

Current skills shown as removable pill tags:
```
[Windows Server ×]  [Active Directory ×]  [VPN ×]
[Add a skill +]
```

Tapping "Add a skill +" opens a search input with autocomplete:
- Type to search from a predefined skills list
- Or type a custom skill and press Enter to add

Skills are grouped by category if more than 5:
```
IT Support          [Windows Server]  [Active Directory]  [Help Desk]
Networking          [VPN]  [Cisco]  [TCP/IP]
Certifications      [CompTIA A+]
```

Maximum 20 skills.
Skills must have at least 1 to show green checkmark on the nav item.

---

### 4. EXPERIENCE

Section heading: "Work Experience"
Subtitle: "Add past IT roles to build credibility with clients."

List of experience entries (or empty state: "No experience added yet. Add your first role."):

Each entry card shows:
```
┌──────────────────────────────────────────────────────┐
│  💼  IT Support Technician                           │
│      TechCorp Nigeria  ·  Jan 2023 – Present         │
│      Full-time  ·  Lagos, Nigeria                    │
│                                                      │
│      Provided L2 IT support for 300+ users.          │
│      Managed Active Directory and Office 365.        │
│                                          [Edit] [×]  │
└──────────────────────────────────────────────────────┘
```

"+ Add experience" button opens an inline form:
```
Job title*          [                    ]
Company name*       [                    ]
Employment type     [Full-time ▾]
Location            [                    ]
Start date*         [Month ▾] [Year ▾]
End date            [Month ▾] [Year ▾]  [ ] I currently work here
Description         [                    ]
                    (max 500 characters)

[Save experience]  [Cancel]
```

---

### 5. CERTIFICATIONS

Section heading: "IT Certifications"
Subtitle: "Verified certifications increase your visibility and AI match priority."

List of certifications (or empty state: "No certifications added. Add your first."):

Each certification card:
```
┌──────────────────────────────────────────────────────┐
│  🏅  CompTIA A+                                      │
│      CompTIA  ·  2023                                │
│      ○ Unverified — submit for verification          │
│                                          [Edit] [×]  │
└──────────────────────────────────────────────────────┘
```

Verification status badge:
- ○ Unverified (gray) — added but not verified yet
- ⏳ Pending (amber) — submitted for verification, under review
- ✓ Verified (green) — confirmed by the verification system

"+ Add certification" button opens inline form:
```
Certification name*   [                    ]
Issuing organisation* [                    ]
Year obtained*        [Year ▾]
Credential ID         [                    ] (optional)
Certificate file      [Upload PDF or image]

[Save certification]  [Cancel]
```

"Submit for verification →" button appears on unverified certs.
For MVP this button shows: "Verification launching soon. Your certificate is saved and will be verified when this feature launches."

---

### 6. PORTFOLIO

Section heading: "Portfolio"
Subtitle: "Show clients what you have built or solved."

Portfolio items (or empty state):

Each portfolio card:
```
┌──────────────────────────────────────────────────────┐
│  [Thumbnail or placeholder]                          │
│  Network Migration Project                           │
│  Migrated a 50-user office from on-premise to Azure  │
│  Tags: [Azure] [Networking] [Migration]              │
│  Link: github.com/...                    [Edit] [×]  │
└──────────────────────────────────────────────────────┘
```

"+ Add portfolio item" opens inline form:
```
Project title*        [                    ]
Description*          [                    ] (max 300 chars)
Project URL           [                    ]
Skills used           [tag input]
Upload image          [Upload screenshot]  (optional)

[Save project]  [Cancel]
```

---

### 7. WORK HISTORY (Completed jobs on Kryd)

Section heading: "Work History on Kryd"
Subtitle: "Jobs you have completed through Kryd appear here automatically."

This section is READ ONLY — it is populated automatically from completed job_applications where status = 'completed'.

Each entry:
```
┌──────────────────────────────────────────────────────┐
│  ✓  Network Setup & Config                           │
│     StartupXYZ  ·  March 2026                        │
│     Freelance  ·  $800                               │
│     ⭐⭐⭐⭐⭐  "Great work, fast delivery"            │
└──────────────────────────────────────────────────────┘
```

Empty state: "No completed jobs yet. Apply to jobs and complete them to build your work history."

Note at bottom: "Work history is verified by Kryd — clients trust it."

---

### 8. AVAILABILITY & RATE

Section heading: "Availability & Rate"
Subtitle: "Let clients know when you are available and what you charge."

```
Availability status
● Available now                           [Change ▾]
Options: Available now / Open to opportunities / Not available
Updates visible to clients immediately.

Open to
[✓] Freelance / contract work
[✓] Full-time employment
[ ] Remote only
[✓] On-site (Lagos)

Hourly rate
$0 / hour                                 [Edit]
Set your expected hourly rate in USD.
Shown on your profile to clients.

Preferred project size
[ ] Small (under $500)
[✓] Medium ($500 – $2,000)
[✓] Large ($2,000+)
```

---

### 9. RESUME / CV

Section heading: "Resume & CV"
Subtitle: "Upload your CV so clients can review your full background."

```
┌──────────────────────────────────────────────────────┐
│  📄 No CV uploaded yet                               │
│                                                      │
│  Drag and drop your CV here                          │
│  or                                                  │
│  [Browse files]                                      │
│                                                      │
│  Accepted formats: PDF, DOC, DOCX  ·  Max 5MB       │
└──────────────────────────────────────────────────────┘
```

If CV is uploaded:
```
┌──────────────────────────────────────────────────────┐
│  📄  Aminat_CV_2026.pdf                              │
│      Uploaded May 2026  ·  1.2MB                     │
│      Visibility: Visible to clients                  │
│                                                      │
│  [Preview]  [Download]  [Replace]  [Delete]          │
└──────────────────────────────────────────────────────┘
```

Visibility toggle:
- Visible to clients (default)
- Hidden (only I can see it)

File stored in Supabase Storage bucket `resumes`.
Path: `resumes/{user_id}/cv.pdf`

---

### 10. REVIEWS & RATINGS

Section heading: "Reviews & Ratings"
Subtitle: "Reviews from clients who hired you through Kryd."

Overall rating display:
```
⭐⭐⭐⭐⭐
0.0 / 5.0
Based on 0 reviews
```

Individual reviews list (populated from completed jobs with client ratings).

Empty state: "No reviews yet. Complete your first job on Kryd to earn your first review."

Reviews cannot be edited or deleted by the freelancer — they are permanent.
Freelancer can reply to a review with one response.

---

### 11. IDENTITY & TRUST (Verification section)

Section heading: "Identity & Trust"
Subtitle: "Verified profiles get priority in job matching and are trusted by clients."

Three verification cards:

**Card 1 — Identity verification (KYC)**
```
┌──────────────────────────────────────────────────────┐
│  🪪  Identity Verification                           │
│                                                      │
│  Status: ○ Not verified                              │
│                                                      │
│  Verifying your identity with a government-issued   │
│  ID unlocks wallet withdrawals and increases your    │
│  visibility to premium clients.                      │
│                                                      │
│  What you need: National ID, Passport, or           │
│  Driver's Licence + a selfie photo.                 │
│                                                      │
│  [  Start Verification  ]                            │
│  Powered by Smile Identity (coming soon)             │
└──────────────────────────────────────────────────────┘
```

For MVP: "Start Verification" button shows:
"Identity verification is launching soon. We'll notify you when it's available."
The status shows "Not verified" but the button shows coming soon messaging.

**Card 2 — Certification verification**
```
┌──────────────────────────────────────────────────────┐
│  🏅  Certification Verification                      │
│                                                      │
│  Status: ○ 0 of 0 certifications verified            │
│                                                      │
│  Get your IT certifications verified by Kryd         │
│  to display a trusted badge on your profile.        │
│                                                      │
│  [  Go to Certifications  ]                          │
│  (links to Certifications section in left sidebar)  │
└──────────────────────────────────────────────────────┘
```

**Card 3 — Email and phone verification**
```
┌──────────────────────────────────────────────────────┐
│  ✉️  Contact Verification                            │
│                                                      │
│  Email:  ✓ Verified                                  │
│  Phone:  ○ Not verified  [Verify now →]              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Phone verification for MVP: "SMS verification launching soon."

---

### 12. APPEARANCE (App Settings)

Section heading: "Appearance"
Subtitle: "Customise how Kryd looks for you."

```
Theme
Choose your preferred colour theme.

[  🌞 Light  ]  [  🌙 Dark  ]  [  ⚡ Kryd  ]
Active theme highlighted in lime green.

Sidebar
[ ] Keep sidebar collapsed by default

Font size
○ Small   ● Normal   ○ Large
```

Tapping a theme here changes the theme app-wide (same as the dashboard theme switcher — these are the same setting).

---

### 13. NOTIFICATIONS

Section heading: "Notification Preferences"
Subtitle: "Choose what Kryd notifies you about."

Toggle rows:
```
Job matches
New jobs matching your skills          [toggle ON]

Messages
New direct messages                    [toggle ON]

Community
Replies to your posts                  [toggle ON]

Learning
Daily challenge reminders              [toggle ON]
Course completion milestones           [toggle ON]

Points & earnings
Points earned notifications            [toggle OFF]
Weekly earnings summary                [toggle ON]

Platform
New features and updates               [toggle ON]
```

Save button at bottom: "Save preferences"

---

### 14. PRIVACY

Section heading: "Privacy Settings"
Subtitle: "Control who can see your profile and activity."

```
Profile visibility
● Public — anyone on Kryd can view your profile
○ Connections only — only people you are connected with
○ Private — only you can see your profile

Show on leaderboard
[✓] Show my name and points on the community leaderboard

Show availability status
[✓] Show my availability status to clients

Show hourly rate
[ ] Show my hourly rate on my public profile

Show work history
[✓] Show completed Kryd jobs on my public profile
```

---

### 15. CURRENCY & LANGUAGE

Section heading: "Currency & Language"
Subtitle: "Set your preferred display currency and language."

```
Primary currency
● Nigerian Naira (₦)
○ US Dollar ($)
○ Both (₦ and $)

Exchange rate info:
Current rate: $1 = ₦1,540
[Rate updates manually — last updated May 2026]

Language
● English
○ Yoruba (coming soon)
○ Igbo (coming soon)
○ French (coming soon)
```

Changing currency here updates the user's `preferred_currency` in Supabase and immediately updates all money displays across the app.

---

### 16. ACCOUNT

Section heading: "Account Settings"
Subtitle: "Manage your login credentials and account security."

```
Email address
aminat@gmail.com                        [Change email]

Password
••••••••                               [Change password]

Two-factor authentication
○ Not enabled                           [Enable 2FA]
(coming soon)

Connected accounts
Google    ○ Not connected               [Connect]
LinkedIn  ○ Not connected               [Connect]

Sign out of all devices                 [Sign out everywhere]
```

---

### 17. DELETE ACCOUNT (Danger Zone)

Section heading: "Delete Account"
Subtitle: "Permanently delete your Kryd account and all data."

```
⚠️  This action cannot be undone.

Deleting your account will:
- Remove your profile permanently
- Cancel any active job applications
- Forfeit any unspent points and coins
- Remove all your community posts

Your completed work history and client reviews
will be anonymised, not deleted.

[  Delete my account  ]  (red button, requires typing "DELETE" to confirm)
```

---

## Client mode profile differences

When the user is in CLIENT mode, the left sidebar navigation changes slightly:

```
MY PROFILE
  ├─ Overview
  ├─ Bio & Company Info   ← replaces "Bio & Personal Info"
  └─ Work History         ← shows jobs posted, not jobs completed

HIRING
  ├─ Posted Jobs
  ├─ Payment Methods      ← coming soon
  └─ Reviews Given

VERIFICATION
  └─ Identity & Trust

APP SETTINGS
  (same as freelancer)
```

The client overview shows:
- Company name and logo
- Jobs posted count
- Total spent (coming soon)
- Reviews given

---

## Technical implementation

### Route
File: `/app/profile.tsx`

The profile page uses a `selectedSection` state to track which left nav item is active.
Default: `'overview'`

```ts
const [selectedSection, setSelectedSection] = useState<ProfileSection>('overview')
```

### Left sidebar navigation
Each nav item calls `setSelectedSection('bio')` etc. on tap.
The right panel renders the correct component based on `selectedSection`.

### Inline editing pattern
Every editable field follows this pattern:
```ts
const [isEditing, setIsEditing] = useState(false)

// Display mode
<Text>{value}</Text>
<TouchableOpacity onPress={() => setIsEditing(true)}>
  <Text>Edit</Text>
</TouchableOpacity>

// Edit mode
<TextInput value={editValue} onChangeText={setEditValue} />
<TouchableOpacity onPress={handleSave}>Save</TouchableOpacity>
<TouchableOpacity onPress={() => setIsEditing(false)}>Cancel</TouchableOpacity>
```

On Save: update Supabase profiles table, update Zustand store, show success toast.
On Cancel: revert to original value, no API call.

### File uploads
CV and portfolio images use Supabase Storage:
```ts
const { data, error } = await supabase.storage
  .from('user-uploads')
  .upload(`resumes/${userId}/cv.pdf`, file)
```

---

## Done when
- Two-column layout renders correctly — left nav sidebar + right content panel
- Left sidebar shows profile header with avatar, name, tier, completion bar
- All 17 sections are implemented as nav items with correct grouping
- Completion indicators (✓ ● ○) show on each nav item correctly
- Default view is Overview showing public profile preview + completion checklist
- Bio section supports inline editing for all fields
- Skills section has tag-based input with autocomplete and max 20 skills
- Experience section supports adding, editing, and removing entries
- Certifications section shows verification status correctly
- Portfolio section supports project entries with image upload
- Work History is read-only, populated from completed jobs
- Availability & Rate section has functional toggles and rate input
- CV upload works with Supabase Storage and shows preview/download
- Reviews section shows rating summary and individual reviews
- Verification section shows KYC coming soon state with correct status
- Appearance section controls theme app-wide (same store as dashboard theme)
- Notifications section saves preferences to Supabase
- Privacy section saves preferences to Supabase
- Currency change updates preferred_currency in Supabase and refreshes all money displays
- Delete account requires typing DELETE to confirm
- Client mode shows different nav items relevant to hiring
- Mobile: left sidebar collapses to horizontal tab strip
- All three themes apply correctly throughout
