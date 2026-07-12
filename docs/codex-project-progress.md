# Vistack Project Progress

Last updated: 2026-07-12 20:16 (Asia/Shanghai)

This file is the durable handoff record for future Codex conversations. Read it before working on the project and update it before every final response.

## User Priorities

- The application is currently usable. Do not trade existing usability for architectural neatness.
- Preserve the provider-specific behavior that was tuned through real use.
- Make small, reversible changes with automated checks and migration fallbacks.
- Explain work in plain Chinese because the user is a beginner.
- Keep progress and next TODO items in this file so a truncated or new conversation can resume safely.

## Current State

- Branch: `main`, tracking `origin/main`.
- The original application runtime source has not been changed during the current safety-work phase.
- The user-owned untracked `排查/` directory exists and must not be modified or removed.
- Production build succeeds with Vite 5.4.19.
- Current production bundle remains unchanged at approximately 364.46 kB JS / 126.98 kB gzip and 46.92 kB CSS / 7.75 kB gzip.

## Completed Work

### 1. Project assessment

- Reviewed the Vue 3 + TypeScript + Vite application, API compatibility layer, proxy, local storage, IndexedDB history, and build configuration.
- Confirmed `npm run build` and strict Vue type checking pass.
- Identified future work around proxy security, third-party analytics/privacy, canvas Data URL persistence, test coverage, duplicated proxy logic, and dependency updates.

### 2. Safety baseline and automated checks

- Added Vitest 3.2.6 as a development-only dependency.
- Added package scripts:
  - `npm run typecheck`: checks Vue/frontend and Node/proxy TypeScript.
  - `npm run test`: runs behavior-locking tests.
  - `npm run check`: runs type checking, all tests, and the production build.
- Added 24 characterization tests covering:
  - API endpoint completion and provider recognition;
  - OpenAI, Gemini, Grsai, and Doraverse image-size conversion;
  - proxy token checks, unsafe literal target rejection, header filtering, JSON POST, and GET behavior.
- No application runtime module was changed by this phase.

## Verification Baseline

Latest successful command:

```text
npm run check
```

Latest result:

- Type checks: passed (`vue-tsc` and Node `tsc`).
- Test files: 3 passed.
- Tests: 24 passed.
- Production build: passed.
- Runtime source diff: empty.

The official npm audit still reports the 9 pre-existing toolchain advisories: 5 high and 4 moderate. The initially considered Vitest 2 release was not retained; Vitest 3.2.6 removed the additional Vitest critical advisory.

## Safety Baseline Checkpoint

The safety checkpoint created on 2026-07-12 contains:

- `docs/codex-project-progress.md`
- `package.json`
- `package-lock.json`
- `api/proxyCore.test.ts`
- `src/utils/apiEndpoint.test.ts`
- `src/utils/imageSizing.test.ts`

Local collaboration instruction:

- `AGENTS.md` exists locally and tells future Codex conversations to read and update this handoff file.
- The repository's existing `.gitignore` intentionally ignores `AGENTS.md`; that ignore rule was preserved. The durable project record is this tracked-eligible file under `docs/`.

User-owned unrelated state:

- `排查/` is untracked and untouched.

## Next TODO

1. Review and strengthen the application's own diagnostic export.
   - Preserve current error messages and the existing "copy diagnostic information" workflow.
   - Add tests around diagnostic content before changing it.
   - Add useful non-secret context such as time, model, endpoint route, proxy mode, browser, and exact visible error while masking API keys and proxy tokens.
2. Design and implement canvas storage v2 only after the diagnostic baseline is protected.
   - Store large image data in IndexedDB rather than `localStorage`.
   - Read v2 first and fall back to the existing format.
   - Do not delete legacy data during the first migration release.
3. Add proxy security in compatibility mode.
   - Preserve the current mode initially.
   - Add optional strict mode, per-hop redirect validation, DNS/private-IP validation, configurable limits, and timeouts.
   - Retain compatibility for existing custom public endpoints.
4. Expand tests before touching provider payload construction or task recovery.
5. Upgrade vulnerable build dependencies separately; do not use `npm audit fix --force` blindly.

Deferred by user decision:

- Do not change or disable Microsoft Clarity yet. Reconsider opt-in loading only after local diagnostics are demonstrably sufficient for future bug investigation.

## Resume Checklist

1. Read this file and `AGENTS.md`.
2. Run `git status --short --branch` and preserve unknown/user changes.
3. Run `npm run check` before and after the next runtime change.
4. Work on only one TODO area at a time.
5. Update this file before the final response.

## Update Log

### 2026-07-12 20:16 (Asia/Shanghai)

- User approved creating the safety checkpoint and continuing with diagnostic improvements.
- Re-ran `npm run check`: both TypeScript checks passed, all 24 tests passed, and the production build passed with unchanged bundle sizes.
- Created the Git safety checkpoint from Codex-owned package, test, and handoff files only; the user-owned `排查/` directory was excluded and untouched.
- Next action: add tested, secret-redacted diagnostic report building and connect it to the existing copy buttons without changing generation requests.

### 2026-07-12 20:12 (Asia/Shanghai)

- Reviewed the current state and recommended the next safe sequence; no code was changed.
- First recommendation: create a Git checkpoint for the already verified safety tests so future work has a clean rollback point.
- Next repair recommendation: strengthen the existing diagnostic export without changing generation, model routing, API payloads, or Clarity.
- Awaiting user approval before committing or implementing diagnostics.

### 2026-07-12 20:04 (Asia/Shanghai)

- User raised a valid concern that removing Clarity could reduce information available for future bug investigation.
- Decision: leave Clarity exactly as it is for now. No runtime code was changed.
- Reordered the TODO list so local diagnostic coverage is reviewed and protected before reconsidering any analytics change.
- Working tree remains otherwise unchanged; the user-owned `排查/` directory remains untouched.

### 2026-07-12 20:00 (Asia/Shanghai)

- Explained what Clarity data is useful for: visitor counts, interaction/session playback, and context leading up to a visible problem.
- Confirmed from the application that its own model errors, generation errors, warnings, and "copy diagnostic information" flow do not depend on Clarity.
- Recommended keeping Clarity opt-in for this self-use project. Disabling it by default would remove only the external dashboard/session history, not the application's error messages or diagnostics.
- No code was changed. Next TODO remains the opt-in implementation after user approval.

### 2026-07-12 19:58 (Asia/Shanghai)

- Explained the proposed Clarity change in beginner-friendly terms; no code was changed.
- Clarified that the current page always loads the external analytics script, while the proposed version would load it only when the owner explicitly configures a Clarity project ID.
- Generation, model selection, API requests, history, and image storage would be unaffected; only visitor analytics/session recording would change.
- Awaiting the user's decision on whether they use the Clarity dashboard. Next TODO remains the opt-in change if approved.

### 2026-07-12 13:12 (Asia/Shanghai)

- Resumed from the durable handoff and checked the working tree; it matches the previously recorded state.
- No application or configuration code was changed in this turn, so no new build was required. The latest verified baseline remains `npm run check` with 24 passing tests and a successful production build.
- Recommended next action: make Microsoft Clarity explicitly opt-in, then run the full check before moving to canvas storage v2.
- Existing uncommitted safety tests and the user-owned `排查/` directory remain untouched.

### 2026-07-11 01:18 (Asia/Shanghai)

- Added the durable handoff workflow requested by the user.
- Created root collaboration instructions and this project progress file.
- Preserved the existing rule that ignores `AGENTS.md`; the handoff document itself is not ignored and can travel with the project.
- Next action remains making Clarity opt-in without changing generation behavior.
