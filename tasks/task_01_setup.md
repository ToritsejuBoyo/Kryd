# task_01_setup.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 1 | Parallel agents: none yet

---

## Goal
Get the Kryd project running with all dependencies installed, the correct folder structure in place, and the tab navigator visible on screen.

---

## Instructions

### 1. Configure the existing Expo project
The project was created with `npx create-expo-app kryd`. Now configure it:
- Enable TypeScript (rename App.js to App.tsx if needed)
- Set up Expo Router for file-based navigation
- Configure NativeWind for Tailwind styling in React Native

### 2. Install dependencies
```bash
npm install nativewind
npm install --save-dev tailwindcss
npm install zustand
npm install @supabase/supabase-js
npm install react-native-safe-area-context
npm install expo-linear-gradient
npm install @expo/vector-icons
npm install react-native-reanimated
```

### 3. Configure NativeWind
- Create `tailwind.config.js` pointing to all app files
- Add the NativeWind babel plugin to `babel.config.js`

### 4. Environment setup
Create a `.env` file at project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```
Create a `.env.example` with the same keys but empty values.

### 5. Create lib/supabase.ts
```ts
import { createClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)
```

### 6. Create lib/theme.ts
Export the Kryd brand colour tokens from KRYD_SPEC.md so they can be imported anywhere.

### 7. Create the Zustand store at store/userStore.ts
Use the interface from KRYD_SPEC.md.

### 8. Set up the tab navigator
Create these four placeholder screens under `/app/(tabs)/`:
- `index.tsx` — shows heading "Dashboard"
- `learn.tsx` — shows heading "Learn"
- `jobs.tsx` — shows heading "Jobs"
- `community.tsx` — shows heading "Community"

Each placeholder should use the brand background colour `#0B2D2C` with white heading text so we can confirm the theme is working.

### 9. Set up the root layout
Create `/app/_layout.tsx` that wraps the app in `SafeAreaProvider` and renders the tab navigator.

---

## Done when
- `npx expo start --web` opens a browser showing the 4-tab navigator
- Tapping each tab shows the correct heading
- No TypeScript or NativeWind errors in the console
