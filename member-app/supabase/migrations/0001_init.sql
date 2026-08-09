-- בריא.ה — סכמת בסיס + RLS למודול חברות/מלוות (שלב 1 / P0).
--
-- סטטוס: נכתב כדי לשקף בדיוק את docs/briah-app/data-model.md ו-permissions-model.md,
-- ואת src/domain/permissions.ts (שני המקורות האלה חייבים להישאר תואמים - שינוי בהרשאה
-- אחד בלי לעדכן את השני הוא הבאג הכי מסוכן באפליקציה הזו).
-- טרם הורץ מול פרויקט Supabase אמיתי - להריץ ולבדוק לפני production עם נתונים אמיתיים.
-- לא כולל עדיין: ConsentForm (תלוי בתוכן משפטי מיולה), audit log (שאלה פתוחה ב-permissions-model.md).

create extension if not exists "pgcrypto";

create type app_role as enum ('owner', 'melave', 'matargel', 'workshop_facilitator');
create type membership_track as enum ('anchor', 'growth', 'deepening');
create type chevra_status as enum ('active', 'paused', 'ended');
create type session_type as enum (
  'group_workshop', 'individual_session', 'melave_meeting', 'community_circle', 'community_evening'
);
create type methodology_layer as enum ('grounding', 'release', 'integration', 'community', 'meaning');
create type note_visibility as enum ('team_wide', 'limited');
create type agreement_type as enum ('per_session', 'retainer', 'revenue_share', 'other');
create type payment_status as enum ('unpaid', 'partial', 'paid');
create type document_link_type as enum ('chevra', 'practitioner', 'none');

-- ---------------------------------------------------------------------------
-- profiles: משתמשי צוות (לא חברות/מטופלות - אלו מגיעות בשלב מאוחר יותר, ראו P1).
-- id = auth.users.id, כך שמדיניות RLS יכולה להשוות ישירות מול auth.uid().
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  roles app_role[] not null default '{}',
  created_at timestamptz not null default now()
);

create index profiles_roles_idx on profiles using gin (roles);

create or replace function has_role(check_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select check_role = any(roles) from profiles where id = auth.uid()), false);
$$;

create or replace function is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select has_role('owner');
$$;

-- ---------------------------------------------------------------------------
-- cycles
-- ---------------------------------------------------------------------------
create table cycles (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null
);

-- ---------------------------------------------------------------------------
-- chevrot (חברות/חברי קהילה - "Chevra" נשאר שם הישות הטכני, ראו data-model.md)
-- ---------------------------------------------------------------------------
create table chevrot (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  track membership_track,
  cycle_id uuid references cycles (id),
  melave_id uuid references profiles (id),
  joined_at date not null default current_date,
  status chevra_status not null default 'active',
  arbox_customer_id text,
  created_at timestamptz not null default now()
);

create index chevrot_melave_idx on chevrot (melave_id);

-- פונקציית עזר: אילו chevra_id מותר ל-auth.uid() הנוכחי לראות (לפי תפקיד).
-- Owner: הכל (מטופל בנפרד ב-USING (is_owner() OR chevra_id = any(visible_chevra_ids())) בכל פוליסה).
create or replace function visible_chevra_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from chevrot where melave_id = auth.uid()
  union
  select s.chevra_id from sessions s
    where s.type = 'individual_session' and s.facilitator_id = auth.uid() and s.chevra_id is not null
  union
  select unnest(s.attendee_ids) from sessions s
    where s.facilitator_id = auth.uid() and s.attendee_ids is not null;
$$;

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
create table sessions (
  id uuid primary key default gen_random_uuid(),
  type session_type not null,
  layer methodology_layer,
  facilitator_id uuid references profiles (id),
  date timestamptz not null,
  duration_minutes int not null,
  arbox_event_id text,
  chevra_id uuid references chevrot (id), -- למפגש 1:1 בלבד
  attendee_ids uuid[] -- לסדנה קבוצתית/מעגל
);

-- ---------------------------------------------------------------------------
-- notes (עם toggle נראות + דגל "קריטי להעברה")
-- ---------------------------------------------------------------------------
create table notes (
  id uuid primary key default gen_random_uuid(),
  chevra_id uuid not null references chevrot (id) on delete cascade,
  author_id uuid not null references profiles (id),
  content text not null,
  visibility note_visibility not null default 'team_wide',
  shared_with uuid[] not null default '{}',
  critical_flag boolean not null default false,
  session_id uuid references sessions (id),
  created_at timestamptz not null default now()
);

create index notes_chevra_idx on notes (chevra_id);

