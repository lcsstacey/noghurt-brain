# ARCHITECTURE.md — Technical Architecture

This document captures the technical decisions for v1. Read it before Phase 0. If a decision changes during the build, update this file in the same commit.

---

## 1. High-level architecture

```
┌────────────────────────────────────────────────────────────────┐
│                          Vercel (Edge)                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   /  (root)  │    │ /host/[code] │    │  /play/[code]    │   │
│  │  Next.js SSR │    │  Next.js SSR │    │  Next.js SSR     │   │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘   │
│         │                   │                      │             │
│         │  client-side: subscribes to Realtime channel           │
│         │                   │                      │             │
└─────────┼───────────────────┼──────────────────────┼─────────────┘
          │                   │                      │
          ▼                   ▼                      ▼
┌────────────────────────────────────────────────────────────────┐
│                       Supabase Cloud                            │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ Postgres │  │   Auth     │  │  Realtime  │  │  Storage   │   │
│  │  (data)  │  │ (Discord+  │  │ (Postgres  │  │ (unused v1)│   │
│  │          │  │   guest)   │  │  changes)  │  │            │   │
│  └──────────┘  └────────────┘  └────────────┘  └────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**Key decisions:**

- Server-authoritative game state lives in Postgres. The client never owns truth.
- Phase progression is triggered by the host but enforced via RLS — only the host of a room can advance its phase.
- Realtime subscriptions are scoped per room. Each connected client subscribes to changes on that room only.
- Edge functions / RPC are used for atomic operations (advancing phase + tallying scores in a single transaction). v1 uses Postgres functions called via `supabase.rpc()`.

---

## 2. Routes

| Path | Method | Purpose | Auth required |
|---|---|---|---|
| `/` | GET | Landing. Create or join a room. | No |
| `/host/[code]` | GET | TV view. Renders all phases. | Yes (host of this room) |
| `/play/[code]` | GET | Phone view. Renders phase-appropriate controls. | Yes (member of this room) |
| `/auth/callback` | GET | Discord OAuth callback. | No |
| `/api/rooms` | POST | Create a new room. Returns code. | Yes |
| `/api/rooms/[code]/join` | POST | Join as player. Sets player.room_id. | Yes |
| `/api/rooms/[code]/advance` | POST | Host advances phase. Atomic. | Yes (host only) |
| `/api/answers` | POST | Player submits answer. | Yes (member) |

> **Note:** Most route logic uses Server Actions or RPC instead of explicit API routes. The list above is the conceptual surface. Implementation detail (Server Action vs route handler vs RPC) is decided per case in Phase 3.

---

## 3. Database schema

```sql
-- ROOMS
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (char_length(code) = 4),
  host_id uuid not null references auth.users(id) on delete cascade,
  phase text not null default 'lobby'
    check (phase in (
      'lobby', 'intro', 'question', 'reveal',
      'mainframe_intro', 'wager', 'final_question', 'final_reveal',
      'game_over'
    )),
  current_question_idx int not null default 0,
  questions jsonb not null default '[]'::jsonb,        -- array of question IDs from the static pool
  mainframe_question_id text,                          -- the chosen mainframe question
  question_started_at timestamptz,                     -- when the current question phase began (server-side timer truth)
  created_at timestamptz not null default now()
);
create index rooms_code_idx on rooms (code);

-- PLAYERS
create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 12),
  color text not null check (color in ('pink','cyan','green','yellow','red','purple')),
  is_host boolean not null default false,
  score int not null default 0,
  streak int not null default 0,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id),
  unique (room_id, color)
);
create index players_room_idx on players (room_id);

-- ANSWERS
create table answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  question_id text not null,                           -- references static pool
  answer jsonb not null,                               -- {type: 'classic', value: 1} or {type: 'decryptor', value: 'WORLD WIDE WEB'}
  locked_at timestamptz not null default now(),
  is_correct boolean,                                  -- null until graded
  points_awarded int,                                  -- null until graded
  unique (player_id, question_id)
);
create index answers_room_idx on answers (room_id);

-- WAGERS (mainframe round)
create table wagers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  pct int not null check (pct in (0, 25, 50, 75, 100)),
  amount int not null,                                 -- computed at lock-in: floor(score * pct / 100)
  locked_at timestamptz not null default now(),
  unique (player_id, room_id)
);
```

**Notes:**

- `rooms.code` is generated client-side as a 4-char uppercase code (alphabet excludes confusable chars: `O`, `0`, `I`, `1`). On insert, retry on collision (very rare with 4-char × 32-letter alphabet = 1M codes).
- `rooms.question_started_at` is the server's truth for the timer. Clients compute `secondsLeft = 15 - (now - started_at)` and clamp.
- `players.color` is constrained to the palette names. The frontend maps name → hex via the `C` object.
- `answers.answer` is JSONB so it can hold different shapes per question type without schema changes.
- `wagers` is a separate table because the mainframe round has different mechanics. Could be merged into `answers` with a discriminator — keeping separate for clarity.

---

## 4. Row-Level Security (RLS) policies

RLS is enabled on every table. Default deny.

### `rooms`

```sql
alter table rooms enable row level security;

