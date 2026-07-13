# Vistack Project Progress

Last updated: 2026-07-13 17:27 (Asia/Shanghai)

This file is the durable handoff record for future Codex conversations. Read it before working on the project and update it before every final response.

## User Priorities

- The application is currently usable. Do not trade existing usability for architectural neatness.
- Preserve the provider-specific behavior that was tuned through real use.
- Make small, reversible changes with automated checks and migration fallbacks.
- Explain work in plain Chinese because the user is a beginner.
- Keep progress and next TODO items in this file so a truncated or new conversation can resume safely.
- Before implementing each roadmap item, explain the current experience, the problem, the proposed experience, alternatives, impact, and data risk in plain product language, then wait for explicit user confirmation.
- After the product direction is confirmed, complete routine implementation details, tests, checks, documentation, and the agreed checkpoint without asking for approval on every technical decision.

## Validated Product Direction

- The primary workflow is image-to-image editing (usually understood as "改图"): enter endpoint/account information, fetch models, import images, enter a prompt, and generate.
- Do not optimize secondary features at the expense of this path. The couple-photo assistant, prompt templates, and phrase library are currently low-use features and should be visually de-emphasized rather than expanded.
- Diagnostic copying is occasionally important for upstream failures. The main-page diagnostic action currently represents only the latest generation; future work must allow selecting or copying diagnostics for a specific historical generation.
- The single-asset history view needs a clearer information and action hierarchy.
- The right-side prompt preview has no validated user value and must be reviewed for removal, collapse, or replacement within the core workflow.
- The current main-image plus transient waterfall layout is visually redundant. A future result-browser design must define one clear current result and a persistent session/history strip or grid backed by saved history, not only in-memory page state.
- Provider/model parameters vary and cannot be assumed to be universally discoverable. Adapt them incrementally through tested provider/model capability profiles with a generic fallback.
- Generation images, prompts, and saved API connection presets are protected user data. No storage migration may delete or silently overwrite them.
- The application is for personal and limited internal-team use with shared endpoint accounts, not broad public distribution. Compatibility and data reliability take priority over public multi-tenant hardening.
- The toolbox and canvas workspace have not yet delivered practical value. Freeze incremental feature expansion until their information architecture and use cases are redesigned as a separate product phase.

## Execution Policy

- Before each implementation item, inspect the current code and behavior but do not change runtime source.
- Present a short product brief covering: what users see today, why it is a problem, what it could become, available alternatives, what remains unchanged, data/migration risk, and acceptance criteria.
- Use plain Chinese and distinguish confirmed facts from proposals. Include a simple layout sketch or interaction sequence when the change is visual or hard to explain in prose.
- Wait for explicit user confirmation of the product direction before implementation. Silence or agreement with the overall roadmap is not approval for an individual item.
- Once confirmed: add or update tests, make the smallest compatible change, run `npm run check`, verify the user-visible flow, update this file, and create the agreed focused Git checkpoint.
- If implementation reveals a materially different user experience, destructive migration, privacy exposure, or ambiguous product choice, pause and return to confirmation instead of deciding silently.
- Completing one item does not authorize starting the next item; prepare and confirm the next product brief separately.

## Current State

- Branch: `main`, tracking `origin/main`.
- UI/UX Phase 1 is implemented: asset-library hierarchy, search/sort, separate-file selected downloads, and a responsive image-detail workspace.
- Studio Phase 2A is implemented: the fixed PC prompt dock now has one dynamic `图生图 / 文生图` action while preserving the two existing internal request paths.
- Studio Phase 2B is implemented: the couple-photo assistant now opens from a compact toolbar icon as a PC popover/mobile bottom sheet, while preserving its prompt behavior.
- The playground integration P0 gate is satisfied at runtime checkpoint `4d2bb94`; the sole next planning task is the result/history brief that incorporates task-level actual parameters and selected-generation diagnostics.
- History storage formats, generation requests, and provider routing are unchanged.
- Production build succeeds with Vite 5.4.19.
- Current production bundle is approximately 386.62 kB JS / 135.35 kB gzip and 51.54 kB CSS / 8.43 kB gzip.

## Active Product Brief: Full UI/UX Plan

Current facts:

- The primary product task is image editing, but API configuration, reference setup, low-use couple-photo controls, result modules, diagnostics, prompt preview, recent assets, and the prompt dock compete within one studio screen.
- The API configuration accordion pushes down every main view when open.
- Desktop has three simultaneous columns plus a fixed prompt dock; mobile mostly stacks the desktop order, placing low-use controls before prompt/generate.
- The asset library has nested surfaces and many equal-weight card actions. Direct single download exists only in details, while bulk selection supports deletion only.
- Toolbox and canvas have high navigation/layout weight despite lacking validated regular use.

