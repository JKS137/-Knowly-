# Knowly — Personalized Interactive Social Quiz Platform

> **"How well do your friends really know you?"**
> Knowly is a mobile-first, commercial-grade social quiz web application where users create personalized interactive tests about themselves, share unique public links with friends, collect answers, and discover who actually knows them best through rich leaderboards, accuracy analytics, and shareable scorecards.

---

## 1. What Was Built & Features

### Creator Experience
- **Dedicated Test Builder**:
  - Test Title, Creator Name, Custom Subtitle, and Theme selector.
  - Multi-choice question creation with order tracking (`Question 01`, `Question 02`...).
  - Pre-built **Question Bank** containing curated prompt ideas (comfort foods, pet peeves, travel dreams, habits, quirks).
  - Add / edit / delete / duplicate question capabilities.
  - Accessible Up/Down question reordering.
  - Visual radio selection to mark the creator's true answer.
  - Real-time client-side validation (ensures questions have text, $\ge 2$ options, and a marked correct answer).
  - Unsaved changes prevention and live **Mobile Simulator Preview**.
- **Publish & Viral Sharing**:
  - Generates a unique, non-sequential URL-safe short identifier (e.g. `/q/k9z2Wp`) without exposing database primary keys.
  - Dedicated **Publish Celebration Screen**.
  - One-click **Copy Link** with instant visual feedback.
  - Native **Web Share API** integration with automatic fallback.
  - Direct sharing hooks for **WhatsApp**, **X (Twitter)**, and **Telegram**.
  - In-browser **QR Code Generator** using the `qrcode` engine with PNG image download for party screens, stickers, or Instagram stories.
- **Private Creator Dashboard (`/dashboard/:shortId`)**:
  - Protected by a private `creatorToken` stored securely in the creator's browser.
  - **Key Metrics**: Total Views, Starts, Completions, Completion Rate %, Average Score, Average Match %, and Highest Score.
  - **Score Distribution**: Tier breakdown (90–100%, 70–89%, 50–69%, 25–49%, 0–24%).
  - **Question Accuracy Analytics**: Displays completion rate per question, highlighting the **Hardest Question (Most Missed)** and **Easiest Question (Most Accurate)**.
  - **Participants Leaderboard**: Ranked list with avatar emoji, participant nickname, score, percentage, match badge, and date.
  - **Deep Answer Inspection**: Click any participant row to see their exact answer choices and mistakes.
  - **Quiz Controls**: Toggle quiz status (Active vs Closed) and permanently delete quiz.
- **My Tests Hub (`/my-quizzes`)**:
  - Automatically indexes all tests created on the user's device.
  - Quick overview cards with responses count, views, status, and direct dashboard shortcuts.

### Participant Experience (`/q/:shortId`)
- **Zero-Friction Onboarding**:
  - No account, password, or email required to take a test.
  - Friendly welcome screen showing the creator's name, title, description, and question count.
  - Nickname input with 16 curated expressive emoji avatars (`🦊`, `🐼`, `⚡️`, `🍕`, `🚀`, `🌸`, `🎸`, etc.).
- **Focused Answering Flow**:
  - Clean, distraction-free one-question-at-a-time interface.
  - Large touch targets ($\ge 48\text{px}$) optimized for mobile devices.
  - Smooth progress indicator (`Question 3 of 6 · 50% Complete`).
  - Preserves answers during previous/next navigation.
  - **Security Guarantee**: Correct answers are **never** delivered in the public quiz API payload. Participants cannot inspect network payloads to cheat.
  - Confirmation review modal before final submission.
- **Results & Viral Celebration**:
  - Full celebratory confetti burst powered by `canvas-confetti`.
  - Big score badge (e.g., `5 / 6 — 83% Match`).
  - Dynamic result tier assignment:
    - `90%–100%`: **Soulmate Status 🔮**
    - `70%–89%`: **Inner Circle VIP ⭐️**
    - `50%–69%`: **Solid Companion 🤝**
    - `25%–49%`: **Casual Acquaintance 👀**
    - `0%–24%`: **Strangers on a Train 🚂**
  - **Full Answer Breakdown**: Reveals the creator's actual answers side-by-side with the participant's choices only after submission.
  - Social Result Card sharing via Web Share API or clipboard copy.
  - **Viral Return Loop**: Direct CTA for the participant to create their own test to challenge the creator back.

### Design System & Taste
- **Anti-Slop Restraint**: Zero generic purple gradients or meaningless pill tags. Rendered with refined typography (*Plus Jakarta Sans* and *Outfit*), clean unboxed metadata, and high-contrast accessible color themes.
- **Tasteful Aesthetic Themes**:
  - *Warm Clay (Terracotta)*
  - *Amber Glow (Sunset)*
  - *Midnight Ink (Dark Navy/Cyan)*
  - *Forest Moss (Emerald)*
  - *Lilac Mist (Lavender)*
  - *Editorial Monochrome (Minimal)*

