# BUILD_PLAN.md — Phased Execution Plan

Five phases. Each is a standalone session: start a fresh Claude Code chat, paste the phase prompt, work in Plan Mode until the plan is approved, then execute.

The phases are ordered by dependency. Don't skip ahead. Each phase ends in a working, committed state — if the user has to stop after Phase 2, they have a deployable lobby. Total estimate for a focused solo developer: **2–3 weeks.**

---

## Phase index

| Phase | Goal | Estimate | Ships |
|---|---|---|---|
| 0 | Init project, deploy a "hello" landing | 1 day | Vercel preview URL works |
| 1 | Port aesthetic, build landing page | 2–3 days | Polished landing page is live |
| 2 | Auth + lobby with realtime | 3–4 days | Real multiplayer lobby |
| 3 | Game loop with classic + decryptor + mainframe | 5–7 days | Full game works end-to-end |
| 4 | Polish, edge cases, ship to production | 2–3 days | v1 is launched |

---

# PHASE 0 — Project Initialization

**Goal:** Working Next.js project on Vercel, Supabase project linked, repo with all docs, an empty landing page that says "NOGHURT BRAIN — coming soon."

## Deliverables
- Next.js 15 + TS + Tailwind v4 scaffolded
- pnpm configured
- Supabase CLI installed, local project initialized, linked to a Supabase Cloud project
- ESLint + Prettier configured
- `tsc --noEmit` passes
- Repo pushed to GitHub
- Vercel project created and auto-deploying `main`
- Empty landing page renders the project tagline using `font-pixel`
- `KICKOFF.md`, `README.md`, `CLAUDE.md`, `MVP_SCOPE.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `BUILD_PLAN.md` all in the repo (this and the other docs you're reading)

## Definition of done
- The Vercel preview URL loads in <2s
- The landing page text uses the locked palette (specifically `C.pink`) and `font-pixel`
- A commit history exists on `main` with conventional-commit messages

## Phase 0 prompt (paste into a fresh Claude Code session)

```
We are at Phase 0 of Noghurt Brain. Read all docs in this order before doing anything: KICKOFF.md, CLAUDE.md, MVP_SCOPE.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, BUILD_PLAN.md.

After reading, write a plan in Plan Mode for Phase 0. The goal is a working Next.js project deployed to Vercel with Supabase linked, plus an empty landing page rendering the tagline "NOGHURT BRAIN" using the locked palette and pixel font.

Specifically your plan should cover:
1. Next.js 15 init with TS, Tailwind v4, App Router
2. pnpm setup
3. Supabase CLI install, local project init, link to a Cloud project (assume the user provides the project ref)
4. ESLint + Prettier config
5. The minimum file structure from CLAUDE.md
6. Initial commit setup with conventional commits and a sensible .gitignore
7. The empty landing page with palette + font verification
8. Vercel project creation and first deploy
9. The verification steps the user will run

Do not write code yet. Wait for the plan to be approved.

When asked, the user will provide the Supabase project URL + anon key, the GitHub repo URL, and confirm Vercel access.
```

## Verification

After execution:
1. Visit the Vercel preview URL. Confirm "NOGHURT BRAIN" displays in pink pixel font on a near-black background.
2. Run `pnpm tsc --noEmit` locally. Should pass with no errors.
3. Confirm `git log` shows commits with conventional prefixes.
4. Confirm `supabase link` succeeded (`supabase status` shows the linked ref).

---

# PHASE 1 — Aesthetic Port + Landing Page

**Goal:** A polished, on-brand landing page where the user can click "Create Room" or enter a code to "Join Room" — the buttons don't yet do anything functional, but the visual language is locked in. All shared chrome components ported from the prototype.

## Deliverables
- `src/styles/palette.ts` — exports the `C` object
- `src/styles/crt.css` — all keyframes from the prototype (scanlines, scan-line, vignette, blink, pixel-pop, etc.)
- Root layout (`src/app/layout.tsx`) loads Press Start 2P + VT323 from Google Fonts and imports `crt.css`
- `src/components/chrome/HostFrame.tsx` — ported faithfully from `noghurt-brain-question-preview.jsx`
- `src/components/chrome/PhoneFrame.tsx` — ported faithfully from `noghurt-brain.tsx`
- `src/components/shared/PlayerAvatar.tsx`, `TimerBar.tsx` — ported
- `src/app/(marketing)/page.tsx` — the landing page

## Landing page contents
- Centered logo: "NOGHURT BRAIN" in pink pixel glow
- Tagline below in `font-crt`: "Multiplayer trivia. Cyberpunk vibes. Bring your phone."
- Two large buttons stacked vertically (mobile-first):
  - **"CREATE ROOM"** — pink, with `neon-pulse` on hover
  - **"JOIN WITH CODE"** — cyan, opens a small inline form with a 4-character code input
- Footer with `▓` blinking accent, copyright line in zinc-600

## Definition of done
- All chrome components type-check and match the prototype visually (compare to `noghurt-brain.tsx` side-by-side)
- The landing page renders identically on Chrome and Safari, both desktop and mobile
- Lighthouse score on the landing page is ≥90 across the board
- No accessibility regressions: form inputs have labels, color-contrast meets WCAG AA on the button text

## Phase 1 prompt

```
We are at Phase 1 of Noghurt Brain. Re-read CLAUDE.md and DESIGN_SYSTEM.md.

