# Vistack Project Progress

Last updated: 2026-07-12 20:59 (Asia/Shanghai)

This file is the durable handoff record for future Codex conversations. Read it before working on the project and update it before every final response.

## User Priorities

- The application is currently usable. Do not trade existing usability for architectural neatness.
- Preserve the provider-specific behavior that was tuned through real use.
- Make small, reversible changes with automated checks and migration fallbacks.
- Explain work in plain Chinese because the user is a beginner.
- Keep progress and next TODO items in this file so a truncated or new conversation can resume safely.
- Continue through the agreed roadmap autonomously. Do not ask the user to approve routine implementation details or every checkpoint.

## Execution Policy

- For each phase: inspect current behavior, add or update tests, make the smallest compatible change, run `npm run check`, update this file, and create a focused Git checkpoint.
- Continue automatically to the next agreed phase after a successful checkpoint.
- Stop and ask the user only when an action would delete or migrate data without fallback, change a familiar workflow, require credentials/payment/deployment, expose private information, or when tests reveal an ambiguous behavior choice.
- Send concise progress updates while working, but do not require the user to make routine technical decisions.

## Current State

- Branch: `main`, tracking `origin/main`.
- The only current runtime-source change is diagnostic report generation and secret redaction; generation requests and provider routing are unchanged.
- The user-owned untracked `排查/` directory exists and must not be modified or removed.
- Production build succeeds with Vite 5.4.19.
- Current production bundle is approximately 366.20 kB JS / 127.62 kB gzip and 46.99 kB CSS / 7.76 kB gzip.

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

### 3. Diagnostic report hardening

- Created safety checkpoint commit `ffda75c` (`test: add safety baseline checks`).
- Preserved both existing copy-diagnostic buttons and all prior diagnostic fields.
- Added capture time, visible error, browser, online state, current view, configured endpoint, resolved endpoint, and history creation time.
- Added redaction for Bearer credentials, API keys, proxy tokens, sensitive URL query parameters, and URL credentials.
- Added tolerant formatting for invalid legacy history timestamps.
- Did not change Clarity, generation requests, model routing, API payloads, or stored history data.

### 4. Asset history preview header fix

- Created diagnostic checkpoint commit `19c6c8f` (`feat: improve diagnostic reports`) before starting UI work.
- Fixed the asset-history preview modal header that could become hundreds of pixels tall when the prompt and nine action buttons competed in one horizontal flex row.
- Kept the title/prompt in its own row and moved actions into a stable toolbar below it.
- Grouped common actions separately from delete/close actions and prevented button labels from breaking into vertical text.
- Preserved every existing action and the image, thumbnail, prompt, and batch-information areas.

## Verification Baseline

Latest successful command:

```text
npm run check
```

Latest result:

- Type checks: passed (`vue-tsc` and Node `tsc`).
- Test files: 4 passed.
- Tests: 30 passed.
- Production build: passed.
- Diagnostic utility tests: passed, including credential redaction and invalid timestamp handling.
- UI layout fixture at 1440x900 and 768x900: no vertical button text, no horizontal overflow, and header height remained approximately 130 px.
- Browser console errors during the UI fixture check: none.

The official npm audit still reports the 9 pre-existing toolchain advisories: 5 high and 4 moderate. The initially considered Vitest 2 release was not retained; Vitest 3.2.6 removed the additional Vitest critical advisory.

## Safety Baseline Checkpoint

The safety checkpoint commit `ffda75c` created on 2026-07-12 contains:

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

The diagnostic enhancement was saved as a separate checkpoint before starting UI work.

## Next TODO

1. Continue collecting and fixing the user's concrete UI pain points as bounded changes, keeping each visual checkpoint separate.
2. Design and implement canvas storage v2 after the current UI review pass.
   - Store large image data in IndexedDB rather than `localStorage`.
   - Read v2 first and fall back to the existing format.
   - Do not delete legacy data during the first migration release.
   - Preserve the current canvas UI and all existing images during migration.