---

## 2. Application Architecture

```
├── .data/
│   └── db.json               # File-backed persistence engine
├── server.ts                 # Express full-stack backend with Vite middleware in dev
├── index.html                # HTML entry with SEO metadata and web font links
├── src/
│   ├── main.tsx              # React DOM entry point
│   ├── App.tsx               # Client router and view orchestrator
│   ├── index.css             # Tailwind CSS layer and typography styling
│   ├── types/
│   │   └── quiz.ts           # Core TypeScript data contracts
│   ├── server/
│   │   └── storage.ts        # Storage engine, sanitization, server scoring
│   ├── db/
│   │   ├── schema.sql        # Production PostgreSQL / Supabase DDL
│   │   └── supabase-setup.md # Supabase setup & RLS configuration guide
│   ├── utils/
│   │   ├── api.ts            # Typed client API client
│   │   ├── scoring.ts        # Result tier calculations and share URL generator
│   │   ├── theme.ts          # Color palettes and theme styling configurations
│   │   ├── questionBank.ts   # Curated starter question templates
│   │   └── storageClient.ts  # LocalStorage helper for creator tokens & avatars
│   └── components/
│       ├── Navbar.tsx        # Responsive navigation bar
│       ├── Footer.tsx        # App footer with privacy and product links
│       ├── LandingPage.tsx   # Landing page with interactive preview & FAQs
│       ├── TestBuilder.tsx   # Multi-step test creation and mobile simulator
│       ├── PublishSuccessModal.tsx # Share modal with WhatsApp/X/QR code
│       ├── QRCodeModal.tsx   # Canvas QR code generator with image download
│       ├── ParticipantQuiz.tsx # Mobile quiz taking experience & answer reveal
│       ├── CreatorDashboard.tsx # Private analytics and leaderboard
│       └── MyQuizzes.tsx     # Creator's test management hub
```

---

## 3. Database Schema (PostgreSQL / Supabase)

The production schema is located at `src/db/schema.sql` and includes:

- `tests`: Stores quiz metadata (`id`, `short_id`, `title`, `creator_name`, `creator_token`, `theme`, `status`, counters). Indexed by `short_id` and `creator_token`.
- `questions`: Stores question text, order, and type. Foreign key to `tests.id` (CASCADE).
- `question_options`: Stores answer choices. Foreign key to `questions.id` (CASCADE). `is_correct` boolean is strictly protected.
- `submissions`: Stores participant score, total, percentage, result tier, and submission timestamp.
- `submission_answers`: Records individual answers mapped to questions and options.
- **Row Level Security (RLS)**: Enforces public read-only access for published tests, while reserving sensitive mutations to creator tokens.

---

## 4. Security & Anti-Cheating Architecture

1. **Server-Side Scoring**: The browser never decides if an answer is right or wrong. Scoring is calculated strictly on the backend when `/api/quizzes/:shortId/submit` is called.
2. **Payload Sanitization**: The public quiz API (`/api/quizzes/:shortId`) systematically omits `is_correct` from every question option. A participant inspecting network dev tools will find no cheat cues.
3. **Creator Authorization**: Actions such as viewing private dashboards, modifying questions, closing quizzes, or deleting quizzes require the secret `creator_token`.
4. **Rate Limiting**: Submission endpoints are rate-limited per IP to prevent bot spam or leaderboard flooding.

---

## 5. Local Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run development server (runs full-stack Express API + Vite dev server)
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## 6. Vercel Deployment Instructions

To deploy to Vercel:

1. **Option A (Next.js or Serverless API)**:
   - Point your Vercel project to this repository.
   - For serverless functions, deploy API endpoints to `/api/*` handlers or Next.js route handlers.
2. **Option B (Docker / Node Server on Vercel or Cloud Run)**:
   - Run `npm run build` to generate the production client bundle in `dist/`.
   - Start the server with `npm start` (`tsx server.ts`), which automatically serves the production `dist/` directory and exposes the `/api` routes.
3. **Environment Variables**:
   ```env
   NODE_ENV="production"
   PORT="3000"
   # Optional Supabase / Postgres connection:
   DATABASE_URL="postgresql://user:password@host:5432/knowly"
   ```

---

## 7. Monetization & Subscription Architecture (V2 Readiness)

The database schema and API contracts are structured for easy integration with Stripe, Creem, or LemonSqueezy:
- **Free Tier**: Up to 3 active tests, standard themes, up to 100 responses per test.
- **Pro Tier**: Unlimited tests, unlimited participant submissions, export responses as CSV, custom color palettes, and removed Knowly watermark.
- **Creator / Party Pack**: Custom subdomain/branding, audio sound effects, live party mode with projector display.
