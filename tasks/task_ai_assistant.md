# task_ai_assistant.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_03_auth | Parallel: can run alongside task_notifications.md

---

## Goal
Build the AI Support Assistant screen — a chat interface where users can ask IT questions or platform questions and get instant AI-powered answers. This is one of Kryd's core differentiators from competitors.

---

## File
`/app/ai-assistant.tsx`

Accessible from:
- Dashboard quick actions grid — replace or add as a 5th action
- Bottom tab bar — add as a 5th tab with a robot/sparkle icon
- Profile dropdown menu

---

## How it works
For the MVP, the AI assistant calls the Anthropic Claude API (or OpenAI API) from a Supabase Edge Function. The app sends the user's query to the edge function, the edge function calls the AI API, and returns the response. This keeps the API key secure on the server side.

If setting up an edge function is too complex for now, fall back to a hardcoded response system using pattern matching — described in the fallback section below.

---

## Layout

### Header
- Back button (left)
- Title: "AI Assistant"
- Subtitle: "Powered by Kryd AI"
- Small sparkle or robot icon in lime green

### Suggested questions (show when chat is empty)
Display 4 tappable suggestion pills at the top:
- "How do I configure a VPN on Windows 11?"
- "What certifications should I get for cloud jobs?"
- "How does the Kryd escrow system work?"
- "How do I increase my tier level?"

Tapping a suggestion fills the input and sends it automatically.

### Chat messages area
ScrollView showing the conversation history.

**User message bubble:**
- Right-aligned
- Background: `#CCDF1A` (lime green)
- Text: `#0B2D2C` (dark)
- Rounded corners: `rounded-2xl rounded-tr-sm`

**AI message bubble:**
- Left-aligned
- Background: `rgba(255,255,255,0.08)`
- Text: white
- Small Kryd K icon on the left
- Rounded corners: `rounded-2xl rounded-tl-sm`
- Typing indicator: three animated dots while waiting for response

### Input bar (sticky at bottom)
- Text input: "Ask anything about IT or Kryd..."
- Send button: lime green circle with arrow icon
- Disabled when input is empty
- Keyboard avoiding — always visible above keyboard

---

## AI response logic

### Option A — Supabase Edge Function (preferred)
Create `/supabase/functions/ai-assistant/index.ts`:

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { query, history } = await req.json()
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: 'You are Kryd AI — a helpful assistant for IT Support professionals. You answer IT technical questions and questions about the Kryd platform. Keep answers concise, practical, and under 150 words. Always be encouraging about the user\'s IT career growth.',
      messages: [
        ...history,
        { role: 'user', content: query }
      ]
    })
  })
  
  const data = await response.json()
  return new Response(
    JSON.stringify({ answer: data.content[0].text }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

Call from the app:
```ts
const { data } = await supabase.functions.invoke('ai-assistant', {
  body: { query: userMessage, history: conversationHistory }
})
```

### Option B — Fallback pattern matching (if edge function not ready)
Use a local response map for common IT and platform questions:

```ts
const responses: Record<string, string> = {
  'vpn': 'To configure a VPN on Windows 11: go to Settings → Network & Internet → VPN → Add VPN. Enter your server address, VPN type (usually IKEv2 or L2TP), and credentials. For corporate VPNs, ask your IT admin for the server details.',
  'certification': 'For IT Support, start with CompTIA A+ then Network+. For cloud roles, target AWS Cloud Practitioner or Google Cloud ACE. For security, CompTIA Security+ is the industry standard. Check the Kryd Learning Hub for courses on all of these.',
  'escrow': 'Kryd escrow holds your payment securely for 24 hours after job completion — much faster than Upwork (5 days) or Fiverr (14 days). The client confirms delivery, funds release automatically after 24 hours.',
  'tier': 'Your tier advances automatically based on: completed jobs, ratings received, learning modules finished, and community engagement. Keep earning points and completing jobs to move from New Talent to Intermediate to Verified Expert.',
  'default': 'Great question! For detailed IT guidance, I recommend checking the Kryd Learning Hub for relevant courses. For platform questions, visit your profile settings or post in the Community Hub where experienced IT professionals can help.'
}

function getResponse(query: string): string {
  const lower = query.toLowerCase()
  for (const [key, response] of Object.entries(responses)) {
    if (lower.includes(key)) return response
  }
  return responses.default
}
```

---

## Points for using AI assistant
Every time a user sends a query and receives a response:
- Insert +5 points into `point_transactions` with reason `'ai_assistant_query'`
- Update `profiles.points` in Supabase
- Update Zustand store

---

## Query history
Store the conversation in component state — not in Supabase for MVP. When the user leaves the screen and comes back the conversation resets. Add a "Clear chat" button in the header for longer sessions.

---

## Done when
- Chat interface renders correctly with user and AI bubbles
- Suggested questions appear when chat is empty and fill the input on tap
- Sending a message shows a typing indicator then the AI response
- +5 points awarded per query and reflected in dashboard stats
- Input stays above keyboard on both iOS and Android
- Clear chat button resets the conversation
- Loading state shows while waiting for AI response
- Error state shows if AI call fails: "Could not reach the assistant. Please try again."
