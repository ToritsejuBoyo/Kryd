
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Covers: Login page, Welcome/intro page, and all onboarding screens
> Focus: no scrolling on any auth screen, everything fits the viewport
> The login page structure is good — keep the two-column split, just improve the content

---

## Goal
Fix three things with the auth experience:
1. Login page left panel — replace text with a visual/image panel
2. Sign up flow — clicking "Sign up" goes to a Welcome to Kryd intro page first, not a form
3. All auth and onboarding screens — must fit within the viewport with NO scrolling required on any screen

---

## CRITICAL RULE — NO SCROLLING ON ANY AUTH SCREEN

Every single screen in the auth and onboarding flow must fit entirely within the viewport height.
Use `height: 100vh` on the root container of every auth screen.
Use `overflow: hidden` to prevent any scroll.
If content might overflow, reduce padding, reduce font sizes, or reduce the number of items shown.
On mobile, use `height: 100dvh` (dynamic viewport height) to handle browser chrome correctly.

---

## FIX 1 — Login page

File: `/app/(auth)/login.tsx`

### Keep the two-column split layout — it looks good
Left panel: visual/brand panel (dark teal, full height)
Right panel: sign in form

### Left panel — replace all text with a visual

The current left panel has "Welcome back to KRYD" text with bullet points. Replace this entirely with a brand visual panel.

**Left panel content:**
- Full dark teal background `#0B2D2C`
- A large abstract geometric SVG illustration centered in the panel
  - Build this as an SVG with overlapping circles, triangles, and lines in lime green `#CCDF1A`, white at 20% opacity, and teal shades
  - The shapes should feel like a network or circuit board — abstract, tech-inspired, not literal
  - The illustration fills about 60% of the panel height and is centered
- Below the illustration, centered text:
  - Large: "The IT career platform"
  - Small subtitle: "Learn · Earn · Connect · Grow"
  - Both in white, the subtitle in `rgba(255,255,255,0.6)`
- Kryd logo top-left of the left panel (small, white)
- No bullet points. No feature list. Just the visual and the tagline.

### Right panel — sign in form (no changes to functionality, just ensure no scroll)

The right panel must use flexbox to vertically center all content:
```
display: flex
flex-direction: column
justify-content: center
height: 100vh
padding: 48px
max-width: 480px
```

Content (top to bottom, all fits without scroll):
- "KRYD" wordmark (small, dark, top)
- "Sign in" heading
- "Enter your details below" subtitle
- Email field
- Password field
- "Forgot password?" link (right-aligned)
- Sign In button
- Divider "or continue with"
- Google button + Apple button side by side
- "Don't have an account? Sign up" at bottom

**"Sign up" link behaviour:**
When user clicks "Sign up" → navigates to `/app/(auth)/welcome-intro` 
NOT to the current signup form. The signup form is no longer directly accessible from login.

---

## FIX 2 — New Welcome Intro page

File: `/app/(auth)/welcome-intro.tsx`

This is a NEW page that sits between the login page and the onboarding flow.
It is the first thing new users see after clicking "Sign up".
It must feel like a moment — not a form, not an info dump.
Full screen. No scroll. Pure brand energy.

### Layout — full screen, centered

```
height: 100vh
overflow: hidden
background: #0B2D2C  (dark teal)
display: flex
flex-direction: column
justify-content: center
align-items: center
padding: 48px
```

### Content (top to bottom, centered)

1. **Kryd logo** — large, centered at top
   - The K icon in lime green `#CCDF1A`
   - "ryd" in white
   - Size: about 48px height

2. **Large headline** (centered, white, bold, large font ~48px desktop / 32px mobile):
   ```
   "Your IT career,
   elevated."
   ```

3. **Subtitle** (centered, `rgba(255,255,255,0.7)`, ~18px):
   ```
   "Join thousands of IT professionals
   learning, earning, and growing on Kryd."
   ```

4. **Three horizontal feature pills** (centered row, inline):
   ```
   [ ⚡ Learn ]   [ 💰 Earn ]   [ 🌍 Connect ]
   ```
   Each pill: small rounded chip, `rgba(255,255,255,0.1)` background, white text, lime green icon.

5. **Get Started button** (large, full width max 400px, lime green `#CCDF1A`, dark text, centered):
   ```
   [   Get Started →   ]
   ```
   → navigates to `/app/(auth)/onboarding/role-select`

6. **Small text below button**:
   ```
   Already have an account?  Sign in
   ```
   "Sign in" is lime green, taps back to login page.

7. **Bottom strip** (very bottom of screen, small text):
   ```
   Free to join  ·  No credit card required
   ```
   Secondary white colour, very small.

### Animation
On page load, elements animate in with a stagger:
- Logo fades in first (0ms delay)
- Headline slides up from below (150ms delay)
- Subtitle fades in (300ms delay)
- Feature pills fade in (450ms delay)
- Get Started button scales in (600ms delay)

---

## FIX 3 — All onboarding screens — no scroll, fixed viewport