Approved product choice:

- User selected separate-file downloads (option B): selecting five assets should initiate five independent image downloads, not create an archive.

Proposed plan:

- Use the product direction "high-frequency image editing first, results are assets, low-frequency capabilities appear on demand."
- Recompose the studio around references, prompt, relevant model parameters, generate, one current result, and a persistent result/history list.
- Replace the generic prompt preview with context for the selected result: prompt, parameters, actions, and its own diagnostics.
- Flatten and clarify the asset library, promote download/reuse, add separate-file selected downloads, and redesign single-asset details.
- Move full API configuration out of the page-pushing accordion while keeping compact preset/model access available.
- De-emphasize couple-photo, templates, phrases, canvas, and toolbox features without deleting them; plan toolbox/canvas separately.
- Recompose mobile ordering so prompt/generate precede low-use assistants and diagnostics.

The full draft is `docs/product-ui-ux-plan.md`. Phase 1 is implemented and recorded at `docs/phase-1-asset-library-brief.md`.

The original broad Phase 2 studio restructure was not approved and has been withdrawn. Phase 2A and 2B are complete as separately approved small changes: one dynamic `图生图 / 文生图` action in the fixed PC dock, plus a couple-photo icon after Templates that opens a PC popover/mobile bottom sheet. Phrase/template icons, three-column layout, canvas entry, result layout, request behavior, history, API presets, and local data remain unchanged. No later product phase is approved.

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

### 5. Documentation organization

- Added `docs/README.md` as the current documentation index.
- Added `docs/archive/README.md` with archive status and provenance for historical documents.
- Archived the completed 2025 UI compact-optimization specification, the superseded 2026 toolbox handoff, and the obsolete legacy README without rewriting their contents.
- Replaced the root README with a concise project entry that matches the current scripts, features, and directory structure.
- Kept this file as the only authoritative development progress and handoff record.

### 6. Asset library and image details

- Rebuilt the asset library as a flatter, image-first page with desktop navigation and mobile filters.
- Added prompt/model search and newest/oldest sorting with pure behavior tests.
- Promoted single-image download and reuse, while moving canvas, group categorization, and deletion into secondary actions.
- Added selected-image downloads as separate files with stable names, progress, browser permission guidance, and partial-failure reporting.
- Replaced the crowded history modal with a responsive image-detail workspace that groups image, batch thumbnails, prompt, parameters, group collection, diagnostics, and secondary actions.
- Preserved group-level favorite/category storage and clarified it in visible labels; no history migration was performed.
- Added confirmation for current-image and whole-group deletion while preserving the existing typed confirmation for bulk deletion.

### 7. Studio generation and couple-photo entry

- Replaced two mutually exclusive generation buttons with one dynamic `图生图 / 文生图` action while preserving both request handlers.
- Kept the PC prompt dock fixed and verified its height and position across 1440px, 1280px, and 1024px desktop widths.
- Moved the couple-photo assistant from the left reference column to one toolbar icon after Templates.
- Added a 440px desktop popover and a viewport-root mobile bottom sheet with click-outside, close-button, and `Esc` handling plus focus return.
- Preserved all couple-photo options and exact composed-prompt text; no storage, history, provider, or request migration was performed.
- Added the official Lucide Vue package for the new people and close icons.

## Verification Baseline

Latest successful command:

```text
npm run check
```

Latest result:

- Type checks: passed (`vue-tsc` and Node `tsc`).
- Test files: 7 passed.
- Tests: 40 passed.
- Production build: passed.
- Diagnostic utility tests: passed, including credential redaction and invalid timestamp handling.
- UI layout fixture at 1440x900 and 768x900: no vertical button text, no horizontal overflow, and header height remained approximately 130 px.
- Browser console errors during the UI fixture check: none.
- Phase 1 browser verification: image-filled asset grid, search, two-item selection toolbar, desktop detail workspace, and 390×844 mobile detail all passed without horizontal overflow or console warnings/errors.
- Phase 2B browser verification: PC dock remained 241px high at 1440×900, 1280×800, and 1024×768; the 440px popover stayed above it; the 390×844 bottom sheet fit the viewport with no horizontal overflow; fresh-page console logs were clean.

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

The diagnostic enhancement was saved as a separate checkpoint before starting UI work.

## Next TODO