The user has uploaded the prototype files. Treat them as read-only specs:
- noghurt-brain.tsx — the original locked design
- noghurt-brain-question-preview.jsx — the polished question screen spec

Phase 1 goal: aesthetic port + landing page. By end of phase, navigating to / on the deployed Vercel URL shows a polished landing page with NOGHURT BRAIN branding, a "Create Room" button, and a "Join with Code" form. Chrome components (HostFrame, PhoneFrame, PlayerAvatar, TimerBar) are ported from the prototype into reusable React components. The buttons don't yet trigger backend actions — those come in Phase 2.

Plan in Plan Mode:
1. The src/styles/ files (palette.ts, crt.css)
2. Root layout updates for fonts + global CSS
3. Each chrome component to port, with which prototype file it's sourced from
4. The landing page file structure
5. How you'll verify the visual match against the prototype (suggestion: side-by-side screenshots)

Do not write code yet. Wait for plan approval.
```

## Verification

1. Side-by-side compare the deployed landing page to the prototype's lobby aesthetic. Should feel like the same product.
2. Resize the browser from 320px wide to 1920px wide. Layout should scale gracefully.
3. Click "Create Room" — it should be unresponsive (intentional for v1) or show a placeholder toast.
4. Click "Join with Code" — the form should accept 4 chars, enforce uppercase, and not submit (placeholder).

---

# PHASE 2 — Auth + Lobby with Realtime

**Goal:** A fully-functional multiplayer lobby. A host can create a room and see players join in real time. Players can join via a code from their phone, pick a name and color, and see other players. No game logic yet — just the lobby.

## Deliverables
- Discord OAuth configured on Supabase Cloud
- `/auth/callback` route handler
- Anonymous auth flow for guests
- `useUser()` hook
- Database migrations for `rooms` and `players` tables (per ARCHITECTURE.md)
- All RLS policies enabled and tested
- `useRoomChannel(code)` hook for realtime subscriptions
- `/host/[code]` route (host TV view) with `<LobbyHost>` rendering the live player list
- `/play/[code]` route (phone view) with `<LobbyPhone>` rendering the player's own card + waiting state
- Server actions or RPC for: creating a room, joining a room, changing player color, leaving a room
- Code generation utility (4-char, excluding confusable chars)
- Color picker component on phone

## Definition of done
- A host can create a room from `/`, get redirected to `/host/[code]`, and see "AWAITING SIGNAL…" plus a QR code (or just the code, QR is v1.5)
- A player can visit `/play/[code]` on their phone, sign in (Discord or guest), pick a name + color, and join
- Within ~500ms of joining, the host sees the new player appear in their lobby
- Two players can't pick the same color (RLS / unique constraint enforces it)
- The host has a "Start Game" button that's disabled until at least 2 players have joined
- Clicking "Start Game" advances room.phase to `intro` (the rest of the loop comes Phase 3)
- RLS test passes: a player on Room A cannot read Room B's player list

## Phase 2 prompt

```
We are at Phase 2 of Noghurt Brain. Re-read CLAUDE.md, MVP_SCOPE.md, ARCHITECTURE.md.

Goal: a working multiplayer lobby with auth and realtime. Host creates a room, players join from their phones, everyone sees everyone in real time. No game logic yet.

