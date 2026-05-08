# MVP_SCOPE.md — What v1 Is and Isn't

## v1 Definition (one paragraph)

A working multiplayer trivia web app where one host opens a TV view, up to 8 players join from their phones via a 4-letter room code, and the group plays through 5 trivia questions plus 1 Mainframe wager round. Real-time sync between all clients. Discord OAuth or guest play. Static question pool. Two question formats: Classic multiple choice and Decryptor (typed answer). Cyberpunk CRT aesthetic per the locked design.

The goal of v1 is to **prove the multiplayer game loop works end-to-end and ship it to production.** Anything that doesn't serve that goal is deferred.

---

## v1 — IN SCOPE

### Authentication
- Discord OAuth (primary auth method)
- Guest play with display name + color picker (no account required)
- Session persists across page refreshes via Supabase auth cookies

### Lobby
- Host visits `/` and clicks "Create Room" → gets a 4-letter code
- Players visit `/play/[code]` (or scan a QR code on the TV) and join with name + color
- Up to 8 players per room
- Host sees players appear in real-time as they join
- Host clicks "Start Game" to advance to the intro phase

### Game loop (server-authoritative)
- `lobby` → `intro` → `question` → `reveal` (×5 normal rounds) → `mainframe_intro` → `wager` → `final_question` → `final_reveal` → `game_over`
- Phase progression triggered by host (with edge function for atomicity)
- Players see their phone update reactively as the host advances phases
- Timer per question (15 seconds), auto-advances to reveal on expiry

### Question types
- **Classic** (multiple choice, 4 options, A/B/C/D)
- **Decryptor** (text input, server normalizes whitespace and case for matching, partial-letter reveal animation on host)

### Mainframe round
- Single signature finale after the 5 normal rounds
- Players see a wager UI on their phone: choose 0%, 25%, 50%, 75%, or 100% of current score
- Host shows `mainframe_intro` cinematic for ~5 seconds
- One harder Classic-format question is asked
- Correct: gain wagered amount. Wrong: lose wagered amount.
- Final reveal shows score swings dramatically

### Scoring
- Correct answer: 500 base points + 0–500 speed bonus (faster = more)
- Streak: +100 per consecutive correct answer above 1
- Wrong / timeout: 0 points
- Mainframe: ±wagered amount (no speed bonus)

### Static question pool
- ~50 hand-curated classic questions, ~20 decryptor questions
- Stored in `src/data/questions.ts` as a typed array
- Pulled randomly per game (no repeats within a session)
- 10 Mainframe-difficulty questions in their own pool

### UI surfaces
- **Landing page** (`/`) — branded hero, "Create Room" + "Join with Code" inputs
- **Host TV view** (`/host/[code]`) — `noghurt-brain.tsx` aesthetic, 16:9 designed for laptops/projectors, all phases render here
- **Phone view** (`/play/[code]`) — mobile-first, designed for portrait phones, lobby + answer input + result screens

### Realtime
- Supabase Realtime Postgres changes channel scoped per room
- Both host and players subscribe to `room:{id}` for state sync
- Players also subscribe to their own answers (RLS: only own row visible until reveal)

### Deployment
- Vercel for the Next.js app
- Supabase Cloud for database + auth + realtime
- Custom domain (optional, can use Vercel default)

---

## v1 — EXPLICITLY OUT OF SCOPE

Each item below is **firm cut**, not "maybe if there's time."

### Question types
- ❌ **Sequence questions** (drag-to-order). Adds complexity and the simpler types prove the model. → **v1.5**

### Audio
- ❌ **Music** (THE MAINFRAME theme, jukebox, etc.). Web Audio is heavy, mobile audio is fiddly, no music ships better than broken music. → **v1.5**
- ❌ **Sound effects** (lock, correct, wrong, timer tick). Same reasons. → **v1.5**