1. Prepare a separate result/history product brief for one current result, persistent history-backed browsing, and diagnostics tied to a selected generation; do not implement before approval.
2. Prepare a separate model-parameter brief for incremental provider/model capability profiles with a generic fallback.
3. Design and implement storage v2 only after the core result design is agreed.
   - Store large image data in IndexedDB rather than `localStorage`.
   - Preserve existing history images, prompts, API presets, and canvas data during migration.
4. Redesign toolbox and canvas architecture as Phase 5 discovery; do not continue feature-by-feature expansion before defining validated workflows.
5. Keep proxy security in compatibility mode for limited team use, then upgrade vulnerable dependencies in small tested groups.
6. Only after behavior coverage is broader, extract small state modules from `App.vue` without changing provider behavior.
7. Use `docs/gpt-image-playground-integration-plan.md` for selective integration after the current UI work has a verified checkpoint; the fork roadmap does not authorize implementing its P1-P3 items automatically.

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

1. Read `docs/resume-quickstart.md`, this file, `docs/gpt-image-playground-integration-plan.md`, the product document named by the current TODO, and `AGENTS.md` when present.
2. Run `git status --short --branch` and preserve unknown/user changes.
3. Run `npm run check` before and after the next runtime change.
4. Work on only one TODO area at a time.
5. Update this file before the final response.

## Update Log

### 2026-07-13 17:27 (Asia/Shanghai)

- Reconciled the cross-machine quickstart and playground integration plan with the completed Phase 2B runtime baseline.
- Marked the P0 UI stability gate complete at `4d2bb94` and explicitly prohibited another machine from repeating the finished UI work.
- Declared one next task across all handoff documents: prepare the result/history product brief, incorporating optional task-level actual parameters and diagnostics tied to the selected generation.
- Kept Responses API and reference-image paste/sort as separately confirmed later P1 items; the roadmap still does not authorize runtime implementation.
- Changed first-time dependency installation to `npm ci`, corrected the default Vite preview port to `5173`, added absolute-path replacement guidance, and expanded the required reading order.
- No runtime source, dependency, API, storage, or UI file was changed; documentation consistency checks are sufficient for this pass.

### 2026-07-13 17:10 (Asia/Shanghai)

- Added `docs/resume-quickstart.md` as a beginner-friendly, one-page cross-machine startup guide.
- Included first-time clone commands, the fixed playground reference commit, dirty-worktree stop conditions, required reading order, a copy-ready Codex kickoff prompt, verification commands, integration priorities, local preview, completion handoff, and prohibited destructive actions.
- Added the guide to the current documentation index and the resume checklist.
- No runtime source, UI, API, storage, dependency, or build configuration changed; no application test run was required.

### 2026-07-13 16:55 (Asia/Shanghai)

- Audited the user's `shawnoarry/gpt-image-playground` fork as a selective reference rather than a replacement for Vistack.
- Fixed the cross-machine reference baseline at clean `main` commit `c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd`; recorded clone, checkout, verification, and baseline-upgrade instructions.
- Added `docs/gpt-image-playground-integration-plan.md` with a P0 UI stability gate, P1-P3 integration priorities, explicit deferred and parked items, source-reference links, acceptance boundaries, and an off-machine resume checklist.
- Prioritized task-level actual parameters/diagnostics, an isolated Responses API adapter, and safe reference-image input after UI stabilization; placed native masks, backup/restore, Storage v2, and capability profiles behind later product briefs and safety prerequisites.
- Deferred fal.ai, generic provider manifests, advanced selection interactions, and deployment/PWA work until real demand exists; explicitly rejected wholesale React/Zustand/UI migration and URL-carried API secrets.
- Updated the documentation index. No runtime source, UI, API request, storage schema, dependency, or build configuration was changed, so no application test run was required.

### 2026-07-13 16:45 (Asia/Shanghai)

- User explicitly approved all three recommended Phase 2B decisions.
- Removed the always-visible couple-photo form from the left reference column and added a standard people icon after the Template toolbar action.
- Implemented a 440px PC popover above the fixed dock and a viewport-root mobile bottom sheet; the root rendering avoids incorrect mobile positioning caused by the dock's backdrop filter.
- Added unavailable, available, enabled, and expanded states, plus concise tooltips and the two-character-reference explanation.
- Added close-button, click-outside, `Esc`, mutual exclusion with the phrase panel, and focus-return behavior without clearing current options.
- Extracted and tested the exact couple-photo prompt composition; request routing, payloads, history, API presets, canvas, and other prompt tools are unchanged.
- Added `@lucide/vue` for the new people and close icons; the 9 existing audit advisories remain 5 high and 4 moderate.
- `npm run check` passed with 7 test files and 40 tests plus successful type checks and production build.
- Verified 1440×900, 1280×800, 1024×768, and 390×844 layouts; dock height stayed stable, the mobile sheet fit exactly, no horizontal overflow occurred, and fresh-page browser logs were clean.
- No later phase is approved; the next action is a result/history product brief only.

