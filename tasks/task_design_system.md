# task_design_system.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> This is a DESIGN SYSTEM task — it touches every screen in the app
> Do not rebuild screens — only update card styles, shadows, borders, backgrounds
> Reference: the sample dashboard UI provided by the product owner

---

## Goal
Apply a consistent, polished design system across the entire app. The current design is too flat — cards blend into backgrounds, shadows are too subtle, and there is no visual depth. The target look has:
- Defined card shadows with depth
- Clear border radius on all cards and buttons
- The left sidebar user card is dark (inverted) while the rest is light
- Filter chips are proper pill shapes with clear active states
- Accent borders on featured/highlighted cards
- Clean, consistent spacing inside every card

---

## Design tokens — apply these everywhere

Create or update `/lib/design.ts` with these tokens:

```ts
export const DESIGN = {
  // Border radius
  radius: {
    sm: 8,      // small elements — badges, chips, tags
    md: 12,     // inputs, small cards
    lg: 16,     // standard cards
    xl: 20,     // large feature cards
    full: 9999, // pills, avatars, circular buttons
  },

  // Shadows — use these for all cards
  shadow: {
    // Light theme shadows
    light: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    },
    // Dark/Kryd theme shadows — use colour tint not black
    dark: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },

  // Spacing
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  // Card padding — consistent inside all cards
  cardPadding: {
    sm: 12,   // compact cards — stat rows, mini cards
    md: 16,   // standard cards — job cards, course cards
    lg: 20,   // feature cards — hero cards, profile card
  },
}
```

---

## Card styles — three types used throughout the app

### Type 1 — Standard card (most common)
Used for: job cards, course cards, community posts, notification rows

```ts
// Light theme
backgroundColor: '#FFFFFF'
borderRadius: 16
borderWidth: 1
borderColor: '#F0F0F0'
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.08
shadowRadius: 8
elevation: 4
padding: 16

// Dark / Kryd theme
backgroundColor: 'rgba(255,255,255,0.06)'
borderRadius: 16
borderWidth: 1
borderColor: 'rgba(255,255,255,0.1)'
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.4
shadowRadius: 8
elevation: 4
padding: 16
```

### Type 2 — Inverted / dark card (for user identity cards)
Used for: the left sidebar user card, the tier card, the profile header card
This card is ALWAYS dark regardless of theme — it is the user's identity anchor

```ts
// ALL themes — always dark
backgroundColor: '#0B2D2C'
borderRadius: 20
borderWidth: 0
shadowColor: '#0B2D2C'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.4
shadowRadius: 16
elevation: 8
padding: 20

// Text inside: white
// Points/balance numbers: #CCDF1A (lime green)
// Tier badge: lime green background #CCDF1A, dark text
// Availability button: inside this dark card — white text green dot
```

### Type 3 — Accented card (for featured / highlighted content)
Used for: Tip of the Day, Daily Challenge, Kryd AI card, escrow protection, announcements

```ts
backgroundColor: colors.backgroundPrimary  // matches page
borderRadius: 16
borderLeftWidth: 4
borderLeftColor: '#CCDF1A'  // lime green left accent
borderTopWidth: 0
borderRightWidth: 0
borderBottomWidth: 0
// OR use full border with lime green:
borderWidth: 1
borderColor: 'rgba(204,223,26,0.3)'
padding: 16
```

---

## Specific elements to update across the whole app

### 1. Left sidebar user card — ALWAYS dark (Type 2)

The user identity card in the left sidebar of Dashboard, Learn, Jobs, Community, Wallet must use the inverted dark card style.

```
┌─────────────────────────────────────┐  ← borderRadius: 20
│  [Avatar 48px]                      │  ← dark background #0B2D2C
│  Aminat                (white bold) │
│  [New Talent]          (lime pill)  │
│                                     │
│  Points  │  Balance                 │
│  0       │  0.00      (lime green)  │
└─────────────────────────────────────┘
```

Avatar circle: 48px, lime green background `#CCDF1A`, dark text initials.
Tier badge inside this dark card: lime green `#CCDF1A` background, dark `#0B2D2C` text, `borderRadius: 9999`.
The divider between points and balance: `rgba(255,255,255,0.15)`.

### 2. Availability button — pill style

