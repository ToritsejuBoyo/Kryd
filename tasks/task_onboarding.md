\# task\_onboarding\_flow.md

> Agent task — read KRYD\_SPEC.md first, then follow these instructions.

> This REPLACES the current signup flow entirely

> Each step is its own screen — nothing is grouped on one page

> The tone is warm, personal, and conversational throughout

> Every screen has "Already have an account? Sign in" at the bottom



\---



\## Goal

Build an intimate, step-by-step onboarding experience where each question gets its own full screen. The flow feels like a conversation — not a form. The user's choice of Freelancer or Client determines everything that follows and sets their default dashboard on first login.



\---



\## Design principles for every screen



\- Full screen, centered content — not a form with multiple fields

\- One question or one action per screen

\- Large, friendly heading on every screen

\- Subtitle text that speaks to the user directly — warm, encouraging

\- Progress indicator at the top (Step X of Y — different for each path)

\- Back button top left (except first screen)

\- Primary CTA button at the bottom — always full width

\- "Already have an account? Sign in" as a subtle link at the very bottom of every screen

\- Smooth slide transition between screens (slide left to go forward, slide right to go back)

\- Brand colours throughout — dark teal `#0B2D2C` background, lime green `#CCDF1A` accents



\---



\## THE COMPLETE FLOW



\---



\### SCREEN 0 — Welcome / Landing

File: `/app/(auth)/welcome.tsx`



This already exists but redesign it to match the new intimate feel.



Layout:

\- Kryd logo centered at top

\- Large illustration or abstract graphic below (geometric shapes in brand colours — no stock photos)

\- Heading: \*\*"The IT career platform built for you."\*\*

\- Subtitle: "Learn. Earn. Connect. Grow. All in one place."

\- Two buttons stacked:

&#x20; - Primary: "Get started" → goes to Screen 1

&#x20; - Ghost: "I already have an account" → goes to Login screen

\- No other content. Clean. Confident.



\---



\### SCREEN 1 — Are you a Freelancer or Client?

File: `/app/(auth)/onboarding/role-select.tsx`



This is the most important screen. It must feel like a moment of choice, not a dropdown.



Layout:

\- No progress bar on this screen — it is the gateway

\- Heading: \*\*"How do you want to use Kryd?"\*\*

\- Subtitle: "Choose your primary role — you can always switch later."



Two large cards, side by side on tablet/desktop, stacked on mobile. Each card is tappable:



\*\*Freelancer card:\*\*

\- Illustration: a person at a laptop, IT themed (or a simple geometric illustration in lime green)

\- Bold title: "I am a Freelancer"

\- Description: "I am an IT professional. I want to find work, earn, and grow my career."

\- Examples below title: "IT Support · Cloud Engineer · Cybersecurity · Help Desk · Network Admin"

\- When selected: card gets a lime green `#CCDF1A` border and a checkmark in the corner



\*\*Client card:\*\*

\- Illustration: a business building or briefcase graphic

\- Bold title: "I am a Client"

\- Description: "I represent a business or project. I want to hire IT professionals."

\- Examples: "Startup · SME · Individual · Enterprise"

\- When selected: card gets a blue `#185FA5` border and a checkmark



Primary button at bottom: "Continue →" — disabled until one card is selected.

"Already have an account? Sign in" at the very bottom.



On Continue → store selected role in local state and navigate to the appropriate path.



\---



\## FREELANCER PATH (if they chose Freelancer)



\---



\### FREELANCER SCREEN 1 — The welcome moment

File: `/app/(auth)/onboarding/freelancer/welcome.tsx`



Progress: Step 1 of 7



Full screen with a warm, personal message. This is the emotional hook.



Layout:

\- Large emoji or illustration at top: 💻 or a simple IT-themed graphic

\- Heading: \*\*"Awesome. Let's get you set up."\*\*

\- Body text (conversational, not a list):

&#x20; \*"Kryd is where IT professionals like you find real work, earn real money, and grow with a community that gets what you do. This will take about 2 minutes."\*

\- What to expect — simple 3-line preview:

&#x20; - "Pick your IT specialty"

&#x20; - "Tell us about your experience"

&#x20; - "Set up your profile"

\- Primary button: "Let's go →"



\---



\### FREELANCER SCREEN 2 — Career path selection

File: `/app/(auth)/onboarding/freelancer/career-path.tsx`



Progress: Step 2 of 7



Heading: \*\*"What is your IT specialty?"\*\*

Subtitle: "This helps us match you with the right jobs and courses."



