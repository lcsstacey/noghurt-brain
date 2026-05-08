# CLAUDE.md — Operating Constitution for Noghurt Brain

You are the AI development partner on this project. This file is your constitution. Read it before every session and follow its rules without exception.

---

## Project mission

Build a polished, shippable multiplayer trivia game with cyberpunk CRT aesthetics. **Shippable** is the operative word — we are not exploring, we are building. Scope creep kills indie projects. Your job is to help ship v1, not to invent v3.

---

## Hard rules

### 1. The aesthetic is locked

The original prototype `noghurt-brain.tsx` is the visual specification. The polished `noghurt-brain-question-preview.jsx` is the spec for the question screen. You **do not** redesign elements from these prototypes. You port them. Color values, animation curves, font choices, component structure, and layout are decisions already made.

If you have a strong opinion that something should look different, raise it explicitly — do not silently change it. The user will decide.

### 2. The scope is locked

`docs/MVP_SCOPE.md` lists what's in v1 and what's deferred. The deferred list is not a wishlist for "if there's time" — it's a **firm cut**. Specifically:

- **No music or sound effects in v1.** Web Audio chiptune themes exist in prototypes (`noghurt-brain-theme-v1_1.jsx`, `noghurt-brain-jukebox.jsx`) — they are reference, not implementation.
- **No power-ups in v1** (50/50, FREEZE, DOUBLE).
- **No reaction emotes in v1.**
- **No AI question generation in v1.** Use the static question pool in `src/data/questions.ts`.
- **No Quest Mode RPG framing.** That's v3+. The `noghurt-brain-quest-mode-v1_1.jsx` prototype is inspiration only.
- **No Sequence question type in v1.** Classic and Decryptor only. Sequence joins v1.5.
- **No daily challenge, no friend duels, no leaderboards in v1.**

If a user request would expand scope, say so explicitly: "This is v2 work per MVP_SCOPE.md. Should we add it to v1, or stay focused?"

### 3. Plan Mode is mandatory for new phases

Before starting any phase from `docs/BUILD_PLAN.md`, you write a plan and get user confirmation before touching the codebase. The plan includes:
- Which files you'll create or modify
- What database changes (migrations, RLS) you'll make
- What you'll defer and why
- The verification steps the user will run after

No code without an approved plan. This is non-negotiable.

### 4. One phase per session

Don't try to do multiple phases in a single session. Each phase ends with a commit and a stop. The user starts a fresh session for the next phase. This keeps context clean and rollback easy.

### 5. Commit conventions

- One commit per logical change
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- Phase commits use `feat(phase-N): ...` (e.g., `feat(phase-2): supabase auth + lobby`)
- Never commit secrets, never commit `.env.local`

### 6. Definition of done (every phase)

- [ ] Code compiles, type-checks (`pnpm tsc --noEmit`), and lints clean
- [ ] Manual smoke test passes (visit relevant routes, complete the user flow)
- [ ] No regressions in earlier phases
- [ ] CLAUDE.md and docs updated if architecture changed
- [ ] Committed with a clear message

---

## Coding conventions

### File naming

- React components: `PascalCase.tsx` (`LobbyHost.tsx`, `PhoneFrame.tsx`)
- Hooks: `useCamelCase.ts` (`useGame.ts`, `useRoomChannel.ts`)
- Utilities: `camelCase.ts` (`norm.ts`, `checkAnswer.ts`)
- Routes (App Router): `page.tsx`, `layout.tsx`, `loading.tsx` per Next.js convention
- One component per file, named export matching the filename

### Component structure

- Functional components only. No class components.
- Default to server components; opt into `"use client"` only when needed (state, effects, browser APIs).
- Realtime hooks and animation effects live in client components. Data fetching at boundaries.
- Props are typed with explicit interfaces, not inline types.

### State management

- React state for ephemeral UI (timer, animations, hover, focus)
- Supabase Realtime channels for shared room state (subscribe via custom hooks)
- URL params for routing state (room code, phase if needed)
- **No Redux, no Zustand, no Jotai.** Don't add a state library. Supabase + React state is sufficient.

### Styling

- Tailwind utilities for layout, spacing, sizing
- Inline `style={}` for dynamic colors from the `C` palette object (defined in `src/styles/palette.ts`)
- Animation keyframes live in a single `src/styles/crt.css` file, imported once at root layout
- The `font-pixel` and `font-crt` classes come from a `<style>` tag in the root layout (Press Start 2P + VT323 from Google Fonts)
- **Do not use shadcn/ui.** The pixel aesthetic doesn't fit the shadcn defaults. Build the small number of UI primitives we need by hand.

### TypeScript

- Strict mode on
- No `any` without a `// eslint-disable-next-line` and a justifying comment
- Database row types come from `supabase gen types typescript --local` — generated to `src/lib/database.types.ts`
- Domain types (Question, Room, Player) live in `src/lib/types.ts`

### Folder structure

```
src/
├── app/
│   ├── (marketing)/page.tsx           # landing
│   ├── host/[code]/page.tsx           # host TV view
│   ├── play/[code]/page.tsx           # phone view
│   ├── auth/callback/route.ts         # OAuth callback
│   └── layout.tsx                     # root layout (fonts, styles)
├── components/
│   ├── chrome/                        # HostFrame, PhoneFrame
│   ├── phases/                        # LobbyHost, QuestionHost, RevealHost, etc.
│   ├── phone/                         # phone-specific components
│   ├── shared/                        # PlayerAvatar, TimerBar
│   └── effects/                       # InjectedStyles, animation primitives
├── lib/
│   ├── supabase/                      # client, server, middleware clients
│   ├── game/                          # checkAnswer, scoreQuestion, advancePhase
│   ├── realtime/                      # useRoomChannel hook
│   └── types.ts                       # domain types
├── data/
│   └── questions.ts                   # static question pool
└── styles/
    ├── palette.ts                     # the C object
    └── crt.css                        # animation keyframes
```

---

## Tooling

- `pnpm dev` — runs Next.js dev server
- `pnpm tsc --noEmit` — type-check (run before every commit)
- `pnpm lint` — eslint
- `pnpm db:reset` — wipes and re-applies local Supabase migrations
- `pnpm db:types` — regenerates database types after migration changes
- `pnpm build` — production build (runs in CI)

---

## When in doubt

Ask. Don't guess on architecture, don't guess on scope, don't guess on aesthetic. The cost of asking is one round trip; the cost of building the wrong thing is hours of rework.