-- ---------------------------------------------------------------------------
-- matargel_summaries (סיכום מפגש מתרגל 1:1 - נראה כברירת מחדל רק לניצן+כותב/ת)
-- ---------------------------------------------------------------------------
create table matargel_summaries (
  id uuid primary key default gen_random_uuid(),
  chevra_id uuid not null references chevrot (id) on delete cascade,
  matargel_id uuid not null references profiles (id),
  session_id uuid references sessions (id),
  goal text,
  what_came_up text,
  recommendations text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- personal_plans
-- ---------------------------------------------------------------------------
create table personal_plans (
  chevra_id uuid primary key references chevrot (id) on delete cascade,
  layers jsonb not null default '{}',
  melave_notes text
);

-- ---------------------------------------------------------------------------
-- practitioner_agreements (תנאי העסקה - רק Owner עורך; המתרגל/ת רואה רק את שלו/ה)
-- ---------------------------------------------------------------------------
create table practitioner_agreements (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references profiles (id),
  agreement_type agreement_type not null,
  rate numeric,
  currency text not null default 'ILS',
  payment_terms text,
  start_date date not null default current_date,
  end_date date,
  notes text
);

create unique index practitioner_agreements_one_active_idx
  on practitioner_agreements (practitioner_id)
  where end_date is null;

-- ---------------------------------------------------------------------------
-- practitioner_submissions (דיווח חודשי + קבלות + סטטוס תשלום)
-- receipts מוחזקות כ-Supabase Storage paths ב-jsonb (לא כ-base64 - זה רק ה-mock בפיתוח המקומי)
-- ---------------------------------------------------------------------------
create table practitioner_submissions (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references profiles (id),
  month int not null check (month between 1 and 12),
  year int not null,
  items jsonb not null default '[]',
  receipts jsonb not null default '[]',
  payment_status payment_status not null default 'unpaid',
  marked_by uuid references profiles (id),
  marked_at timestamptz,
  owner_note text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index practitioner_submissions_practitioner_idx on practitioner_submissions (practitioner_id);

-- ---------------------------------------------------------------------------
-- documents (מסמכים כלליים - "להעלות שם הכל" - Owner בלבד כברירת מחדל)
-- ---------------------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  file_name text not null,
  description text,
  uploaded_by uuid not null references profiles (id),
  uploaded_at timestamptz not null default now(),
  linked_to_type document_link_type not null default 'none',
  linked_to_id uuid
);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table profiles enable row level security;
alter table cycles enable row level security;
alter table chevrot enable row level security;
alter table sessions enable row level security;
alter table notes enable row level security;
alter table matargel_summaries enable row level security;
alter table personal_plans enable row level security;
alter table practitioner_agreements enable row level security;
alter table practitioner_submissions enable row level security;
alter table documents enable row level security;

-- profiles: כולם בצוות רואים את רשימת הצוות (לשיוך/תצוגת שמות); רק Owner עורך תפקידים.
create policy profiles_select_all on profiles for select using (true);
create policy profiles_update_owner on profiles for update using (is_owner());

-- cycles: מידע תפעולי כללי, לא רגיש - כל הצוות המחובר רואה.
create policy cycles_select_all on cycles for select using (true);
create policy cycles_write_owner on cycles for all using (is_owner()) with check (is_owner());

-- chevrot: Owner הכל; אחרים רק המשובצות אליהם.
create policy chevrot_select on chevrot for select
  using (is_owner() or id in (select visible_chevra_ids()));
create policy chevrot_write_owner on chevrot for insert with check (is_owner());
create policy chevrot_update_owner on chevrot for update using (is_owner());

-- sessions: נראות תואמת ל-chevrot (או שאתה המנחה של המפגש עצמו).
create policy sessions_select on sessions for select
  using (
    is_owner()
    or facilitator_id = auth.uid()
    or chevra_id in (select visible_chevra_ids())
    or attendee_ids && (select array_agg(id) from chevrot where id in (select visible_chevra_ids()))
  );
create policy sessions_write_owner on sessions for all using (is_owner()) with check (is_owner());

-- notes: הליבה של מודל ההרשאות. ראו src/domain/permissions.ts:canViewNote לגרסת האמת בקוד.
create policy notes_select on notes for select
  using (
    is_owner()
    or author_id = auth.uid()
    or critical_flag = true
    or (visibility = 'team_wide' and (has_role('melave') or has_role('matargel')))
    or auth.uid() = any(shared_with)
  );
create policy notes_insert on notes for insert
  with check (
    author_id = auth.uid()
    and (is_owner() or has_role('melave') or has_role('matargel'))
    and (critical_flag = false or has_role('matargel'))
    and chevra_id in (select visible_chevra_ids())
  );

-- matargel_summaries: Owner + הכותב/ת בלבד (בהתאם ל-permissions-model.md: "לא לרוני אלא אם ניצן משתפת" -
-- במימוש הזה "Owner" מכסה גם את רוני וגם את ניצן; אם רוצים להבדיל ביניהן צריך role נפרד, ראו open-questions.md).
create policy matargel_summaries_select on matargel_summaries for select
  using (is_owner() or matargel_id = auth.uid());
create policy matargel_summaries_insert on matargel_summaries for insert
  with check (matargel_id = auth.uid() and has_role('matargel'));

-- personal_plans: אותה נראות כמו chevrot.
create policy personal_plans_select on personal_plans for select
  using (is_owner() or chevra_id in (select visible_chevra_ids()));
create policy personal_plans_write on personal_plans for all
  using (is_owner() or chevra_id in (select visible_chevra_ids()))
  with check (is_owner() or chevra_id in (select visible_chevra_ids()));

-- practitioner_agreements: Owner עורך/רואה הכל; המתרגל/ת רואה קריאה בלבד את שלו/ה.
create policy agreements_select on practitioner_agreements for select
  using (is_owner() or practitioner_id = auth.uid());
create policy agreements_write_owner on practitioner_agreements for all
  using (is_owner()) with check (is_owner());

-- practitioner_submissions: המתרגל/ת יוצר/ת ורואה רק את שלו/ה; Owner רואה/מסמן הכל.
create policy submissions_select on practitioner_submissions for select
  using (is_owner() or practitioner_id = auth.uid());
create policy submissions_insert on practitioner_submissions for insert
  with check (practitioner_id = auth.uid() and (has_role('matargel') or has_role('workshop_facilitator')));
create policy submissions_update_owner on practitioner_submissions for update
  using (is_owner());

-- documents: Owner בלבד כברירת מחדל; מתרגל/ת רואה מסמכים המקושרים אליו/ה בלבד.
create policy documents_select on documents for select
  using (is_owner() or (linked_to_type = 'practitioner' and linked_to_id = auth.uid()));
create policy documents_write_owner on documents for all
  using (is_owner()) with check (is_owner());