```ts
// Available now (green)
backgroundColor: 'rgba(29, 158, 117, 0.15)'
borderColor: '#1D9E75'
borderWidth: 1
borderRadius: 9999
paddingHorizontal: 14
paddingVertical: 8
color: '#1D9E75'
// Green dot before text: width 8, height 8, borderRadius 9999, backgroundColor '#1D9E75'

// Open to opportunities (amber)
backgroundColor: 'rgba(180, 120, 0, 0.1)'
borderColor: '#B47800'
color: '#B47800'

// Not available (gray)
backgroundColor: colors.backgroundSecondary
borderColor: colors.border
color: colors.textSecondary
```

### 3. Status summary rows — clean, no card wrapper needed

The status summary (Applications, Profile Views, Courses) should be inside the left sidebar as clean rows, not separate cards:

```
STATUS SUMMARY          (small uppercase label, secondary colour)
───────────────────────────────
Applications       4 Active
Profile Views    12 this week
Courses         2 in progress
```

Each row: label on left (secondary colour, 12px), value on right (primary colour, 13px bold).
Thin divider between rows: `rgba(0,0,0,0.06)` on light, `rgba(255,255,255,0.08)` on dark.
No card background — just rows with dividers.

### 4. Job cards — standard card with hover/active state

```ts
// Default state
backgroundColor: '#FFFFFF'
borderRadius: 16
borderWidth: 1
borderColor: '#F0F0F0'
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.06
shadowRadius: 8
elevation: 3
padding: 16
marginBottom: 12

// On hover (web) or pressed (mobile)
borderColor: '#CCDF1A'  // lime green border on interaction
shadowOpacity: 0.14
```

Inside each job card:
- Company name: 12px, secondary colour, top line
- Job title: 16px, bold, primary colour, second line
- Location and type badges: inline row below title
- Salary: right-aligned, 15px, bold, `#1D9E75` green
- Bookmark icon: top right corner, 20px

### 5. Filter chips / pills

The "All", "Remote", "Contract" chips must look like proper pills:

```ts
// Inactive chip
backgroundColor: 'transparent'
borderWidth: 1.5
borderColor: colors.border
borderRadius: 9999
paddingHorizontal: 16
paddingVertical: 7
color: colors.textSecondary
fontSize: 13

// Active chip (selected)
backgroundColor: '#0B2D2C'  // dark teal fill
borderWidth: 0
borderRadius: 9999
paddingHorizontal: 16
paddingVertical: 7
color: '#FFFFFF'  // white text
fontSize: 13
fontWeight: '600'

// In Kryd dark theme — active chip
backgroundColor: '#CCDF1A'  // lime green fill
color: '#0B2D2C'  // dark text
```

### 6. Tip of the Day card — accented (Type 3)

```ts
backgroundColor: colors.backgroundPrimary
borderRadius: 16
borderWidth: 1
borderColor: 'rgba(204,223,26,0.25)'
// Optional: add lime green left border for extra accent
borderLeftWidth: 4
borderLeftColor: '#CCDF1A'
padding: 16
```

Label "TIP OF THE DAY": 10px, uppercase, letter-spacing 1px, `#CCDF1A` colour.
Tip text: 14px, primary colour, line-height 1.6.

### 7. Upcoming Events cards

Each event card:
```ts
backgroundColor: colors.backgroundSecondary
borderRadius: 12
padding: 12
marginBottom: 8

// Date block (left side)
dateBlock: {
  backgroundColor: '#0B2D2C',
  borderRadius: 8,
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
}
// Month text: 9px, uppercase, rgba(255,255,255,0.7)
// Day number: 18px, bold, white
```

### 8. Search bar

```ts
backgroundColor: colors.backgroundSecondary
borderRadius: 12
borderWidth: 1
borderColor: colors.border
paddingHorizontal: 16
paddingVertical: 12
fontSize: 14

// On focus
borderColor: '#CCDF1A'  // lime green focus ring
shadowColor: '#CCDF1A'
shadowOpacity: 0.2
shadowRadius: 4
```

Search icon: left inside the input, `colors.textSecondary` colour.
Filter icon button: right side, same height as input, `borderRadius: 8`, `backgroundColor: colors.backgroundSecondary`.

### 9. Avatar circles — consistent across app

