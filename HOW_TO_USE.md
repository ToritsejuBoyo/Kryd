# HOW_TO_USE.md
> Read this before opening Antigravity.

---

## The two types of files

| File | Purpose | How often |
|------|---------|-----------|
| `KRYD_SPEC.md` | Master context — brand, stack, DB schema, rules | Every agent reads this first, always |
| `tasks/task_XX.md` | One focused job for one agent | One per agent session |

---

## How to start each agent in Antigravity

1. Open Antigravity → Agent Manager → New Agent
2. Drop `KRYD_SPEC.md` into the agent context window
3. Drop the relevant `task_XX.md` into the same context window
4. Type: **"Read both files and complete the task in task_XX.md"**
5. Switch to **Plan mode** — review the plan before the agent writes code
6. Approve the plan → agent builds

That's it. Two files + one instruction per agent.

---

## The build order and parallel agents

Some tasks can run at the same time on different agents. Here is the full schedule:

```
Day 1   Agent 1: task_01_setup.md
Day 2   Agent 1: task_02_database.md
Day 3   Agent 1: task_03_auth.md
Day 4   Agent 1: task_04_dashboard.md
Day 5   Agent 1: fix any issues from Days 1–4 (describe bugs in chat)

Day 6   Agent 1: task_05_learn_listing.md
Day 7   Agent 1: task_06_learn_detail.md

Day 8   Agent 1: task_07_jobs_listing.md
        Agent 2: task_08_jobs_detail.md        ← run at the same time

Day 9   Agent 1: task_09_community_feed.md
        Agent 2: task_10_community_post_profile.md  ← run at the same time

Day 10  Agent 1: Fix and merge any conflicts from Day 8–9 parallel work

Day 11  Agent 1: task_11_wallet.md
Day 12  Agent 1: task_12_polish.md
Day 13  Agent 1: task_13_testing.md

Day 14  Human day — share with 5 real IT professionals for feedback
Day 15  Agent 1: Fix issues found in user testing (describe in chat)

Day 16  Agent 1: task_14_deployment.md (web + EAS builds)
Day 17  Submit to App Store and Google Play
Day 18  Email waitlist, post announcements
```

---

## Parallel agent tips

When running two agents at the same time (Days 8 and 9):
- Give each agent a **separate subfolder** to work in if possible — e.g. Agent 1 writes `app/(tabs)/jobs.tsx`, Agent 2 writes `app/job/[id].tsx` and `app/post-job.tsx`. No overlap.
- After both finish, review the code briefly for any conflicting imports or shared state issues
- A quick merge check on Day 10 catches anything before you move forward

---

## Quota management

Antigravity uses Gemini Pro which has a daily limit.

- Use **Plan mode** for every task — always review before it writes
- Use **Fast mode** only for small fixes (typos, colour tweaks, renaming)
- If you hit the quota limit:
  - Switch to the VS Code editor and make small fixes manually
  - Save agents for the big tasks
  - Come back the next day — quota resets daily

---

## If an agent goes off track

If the agent is building something wrong:
1. Stop it immediately — do not let it continue
2. Type: "Stop. Revert this. Re-read KRYD_SPEC.md and the task file. Here is what went wrong: [describe it]."
3. Start fresh with a cleaner, more specific instruction

Agents do best when each task file is focused on one thing. These files are already written that way — trust the structure.

---

## Rule to remember

> The task file tells the agent WHAT to build.
> The spec file tells the agent HOW Kryd works.
> You never need to explain the app from scratch in every prompt.