### Visual effects
- ❌ **Lock-in floating badges** on host. Static "locked" indicator on avatar is enough for v1. → **v1.5**
- ❌ **Streak flame indicators**. Score is enough for v1. → **v1.5**
- ❌ **Heat border** in last 5 seconds. Timer color shift suffices. → **v1.5**
- ❌ **Reaction emotes**. → **v1.5**
- ❌ **CRT boot sequence on app load**. → **v1.5**
- ❌ **Particle bursts on lock-in / correct answer**. → **v1.5**

### Game mechanics
- ❌ **Power-ups** (50/50, FREEZE, DOUBLE). They're great but they're a separate engineering surface (per-player state, server-authoritative spend, UI affordances). → **v2**
- ❌ **Difficulty levels per question** (`normal` / `nightmare`). All v1 questions are normal difficulty except Mainframe. → **v2**

### Content
- ❌ **AI question generation via Anthropic API**. Static pool only. → **v2**
- ❌ **Custom question packs / user-submitted questions**. → **v2**
- ❌ **Category selection**. v1 picks randomly across all categories. → **v2**

### Social / persistence
- ❌ **Persistent stats** (games played, win rate, etc.). → **v2**
- ❌ **Leaderboards**. → **v2**
- ❌ **Friend system**. → **v2**
- ❌ **Friend duels** (1v1 mode). → **v2**
- ❌ **Daily challenge** (everyone gets the same questions, leaderboard for the day). → **v2**

### Themes / customization
- ❌ **Quest Mode** (RPG / Slay-the-Spire framing with Oracle, party, biomes, path nodes, character classes). The `noghurt-brain-quest-mode-v1_1.jsx` prototype exists as a reference but is **out of scope for v1, v1.5, and v2.** → **v3**
- ❌ **Player-selectable skins / themes** (e.g., a "fantasy" skin). → **v3**
- ❌ **Persistent character classes / decks**. → **v3**

### Misc
- ❌ **Spectator mode** (watch without playing). → **v2**
- ❌ **Replay / recap** (game-end summary as shareable image). → **v2**
- ❌ **Localization / i18n**. English only in v1. → **v2 maybe, v3 likely.**

---

## Roadmap teasers

These keep the vision alive without committing schedule.

### v1.5 — "Polish" (~2 weeks after v1 ships)
- Sequence question type
- Lobby music (THE MAINFRAME theme, looping)
- Mainframe round music (a tense variant)
- Sound effects (lock, correct, wrong)
- Lock-in floating badges
- Streak flames
- Heat border
- Reaction emotes (4 emotes: FIRE, SUS, DEAD, GG)
- CRT boot sequence on first app load

### v2 — "Content & Power" (~1–2 months after v1.5)
- Power-ups: 50/50, FREEZE, DOUBLE
- Per-question difficulty (normal/nightmare)
- AI question generation (Anthropic Claude)
- Category selection
- Persistent stats and per-game replay
- Daily challenge
- Friend system + 1v1 duels
- Leaderboards (daily, weekly, all-time)

### v3 — "Quest Mode" (long-term, when v2 has audience)
- The full RPG framing from `noghurt-brain-quest-mode-v1_1.jsx`
- Slay-the-Spire-style branching map screen between rounds
- Character classes (Mage, Hacker, Bard, Paladin) with class-specific power-ups
- The Oracle as a recurring NPC with reactive dialogue
- Persistent meta-progression
- Boss variants for the Mainframe round
- Different "ascents" with different rule modifications

---

## Why these cuts (philosophy)

Every cut above protects the v1 ship date. Each deferred feature is genuinely cool — that's why it tempts scope creep — but cool features that don't ship don't matter.

Three principles for any future scope debate:

1. **Does it block the multiplayer game loop?** If no, defer.
2. **Is it a separate engineering surface (new state, new tables, new realtime channels)?** If yes, defer.
3. **Will the game work without it?** If yes, defer.

The fastest way to ship v2 is to ship v1.
