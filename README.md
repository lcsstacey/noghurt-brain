# noghurt brain README

**noghurt brain** is a real-time multiplayer trivia web app — Jackbox-style party energy in a cyberpunk CRT shell. The host creates a room, friends join from the same URL on any device, and the group plays through a configurable set of trivia rounds capped by a high-stakes "Mainframe" wager finale.

Live at [noghurt-brain.vercel.app](https://noghurt-brain.vercel.app).

## Core Features

The game runs on three loops:

- **Lobby**: the host picks categories, difficulty, and round count. Friends join via a 4-letter code or QR. Each player's chosen color renders as a pixel-art class portrait — Mage, Hacker, Bard, Paladin, Berserker, Oracle.
- **Round loop**: alternates between two question types per round. Classic is four-option multiple choice; Decryptor is a typed answer with a progressive letter-reveal animation. Speed bonuses reward faster locks; consecutive correct answers stack a streak multiplier.
- **Mainframe**: a single wager round at the end. Players bet any portion of their score on one harder question. Correct doubles the wager, wrong loses it. Then a podium with a one-click run-it-back reset.

The host also has a slide-out admin drawer for room control — start, kick, reset — without ever leaving the game view.

## Technical Architecture

The project is server-authoritative on a Supabase Postgres backend, with row-level security policies that double as the trust boundary. Cross-table RLS recursion is handled by SECURITY DEFINER helper functions that bypass RLS for the chicken-and-egg lookups the join flow needs. Real-time updates flow through Supabase Realtime channels with a polling fallback for sessions that drop the WebSocket.

The frontend stack is Next.js 15, TypeScript, and Tailwind v4. Auth is Discord OAuth and anonymous Supabase guest play sharing a single users table. Music is generated entirely in-browser with the Web Audio API — six original chiptune tracks composed as 16th-note step sequences, no audio assets shipped.

## Design Philosophy

The aesthetic was locked from the start: a prototype shipped with the kickoff brief, and every component, color, animation, and font in it counted as a design decision already made. The build was about porting that prototype into production multiplayer infrastructure without re-litigating the visual language.

Server authority is enforced where it matters and pragmatically relaxed where it doesn't — question grading runs client-side on the host's browser since the question pool lives in TypeScript. The trade-off is intentional: it cuts deployment complexity by half without meaningfully widening the trust surface for friend-group play.

**License note**: This repository is published as portfolio work. The source code, design, prompts, microcopy, sprite art, and music compositions are not available for reuse or derivative works.