Plan in Plan Mode:
1. Supabase migrations for rooms and players tables, including RLS policies (verbatim from ARCHITECTURE.md sections 3 and 4)
2. Discord OAuth setup steps (the user will configure the Discord app and provide credentials)
3. Anonymous auth flow for guests
4. The useUser() hook
5. The useRoomChannel(code) hook for realtime
6. Server actions: createRoom, joinRoom, changeColor, leaveRoom
7. The /host/[code] page with LobbyHost component
8. The /play/[code] page with LobbyPhone component
9. The code generation utility
10. The "Start Game" trigger (advances phase, no scoring)
11. How you'll test RLS (write a script or manual recipe)

Do not write code yet. Wait for plan approval.

After approval, implement migrations FIRST and run them locally before writing any frontend code. Verify RLS works in the Supabase Studio query console before moving on.
```

## Verification

1. Open `/` in two browsers (one in incognito). Sign in as different users.
2. From browser A: create a room. Get a code.
3. From browser B: visit `/play/[CODE]`, sign in, pick name + color, join.
4. Confirm browser A's lobby updates within ~500ms.
5. Try to pick the same color as the host — should be blocked.
6. From browser B: leave the room. Confirm the player disappears from browser A.
7. Test RLS: from browser B, run `supabase.from('players').select()` after joining room A. Should return only Room A's players, not other rooms'.

---

# PHASE 3 — Game Loop (Classic + Decryptor + Mainframe)

**Goal:** Full end-to-end gameplay. From lobby, host clicks "Start Game"; players play through 5 questions (mix of Classic and Decryptor) plus the Mainframe wager finale; final scores display on a podium screen. Server-authoritative throughout.

## Deliverables

### Database
- Migrations for `answers` and `wagers` tables + RLS
- `advance_phase()` Postgres function
- `grade_question()` Postgres function
- `grade_mainframe()` Postgres function
- `pickRoundQuestions(seed)` SQL or TS utility (deterministic per room)

### Question pool
- `src/data/questions.ts` with the typed `Question` array
- ~50 normal Classic questions, ~15 normal Decryptor questions, ~10 Mainframe-difficulty questions
- (User writes the questions — the dev's job is the structure, not the content)

### Phase components

For host:
- `<IntroHost>` — round X-of-5 intro
- `<QuestionHost>` — timer + prompt + per-type body
- `<RevealHost>` — correct answer reveal + score updates
- `<MainframeIntroHost>` — cinematic
- `<WagerHost>` — players' wager status
- `<FinalQuestionHost>` — same as QuestionHost, mainframe-themed
- `<FinalRevealHost>` — score swing animation
- `<GameOverHost>` — podium

For phone:
- `<IntroPhone>` — minimal "GET READY"
- `<QuestionPhone>` — answer input per type, lock-in flow
- `<RevealPhone>` — your result + score change
- `<MainframeIntroPhone>` — minimal cinematic
- `<WagerPhone>` — wager picker (5 buttons: 0/25/50/75/100)
- `<FinalQuestionPhone>` — answer input
- `<FinalRevealPhone>` — your final result
- `<GameOverPhone>` — your final rank

### Question type bodies
- `ClassicHostBody`, `ClassicPhoneBody` — ported
- `DecryptorHostBody`, `DecryptorPhoneBody` — ported

### Timer
- `useQuestionTimer(startedAt, durationSec)` hook — computes remaining seconds, returns `{ secondsLeft, isExpired }`

## Definition of done
- The full game runs from start to finish without errors
- A player can never see another player's pre-locked answer (RLS enforced; verify manually)
- Timer is server-truth — clients reload mid-question without resetting
- Mainframe wager flow works: players pick percentages, wagered amounts compute correctly, wins/losses apply correctly
- Game-over podium displays the top 3 players with their scores

## Phase 3 prompt

```
We are at Phase 3 of Noghurt Brain. Re-read CLAUDE.md, MVP_SCOPE.md, DESIGN_SYSTEM.md, ARCHITECTURE.md.

This is the biggest phase. By the end, the game runs end-to-end: from "Start Game" through 5 normal rounds, the Mainframe wager round, and a podium screen. Server-authoritative the whole way.

Plan in Plan Mode. Break the implementation into sub-phases the user can verify independently:

3a. Database — answers and wagers tables, RLS, advance_phase / grade_question / grade_mainframe Postgres functions. Verify in Supabase Studio.
3b. Question pool — the questions.ts file structure (the user provides content, you provide the format and a seed-deterministic picker).
3c. The timer hook — useQuestionTimer based on rooms.question_started_at.
3d. Normal-round phases — IntroHost, QuestionHost (Classic body only first, then Decryptor), RevealHost, plus phone counterparts. Test with 1 question, then 5.
3e. Mainframe round — MainframeIntroHost, WagerHost/Phone, FinalQuestionHost/Phone, FinalRevealHost.
3f. Game over — GameOverHost (podium) and GameOverPhone.

