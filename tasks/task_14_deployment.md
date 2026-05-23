# task_14_deployment.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 16–17 | Depends on: task_13 | Run as ONE focused agent

---

## Goal
Prepare and deploy the Kryd app to the web (immediately) and to both app stores (iOS + Android).

---

## 1. Pre-deployment checklist

Before building, confirm all of these are in place:

- [ ] `app.json` has: `name: "Kryd"`, `slug: "kryd"`, `version: "1.0.0"`, `bundleIdentifier: "com.kryd.app"`, `package: "com.kryd.app"`
- [ ] App icon exists at `assets/icon.png` (1024×1024, Kryd logo on `#0B2D2C` background)
- [ ] Splash screen image set in `app.json` with `backgroundColor: "#0B2D2C"`
- [ ] `.env` values are set (Supabase URL and anon key)
- [ ] `.env` is in `.gitignore`
- [ ] No `console.log` statements with sensitive data remaining

---

## 2. Web deployment

Build:
```bash
npx expo export --platform web
```
This creates a `/dist` folder.

Create a `vercel.json` in the project root for correct SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The `/dist` folder is ready to drag-and-drop into Vercel or Netlify.
Both are free and take under 5 minutes to deploy.

After deploying, test these in a browser:
- Sign up flow
- Dashboard loads with data
- All 4 tabs navigate correctly
- Supabase calls work (no CORS errors)

---

## 3. EAS configuration

Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 4. Production builds

Run both builds (they can run in parallel on EAS servers):
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

Builds take 20–40 minutes. Monitor the output at expo.dev/accounts/[username]/projects/kryd/builds.

If the build fails, the most common causes are:
- Missing bundle identifier — fix in `app.json`
- Missing Apple certificates — EAS will guide you through creating them
- Missing Google keystore — EAS creates this automatically on first build

---

## 5. App store listings

### App Store (iOS) — fill in App Store Connect
- **Name:** Kryd — IT Careers & Learning
- **Subtitle:** Learn, Earn, and Grow in IT
- **Category:** Education (primary), Business (secondary)
- **Age rating:** 4+
- **Short description:** The AI-powered platform for IT Support professionals worldwide.
- **Keywords:** IT support, IT jobs, tech careers, CompTIA, cloud jobs, helpdesk, IT training, earn points
- **Privacy Policy URL:** your URL (create a simple one-page policy)

### Google Play — fill in Play Console
- **App name:** Kryd — IT Careers & Learning
- **Short description (80 chars):** Learn IT skills, find jobs, and earn rewards — globally.
- **Category:** Education
- **Content rating:** Everyone

### Full description (use for both stores):
```
Kryd is the professional platform built for IT Support specialists, 
cloud engineers, cybersecurity professionals, and tech enthusiasts worldwide.

LEARN & EARN
Access IT courses covering CompTIA, cloud computing, cybersecurity, 
and helpdesk fundamentals. Earn points for every module you complete — 
and convert those points into real rewards.

FIND YOUR NEXT ROLE
Browse freelance gigs and full-time IT positions matched to your skills. 
Apply in seconds. Track your applications in one place.

JOIN A GLOBAL COMMUNITY
Connect with IT professionals across the world. Share knowledge, 
ask questions, and grow your reputation in groups for IT Support, 
Cloud, Security, Helpdesk, and Career development.

YOUR SKILLS ARE VALUABLE
Every course you complete, job you apply to, and post you share 
earns you points. Convert points to coins. Redeem for real income.

Kryd is free to download and use. Sign up today.
```

---

## 6. Submit to stores

```bash
eas submit --platform ios
eas submit --platform android
```

Follow the prompts. EAS will ask for your App Store Connect API key and Google Play service account JSON — create both in your developer accounts.

---

## 7. README.md

Create a `README.md` in the project root:

```markdown
# Kryd — MVP v1.0

The AI-powered professional platform for IT Support specialists worldwide.

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Run the SQL files in `/supabase/migrations/` and `/supabase/seed.sql` in your Supabase project
5. Run `npx expo start`

## Tech stack
React Native · Expo · NativeWind · Supabase · Zustand · Expo Router

## Scripts
- `npx expo start` — run in dev mode
- `npx expo start --web` — run in browser
- `npx expo export --platform web` — build for web deployment
- `eas build --platform all` — build for app stores
```

---

## Done when
- Web build completes without errors
- `vercel.json` is in place for correct routing
- `eas.json` is configured for production
- Both iOS and Android builds complete on EAS with no errors
- Both apps are submitted to their respective stores
- README.md is complete and accurate
