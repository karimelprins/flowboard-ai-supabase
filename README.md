# FlowBoard AI — Real Supabase SaaS Dashboard

A real full-stack SaaS dashboard built with Next.js, TypeScript, Supabase, and a premium dark AI dashboard UI.

Unlike a static portfolio dashboard, this version stores data in a real Supabase database. When you add, edit, delete, or update records, the dashboard KPIs and analytics change immediately.

## What This Dashboard Does

FlowBoard AI is an internal admin dashboard for a SaaS / e-commerce business.

It helps an admin track:

- Total revenue from paid orders
- Total users
- Total products
- Pending orders
- Low-stock product risks
- Recent orders
- User/product/order tables
- Analytics based on real database records
- AI-style business recommendations based on current data

## Real Database Features

- Supabase database tables: `users`, `products`, `orders`
- Real CRUD for users
- Real CRUD for products
- Real CRUD for orders
- Dashboard KPIs calculated from Supabase records
- Analytics update after add/edit/delete
- Data persists after refresh
- Search and filters
- Details modal
- CSV export
- Responsive dark AI/neon UI

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Supabase
- CSS
- Vercel
- Git & GitHub

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create Supabase project

Go to:

```text
https://supabase.com
```

Create a new project.

### 3. Run the SQL schema

Open Supabase → SQL Editor → New query.

Copy everything from:

```text
supabase/schema.sql
```

Run it.

### 4. Add environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in Supabase:

```text
Project Settings → API
```

### 5. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## CV Description

**FlowBoard AI — Full-Stack SaaS Dashboard**  
Tech Stack: Next.js, TypeScript, Supabase, React, CSS, Vercel

- Built a full-stack SaaS dashboard using Next.js, TypeScript, and Supabase.
- Implemented real CRUD operations for users, products, and orders.
- Calculated dashboard KPIs dynamically from database records, including revenue, users, products, pending orders, and stock risks.
- Added search, filters, modals, loading states, CSV export, responsive dark UI, and AI-style business insights.
- Created analytics views for revenue, order status, low-stock products, average order value, and recent activity.
