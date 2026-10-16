# Axiom Garden implementation plan

User-selected scope: original browser game inspired by Baba Is You, public MIT repository, desktop and touch play. No optional interview: the user explicitly delegated practical choices.

1. Pure deterministic TypeScript engine; public seams are parseRules, createGame, turn, undo, restart.
2. Hand-authored campaign introducing rule assembly, removing STOP, noun transformation, remote control, SINK, DEFEAT, conjunctions and a combined finale. Each level needs a changed rule to win and has a verified input replay.
3. Responsive DOM/SVG board, active rules, hints, undo/restart, level selection, local save and completion.
4. Behavioral engine tests, campaign replays and browser acceptance; independent standards and specification reviews, then fixes.
5. Build, secret scan, normal commit/push and exact-SHA CI monitoring.

## Assumptions and chosen boundaries

No assets or level layouts from the inspiration. Original moth courier and a sleeping observatory garden. One-screen grid, discrete turns, text is always PUSH. Immutable bedrock terrain bounds levels; protected rule gallery is separated by bedrock. Readable rules remain visible there. All ordinary word tiles are movable.

No NOT, HAS, MOVE, PULL, FLOAT, OPEN/SHUT, recursive text transformation, level editor or original game's entire grammar. Explicit simultaneous transformation pass once per turn; movement uses rules at turn start, then rules are parsed again, transforms and hazards resolve, then win. Undo restores everything including destruction and identity. Multiple YOU movement resolves frontmost first with stable entity IDs; blocked push attempts roll back atomically.

## Research (2026-10-16)

- Developer/publisher store page: https://store.steampowered.com/app/736260/Baba_Is_You/ — rules are physical blocks; changing them changes behavior, transformations and goals.
- Creator's original jam release: https://hempuli.itch.io/baba-is-you — Arrows control, Z undo, R restart.

These primary sources establish the intended interaction. Exact edge semantics below are authored for this implementation rather than a claim of full compatibility.