### 2026-07-13 15:43 (Asia/Shanghai)

- Continued with the next authorized planning step and prepared the Phase 2B couple-photo entry brief without changing runtime source.
- Confirmed the current assistant always occupies the left reference column with its status, enable checkbox, two selectors, extra prompt, and optional composed-prompt preview, even when controls are unavailable.
- Recommended placing one couple-photo icon after the existing Template icon, opening a 440px PC popover above the fixed dock and a mobile bottom sheet without resizing the dock.
- Defined separate unavailable, available, enabled, and panel-open states; the unavailable icon remains clickable so the panel can explain the two-character-reference requirement.
- Preserved all couple-photo options and prompt composition, plus the fixed PC dock, phrase/template tools, generation requests, history, API presets, canvas, and result layout.
- Added `docs/phase-2b-couple-photo-entry-brief.md`; Phase 2B implementation is waiting for three explicit product confirmations.

### 2026-07-13 15:32 (Asia/Shanghai)

- User selected Phase 2A option A and explicitly requested that the PC prompt dock remain fixed and visible.
- Replaced the two mutually exclusive generation buttons with one dynamic action: `图生图` when references exist and `文生图` without references.
- Preserved the existing internal request paths, concurrent-task behavior, prompt dock, tool icons, parameter controls, couple-photo assistant, canvas, result layout, and stored data.
- Added a small generation-mode/label utility with two tests covering both modes and their `继续...` states.
- `npm run check` passed with 6 test files and 36 tests, plus successful type checks and production build.
- Verified at 1440×900 that the dock stays fixed after scrolling 700 px, only one `文生图` button appears without references, legacy button labels are absent, and the browser console has no warnings/errors.
- Phase 2B remains unapproved; the next step is its product brief only.

### 2026-07-13 15:13 (Asia/Shanghai)

- User rejected the broad Phase 2 interpretation and clarified that they do not want the whole studio interface restructured.
- Recorded that `图生图` and `文生图` terminology should remain; the remaining ambiguity is one dynamic button versus two independently visible buttons.
- Confirmed from code that phrase, template, save-template, AI-improve, and translate actions are already compact icons in the fixed bottom toolbar; these entries and the toolbar now remain unchanged.
- Recorded that low usage means the phrase/template capabilities need later product follow-up, not that their entries should be hidden.
- Split the couple-photo assistant into a separately confirmed Phase 2B candidate: move its existing full controls behind a compact toolbar icon without deleting behavior.
- Removed canvas entry changes from Phase 2. Canvas and toolbox require separate product-goal/workflow planning before any UI decision.
- Replaced the previous confirmation draft with a small-batch clarification brief; no runtime source or stored data was changed.

### 2026-07-13 14:59 (Asia/Shanghai)

- Continued with the next authorized planning step and prepared the Phase 2 studio workflow brief without modifying runtime source.
- Confirmed the current desktop three-column plus fixed-bottom-composer structure, the mobile stacking order, two mutually exclusive generation buttons, equal canvas mode weight, persistent prompt preview, and irrelevant parameter placeholders.
- Recommended one dynamic generation action, a normal-flow composer above results, recomposed mobile ordering, collapsed low-use helpers/runtime information, a secondary canvas entry, and only hiding parameters already covered by current model logic.
- Explicitly deferred persistent result/history unification to Phase 3 and API/model capability redesign to Phase 4; generation requests, storage schemas, history, prompts, API presets, and canvas data remain unchanged.
- Added `docs/phase-2-studio-workflow-brief.md`; Phase 2 implementation is waiting for explicit approval of its five product decisions.

### 2026-07-13 14:28 (Asia/Shanghai)

- User explicitly approved the recommended Phase 1 asset-library plan.
- Implemented the flatter asset page, prompt/model search, time sorting, image-first cards, direct download/reuse, and secondary action grouping.
- Implemented separate-file downloads for arbitrary selected assets with stable filenames, progress, browser permission guidance, and partial-failure reporting.
- Replaced the crowded history preview with responsive desktop/mobile image details and clarified group-level favorite/category semantics without migrating history data.
- Added four behavior tests; `npm run check` passed with 5 files and 34 tests plus a successful production build.
- Verified image-filled desktop/mobile fixtures, details, search, and two-item selection in the in-app browser with no horizontal overflow or console warnings/errors; temporary fixtures were removed.
- Phase 2 is not approved; the next action is its product brief only.

