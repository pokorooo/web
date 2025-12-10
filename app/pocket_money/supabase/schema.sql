-- Supabase schema for 夫婦お小遣いマネージャー
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  monthly_allowance int default 30000,
  public_view boolean default true,
  created_at timestamp with time zone default now()
);

create type public.status as enum ('paid', 'unpaid');

create table if not exists public.monthly_allowance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  year int not null,
  month int not null,
  amount_given int not null,
  given_date timestamp with time zone not null,
  status public.status not null,
  unique(user_id, year, month)
);

create table if not exists public.debt (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  amount int not null,
  memo text,
  date timestamp with time zone not null default now(),
  auto_deduct boolean default false
);

-- RLS policies
alter table public.users enable row level security;
alter table public.monthly_allowance enable row level security;
alter table public.debt enable row level security;

create policy "Users are owners" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Allowances are owner-only" on public.monthly_allowance
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Debt owner-only" on public.debt
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sample users (optional)
-- insert into auth.users ... (create via Supabase Auth UI or API)

