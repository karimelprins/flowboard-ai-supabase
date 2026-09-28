# FlowBoard AI — Full-Stack SaaS Dashboard

A live SaaS-style operations dashboard built with **Next.js, TypeScript, React, and Supabase**.

FlowBoard is designed to demonstrate practical full-stack product work: real database reads/writes, CRUD operations, calculated business KPIs, filtering, CSV export, responsive UI, loading/error states, and data-driven operational insights.

## Live Demo

**https://flowboard-ai-supabase.vercel.app/**

## What It Does

FlowBoard connects directly to Supabase tables for users, products, and orders.

The dashboard reads real database records and calculates business metrics from them instead of showing hard-coded demo numbers.

## Main Features

### Executive Dashboard

- Total paid revenue
- Total users
- Product count
- Low-stock risk count
- Average paid order value
- Pending order count
- Recent orders
- Monthly revenue visualization

### Users

- View users
- Search users
- Filter by status
- Add users
- Delete users
- View record details
- Export filtered data to CSV

### Products

- View products
- Search and filter
- Add products
- Track stock
- Detect low-stock products
- Delete products
- Export filtered data

### Orders

- View orders with linked user/product data
- Add orders
- Filter by payment status
- Search orders
- Delete orders
- Export order data
- Automatically update revenue metrics from paid orders

### Analytics

The analytics view calculates business health signals directly from the current database state.

### AI Insight

The project includes a rule-based insight interface that summarizes live business metrics and surfaces operational actions based on revenue, pending orders, and stock risk.

> The current insight engine is deterministic and data-driven; it is not presented as an external LLM integration.

## Tech Stack

- Next.js
- React
- TypeScript
- Supabase
- PostgreSQL via Supabase
- CSS
- Vercel

## Data Model

The project works with three primary tables:

- `users`
- `products`
- `orders`

Orders can include related user and product information, while KPIs are derived from live rows.

## Application Flow

```text
Next.js Client UI
      |
      v
Supabase JavaScript Client
      |
      v
users / products / orders
      |
      v
CRUD + calculated KPIs + filters + exports
```

## Project Structure

```text
app/
  page.tsx
  layout.tsx
  globals.css
components/
  FlowBoardSupabase.tsx
lib/
  supabase.ts
  types.ts
supabase/
public/
```

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/karimelprins/flowboard-ai-supabase.git
cd flowboard-ai-supabase
npm install
```

### 2. Configure environment variables

Create `.env.local` using `.env.example` and provide your Supabase project values.

### 3. Start development

```bash
npm run dev
```

### 4. Production build

```bash
npm run build
npm start
```

## What This Project Demonstrates

- Building a data-driven Next.js dashboard
- Integrating a hosted relational database
- Real CRUD workflows
- Relational record queries
- Derived business metrics
- Search and filtering UX
- CSV export
- Loading and error handling
- Responsive dashboard design
- Production deployment with Vercel

## Author

**Karim Ehab**

- Portfolio: https://karim-3d-portfolio.vercel.app
- GitHub: https://github.com/karimelprins
- LinkedIn: https://www.linkedin.com/in/karim-ehab-4a10902a6
