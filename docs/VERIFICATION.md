# Verification record

## Automated

Strict build, engine behavior tests, campaign replays and browser suite are run locally and in GitHub Actions. Results and independent reviews are recorded below.

## Native visible acceptance

Native UI observations are reported separately from headless Chromium tests below.

## Local results (2026-10-16)

- `npm run check`: PASS — 21 behavior/campaign tests, strict TypeScript, Vite production build, and 4 headless Chromium acceptance tests.
- All nine authored input replays complete in both pure engine tests and actual browser keyboard play. Each replay changes the active rules and can undo to the exact starting state.
- Headless browser tests reload each winning garden, confirm 9/9 persisted completion, restore partial board/turns and undo after reload, exercise mobile touch play at 390×844 without horizontal overflow, recover from damaged saves, and report no page errors.

## Visible native Chrome acceptance

A separate `🌿 Axiom Garden QA` session used only its own newly created tab at http://127.0.0.1:5228. Native key input completed gardens 1, 5 and 9; the final board, rule changes and success card were visually inspected. Reload retained garden 1 and 9 wins; native progress reached 3/9. Undo from a winning state restored turn 13, and restart restored turn 0 while retaining earned completion. This is a subset of the campaign; all nine were separately covered by headless Chromium.

The tab was marked as a deliverable and its save retained. After verification, Chrome's visible Cancel debugging control was clicked and a fresh accessibility diff confirmed removal of the debugging infobar. No prior project or user tabs were used or closed. No claim of cleanup is based merely on ending the turn or resetting the tool.

## Independent review

Two read-only review agents inspected the implementation from empty baseline `0912764` to initial implementation `36435f9`.

Standards axis: stale victory rules after SINK destroyed text (P2) and missing accessible win announcement (P2). Both fixed; regressions cover consumed WIN and status announcement. Architecture otherwise followed the documented boundaries.

Specification/mechanics axis: inert-wall finale shortcut without rule manipulation (P1), the same stale victory rules (P2), and Vitest incorrectly discovering Playwright tests (P1). All fixed. The finale now starts with WALL IS STOP, the discovered shortcut has a negative replay regression, and Vitest includes only the behavioral test files. The water lesson's loose PUSH tile was also enclosed in a vertical chute, preventing sacrifice without first changing its rule. Tests are accurately described as winning replay checks, not exhaustive uniqueness proofs.

## Remaining scope limits

The focused mechanics subset and authored collision order are documented in README. No audio, editor, recursive transformation closure, or full original-game grammar. Browser history snapshots grow with attempt length; extremely long attempts may exceed browser storage, which is reported without blocking play. Native acceptance sampled three gardens; headless acceptance covered all nine.

Independent follow-up confirmed every reported fix, reran all 21 behavior tests, and exhaustively explored garden 5 under unchanged rules: 60 reachable states, zero wins. The other gardens were inspected for unchanged-rule shortcuts; no remaining blocking findings. Pre-publication scan of all tracked and unignored prospective files found no credential patterns or private local paths. `docs/preview.png` is a headless-rendered UI screenshot, separate from the native observations above.