```ts
// Small (32px) — used in post cards, compact lists
width: 32, height: 32, borderRadius: 16

// Medium (40px) — used in notification rows, sidebar header
width: 40, height: 40, borderRadius: 20

// Large (48px) — used in sidebar user card
width: 48, height: 48, borderRadius: 24

// XL (64px) — used on profile page, profile card popup
width: 64, height: 64, borderRadius: 32

// Colour: derive from name hash
const avatarColours = ['#1D9E75', '#185FA5', '#854F0B', '#534AB7', '#A32D2D', '#0B5C3A']
const colour = avatarColours[name.charCodeAt(0) % avatarColours.length]
```

### 10. Sidebar collapse arrow

The `‹` collapse button at the right edge of the left sidebar:
```ts
backgroundColor: colors.backgroundPrimary
borderWidth: 1
borderColor: colors.border
borderRadius: 9999
width: 24
height: 24
alignItems: 'center'
justifyContent: 'center'
// Position: absolute, right: -12, top: '50%' (vertically centered on sidebar edge)
shadowColor: '#000'
shadowOpacity: 0.1
shadowRadius: 4
elevation: 3
```

---

## Pages to update — apply design system to all of these

Go through each of these files and apply the card styles, shadows, border radius, and spacing tokens:

1. `/app/(tabs)/index.tsx` — Dashboard
2. `/app/(tabs)/learn.tsx` — Learning Hub
3. `/app/(tabs)/jobs.tsx` — Get Jobs
4. `/app/(tabs)/community.tsx` — Community
5. `/app/wallet.tsx` — Wallet
6. `/app/course/[id].tsx` — Course Detail
7. `/app/job/[id].tsx` — Job Detail
8. `/app/profile.tsx` — Profile Settings
9. `/app/notifications.tsx` — Notifications

For each file:
- Replace any hardcoded shadow values with `DESIGN.shadow.light.md` or `DESIGN.shadow.dark.md` based on theme
- Replace any hardcoded border radius values with `DESIGN.radius.lg` (16) for cards
- Replace any hardcoded padding inside cards with `DESIGN.cardPadding.md` (16)
- Ensure the left sidebar user card uses the inverted dark Type 2 style
- Ensure the Tip of the Day / Daily Challenge / AI card uses the accented Type 3 style

---

## NativeWind CSS classes to use (for web consistency)

Since NativeWind is used, these Tailwind classes map to the design tokens:

```
Standard card:     rounded-2xl border border-gray-100 shadow-md bg-white p-4
Inverted card:     rounded-2xl bg-[#0B2D2C] shadow-xl p-5
Accented card:     rounded-2xl border border-[#CCDF1A]/30 border-l-4 border-l-[#CCDF1A] p-4
Active filter:     rounded-full bg-[#0B2D2C] px-4 py-1.5 text-white font-semibold
Inactive filter:   rounded-full border border-gray-200 px-4 py-1.5 text-gray-500
Availability:      rounded-full border border-green-500 px-3 py-1.5 text-green-600
Search bar:        rounded-xl border border-gray-200 px-4 py-3 bg-gray-50
Avatar sm:         w-8 h-8 rounded-full
Avatar md:         w-10 h-10 rounded-full
Avatar lg:         w-12 h-12 rounded-full
```

---

## What NOT to change

- Do not change any functionality or logic
- Do not change screen layouts or column structures
- Do not change any text content or labels
- Do not change navigation or routing
- Do not change the theme colour tokens in themeStore.ts
  (the design system applies ON TOP of the theme colours)

---

## Done when
- Left sidebar user card is always dark teal (#0B2D2C) with lime green accents on all pages
- All standard cards have borderRadius 16, defined shadow, and 1px border
- Job cards have lime green border on hover/press
- Filter chips are proper pills — dark fill when active, outline when inactive
- Tip of the Day card has lime green left border accent
- Upcoming Events date blocks are dark teal with white text
- Search bar has lime green focus ring
- Avatar circles are consistent sizes across all screens
- Sidebar collapse arrow is a small floating circle button on the sidebar edge
- Shadows are visible and add depth without being heavy
- All three themes (Light, Dark, Kryd) look correct with the new design system
- No hardcoded shadow or border radius values remain — all use DESIGN tokens