3. Add proxy security in compatibility mode.
   - Preserve the current mode initially.
   - Add optional strict mode, per-hop redirect validation, DNS/private-IP validation, configurable limits, and timeouts.
   - Retain compatibility for existing custom public endpoints.
4. Upgrade vulnerable build dependencies in small groups.
   - Do not use `npm audit fix --force` blindly.
   - Run the provider-routing and sizing tests after every dependency group.
5. Expand tests around provider payload construction and task recovery before any related refactor.
6. Only then extract small state modules from `App.vue`; do not redesign the UI or provider behavior.

Deferred by user decision:

- Do not change or disable Microsoft Clarity yet. Reconsider opt-in loading only after local diagnostics are demonstrably sufficient for future bug investigation.

## UI Review Track

- The user has additional visual/UI concerns and asked whether to state them first or request a general audit.
- Recommended workflow: collect the user's concrete pain points first in plain language, then perform a systematic full-interface review before editing.
- The review should cover, in order: composition, density and spacing, typography, component consistency, interaction states, color/contrast, depth, motion, and mobile behavior.
- Preserve the current information density, workflows, and domain-specific controls. Do not redesign the product into a generic landing page or remove deliberate functionality.
- Produce prioritized findings and a bounded visual direction before implementing UI changes. The user's concrete pain points take precedence over generic aesthetic preferences.
- First reported issue fixed: the asset-history preview title/prompt container no longer expands because the action toolbar wraps vertically beside it.

## Resume Checklist

1. Read this file and `AGENTS.md`.
2. Run `git status --short --branch` and preserve unknown/user changes.
3. Run `npm run check` before and after the next runtime change.
4. Work on only one TODO area at a time.
5. Update this file before the final response.

## Update Log

### 2026-07-12 20:59 (Asia/Shanghai)

- User provided screenshots showing a confusingly tall title/prompt container in the asset-history preview modal.
- Root cause: the long prompt block and nine buttons shared one horizontal flex row; the button area was squeezed into a narrow vertical column and expanded the entire header.
- Implemented a bounded header/toolbar restructure in `src/App.vue`; all actions and behavior are preserved.
- `npm run check` passed with 30 tests and a successful production build.
- Verified wide and narrow layouts in the local browser using the application's compiled styles; no overflow, vertical button text, or console errors. The temporary visual fixture was deleted.
- Saved the completed UI fix as a focused Git checkpoint; the only remaining untracked path is the user-owned `排查/` directory.
- Local development server is running at `http://127.0.0.1:4173/` for user review.

### 2026-07-12 20:30 (Asia/Shanghai)

- User introduced a UI/visual review track and asked how to start.
- Applied the UI aesthetics review workflow and recommended a hybrid process: user describes the felt problems first, then Codex audits the entire interface systematically.
- No UI or runtime code was changed. Awaiting the user's initial visual pain points or screenshots before beginning the audit.

### 2026-07-12 20:25 (Asia/Shanghai)

- User requested a complete roadmap and authorized autonomous progress without approval at every routine step.
- Added the standing execution policy: test first, make small compatible changes, run the full check, update handoff, checkpoint, and continue.
- Defined the limited conditions that still require user input: destructive data changes, workflow changes, credentials/payment/deployment, privacy exposure, or genuinely ambiguous behavior.
- No runtime code changed in this turn. Current diagnostic work remains verified and ready for its checkpoint; next major phase is fallback-safe canvas storage v2.

### 2026-07-12 20:21 (Asia/Shanghai)

- Created verified safety checkpoint commit `ffda75c`; only Codex-owned test, package, and handoff files were committed.
- Implemented tested diagnostic report building and credential redaction without modifying generation or provider behavior.
- `npm run check` passed: 4 test files, 30 tests, both TypeScript checks, and production build.
- Current diagnostic changes remain uncommitted for review. The user-owned `排查/` directory remains untouched.
- Next action after approval: save the diagnostic enhancement as its own checkpoint, then begin the fallback-safe canvas storage v2 work.

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