Show a scrollable grid of career path cards — each is a tappable tile:



```

\[💻 IT Support]        \[☁️ Cloud Engineering]

\[🔒 Cybersecurity]     \[🌐 Networking]

\[🖥️ System Admin]      \[📱 Help Desk / Service Desk]

\[💾 Data Recovery]     \[⚙️ DevOps]

\[🛡️ SOC Analyst]       \[📋 IT Project Management]

\[🔧 Hardware \& Repair] \[📊 IT Training \& Consulting]

```



User can select UP TO 3 tiles. Selected tiles get a lime green background and white text.



At the bottom, below the grid:

A text input with placeholder: "My specialty is not listed — type it here"

If they type here, it clears the grid selections and uses their custom input instead.



Primary button: "This is me →"

"Already have an account? Sign in" at bottom.



Save selected paths to local state. Will be written to `profiles.work\_types` on account creation.



\---



\### FREELANCER SCREEN 3 — Experience level

File: `/app/(auth)/onboarding/freelancer/experience.tsx`



Progress: Step 3 of 7



Heading: \*\*"How long have you been working in IT?"\*\*

Subtitle: "Be honest — Kryd works for every level, from day one to decade ten."



Show 5 large tappable option cards stacked vertically — not radio buttons, full width cards:



```

┌────────────────────────────────────────────┐

│  🌱  I am just starting out                │

│       No experience yet — learning now     │

└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐

│  📚  Less than 1 year                      │

│       I have some hands-on experience      │

└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐

│  ⚡  1 to 3 years                          │

│       I have completed real projects        │

└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐

│  🚀  3 to 5 years                          │

│       I handle complex environments         │

└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐

│  🏆  5+ years                              │

│       Senior level, I mentor others        │

└────────────────────────────────────────────┘

```



Selected card gets lime green left border (4px) and slightly lighter background.

This maps to tier placement:

\- Just starting → New Talent (Tier 1)

\- Less than 1 year → New Talent (Tier 1)

\- 1–3 years → Intermediate hint (still starts Tier 1 but AI prioritises them differently)

\- 3–5 years → Intermediate hint

\- 5+ years → Rising Pro hint



Primary button: "Next →"



\---



\### FREELANCER SCREEN 4 — What are you looking for?

File: `/app/(auth)/onboarding/freelancer/goal.tsx`



Progress: Step 4 of 7



Heading: \*\*"What brings you to Kryd?"\*\*

Subtitle: "Pick everything that applies."



Multi-select option cards (can pick more than one):



```

💼  Find freelance IT work

&#x20;   Short-term contracts and gigs



🏢  Find a full-time IT job

&#x20;   Permanent employment opportunities



📚  Learn new IT skills

&#x20;   Courses, certifications, resources



🌍  Build my professional network

&#x20;   Connect with IT professionals globally



💰  Earn while I grow

&#x20;   Points, coins, and real income

```



Each option is a full-width tappable card. Selected ones show lime green checkmark.

At least 1 must be selected.



This data personalises:

\- Which quick actions appear on dashboard

\- Which courses are recommended first

\- Which job types surface first in the feed



Primary button: "Almost there →"



\---



\### FREELANCER SCREEN 5 — Your name

File: `/app/(auth)/onboarding/freelancer/name.tsx`



Progress: Step 5 of 7



Heading: \*\*"What should we call you?"\*\*

Subtitle: "This is how you'll appear to clients and the community."



Single large text input, centered:

```

Full Name

\[                              ]

```



Placeholder: "e.g. Toritseju Boyo"

Auto-capitalises first letter of each word.

Minimum 2 characters.



Below the input, a small reassurance:

"🔒 Your name is visible to other Kryd members."



Primary button: "That's me →"



\---



\### FREELANCER SCREEN 6 — Email and password

File: `/app/(auth)/onboarding/freelancer/credentials.tsx`



Progress: Step 6 of 7



Heading: \*\*"Create your account"\*\*

Subtitle: "Almost done. Set up your login details."



Two inputs stacked:

```

Email address

\[                              ]



Password

\[                              ] 👁

```



\- Email: email keyboard, lowercase, auto-trim

\- Password: secure entry, minimum 8 characters

\- Show/hide toggle on password

\- Below password: a simple strength bar (weak → fair → strong → very strong)

\- Small text: "8 characters minimum"



Primary button: "Create my account →"



On tap:

1\. Validate both fields

2\. Call `supabase.auth.signUp({ email, password, options: { data: { full\_name } } })`

3\. On success → navigate to Screen 7 (confirmation)