For each sub-phase, list deliverables, what the user runs to verify, and what's deferred.

Do not write code yet. Wait for plan approval. After approval, implement in the order above and pause between sub-phases for verification.
```

## Verification

End-to-end smoke test:
1. Two browsers, two players, one host. (Three windows total.)
2. Host creates room. Players join.
3. Host clicks "Start Game".
4. Play through all 5 rounds. Confirm scores update correctly.
5. Mainframe round: players pick wagers. Confirm host shows wager status. Pick a wrong answer for one player and confirm they lose their wagered amount.
6. Final reveal: score swings animate.
7. Game over: podium displays.
8. Open a third browser, join mid-round 3 — should not be allowed (no late-joining for v1).
9. Refresh the host browser mid-question — timer continues from server truth, doesn't reset.
10. Inspect network: confirm the `answers` table query before reveal returns only the calling player's row (RLS).

---

# PHASE 4 — Polish + Ship

**Goal:** Production-ready. Edge cases handled, mobile responsive, error states real, deployed to a custom domain (or Vercel default), documented.

## Deliverables

### Edge cases
- Player drops mid-game (network disconnect): they keep their slot, can rejoin the same room
- Host drops mid-game: room auto-pauses, resumes when host reconnects
- Host explicitly leaves: room is closed, players see "HOST DISCONNECTED — game over"
- Player tries to join a room that's already started: "GAME IN PROGRESS — cannot join"
- Player tries to join a room that doesn't exist: "ROOM NOT FOUND"
- Code expires (rooms older than 24 hours are deleted by a Supabase cron)

### UX pass
- Loading states on every async action (creating room, joining, starting game, locking answer)
- Error states with retry buttons where applicable
- Friendly fallback if Realtime disconnects (toast: "RECONNECTING…")
- Mobile responsiveness: phone view tested on iPhone SE width (375px) and Pixel 7 width (412px)
- Host view: tested at 1280px, 1440px, and 1920px

### Production
- Custom domain configured on Vercel (or document the chosen domain)
- Production Supabase project: migrations applied, OAuth configured, RLS verified
- Environment variables set on Vercel
- Discord OAuth: production redirect URI configured
- README.md updated with the production URL
- Vercel preview deployments work for PRs

### Optional (high-value polish)
- QR code on host TV view that links to `/play/[CODE]` (so players can scan instead of typing)
- "Share Room" button that copies the join URL to clipboard

## Definition of done
- The user can play a complete game with friends from production URL on their phones
- No console errors during a normal flow
- No flash of unstyled content on initial page load
- Lighthouse score ≥85 on all pages

## Phase 4 prompt

```
We are at Phase 4 of Noghurt Brain — the polish and ship phase. Re-read CLAUDE.md and MVP_SCOPE.md.

The game works end-to-end in dev. Now we make it production-ready.

Plan in Plan Mode:
1. The edge cases to handle (player drop, host drop, host explicit leave, room not found, room in progress, expired rooms) — for each, what's the UX
2. Loading and error states needed
3. Mobile responsiveness audit and fixes
4. Production Supabase setup checklist
5. Vercel custom domain setup (or default)
6. Smoke test plan for production
7. Optional polish: QR code, share button

Do not write code yet. Wait for plan approval.

After Phase 4 ships, v1 is launched. v1.5 (sequence questions, music, lock-in badges, etc.) is a separate future phase.
```

## Verification

The launch test:
1. Open `production-url.com` on a laptop.
2. Open `production-url.com/play/CODE` on three different phones (or mobile browser tabs).
3. Play a full game from lobby through game-over.
4. No errors. Scores correct. Mainframe round dramatic.
5. Refresh each phone mid-game — they recover gracefully.
6. Launch a second game from the game-over screen → returns to a fresh lobby.

If all six pass: v1 is shipped. Ship it.

---

## After v1 ships

You're done with v1. Take a beat. Play it with friends. Note what feels missing.

Then, when you're ready, the v1.5 plan in `MVP_SCOPE.md` becomes its own phased build. Same playbook: phased prompts, plan-before-code, definition of done.

Do not start v1.5 the same week v1 ships.
