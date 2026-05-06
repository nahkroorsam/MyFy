# Finvoice — Personal Finance Manager

A production-ready personal finance SaaS with voice input, receipt upload, and manual expense tracking. Built with React + TypeScript + Supabase.

![Finvoice Dashboard](https://placehold.co/1200x630/07071a/c8f135?text=Finvoice)

## Features

- **Auth** — Email/password sign-up & login via Supabase Auth
- **Dashboard** — Monthly income, total expenses, remaining balance, budget progress bar
- **Manual Entry** — Quick form with category selection
- **Voice Input** — Speak expenses using Web Speech API ("forty dollars on lunch")
- **Receipt Upload** — Drag-and-drop image upload to Supabase Storage
- **Smart Alerts** — Warning banner when expenses exceed 50% of income
- **Mobile Responsive** — Works on all screen sizes
- **Dark Theme** — Obsidian dark with lime green accents

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd finvoice
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Go to **SQL Editor** and run the contents of `schema.sql` (in the project root)
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Supabase Setup Details

### Run the SQL schema

In your Supabase dashboard → **SQL Editor** → **New query**, paste the full contents of `schema.sql` and click **Run**.

This creates:
- `profiles` table — user data including monthly income
- `expenses` table — expense records with RLS policies
- Storage bucket `receipts` — for receipt images
- A trigger to auto-create a profile on signup
- Row Level Security policies so users only see their own data

### Email confirmation (optional)

For development, you can disable email confirmation:
- Go to **Authentication → Providers → Email**
- Toggle off "Confirm email"

---

## Project Structure

```
finvoice/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── StatCards.tsx       # Income / Expenses / Remaining cards
│   │   └── expenses/
│   │       ├── ExpenseInput.tsx    # Tabbed input (manual/voice/receipt)
│   │       ├── ManualForm.tsx      # Manual expense form
│   │       ├── VoiceInput.tsx      # Web Speech API integration
│   │       ├── ReceiptUpload.tsx   # Drag-drop upload to Supabase Storage
│   │       └── ExpenseTable.tsx    # Sortable expense list with delete
│   ├── hooks/
│   │   ├── useAuth.tsx             # Auth context + hook
│   │   ├── useExpenses.ts          # CRUD for expenses
│   │   └── useProfile.ts           # Profile + income management
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   └── utils.ts                # Formatters, parsers, constants
│   ├── pages/
│   │   ├── AuthPage.tsx            # Login / Sign up
│   │   └── DashboardPage.tsx       # Main app page
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx                     # Router + Toaster
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Tailwind + custom styles
├── schema.sql                      # Supabase SQL schema
├── netlify.toml                    # Netlify deployment config
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Deploy to Netlify

### Option A: Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option B: Netlify Dashboard

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Connect your repo
4. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Voice Input Notes

Voice recognition uses the browser's built-in **Web Speech API**:
- ✅ Chrome (desktop & Android)
- ✅ Edge
- ✅ Safari (iOS 14.5+)
- ❌ Firefox (not supported)

Example phrases:
- "forty dollars on lunch"
- "12.50 for coffee"
- "hundred and twenty for groceries"

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Backend | Supabase (Auth, Database, Storage) |
| Routing | React Router v6 |
| Toasts | react-hot-toast |
| Icons | Lucide React |
| Hosting | Netlify |

---

## License

MIT