-- Anyone authenticated can read a room they're a member of (or the host).
create policy "rooms_select_member" on rooms for select using (
  auth.uid() = host_id
  or auth.uid() in (select user_id from players where players.room_id = rooms.id)
);

-- Only the host can update their room (used for advancing phase).
create policy "rooms_update_host" on rooms for update using (auth.uid() = host_id);

-- Anyone authenticated can insert a room — they become the host.
create policy "rooms_insert_authed" on rooms for insert with check (auth.uid() = host_id);
```

### `players`

```sql
alter table players enable row level security;

-- Anyone in the room can see all players in the room (for the lobby).
create policy "players_select_room_member" on players for select using (
  room_id in (select id from rooms where host_id = auth.uid())
  or auth.uid() in (select p2.user_id from players p2 where p2.room_id = players.room_id)
);

-- Anyone authenticated can join a room (insert their own row).
create policy "players_insert_self" on players for insert with check (auth.uid() = user_id);

-- A player can update their own row (e.g., change color in lobby).
create policy "players_update_self" on players for update using (auth.uid() = user_id);

-- Score updates happen via the host's advance-phase RPC (security definer function), not directly.
```

### `answers`

```sql
alter table answers enable row level security;

-- Pre-reveal: a player only sees their own answer for a question.
-- Post-reveal: anyone in the room sees all answers for that question.
create policy "answers_select_visibility" on answers for select using (
  -- Pre-reveal: own answer only
  (
    player_id in (select id from players where user_id = auth.uid())
  )
  or
  -- Post-reveal: room is at or past 'reveal' phase for this question's index
  exists (
    select 1 from rooms r
    join players p on p.room_id = r.id
    where r.id = answers.room_id
      and p.user_id = auth.uid()
      and r.phase in ('reveal', 'mainframe_intro', 'wager', 'final_question', 'final_reveal', 'game_over')
  )
);

-- A player can submit their own answer.
create policy "answers_insert_self" on answers for insert with check (
  player_id in (select id from players where user_id = auth.uid())
);
```

> **Privacy contract:** the design relies on RLS to prevent answer leaks before reveal. Make sure RLS is enabled and tested. A bug here lets cheaters read the answer key. Phase 3 includes an explicit RLS test.

---

## 5. Realtime channels

Each connected client (host or player) subscribes to **one Supabase Realtime channel per room**:

```ts
const channel = supabase
  .channel(`room:${roomCode}`)
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
    (payload) => { /* update phase, current question, etc. */ }
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
    (payload) => { /* refresh player list */ }
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'answers', filter: `room_id=eq.${roomId}` },
    (payload) => { /* refresh answer state — RLS hides pre-reveal answers from others */ }
  )
  .subscribe();
```

The hook `useRoomChannel(roomCode)` lives in `src/lib/realtime/useRoomChannel.ts` and returns `{ room, players, answers, status }`. Both host and phone views consume the same hook; the difference is which UI surfaces they render.

**Latency expectations:** Supabase Realtime is typically <500ms global. The 15-second timer absorbs this. We don't need predictive UI for v1.

---

## 6. Authentication flow

Two paths:

### Path A: Discord OAuth
1. User clicks "Sign in with Discord" on `/`.
2. Supabase redirects to Discord.
3. Discord redirects back to `/auth/callback`.
4. Callback exchanges code for session, sets cookie, redirects to original page.

### Path B: Guest play
1. User enters a display name (1–12 chars) and picks a color.
2. We call Supabase Anon auth: `supabase.auth.signInAnonymously()`.
3. The anon session is treated like a real user for RLS purposes.
4. On reload within ~30 days, the same anon session persists.

**For v1, both paths funnel into the same `auth.users` table.** Discord users have a `provider = 'discord'`, anon users have `provider = 'anonymous'`. Players don't need a Discord account to play.

The flow:
```
/ (landing)
  ├── "Create Room" → must auth → creates room → /host/[code]
  └── "Join Room" → enter code + name + color → must auth → /play/[code]
