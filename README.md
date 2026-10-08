# SA Beauty Care and Fashion Hub — Store (foundation)

## 1. Supabase
1. Create a free project at supabase.com.
2. SQL Editor → New query → paste all of `supabase/schema.sql` → Run.
3. Project Settings → API → copy **Project URL** and **anon public key**.
   (Never use the `service_role` key in this project.)

## 2. Environment
Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
On Vercel/Netlify, add the same two variables in the project's Environment Variables.

## 3. First admin
1. Authentication → Users → Add user (email + password, tick "Auto confirm").
2. SQL Editor, run: `update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';`
There is deliberately no public admin signup.

## 4. Run
`npm install` then `npm run dev`. Deploy: push to GitHub, import in Vercel, build command `npm run build`, output `dist`.

## What's included so far
Database schema with RLS, atomic stock-safe `place_order()` (duplicate-click safe via `request_key`), image storage policies, demo data, Supabase client, types, logo at `public/logo.png`.