4\. On error → show inline error below the relevant field

5\. Do NOT navigate to dashboard yet — collect country first



\---



\### FREELANCER SCREEN 7 — Country

File: `/app/(auth)/onboarding/freelancer/country.tsx`



Progress: Step 7 of 7



Heading: \*\*"Where are you based?"\*\*

Subtitle: "We'll show you relevant jobs and pay in your local currency."



A searchable country dropdown/picker.

Default: Nigeria (pre-selected since platform is Nigeria-first).

Most used at top: Nigeria, Kenya, South Africa, Ghana, United Kingdom, United States, Canada.



Below the picker:

```

💱 Currency preference

&#x20;  ● Naira (₦) + Dollars ($)   \[selected by default]

&#x20;  ○ Dollars ($) only

```



Primary button: "Take me to Kryd →"



On tap:

1\. Write all collected data to profiles table:

&#x20;  `{ user\_id, full\_name, default\_mode: 'freelancer', work\_types, experience\_years, goals, country, preferred\_currency, points: 0, coins: 0, tier: 'New Talent', profile\_complete: 45 }`

2\. Show a brief celebration animation (confetti or lime green burst)

3\. Navigate to Freelancer dashboard



\---



\## CLIENT PATH (if they chose Client on Screen 1)



\---



\### CLIENT SCREEN 1 — The pitch

File: `/app/(auth)/onboarding/client/pitch.tsx`



Progress: Step 1 of 6



This is NOT a form. It is a pitch. Clients need to understand why Kryd is the right place to hire IT professionals before they give their details.



Layout:

\- Heading: \*\*"Hire verified IT professionals. Fast."\*\*

\- Three value props shown as icon + text rows:

&#x20; ```

&#x20; ✓  AI-matched to your exact needs

&#x20;    Tell us what you need, we find who fits.



&#x20; ✓  Every professional is verified

&#x20;    Real skills, real experience, real results.



&#x20; ✓  24-hour escrow protection

&#x20;    Pay safely. Release when the job is done.

&#x20; ```

\- Below the value props, a social proof line:

&#x20; "Trusted by IT teams across Nigeria and beyond."



Primary button: "Find my IT professional →"

Ghost button: "Learn more about Kryd" (optional — links to a help article or skips)

"Already have an account? Sign in" at bottom.



\---



\### CLIENT SCREEN 2 — What do you need?

File: `/app/(auth)/onboarding/client/needs.tsx`



Progress: Step 2 of 6



Heading: \*\*"What kind of IT help are you looking for?"\*\*

Subtitle: "Select everything that applies to your project or business."



Grid of tappable tiles (same style as freelancer career path):



```

\[🖥️ IT Support \& Help Desk]   \[🌐 Network Setup]

\[🔒 Cybersecurity]             \[☁️ Cloud Services]

\[💿 Software Installation]     \[🔧 Hardware Repair]

\[🖧 Server Management]         \[🌍 Website \& Tech Support]

\[📋 Training for my team]      \[⚙️ Ongoing IT management]

```



Custom input below: "Something else — describe it"



Primary button: "Next →"



\---



\### CLIENT SCREEN 3 — Hiring as

File: `/app/(auth)/onboarding/client/hiring-as.tsx`



Progress: Step 3 of 6



Heading: \*\*"Who are you hiring for?"\*\*

Subtitle: "This helps us show you the right professionals."



Three large tappable cards stacked:



```

┌────────────────────────────────────────────┐

│  👤  Myself / Personal project             │

│       I need IT help for a personal task   │

└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐

│  🏢  My business or company               │

│       SME, startup, or established firm    │

└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐

│  🏗️  My enterprise / large organisation   │

│       Corporate IT needs at scale          │

└────────────────────────────────────────────┘

```



Primary button: "Next →"



\---



\### CLIENT SCREEN 4 — Company name

File: `/app/(auth)/onboarding/client/company.tsx`



Progress: Step 4 of 6



Heading: \*\*"What is your company or project called?"\*\*

Subtitle: "This appears on your job listings so freelancers know who they are applying to."



Single large text input:

```

Company / Project name

\[                              ]

```



Placeholder: "e.g. TechCorp Nigeria, My Home Office Project"



If they selected "Myself" on the previous screen, pre-fill with their name (if already collected) and show:

Subtitle becomes: "You can use your own name if this is a personal project."



Primary button: "Next →"



\---



\### CLIENT SCREEN 5 — Your account details

File: `/app/(auth)/onboarding/client/credentials.tsx`