### 2026-07-13 12:12 (Asia/Shanghai)

- Continued with the approved planning process and prepared the detailed Phase 1 product brief without modifying runtime source.
- Confirmed from code that favorite/category currently apply to the whole generation group, while download and current-image deletion can apply to one image; exposed this as an explicit product decision.
- Proposed a flatter asset page, simplified image-first cards, separate-file selected downloads, a focused image/detail workspace, prompt/model search, and time sorting.
- Added `docs/phase-1-asset-library-brief.md`; implementation remains blocked on three explicit product confirmations.

### 2026-07-13 11:41 (Asia/Shanghai)

- User requested a complete UI/UX plan instead of adding download controls in isolation.
- Reviewed the rendered studio, asset library, mobile layout, and toolbox using the UI hierarchy/component/state rubric; no runtime source was changed.
- Added `docs/product-ui-ux-plan.md` with target information architecture, desktop/mobile layouts, result/history model, asset/download behavior, configuration direction, toolbox/canvas boundaries, phased delivery, and acceptance criteria.
- Recorded separate-file selected downloads as confirmed, while all layout phases remain subject to individual product approval.

### 2026-07-13 11:34 (Asia/Shanghai)

- User chose option B for multiple selected assets: initiate separate image-file downloads rather than creating an archive.
- Applied the UI component/state review workflow and prepared a bounded asset-card and selection-toolbar proposal; no UI implementation was started.
- Proposed promoting Download to a visible card action, moving low-use/destructive actions to secondary controls, and adding local progress/error feedback for selected downloads.

### 2026-07-13 11:28 (Asia/Shanghai)

- User clarified that the priority is selectively downloading needed images, not exporting all project data as a package.
- Verified that single-image download exists, while asset-library bulk selection currently supports deletion only.
- Withdrew the complete-backup proposal as the next implementation item and separated daily image download from low-frequency disaster recovery.
- No runtime source was changed.

### 2026-07-13 11:24 (Asia/Shanghai)

- Began the first approved discovery step for data protection; inspected current storage and restore behavior without changing runtime source.
- Confirmed that history/images, API settings, canvas data, and toolbox assets are split across `localStorage` and two IndexedDB databases, with no unified backup.
- Confirmed API presets include plaintext API keys/proxy tokens and some history images may retain expiring remote URLs when local persistence fails.
- Added a complete, versioned, merge-only backup proposal and marked its three product choices as awaiting explicit confirmation.

### 2026-07-13 11:15 (Asia/Shanghai)

- User approved the overall reprioritization but replaced autonomous roadmap execution with an explicit per-item product confirmation process.
- Recorded the required pre-implementation brief: current experience, problem, proposed experience, alternatives, unchanged behavior, risks, and acceptance criteria in plain Chinese.
- Routine technical implementation and verification may proceed autonomously only after the corresponding product direction is explicitly confirmed.
- No runtime source was changed.

### 2026-07-13 11:10 (Asia/Shanghai)

- User identified image-to-image editing as the primary workflow and provided the first complete product-priority review.
- Recorded protected data requirements: generation images, prompts, and saved API connection presets must not be lost.
- Reprioritized work around historical diagnostics, the single-asset history view, prompt-preview value, and a persistent history-backed result browser.
- Recorded the limited personal/team deployment context and reduced the urgency of public multi-tenant hardening relative to compatibility and data reliability.
- Froze toolbox/canvas feature expansion pending a separate architecture and use-case redesign.
- No runtime source was changed in this feedback pass.

### 2026-07-13 10:28 (Asia/Shanghai)

- User requested that older plans and engineering notes be organized and archived.
- Archived the completed UI compact-optimization specification, superseded toolbox handoff, and obsolete legacy README under `docs/archive/`, preserving their original contents.
- Added current and archive documentation indexes, and rebuilt the root README from the actual project scripts and structure.
- No application source, configuration, dependencies, or runtime behavior changed; documentation checks are sufficient for this pass.

### 2026-07-13 00:39 (Asia/Shanghai)

- User requested a commit.
- Confirmed the asset-history preview fix was already committed as `aa33145` and the branch was synchronized with `origin/main` at the start of this turn.
- No application code was changed and no build rerun was needed; the latest verified baseline remains 30 passing tests plus a successful production build.
- Added only this handoff status update. The user-owned untracked `排查/` directory remains untouched and excluded.

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
