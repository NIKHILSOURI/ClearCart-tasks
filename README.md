# ClearCart AI - Open Task System

Production-style shared project and task tracking app for ClearCart AI.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- Supabase (database only, no auth)
- TanStack Query
- React Hook Form + Zod (installed for validation workflows)
- dnd-kit for Kanban drag-drop
- Recharts for analytics

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
cp .env.example .env.local
```

3. Create a Supabase project and run SQL from `supabase/schema.sql` in the SQL Editor.

4. Add your values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

5. Start:

```bash
npm run dev
```

## Vercel Deployment

1. Push the project to GitHub.
2. Import repository in Vercel.
3. Add env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Product Coverage

- Dashboard with KPIs, charts, upcoming deadlines, recent activity
- Project CRUD with progress and due dates
- Project detail with tasks and activity feed
- Tasks page with Kanban + table views, search, filtering and sorting
- Task detail with full editing, comments, updates/checkpoints, subtasks, blockers, delays, activity history
- `assigned_name` as plain text (no accounts, no auth, no roles)
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
