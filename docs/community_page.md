# Community Page

The Community page (`app/(tabs)/community.tsx`) is designed as a dynamic, forum-style hub where IT professionals can ask questions, share knowledge, and network. It is tightly integrated with the platform's messaging and connection systems.

## Layout Architecture
Similar to the Learn page, the Community page utilizes a **3-column responsive layout**, allowing for high information density on desktop while stacking neatly on mobile devices.

### 1. Left Sidebar (w-64)
Focused on navigation and highlighting top contributors.
*   **Nav Links:** A vertical list of quick links (Community, My Activity, Bookmarks, My Questions, etc.) to filter the user's view.
*   **Top Contributors:** A mini-leaderboard that fetches from `getLeaderboard()` and displays the top users based on their points. Ranks 1, 2, and 3 receive special gold, silver, and bronze background colors for their rank number.
*   **Promo Widget:** A call-to-action box encouraging users to join live voice/video rooms.

### 2. Middle Column (Main Feed, max-w-4xl)
The core interactive zone for the community.
*   **Header & Search:** A prominent title alongside a "Create Post" button (which is hidden for Client roles unless they are in the Hiring group). Below it sits a large search bar to find specific topics.
*   **Group Filters:** A horizontal scrollable list of specialized IT groups (IT Support, Cloud, Security, Helpdesk, Career, Hiring & Projects). Selecting a group filters the main feed.
*   **Inner Tabs:** Filters for content type (Feed, Questions, Discussions, Rooms).
*   **The Post Feed (`FlatList`):** Displays community posts fetched via `getCommunityPosts()`. Each post card includes:
    *   A dynamic icon based on the post type (Question vs. Discussion).
    *   The post title, body text (truncated), and tags.
    *   **Author Info:** The author's avatar, name, timestamp, and role. **Clicking the author triggers the Profile Card Popup**.
    *   **Action Bar:** Upvote/downvote arrows (which update the database via `updatePostLikes()`), comment count, and a bookmark button.

### 3. Right Sidebar (w-[300px])
Focused on trending content and community rules.
*   **Trending Topics:** A static list of popular topics (e.g., Windows 11 Issues) and their post counts to encourage engagement.
*   **Suggested Rooms:** Recommendations for live audio/text rooms to join, displaying active member counts.
*   **Community Guidelines:** A quick checklist of rules (Be respectful, No spam, etc.) to maintain a healthy environment.

## Interactive Features & Modals

### Profile Card Bottom Sheet
A core networking feature integrated directly into the community feed. When a user taps on another user's avatar or name in the feed (or the leaderboard), a custom modal appears sliding up from the bottom of the screen.

*   **Profile Snapshot:** Displays the user's large avatar, full name, role, bio, and top skills.
*   **Stats:** Shows their total posts, jobs done, and total points.
*   **Dynamic Messaging Integration:** 
    *   The modal utilizes `canMessage()` from `lib/messaging.ts` to evaluate the relationship between the logged-in user and the selected profile.
    *   If they are connected or share a job history, the button says **"Message"** and links directly to a private chat (`/conversation/[id]`).
    *   If they have no prior interaction, the button says **"Connect"**.
*   **Connection Request Flow:** Clicking "Connect" flips the modal's UI to reveal a text input where the user can type an optional personal note. Upon submission, it triggers `sendConnectionRequest()` and updates the button state to "Request Sent".

## How it was Built
*   **Data Fetching:** The page pulls data from Supabase using `getCommunityPosts(group)` and `getLeaderboard()`.
*   **State Management:** Local React state handles the active tabs, selected groups, and modal visibility. Zustand (`useUserStore`) is used to access the current user's ID for upvoting logic and messaging permissions.
*   **Styling:** NativeWind is used extensively to create complex borders, hover effects, and responsive flexbox layouts that adapt seamlessly from mobile to wide-screen web.