Progress: Step 5 of 6



Heading: \*\*"Create your Kryd account"\*\*

Subtitle: "Set up your login so you can start posting jobs and finding IT professionals."



Fields stacked:

```

Your full name

\[                              ]



Email address

\[                              ]



Password

\[                              ] 👁

```



Same validation as freelancer credentials screen.



Primary button: "Create my account →"



On tap:

1\. Validate all fields

2\. Call `supabase.auth.signUp()`

3\. On success → Screen 6



\---



\### CLIENT SCREEN 6 — Location and currency

File: `/app/(auth)/onboarding/client/location.tsx`



Progress: Step 6 of 6



Heading: \*\*"Almost ready. Where are you based?"\*\*

Subtitle: "We use this to show you local IT professionals first."



Country picker (same as freelancer version).

Currency preference toggle (same as freelancer version).



Primary button: \*\*"Start hiring on Kryd →"\*\*



On tap:

1\. Write to profiles table:

&#x20;  `{ user\_id, full\_name, default\_mode: 'client', company\_name, hiring\_as, it\_needs, country, preferred\_currency, points: 0, coins: 0, profile\_complete: 40 }`

2\. Show celebration: \*\*"Welcome to Kryd. Your first great hire is one post away."\*\*

3\. Navigate to Client dashboard



\---



\## LOGIN SCREEN

File: `/app/(auth)/login.tsx`



Keep simple — this already exists. Just ensure:

\- "Don't have an account? Get started" link at the bottom navigates back to welcome screen

\- Forgot password shows a toast: "Password reset link coming soon — contact support@kryd.app"



\---



\## NAVIGATION RULES



\### Back button behaviour

Every screen has a back button (top left) that slides back to the previous screen.

Exception: Screen 0 (Welcome) has no back button.

Back from Screen 1 (Role Select) goes to Welcome.



\### Progress indicator

Show at the very top of each screen:

```

●●○○○○○  Step 2 of 7

```

Filled circles in lime green for completed steps.

Current step in lime green.

Remaining steps in gray.



\### "Already have an account?" link

Every single onboarding screen — including the role select, all freelancer screens, and all client screens — must have this text link at the very bottom of the screen, below everything else including the CTA button:



```

Already have an account?  Sign in

```



"Sign in" is lime green and tappable → navigates to login screen.



\### Data persistence during onboarding

Store all collected data in a local onboarding state object (Zustand or React context) as the user progresses through the screens. Only write to Supabase on the final screen when the account is actually created. If the user goes back and changes something, update the local state. Nothing is written to the database until the very last step.



```ts

interface OnboardingState {

&#x20; role: 'freelancer' | 'client' | null

&#x20; // Freelancer fields

&#x20; workTypes: string\[]

&#x20; experienceYears: string

&#x20; goals: string\[]

&#x20; // Client fields

&#x20; itNeeds: string\[]

&#x20; hiringAs: string

&#x20; companyName: string

&#x20; // Common

&#x20; fullName: string

&#x20; email: string

&#x20; password: string

&#x20; country: string

&#x20; preferredCurrency: 'NGN\_USD' | 'USD'

}

```



\---



\## TRANSITION ANIMATIONS



Between each screen use a smooth horizontal slide animation:

\- Going forward: new screen slides in from the right, current screen slides out to the left

\- Going back: new screen slides in from the left, current screen slides out to the right



Use `react-native-reanimated` for this:

```ts

// Each onboarding screen wraps its content in:

<Animated.View entering={SlideInRight} exiting={SlideOutLeft}>

&#x20; {/\* screen content \*/}

</Animated.View>

```



The transition duration should be 280ms with a natural ease curve.



\---



\## DONE WHEN

\- Welcome screen is clean with Get Started and Sign In only

\- Role selection screen shows two large illustrated cards with no form fields

\- Freelancer path flows through 7 separate screens, one question each

\- Client path flows through 6 separate screens, one question each

\- Each screen has back button, progress indicator, and "Sign in" link at bottom

\- Selecting a career tile grid allows up to 3 selections plus a custom text option

\- Experience level shows as full-width cards not radio buttons

\- Smooth slide transition between every screen

\- All data collected in local state, written to Supabase only on final screen

\- Freelancer lands on Provider dashboard on completion

\- Client lands on Client dashboard on completion

\- Celebration animation plays before navigating to dashboard

\- Login screen has "Get started" link back to welcome

\- Every onboarding screen works in all three themes (Light, Dark, Kryd)

ENDOFFILE

echo "Done"