This applies to EVERY screen in the onboarding flow:
- `/app/(auth)/onboarding/role-select.tsx`
- `/app/(auth)/onboarding/freelancer/*.tsx` (all 7 screens)
- `/app/(auth)/onboarding/client/*.tsx` (all 6 screens)

### Layout rule for every onboarding screen

Every onboarding screen uses this wrapper:
```
<View style={{ 
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: colors.backgroundPrimary,
  display: 'flex',
  flexDirection: 'column'
}}>
  {/* Fixed header — never scrolls */}
  <View> {/* Back button + progress indicator */} </View>

  {/* Fixed content area — fills remaining space */}
  <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 40 }}>
    {/* Heading, subtitle, main input/selection */}
  </View>

  {/* Fixed footer — never scrolls */}
  <View style={{ paddingHorizontal: 40, paddingBottom: 32 }}>
    {/* Primary CTA button */}
    {/* "Already have an account? Sign in" text */}
  </View>
</View>
```

The three sections (header, content, footer) are FIXED inside the viewport.
The content section is vertically centered.
Nothing scrolls.

### Role select screen — fits without scroll
Two cards side by side (Freelancer / Client).
On mobile: stack vertically but make cards shorter.
Cards must NOT require scrolling to see the Continue button.
Reduce card padding if needed on small screens.

### Freelancer Screen 2 — Career path grid
The skill tiles grid is the most likely to overflow.
Solution: show a SCROLLABLE grid INSIDE the fixed content area only.
The grid itself can scroll internally (like a list inside a box) but the page itself does not scroll.
```
<View style={{ flex: 1 }}>           {/* fixed content area */}
  <Text>Heading</Text>
  <Text>Subtitle</Text>
  <ScrollView style={{ flex: 1 }}>   {/* only the grid scrolls internally */}
    {/* skill tiles */}
  </ScrollView>
</View>
```
This way the heading, the footer button, and the "sign in" link are always visible.

### Freelancer Screen 3 — Experience level
5 option cards stacked.
If they overflow on small screens, reduce card height and padding.
Target: 5 cards + heading + button all visible without scrolling on a 768px height screen.
Each card: padding 12px not 20px. Font size 14px not 16px. No line breaks in descriptions.

### All credential screens (email + password)
Two inputs + button = very little content.
These should NEVER scroll on any device.
Add extra spacing above the heading to push it down visually and feel centered.

### Country/location screen
Country dropdown + currency toggle + button.
All fits easily. No scroll needed.

---

## FIX 4 — Signup page (the current one at /signup)

The current signup page at `localhost:8082/signup` should NO LONGER be a direct signup form.
Instead, redirect anyone who visits `/signup` to `/welcome-intro`.

The page at `/signup` can be removed OR converted to just redirect:
```ts
// In signup.tsx
useEffect(() => {
  router.replace('/(auth)/welcome-intro')
}, [])
```

The actual account creation happens at the END of the onboarding flow (Freelancer Screen 6 or Client Screen 5) when the user fills in email and password.

---

## FIX- [x] Add Google/Apple sign-up buttons to freelancer credentials screen (step 6/7)
- [x] Validate new TypeScript compilation
- [x] Replace country selection with three currency options on step 7/7
- [x] Validate currency change TypeScript compilation

---

## FIX 5 — Google and Apple sign-in buttons

Both the login page and the welcome-intro page show Google and Apple sign-in options.

For MVP these are placeholder buttons — they do not need to actually work with OAuth yet.
When tapped, show a toast: "Google / Apple sign-in launching soon. Please use email for now."

This is the correct approach — show the buttons so users expect the feature is coming, but do not block launch waiting for OAuth setup.

In Phase 2, integrate with Supabase Auth providers for Google and Apple OAuth.

---

## Size and spacing guidelines for auth screens

To ensure nothing scrolls, follow these max sizes:

| Element | Desktop | Mobile |
|---------|---------|--------|
| Page heading | 36px | 28px |
| Subtitle | 16px | 14px |
| Input height | 48px | 44px |
| Button height | 52px | 48px |
| Section padding | 48px | 24px |
| Card padding | 20px | 14px |
| Gap between elements | 16px | 12px |

On screens shorter than 700px height, reduce all padding by 25%.

---

## Done when
- Login page left panel shows abstract geometric SVG illustration + tagline, no text bullets
- Login page right panel fits in viewport with no scroll on any screen size
- Clicking "Sign up" on login goes to welcome-intro page, NOT a signup form
- Welcome-intro page is full screen dark teal with logo, headline, feature pills, and Get Started button
- Get Started on welcome-intro navigates to role selection (start of onboarding flow)
- "Already have an account? Sign in" on welcome-intro goes back to login
- Every onboarding screen uses the header/content/footer fixed layout
- No onboarding screen requires page-level scrolling
- Career path grid scrolls INTERNALLY within its container, not the page
- Experience level cards fit without scroll on 768px height screens
- /signup route redirects to /welcome-intro
- Google and Apple buttons show "coming soon" toast on tap
- All screens work in all three themes (Light, Dark, Kryd)