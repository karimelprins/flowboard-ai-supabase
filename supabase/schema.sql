-- FlowBoard AI Supabase schema
-- Run this file in Supabase SQL Editor.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'Customer',
  status text not null default 'active' check (status in ('active', 'pending', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  amount numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('paid', 'pending', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Portfolio/demo policies. These allow public anon CRUD for the demo project.
-- For production apps, replace with authenticated policies.
drop policy if exists "demo users read" on users;
drop policy if exists "demo users insert" on users;
drop policy if exists "demo users update" on users;
drop policy if exists "demo users delete" on users;
create policy "demo users read" on users for select using (true);
create policy "demo users insert" on users for insert with check (true);
create policy "demo users update" on users for update using (true) with check (true);
create policy "demo users delete" on users for delete using (true);

drop policy if exists "demo products read" on products;
drop policy if exists "demo products insert" on products;
drop policy if exists "demo products update" on products;
drop policy if exists "demo products delete" on products;
create policy "demo products read" on products for select using (true);
create policy "demo products insert" on products for insert with check (true);
create policy "demo products update" on products for update using (true) with check (true);
create policy "demo products delete" on products for delete using (true);

drop policy if exists "demo orders read" on orders;
drop policy if exists "demo orders insert" on orders;
drop policy if exists "demo orders update" on orders;
drop policy if exists "demo orders delete" on orders;
create policy "demo orders read" on orders for select using (true);
create policy "demo orders insert" on orders for insert with check (true);
create policy "demo orders update" on orders for update using (true) with check (true);
create policy "demo orders delete" on orders for delete using (true);

-- Seed data
insert into users (name, email, role, status) values
('Nour Hassan', 'nour@flowboard.app', 'Admin', 'active'),
('Omar Adel', 'omar@flowboard.app', 'Manager', 'active'),
('Mariam Ali', 'mariam@flowboard.app', 'Editor', 'pending'),
('Youssef Samir', 'youssef@flowboard.app', 'Viewer', 'inactive'),
('Farah Nabil', 'farah@flowboard.app', 'Analyst', 'active'),
('Karim Ehab', 'karim@flowboard.app', 'Developer', 'active')
on conflict (email) do nothing;

insert into products (name, category, price, stock, status) values
('Pro Subscription', 'SaaS Plan', 79, 120, 'active'),
('Enterprise Subscription', 'SaaS Plan', 249, 80, 'active'),
('Starter Subscription', 'SaaS Plan', 29, 150, 'active'),
('AI Add-on', 'Add-on', 49, 12, 'active'),
('Analytics Pack', 'Add-on', 59, 7, 'active'),
('Priority Support', 'Service', 99, 5, 'active');

insert into orders (user_id, product_id, amount, status, created_at)
select u.id, p.id, p.price, 'paid', now() - interval '25 days'
from users u cross join products p
where u.email = 'nour@flowboard.app' and p.name = 'Enterprise Subscription'
limit 1;

insert into orders (user_id, product_id, amount, status, created_at)
select u.id, p.id, p.price, 'paid', now() - interval '18 days'
from users u cross join products p
where u.email = 'omar@flowboard.app' and p.name = 'Pro Subscription'
limit 1;

insert into orders (user_id, product_id, amount, status, created_at)
select u.id, p.id, p.price, 'pending', now() - interval '10 days'
from users u cross join products p
where u.email = 'mariam@flowboard.app' and p.name = 'AI Add-on'
limit 1;

insert into orders (user_id, product_id, amount, status, created_at)
select u.id, p.id, p.price, 'cancelled', now() - interval '6 days'
from users u cross join products p
where u.email = 'youssef@flowboard.app' and p.name = 'Analytics Pack'
limit 1;

insert into orders (user_id, product_id, amount, status, created_at)
select u.id, p.id, p.price, 'paid', now() - interval '2 days'
from users u cross join products p
where u.email = 'farah@flowboard.app' and p.name = 'Priority Support'
limit 1;