```

If the user's auth fails, they bounce back to `/` with a flash error.

---

## 7. Phase progression (server-authoritative)

The host advances phases via an RPC call:

```sql
create or replace function advance_phase(p_room_id uuid)
returns rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms;
begin
  select * into v_room from rooms where id = p_room_id and host_id = auth.uid();
  if v_room is null then
    raise exception 'not authorized';
  end if;

  case v_room.phase
    when 'lobby'           then update rooms set phase = 'intro' where id = p_room_id returning * into v_room;
    when 'intro'           then update rooms set phase = 'question', question_started_at = now() where id = p_room_id returning * into v_room;
    when 'question'        then
      -- grade all answers, update scores
      perform grade_question(p_room_id, v_room.questions->>v_room.current_question_idx);
      update rooms set phase = 'reveal' where id = p_room_id returning * into v_room;
    when 'reveal'          then
      if v_room.current_question_idx + 1 >= jsonb_array_length(v_room.questions) then
        update rooms set phase = 'mainframe_intro' where id = p_room_id returning * into v_room;
      else
        update rooms set
          phase = 'question',
          current_question_idx = current_question_idx + 1,
          question_started_at = now()
        where id = p_room_id returning * into v_room;
      end if;
    when 'mainframe_intro' then update rooms set phase = 'wager' where id = p_room_id returning * into v_room;
    when 'wager'           then update rooms set phase = 'final_question', question_started_at = now() where id = p_room_id returning * into v_room;
    when 'final_question'  then
      perform grade_mainframe(p_room_id);
      update rooms set phase = 'final_reveal' where id = p_room_id returning * into v_room;
    when 'final_reveal'    then update rooms set phase = 'game_over' where id = p_room_id returning * into v_room;
    else null;
  end case;

  return v_room;
end;
$$;
```

The `grade_question` and `grade_mainframe` functions update `answers.is_correct`, `answers.points_awarded`, and `players.score`/`players.streak` atomically. Implementation in Phase 3.

The host calls `supabase.rpc('advance_phase', { p_room_id: room.id })`. Phase changes propagate to all subscribers via Realtime.

---

## 8. Static question pool

Lives in `src/data/questions.ts`:

```ts
export type Question =
  | { id: string; type: 'classic'; cat: Category; difficulty: 'normal' | 'mainframe'; prompt: string; options: [string, string, string, string]; correct: 0 | 1 | 2 | 3 }
  | { id: string; type: 'decryptor'; cat: Category; difficulty: 'normal' | 'mainframe'; prompt: string; answer: string };

export type Category = 'science' | 'internet' | 'geography' | 'retro' | 'history' | 'pop_culture';

export const QUESTIONS: Question[] = [ /* ~70 questions, see Phase 3 */ ];
```

A function `pickRoundQuestions(count: number, seed: string)` returns 5 random `normal` questions and 1 `mainframe` question, deterministic per seed (room id). Same room gets the same questions on reconnect; different rooms get different ones.

---

## 9. Client state

Zero global state libraries. Per-route:

- The `useRoomChannel(code)` hook returns `{ room, players, answers, status }` — this is the realtime-synced state.
- Local UI state (timer countdown, animations, selected answer) lives in `useState` within the relevant phase component.
- Auth state lives in a `useUser()` hook from a Supabase auth helper.

The host TV view renders one of `<LobbyHost>`, `<IntroHost>`, `<QuestionHost>`, ... based on `room.phase`. The phone view renders the corresponding `*Phone` component. A switch statement in the route's `page.tsx` handles dispatch.

---

## 10. Deployment

- **Vercel** auto-deploys `main` to production. Preview deploys on PRs.
- **Supabase** has two projects: `local` (via Supabase CLI), `production` (managed Cloud).
- Production migrations are applied via `pnpm db:push --linked` before merging to `main`.
- Environment variables on Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, used in `/api/*` if needed)
  - `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` (configured on Supabase auth dashboard, not in env)

---

## 11. Things this v1 architecture explicitly doesn't do

- **No edge functions for game logic** — Postgres functions called via RPC are sufficient.
- **No Redis / Upstash** for state — Postgres handles concurrent writes fine at our scale.
- **No optimistic UI updates** — let the realtime round-trip be the source of truth. Avoids divergence bugs.
- **No analytics / Plausible / Posthog** — defer to v1.5.
- **No Sentry / error monitoring** — defer to v1.5.
- **No CDN-cached static questions** — the pool is small enough to bundle into the JS.

---

## 12. Decisions that are open

These need discussion in the kickoff session before Phase 0:

1. **Custom domain or Vercel default?** Affects Discord OAuth redirect URI setup.
2. **Anonymous auth — automatic, or guest entry form?** Architecture supports both; UX decision.
3. **Question content — original-written, sourced from a CSV, or AI-pre-generated and stored?** v1 needs ~70 questions written before launch.
4. **Branding — is "Noghurt Brain" the final name?** Affects copy, OG images, Discord OAuth app name.

These don't block Phase 0 (init / aesthetic port) but should be decided before Phase 2 (auth).
