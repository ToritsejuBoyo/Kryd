# Learn Page (Learning Hub)

The Learn page (`app/(tabs)/learn.tsx`) is designed as a comprehensive, tailored dashboard that helps IT professionals discover new courses, track their progress, and visualize their career trajectory. 

## Layout Architecture
The page is built using a **3-column responsive layout**. On large screens (desktop/tablet), it displays all three columns side-by-side using `flex-col lg:flex-row`. On mobile screens, it gracefully stacks into a single column.

### 1. Left Sidebar (w-64)
Focused on the user's personal career path, gamification, and quick access.
*   **Your Career Path Box:** 
    *   Displays the user's chosen career (e.g., "IT Support Specialist").
    *   Shows the user's current Tier (calculated dynamically based on their total points) and a progress bar showing how close they are to the next tier.
    *   Displays "Recommended focus" tags (e.g., Networking, Active Directory).
*   **Learning XP:** Shows the user's total accumulated points fetched from `userStore.profile.points`.
*   **Next Badge:** A visual indicator of the next achievement the user can unlock, complete with a static progress bar.
*   **Streak:** A gamified "Daily Streak" tracker showing consecutive days of learning and a row of day checkboxes (M, T, W, T, F, S, S).
*   **Bookmarked Courses:** A quick-access list of courses the user has saved for later.

### 2. Middle Column (Main Feed, flex-1)
Focused on content discovery and primary actions.
*   **Header & Search:** A large title and a global search bar to look up specific technologies or certifications.
*   **Category Pills:** A horizontal scrollable list of filters (Recommended, Career Path, Trending, Free, Pro, etc.) to sort the feed.
*   **Continue Learning Card:** A prominent, wide card featuring the user's most recently active course (e.g., Azure Fundamentals), displaying their current completion percentage and a "Resume Learning" button.
*   **Recommended for your career path:** A responsive grid (`flex-wrap`) of course cards tailored to the user's career. Each card features:
    *   Cover image with overlay badges (e.g., FREE, PRO).
    *   Title, difficulty level, duration, and provider.
    *   Star rating and number of reviews.
    *   Enrollment actions.
*   **Career Roadmap:** A horizontal timeline (built with absolute positioned connecting lines and flex nodes) that visualizes the steps from "IT Intern" to "Cloud Engineer", showing the user's current position.

### 3. Right Sidebar (w-[320px])
Focused on detailed analytics and community motivation.
*   **Your Progress (Profile Completeness):** A circular ring chart (achieved via heavy border-width and rounded-full) that displays profile completeness (e.g., 82%), accompanied by a checklist (Add Skills, Take Assessment, etc.).
*   **Skills to Improve:** Horizontal progress bars tracking the user's proficiency in specific skills (Linux, PowerShell, Azure, Networking).
*   **Weekly Goal:** Tracks how many learning modules have been completed this week against a target goal.
*   **Top Learners (Leaderboard):** Fetches the top 3 users from the database (`getLeaderboard()`) and displays their rank, avatar, and total XP to drive competition.
*   **Learning Partners:** A grid of logos/text acknowledging platform partnerships (Coursera, Udemy, Microsoft Learn, Cisco, Google, CompTIA).

## How it was Built
*   **State Management:** Uses Zustand (`useUserStore`) to access the logged-in user's profile and points.
*   **Data Fetching:** Standard `useEffect` calls `getCourses()`, `getUserCourses()`, and `getLeaderboard()` from `lib/db.ts` upon mount.
*   **Dynamic Calculations:** The Tier Progress is calculated using `useMemo` by comparing the user's current points against predefined threshold ranges (e.g., Tier 1 = 0 pts, Tier 2 = 500 pts).
*   **Styling:** Fully styled with Tailwind CSS via NativeWind, heavily utilizing custom color tokens from the `useTheme` hook to ensure compatibility with dark/light/Kryd modes.
