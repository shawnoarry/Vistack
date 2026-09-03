# Vistack Project Progress

Last updated: 2026-09-03 (Asia/Shanghai)

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
- The studio result browser uses one persistent, history-backed waterfall as the primary view. Do not reintroduce a separate main image or duplicate same-generation thumbnail strip; hiding a waterfall image must never delete its asset.
- Provider/model parameters vary and cannot be assumed to be universally discoverable. Adapt them incrementally through tested provider/model capability profiles with a generic fallback.
- Generation images, prompts, and saved API connection presets are protected user data. No storage migration may delete or silently overwrite them.
- The application is for personal and limited internal-team use with shared endpoint accounts, not broad public distribution. Compatibility and data reliability take priority over public multi-tenant hardening.
- The toolbox and canvas workspace have not yet delivered practical value. Freeze incremental feature expansion until their information architecture and use cases are redesigned as a separate product phase.
- The existing image-to-prompt flow received a bounded quality and reliability upgrade without expanding the toolbox: independently authored analysis rules, explicit four-mode requests, existing-image compression reuse, and request tests. Moving the entry or running paid API comparisons remains unapproved.

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
- Studio character references now have a prompt-only `自由 / 平衡 / 严格` identity-preservation control. `平衡` is the backward-compatible default and explicitly allows requested hairstyle, expression, camera-angle, and pose changes while requiring coherent head/body reconstruction; no provider parameter, endpoint, preset, or API payload field was added.
- The calendar illustration assistant is implemented as a separate prompt-only workflow: copy plus a flexible time context produce three short 9:16 or 4:5 options that can be written into the existing prompt field without changing image generation.
- Studio Phase 3 is implemented: successful history is the persistent waterfall, each image can be hidden without deletion and restored from the asset library, and failed generations use a separate bounded diagnostic log.
- GPT Image2 G3-lite is implemented as six bilingual `精准改图配方` templates. The library also contains 28 approved upstream `Curated` generation templates with local previews, bringing the built-in total to 58. All 58 now have visible previews and enlarged viewing. The flat 18-category rail is organized under eight tested main groups while retaining all fine categories. G1/G2, the earlier 42-image batch, and 12 new precise-edit recipes remain deferred or unapproved.
- Eleven previously weak built-in templates now use matching Chinese/English seven-section prompts with complete `【editable phrases】`, explicit reference roles, concrete scene/camera/lighting/material direction, and failure boundaries. Portrait-oriented templates preserve identity while explicitly rebuilding hairstyle, expression, angle, head/neck/body integration, and pose instead of pasting the source head.
- The playground integration P0 gate remains satisfied at runtime checkpoint `4d2bb94`; the next product-planning task is a bounded provider/model parameter-capability brief.
- The IndexedDB version, generation requests, provider routing, existing history/images/prompts, and API preset storage are unchanged. Phase 3 adds only backward-compatible optional visibility/diagnostic fields and a separate local failure-record key.
- Production build succeeds with Vite 5.4.19.
- Current production bundle is approximately 528.35 kB JS / 199.27 kB gzip and 56.23 kB CSS / 9.14 kB gzip.

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
- Keep the studio centered on references, prompt, relevant model parameters, generation, and one persistent history-backed result waterfall.
- Replace the generic prompt preview with context for the selected result: prompt, parameters, actions, and its own diagnostics.
- Flatten and clarify the asset library, promote download/reuse, add separate-file selected downloads, and redesign single-asset details.
- Move full API configuration out of the page-pushing accordion while keeping compact preset/model access available.
- De-emphasize couple-photo, templates, phrases, canvas, and toolbox features without deleting them; plan toolbox/canvas separately.
- Recompose mobile ordering so prompt/generate precede low-use assistants and diagnostics.

The full draft is `docs/product-ui-ux-plan.md`. Phase 1 is implemented and recorded at `docs/phase-1-asset-library-brief.md`.

The original broad Phase 2 studio restructure was not approved and has been withdrawn. Phase 2A and 2B are complete as separately approved small changes. Phase 3 was later approved, implemented, and corrected from an interim single-main-image design to the final persistent-waterfall design in `docs/phase-3-result-history-brief.md`. Phrase/template icons, three-column layout, canvas entry, request behavior, API presets, and protected local data remain unchanged.

## Active Product Brief: Image-to-Prompt Quality Upgrade

- Reviewed `LunarXuan/image-prompt-reverse` as a prompt-design reference. It is a GPL-3.0 Codex Skill, not an embeddable model, package, or inference engine.
- Implemented independently authored rules for media boundaries, 3 to 5 visual anchors, subject-specific evidence, image-text prompt-injection handling, observable style language, uncertainty control, and multi-image separation.
- Preserved all four existing output choices while passing the selected mode explicitly from the toolbox to the prompt-assistant request.
- Reused the existing reference-image compression path for image-to-prompt requests without changing image order or count.
- Added focused unit and transport tests. The existing entry, layout, provider routing, API protocol, storage, and user data remain unchanged.
- Moving the entry beside the studio prompt and running paid API A/B tests remain separate unapproved decisions.

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

### 8. Result and persistent-history workflow

- Replaced the interim single-main-image workflow with one history-backed result waterfall; successful images appear once, preserve natural proportions, and return after browser restart.
- Keeps frequent actions visible on every result card and turns right-side generation history into a scroll/highlight index for the waterfall instead of a second result renderer.
- Adds per-image `hiddenImageIndexes` as a backward-compatible display preference. Hiding removes only the studio card, supports short undo, survives reload, and never deletes the asset.
- Keeps hidden images in the asset library, labels them `创作台已隐藏`, and lets card menus or asset details restore them to the studio.
- Limits the visible task area to running and current failed work. Direct failed-task diagnostic copy remains one click, and closing a failed task also clears its current studio/toolbox error.
- Adds an independent local failure log capped at 20 records with copy, reuse, and delete actions. It saves prompts and redacted diagnostics only, with no API keys, raw secrets, or reference image data.
- Preserves the existing IndexedDB version and history records; history/pending-task writes now cross the IndexedDB boundary as plain cloneable values to prevent Vue proxy `DataCloneError` failures.
- Retains optional actual parameters, per-image details, revised prompts, duration, and redacted error summaries without changing generation request bodies or provider routing.

### 9. Calendar illustration prompt assistant

- Added a compact calendar toolbar entry that opens as a desktop popover or mobile bottom sheet.
- Reduced routine input to the source copy and a flexible time context such as a date range, weekday, festival, or solar term.
- Reused the independent prompt-assistant API to draw three short, editable visual directions; the existing image-generation API, routing, history, and asset behavior remain unchanged.
- Kept author, work, source, and nationality text out of visual-style inference. Abstract copy defaults to non-figurative options, while explicit people/activity contexts allow at most one people-based option.
- Added button-based 9:16 / 4:5 selection, local calendar-layout and no-text constraints, plus safe non-figurative fallbacks for malformed assistant output.

### 10. GPT Image2 G3-lite prompt recipes

- Added exactly six bilingual, image-only recipes under the existing `精准改图配方` template category: identity-preserving scene change, outfit-only replacement, background-only replacement, role-based multi-reference composition, visual-mask local correction, and exact text replacement.
- Generalized the validation prompts with editable `【】` placeholders and explicit reference roles/invariants; no upstream gallery images or externally attributed community prompts were copied.
- Reused the existing template panel and prompt insertion path. API payloads, provider routing, model parameters, endpoint/model presets, references, history, and storage schemas are unchanged.
- Added data-level characterization tests for fixed IDs, category/mode/image boundaries, bilingual content, reference roles, invariants, and exact-text constraints.

### 11. GPT Image2 curated gallery expansion

- Added 28 upstream entries marked `Curated` across poster, cinematic, fashion, illustration, UI/graphics, architecture/technical, beauty/lifestyle, and gaming categories while retaining complete English prompts and faithful Chinese versions.
- Imported the 28 matching examples as local `512×640` WebP previews with letterboxing, recorded the pinned upstream commit and MIT license, and excluded individually attributed community entries.
- Reused the existing search, category, language-switch, preview, and prompt-insertion flows; API payloads, provider routing, model parameters, presets, history, IndexedDB, and local user data are unchanged.
- Added focused tests for exact count, unique IDs/source numbers, category distribution, bilingual prompt completeness, provenance, WebP signatures, dimensions, and file-size bounds.
- Prevented the existing template-panel close button from wrapping vertically on narrow mobile screens.

### 12. Image-to-prompt quality and reliability

- Added `src/services/imagePromptReverse.ts` as a testable, independently authored request-rule module instead of copying the evaluated GPL-3.0 Skill text.
- Added explicit `structured`, `direct`, `tags`, and `template` request modes while preserving the existing toolbox controls and editable text result.
- Added media and subject classification, visual-anchor prioritization, image-text prompt-injection resistance, evidence and uncertainty limits, observable style descriptions, and multi-image non-merging guidance.
- Reused the existing 1600-pixel / 0.88-quality large-reference compression behavior for image-to-prompt requests; image count and order are preserved.
- Added tests for each mode, shared safety/quality rules, multi-image instructions, request image ordering, and large Data URL compression.
- Did not change providers, endpoint resolution, proxy behavior, generation requests, storage, history, or local user data.

## Verification Baseline

Latest successful command:

```text
npm run check
```

Latest result:

- Type checks: passed (`vue-tsc` and Node `tsc`).
- Test files: 22 passed.
- Tests: 119 passed.
- Production build: passed.
- Diagnostic utility tests: passed, including credential redaction and invalid timestamp handling.
- UI layout fixture at 1440x900 and 768x900: no vertical button text, no horizontal overflow, and header height remained approximately 130 px.
- Browser console errors during the UI fixture check: none.
- Phase 1 browser verification: image-filled asset grid, search, two-item selection toolbar, desktop detail workspace, and 390×844 mobile detail all passed without horizontal overflow or console warnings/errors.
- Phase 2B browser verification: PC dock remained 241px high at 1440×900, 1280×800, and 1024×768; the 440px popover stayed above it; the 390×844 bottom sheet fit the viewport with no horizontal overflow; fresh-page console logs were clean.
- Phase 3 browser verification: four successful images rendered once in the persistent waterfall with natural proportions and no horizontal overflow at 1440×900, 1280×800, 1024×768, or 390×844. Hiding reduced 4 images to 3 and survived reload; the asset library still held all 4 and restored the hidden image. Failed-task diagnostics were copied with token redaction; closing the task removed its error while the bounded failure record survived reload.
- Calendar assistant browser verification: the 1440×900 popover stayed above the fixed prompt dock; the 390×844 bottom sheet and its 9:16 / 4:5 segmented control fit without horizontal overflow; `Esc` closed the panel and returned focus to its toolbar trigger. A real assistant request was not sent because no assistant key is configured and external API cost was intentionally avoided.
- Template gallery browser verification: all eight new categories appeared; all 28 local previews decoded at `512×640`; representative desktop/mobile searches, Chinese/English prompt insertion, and the 1440×900 plus 390×844 layouts passed with no horizontal overflow or application errors. The restricted browser environment blocked Google Fonts and Clarity, and the desktop request for the pre-existing missing favicon returned 404; these were isolated external/static-resource messages rather than application failures.
- Template preview pilot browser verification: all four approved templates were found through the existing search and rendered their assigned 80×100 4:5 previews on desktop. At a 390×844 viewport, the document client width and scroll width were both 375 px, so there was no horizontal overflow; all four resources reported complete 1024×1280 loads and no application console errors were present.
- Image-to-prompt browser verification: the desktop toolbox retained the reverse-prompt heading and all four output choices; with no assistant key configured, the submit action remained disabled. At 390×844, document client width and scroll width were both 375 px, with no console warnings or errors. No real assistant request was sent, so output-quality A/B testing remains deferred.

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

1. Review the newly imported 28-template gallery in the local preview. Do not import any of the remaining 134 upstream prompts, generate the old 42-image batch, or add the proposed 12 precise-edit recipes without separate approval.
2. Review `docs/gpt-image2-prompt-validation-pack.md`; execute its A/B generations only after separately confirming acceptable API cost and test images, then record scores before considering any product integration.
3. Prepare a separate model-parameter brief for incremental provider/model capability profiles with a generic fallback only if complete GPT Image 2 parameters or native masks become a confirmed need; do not implement before approval.
4. Design and implement storage v2 only after the model-parameter boundary and migration plan are agreed.
   - Store large image data in IndexedDB rather than `localStorage`.
   - Preserve existing history images, prompts, API presets, and canvas data during migration.
5. Redesign toolbox and canvas architecture as Phase 5 discovery; do not continue feature-by-feature expansion before defining validated workflows.
6. Keep proxy security in compatibility mode for limited team use, then upgrade vulnerable dependencies in small tested groups.
7. Only after behavior coverage is broader, extract small state modules from `App.vue` without changing provider behavior.
8. Use `docs/gpt-image-playground-integration-plan.md` for selective integration after the current UI work has a verified checkpoint; the fork roadmap does not authorize implementing its remaining P1-P3 items automatically.

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

### 2026-08-16 11:47:48 (Asia/Shanghai)

- User requested safely integrating and pushing the one remote `main` update. Fetched and inspected remote commit `eab8de1` (`Fix duplicate API preset selection`): it preserves the currently selected preset when duplicate presets share the same API configuration, extracts the matching logic to `src/utils/apiPreset.ts`, and adds three focused tests.
- Used `git merge-tree --write-tree HEAD origin/main` to confirm a conflict-free merge before touching the worktree, then merged with ordinary Git history preservation as merge commit `9ee93d4`. `src/App.vue` auto-merged cleanly: the remote API-preset fix and the local identity-fidelity controls remain present in separate logic areas. No rebase, force push, history rewrite, data migration, API payload change, or user-file modification occurred.
- Pre-merge `npm run check` passed with 16 test files / 85 tests. Post-merge `npm run check` passed with type checks, 17 test files / 88 tests, and the production build. The new API-preset tests and all template, preview, identity, storage, provider, and generation compatibility tests passed.
- Direct GitHub pushes failed before upload because the network connection to port 443 timed out or reset. Confirmed the existing local proxy at `127.0.0.1:7890` could reach GitHub, then used it only for the individual push command without changing repository or global Git configuration. Push succeeded from remote `eab8de1` through merge `9ee93d4` on `origin/main`.
- Saved and pushed the final handoff checkpoint with subject `docs: record safe remote merge`. Local and remote `main` are synchronized; the tracked working tree is clean, and user-owned untracked `排查/` remains untouched. No image generation, external image API request, upload, or charge occurred.

### 2026-08-16 11:38:15 (Asia/Shanghai)

- User requested committing all current project changes and asked whether the work was only prompt-related. Confirmed the only pending tracked change was this handoff clarification; user-owned untracked `排查/` remains intentionally excluded and untouched.
- Clarified that the seven local commits ahead of `origin/main` are broader than prompt copy: precise-edit recipes, preview pilot/assets, gallery expansion, completed preview bindings, category organization and enlarged preview, prompt-only identity fidelity controls, and the latest 11-template bilingual prompt rewrite. No new runtime source changed in this turn, so the latest verification remains `npm run check` with 16 test files / 85 tests and a successful production build.
- Saved the handoff as the focused checkpoint with subject `docs: update project handoff`. Branch is now `main...origin/main [ahead 8, behind 1]`; the tracked working tree is clean and only user-owned untracked `排查/` remains. Syncing the one remote commit is a separate operation and was not requested.

### 2026-08-16 11:28:09 (Asia/Shanghai)

- Rechecked checkpoint `b4c01fc` for the user's scope question. The runtime change is limited to rewriting the Chinese and English text of 11 existing built-in templates into editable seven-section prompts; no template ID/category/preview, UI layout, generation request, endpoint, provider/model parameter, reference upload, storage, history, or user data changed.
- The same checkpoint added data tests for section order, editable `【】` phrases, and non-pasted-head reference handling, plus the required handoff entry. No source change, image request, external API call, or new verification run was needed for this clarification. Branch remains `main...origin/main [ahead 7, behind 1]`; only this handoff is newly modified, and user-owned untracked `排查/` remains untouched.

### 2026-08-15 23:59:59 (Asia/Shanghai)

- Rewrote the approved 11 weak built-in templates and their English versions: commercial campaign, magazine cover, poster key visual, beauty editorial, K-pop studio concept, MV still, album photobook, comeback teaser, luxury product still, product hero, and cinematic environment. Each prompt now uses the same seven editable sections: goal, editable content, reference handling, visual design, camera/composition, lighting/materials, and avoid.
- Added multiple complete `【】` replacement phrases to every Chinese and English prompt. The eight portrait-capable templates explicitly preserve recognizable identity without copying the original head pixels, and require coherent reconstruction for requested hairstyle, expression, camera angle, head/neck/body connection, and pose changes.
- Preserved template IDs, titles, categories, modes, tags, descriptions, preview paths, insertion behavior, API payloads, provider routing, model parameters, presets, history, IndexedDB, and user data. No image generation, external moderation request, upload, or API charge occurred.
- Added focused data tests for the exact 11-template set, ordered bilingual section headings, at least six editable phrases per language, and the non-pasted-head rule. `npm run check` passed with type checks, 16 test files / 85 tests, and the production build.
- Browser verification at `http://127.0.0.1:5427/` confirmed both Chinese and English insert with seven sections, six blank-line separators, and 21 editable phrases for the sampled commercial template. The long prompt scrolls inside the existing textarea, the 1280 px viewport has no horizontal overflow, and browser warnings/errors are zero. The previous `5426` preview was unreachable; a new Vite server is running on `5427` because `5426` was already occupied.
- Files changed: `src/data/templates.ts`, `src/data/templates.test.ts`, and this handoff. Saved the focused checkpoint with subject `feat: expand editable template prompts`; branch is `main...origin/main [ahead 7, behind 1]`. User-owned untracked `排查/` remains untouched. Existing preview images were intentionally retained; review their semantic match before authorizing any optional regeneration.

### 2026-08-15 23:59:30 (Asia/Shanghai)

- Clarified that checkpoint `38933ad` changed only the Studio identity-preservation policy; it did not rewrite the 11 previously audited weak built-in prompts. Those prompts remain unchanged and still rely on vague output-type labels and adjectives instead of concrete subject, scene, camera, lighting, editable-variable, and failure-boundary instructions.
- No runtime source or template data changed in this clarification turn, no image request was sent, and no verification command was required. Branch remains `main...origin/main [ahead 6, behind 1]`; this shared handoff remains modified and user-owned untracked `排查/` remains untouched.
- Pending separately approved item: rewrite the 11 weak prompts and their English versions while preserving IDs, titles, categories, tags, descriptions, preview paths, UI behavior, API payloads, presets, history, and storage. Review the new copy before deciding whether any existing preview image is sufficiently mismatched to justify regeneration.

### 2026-08-15 23:59 (Asia/Shanghai)

- User approved the safest trial of the identity-boundary fix. Added a compact `自由 / 平衡 / 严格` segmented control that appears only when at least one reference is marked `人物/角色`; it changes the compiled prompt only and does not send or expose provider `input_fidelity`.
- Made `平衡` the default. Its prompt preserves identity-defining facial relationships while explicitly allowing the requested hairstyle, expression, camera angle, pose, lighting, and perspective, and prohibits copied/pasted heads, rigid frontal gaze, frozen expression, and mismatched head-to-body proportions. `自由` permits stronger reconstruction; `严格` preserves more appearance detail but still requires a coherent re-render instead of forcing the source portrait angle.
- Added optional `identityFidelity` to generation recipes so reuse restores the selected policy; legacy history without the field safely falls back to `平衡`. Existing API presets, request routing, provider-specific parameters, storage versions, images, prompts, history records, template IDs/categories/previews, and user data were not migrated or rewritten.
- Added `src/utils/identityFidelity.ts` plus four behavior tests. `npm run check` passed with type checks, 16 test files / 82 tests, and a production build. A fresh local page at `http://127.0.0.1:5426/` loaded as Vistack with no console warnings/errors and no horizontal overflow at the active 1265 px viewport.
- Browser automation could not complete the local file-chooser handshake, so the character-reference-only visible state was not screenshot-verified; no private reference image was uploaded and no image-generation request or external API charge occurred. The behavior, accessibility state, prompt compilation, type compatibility, and build are covered by source inspection and automated checks.
- Files changed for the focused checkpoint: `src/App.vue`, `src/types/index.ts`, `src/utils/identityFidelity.ts`, and `src/utils/identityFidelity.test.ts`. The shared handoff remains separately modified, and user-owned untracked `排查/` remains untouched.
- Saved focused checkpoint `38933ad` (`feat: add identity fidelity controls`). Branch is `main...origin/main [ahead 6, behind 1]`; only this shared handoff remains modified and user-owned untracked `排查/` remains untouched. The local development server is running and returned HTTP 200 at `http://127.0.0.1:5426/`.
- Next concrete TODO: user manually test `平衡` with a character reference and a prompt that explicitly changes hairstyle, expression, angle, and pose. Review the actual provider result before changing the default or adding any provider-level fidelity parameter; the separately identified 11 weak template rewrites remain pending.

### 2026-08-15 20:13 (Asia/Shanghai)

- Investigated the user's observation that the face/head was preserved too literally across the newly generated previews while pose, proportions, expression, camera angle, and body integration remained poor. No image request or runtime/source change was made.
- Confirmed the dominant cause is the one-off preview runner, not a global Vistack hard boundary. `scripts/run-template-preview-completion.mjs` wraps every identity job with `strongest and only facial identity anchor`, explicitly preserves one selected portrait hairstyle, repeats a final exact-identity lock, and sends `--input-fidelity high`. All three supplied identity sources are clean front portraits, so the combined instruction strongly favors reusing the frontal head solution while inventing the unsupported body/pose.
- The normal Studio path is materially softer: it appends a role mapping that says character references preserve identity, but `src/services/api.ts` does not send `input_fidelity` for OpenAI image edits and App does not globally lock hairstyle, expression, angle, pose, or camera. The remaining project-level limitation is that reference roles default to `character` and there is no Studio fidelity control, so provider defaults and prompt wording cannot currently be balanced explicitly.
- A local, offline 26-image contact sheet (three references plus 23 identity-guided outputs) visually confirmed the failure mode: repeated frontal eyes/head geometry and hairstyle within each group, with the largest whole-body mismatch in dynamic poster, full-body fashion, airport, stage, and scene-change compositions. The sheet is stored outside the repo at `C:\Users\PC\.codex\visualizations\2026\08\15\01a003c2-85ec-7513-9646-72c1f1fa119f\vistack-template-identity-audit.jpg`.
- Additional contributing factors are one candidate per job (`n=1`), medium quality, one forced 4:5 format, prompts that prioritize thumbnail face clarity, no pose/body reference, and several precise-edit previews whose own briefs intentionally preserve hair/pose/camera. These do not by themselves prove the third-party provider's unspecified default behavior; a paid controlled A/B would be needed for that and was not attempted.
- Revised proposed next item, pending explicit approval: define three identity policies (`自由变化`, `平衡保持`, `严格保持`), use balanced preservation for general style templates and strict preservation only for outfit/background/local-detail recipes, explicitly allow requested hairstyle/expression/angle/pose changes, and only then rewrite the 11 weak prompts. Preserve API presets, history, storage, template IDs/categories, and current preview files; do not regenerate until copy and policy are reviewed.

### 2026-08-15 20:06 (Asia/Shanghai)

- Audited all 58 built-in template prompts from copy alone, without changing runtime code or sending image requests. Confirmed that the 28 curated gallery prompts and six precise-edit recipes are structurally detailed, while a substantial part of the older 23 general style prompts are short format descriptions rather than production-ready image briefs.
- Identified 11 highest-priority rewrites: `commercial-campaign`, `magazine-cover`, `poster-key-visual`, `beauty-editorial`, `kpop-studio-concept`, `mv-concept-still`, `album-photobook`, `comeback-teaser-poster`, `luxury-product-still`, `product-hero`, and `cinematic-environment`. Their main defects are undefined subjects/scenes, vague adjectives, multiple unranked alternatives, missing camera/light/composition decisions, no editable variables, and no image-reference preservation contract despite many being available in image mode.
- Also identified two cross-library quality issues: the detailed KBO prompt is overfitted to one woman's fixed facial traits and is unsuitable as a general built-in identity template; several curated prompts are complete demonstration briefs but overly fixed through exact text, brands, subjects, or aspect ratios, so they need parameterization rather than more prose if generalized.
- Verification was source inspection plus a structured import of all 58 templates and prompt lengths; no application check was required because only this handoff changed. Working tree remains on `main` with the shared handoff modified and user-owned untracked `排查/` untouched.
- Proposed next concrete item, pending explicit approval: rewrite the 11 weakest prompts first using a stable production structure (goal, editable variables, reference roles/preservation, scene/action, camera/composition, lighting/materials, and failure constraints), preserve IDs/categories/images/UI/API/storage, and review copy before any optional preview regeneration.

### 2026-08-15 20:03 (Asia/Shanghai)

- Resumed after context handoff and confirmed the user's latest request was already completed: the final 11 missing previews were generated once each using portrait references only, all 58 built-in templates are image-bound with enlarged viewing, and the gallery now uses eight main groups plus the retained 18 fine categories.
- Performed no image generation and made no runtime/source changes in this turn. Focused verification `npm exec vitest run src/data/templates.test.ts src/data/templateCategories.test.ts` passed with 2 test files / 7 tests; the local review page at `http://127.0.0.1:5426/` returned HTTP 200.
- Working tree remains `main...origin/main [ahead 5, behind 1]`; only this shared handoff is modified and user-owned untracked `排查/` remains untouched. No blocker remains; next concrete TODO is user review of preview quality and category naming/order before any further gallery expansion.

### 2026-08-15 20:00 (Asia/Shanghai)

- User explicitly requested one attempt for each of the remaining 11 template previews using portrait references only. Resumed the committed batch with concurrency 2 and no automatic retries; the runner skipped the existing 14 outputs, used one matching front portrait for each identity-guided job, used no full-body reference, and kept `product-hero` as a text-only generation.
- All 11 requests succeeded on their single attempt with HTTP 200 responses and no content-policy warning: `fancam-cover`, `after-work-preview`, `korean-cafe-snapshot`, `street-paparazzi`, `product-hero`, `cinematic-environment`, and the five remaining precise-edit previews. No image-generation process remains running.
- Bound the new files so all 58 built-in templates now have images and support the existing enlarged-preview flow. All 25 batch assets are valid WebP files over 20 KB and decode at exactly `1024x1280`; local visual review found the new `fancam-cover` uses a covered black stage outfit and does not reproduce the removed full-body reference styling.
- Investigated the user's category concern. No built-in template had an empty `category` field, but 18 overlapping fine categories were presented as one flat horizontal rail, making many templates appear unorganized. Added eight main groups: `人像摄影`, `K-pop`, `商业设计`, `影视艺术`, `UI / 技术`, `精准改图`, `角色创作`, and `游戏视觉`; retained the 18 existing fine categories as a second row and route future/custom unmapped categories to `其他`.
- Added pure-data category tests requiring every built-in fine category to belong to exactly one main group, with unique group IDs/labels. `npm run check` passed with type checks, 15 test files / 78 tests, and the production build.
- Browser verification found 58 cards and 58 zoom controls. Each main-group count matched the rendered card count (`58 / 13 / 10 / 9 / 9 / 8 / 6 / 1 / 2`), portrait fine categories rendered correctly, and the new `fancam-cover` enlarged at natural `1024x1280` resolution on desktop and `390x844` mobile with no horizontal overflow or application console warnings/errors.
- Saved focused checkpoint `5bf0521` (`feat: complete and categorize template previews`) containing the 11 new preview assets, 58-image bindings/tests, and two-level category UI. Branch is `main...origin/main [ahead 5, behind 1]`; only this shared handoff remains modified, and user-owned untracked `排查/` remains untouched.
- Next concrete TODO: user review at `http://127.0.0.1:5426/`. No further template image generation is needed. Review category naming/order from real use before adding new templates; do not expand the gallery or precise-edit recipe count without separate approval.

### 2026-08-15 19:45 (Asia/Shanghai)

- User requested that all already-generated preview assets be completed in code while keeping the remaining paid image generation paused. Bound the 14 verified `1024x1280` WebP files to their matching templates, bringing visible preview coverage from 33/58 to 47/58; the 11 missing templates remain without image paths.
- Added thumbnail enlargement to the existing template panel. The thumbnail has a dedicated zoom control; the full image opens in a restrained modal with backdrop close, close button, `Esc` handling, initial close-button focus, and focus return to the originating thumbnail. The existing card-click prompt insertion behavior remains unchanged.
- Offline safety review established that the content-policy warning came from the failed `fancam-cover` request, not from any of the 14 successful requests. Ten later missing jobs were never submitted. The text prompt itself did not request sexual content, but the modeled full-body reference visibly combines a chest cutout, exposed midriff, tight clothing, and emphasized proportions; combined with a full-body stage/dance context, this is the most plausible trigger. This remains a reasoned diagnosis rather than a proven classifier explanation because no further request or moderation upload was made.
- Per the user's instruction, removed the fourth full-body reference only from `scripts/run-template-preview-completion.mjs`; the Vistack reference-upload feature, multi-reference generation behavior, stored data, and local source file `112_副本.jpg` were not changed or deleted. A local dry-run using only the three portrait references passed for all 25 manifest entries without network access. The full-body source image remains outside the repository.
- Tightened the built-in and batch-only `fancam-cover` wording to require a general-audience, performance-appropriate outfit with full torso coverage and to exclude lingerie styling, chest cutouts, plunging necklines, exposed midriff, and body-emphasizing poses. No image generation or external moderation request was sent after the user's stop instruction.
- Verification: `npm run check` passed with type checks, 14 test files / 76 tests, and the production build. Browser verification found 47 zoom controls, decoded the new preview at its natural `1024x1280` size, and passed desktop plus `390x844` mobile layout, `Esc` close/focus return, zero horizontal overflow, and zero browser warnings/errors.
- Saved focused checkpoint `ab6b67e` (`feat: connect completed template previews`) containing the 14 new preview assets, template bindings/tests, enlarged-preview UI, and the safer resumable batch files. Branch is `main...origin/main [ahead 4, behind 1]`; only this shared handoff remains modified, and user-owned untracked `排查/` remains untouched.
- Next concrete TODO: keep all remaining image generation paused. The local review server is available at `http://127.0.0.1:5426/` for the user to inspect the 47 previews and enlargement behavior. Do not resume the remaining 11 jobs or send the full-body reference through any batch path without a new explicit product/privacy decision.

### 2026-08-15 19:26 (Asia/Shanghai)

- User explicitly authorized the configured `codex-image` CLI, sending the four supplied identity/body references through its current `https://ljqclub.com` endpoint, and charges on the configured key. Started the capped 25-preview batch with concurrency 2 and no automatic retries.
- Generated 14 of the 25 missing preview assets. A content-policy rejection stopped `mv-concept-still`; its prompt was manually narrowed to the provider's suggested safe framing, a resumable `--resume` mode was added, and the revised item then succeeded without regenerating the seven existing outputs. A later content-policy rejection stopped `fancam-cover`; the concurrently active `airport-preview` completed before the batch exited.
- User then explicitly requested no more image generation. Confirmed there is no remaining `run-template-preview-completion` or `codex_image.py` process, and no further API request was started. The remaining 11 IDs are `fancam-cover`, `after-work-preview`, `korean-cafe-snapshot`, `street-paparazzi`, `product-hero`, `cinematic-environment`, `gpt-image2-edit-identity-scene`, `gpt-image2-edit-outfit-only`, `gpt-image2-edit-background-only`, `gpt-image2-edit-multi-reference`, and `gpt-image2-edit-local-detail`.
- Verification: the completion manifest reports 14 `DONE` / 11 `MISSING`; all 14 generated files have valid RIFF/WEBP signatures, exceed 20 KB, and decode at exactly `1024x1280`. `npm run check` passed with type checks, 14 test files / 75 tests, and the production build. The repository contains 58 templates total: 33 currently have UI-bound previews, while binding the 14 new files would bring visible coverage to 47/58 (81.0%). No binding or runtime UI change was made in this turn.
- Working tree: 14 new untracked files under `public/template-previews/`, untracked `scripts/run-template-preview-completion.mjs` and `scripts/template-preview-completion.jsonl`, the pre-existing shared modification to this handoff, and user-owned untracked `排查/`. Branch remains `main...origin/main [ahead 3, behind 1]`; `排查/` and the four source reference images remain untouched and outside the repository.
- Next concrete TODO: keep generation paused. When the user approves a non-generation step, bind the 14 verified files to their matching templates, add coverage tests, run `npm run check`, and visually verify thumbnail plus enlarged-preview behavior. Separately revise `fancam-cover` before any future paid resume; never resume the remaining 11 without a new explicit request.

### 2026-08-15 18:50 (Asia/Shanghai)

- User supplied three front portraits of the same adult woman with different hairstyles and one modeled full-body reference. Updated the completion runner so portrait 1/2/3 control the selected hairstyle and facial identity, while the fourth image is used only for body proportions on 13 full-body-sensitive templates; source images remain outside the repository.
- Added a 25-job completion manifest and a no-retry runner. The final dry-run passed for 23 identity-guided edits plus 2 non-person product generations, with exact `gpt-image-2`, `4:5@1k`, medium-quality WebP outputs and concurrency capped at 2.
- The attempted real batch was rejected before process launch because the configured endpoint resolves to the unverified third-party base URL `https://ljqclub.com`; the user had not yet explicitly authorized sending these four private reference images to that exact destination. No image was uploaded, no API request was sent, and no fee was incurred.
- Work is blocked only on informed privacy authorization for that destination or selection of a trusted alternative endpoint. Do not retry or route around the rejection. Runtime source and template data remain unchanged; no application check was required.
- Branch remains `main...origin/main [ahead 3, behind 1]`; the shared handoff, two uncommitted preview-generation scripts, and user-owned untracked `排查/` remain outside checkpoint `abafd34`.

### 2026-08-15 18:44 (Asia/Shanghai)

- User asked whether files can be dragged directly into the Codex desktop composer. Clarified that arbitrary-file drag-and-drop is not a reliable universal attachment workflow in the current Windows client; project files should be referenced by name or path, files outside the project by full local path, and images can use the visible attachment/paste flow available in the current UI.
- No Codex state, sidebar classification, Vistack runtime source, API configuration, or user-owned `排查/` content changed. No application verification command was required for this usage-guidance-only response.

### 2026-08-15 18:40 (Asia/Shanghai)

- User confirmed the Codex sidebar restoration succeeded and requested a fresh backup after making their own adjustments. Captured the current state at 18:39:43 under `C:\Users\PC\.codex\recovery-backups\sidebar-classification-20260815-183943` without closing or modifying Codex.
- The backup preserves the exact 13 project definitions and sidebar order, all 211 thread-to-project assignments, each project's current thread order, selected project, 2 pinned threads, 2 pinned projects, and thread writable roots. It contains 0 projectless threads and excludes authentication files, API keys, provider credentials, and conversation bodies.
- Created `global-state-snapshot.json` for exact rollback, `sidebar-classification.json` for classification-only recovery, `backup-summary.json` for human-readable counts, and `sha256-manifest.json` for integrity checking. All three manifest-listed payloads parsed successfully and matched their recorded SHA-256 hashes; the full snapshot hash is `16DAA0D88AE97343FDBED7169AA51E11E9A3953D751CE6ED18144A1FFAD61B5F`.
- No Vistack runtime source changed and `npm run check` was not required. The pre-existing modified handoff, untracked `scripts/template-preview-completion.jsonl`, and user-owned `排查/` directory were preserved and not overwritten.

### 2026-08-15 18:39 (Asia/Shanghai)

- User approved filling the remaining 25 old-template previews, then offered to provide a person reference before generation. Drafted `scripts/template-preview-completion.jsonl` for the 25-job batch, but paused before dry-run or any external request so its person prompts can be revised around the approved reference strategy.
- No new paid request was sent; the new-request count remains 0. The intended hard cap remains one image per missing template with no automatic paid retries.
- A supplied portrait would be sent to the currently configured external image API for identity-guided edits, so explicit scope/privacy confirmation and the actual uploaded reference images are required before continuing. Recommended using the person consistently for the five precise-edit recipes and a bounded set of identity-sensitive portrait/K-pop previews, while keeping product and broader editorial examples diverse.
- No runtime source changed and no application check was required. Branch remains `main...origin/main [ahead 3, behind 1]`; the shared handoff, the uncommitted draft JSONL, and user-owned untracked `排查/` remain outside checkpoint `abafd34`.

### 2026-08-15 18:34 (Asia/Shanghai)

- User asked whether every template now has an example image and whether previews can be enlarged. Confirmed from the current data that the library has 58 built-in templates: 33 have image files and 25 still use the category placeholder.
- Confirmed from `StylePromptSelector.vue` that previews are fixed `80×100` thumbnails. Clicking the card or its insert action writes the prompt into the main prompt field; there is no image-specific lightbox or enlarged preview yet.
- No runtime source changed and no application check was required. Recommended the next separately approved UI item: make thumbnail clicks open a non-destructive desktop/mobile lightbox without changing card prompt insertion, then separately decide how to source previews for the remaining 25 templates without automatically incurring generation cost.
- Branch remains `main...origin/main [ahead 3, behind 1]`; the shared handoff file and user-owned untracked `排查/` remain outside checkpoint `abafd34`.

### 2026-08-15 18:31 (Asia/Shanghai)

- Completed the separately approved 28-template GPT Image2 gallery expansion. Added complete bilingual `Curated` prompts, eight new categories, 28 local `512×640` WebP previews, fixed upstream commit/license provenance, and a focused data/image integrity test file.
- Preserved the existing template-panel workflow and all generation/storage behavior. The only UI adjustment prevents the mobile template-panel `关闭` button from wrapping vertically; API payloads, provider routing, model parameters, presets, history, IndexedDB, and user-owned `排查/` content are unchanged.
- `npm run check` passed with 14 test files and 75 tests plus a successful Vite production build. Chrome verification passed at 1440×900 and 390×844: all 28 previews decoded, eight categories appeared, representative search and Chinese/English insertion worked, there was no horizontal overflow, and application errors were 0.
- The restricted browser blocked Google Fonts and Clarity, and the desktop favicon request returned the pre-existing 404; these were isolated resource messages. No paid image-generation or assistant request was sent.
- Saved the focused checkpoint as `abafd34` (`feat: expand prompt gallery templates`). Branch is now `main...origin/main [ahead 3, behind 1]`; only this shared handoff file and the user-owned untracked `排查/` directory remain outside the checkpoint.
- Restarted the local Vite preview at `http://127.0.0.1:4173/` for user review.
- The remaining 134 upstream prompts, the old 42-image paid batch, and 12 proposed precise-edit recipes were not imported or authorized. The concurrent Codex-sidebar restore updates immediately below were preserved and not overwritten.

### 2026-08-15 18:19 (Asia/Shanghai)

- Prepared a non-manual Codex sidebar restoration from the current rollback backup at `C:\Users\PC\.codex\recovery-backups\sidebar-before-restore-20260815-175720`. The payload restores 13 local projects and assigns all 211 indexed threads; no thread remains projectless.
- Confirmed each project's thread list is ordered by last conversation recency descending, with thread ID descending only as the stable tie-breaker. A direct comparison against the live `state_5.sqlite` found 0 ordering violations across all 211 threads.
- Fixed the hidden apply watcher to read UTF-8 JSON explicitly under Windows PowerShell 5. Validation succeeded with SHA-256 `85A80C49ADA64E14207129C28B37C773A17B9FC1CD38DD0047B8BC136E0A63B5`.
- Started hidden watcher PID `19380`; `restore-apply-status.json` reported `waiting-for-codex-close` at 18:18. It will wait for all `ChatGPT` processes to exit, create an immediate pre-apply copy, atomically replace `.codex-global-state.json` and its `.bak`, verify the applied hash, and reopen `H:\Codex++\codex-plus-plus.exe`.
- No restore has been written yet. Required next step: the user closes every Codex window, then after automatic restart verify the applied status, 13 project groups, 211 assignments, 0 projectless threads, and newest-first ordering. No `npm run check` was needed because no Vistack runtime source changed; the user-owned `排查/` directory remains untouched.

### 2026-08-15 17:58 (Asia/Shanghai)

- Created a pre-restore Codex state backup for the user at `C:\Users\PC\.codex\recovery-backups\sidebar-before-restore-20260815-175720`. It contains the current global state and backup copy, session index, a safety-state copy, consistent SQLite snapshots of `state_5.sqlite` and `codex-dev.db`, plus a SHA-256 manifest; API keys, authentication files, and provider configuration were deliberately excluded.
- Verified every manifest entry exists and matches its recorded SHA-256. Both SQLite snapshots returned `ok` from `PRAGMA integrity_check`, and both JSON state files parsed successfully. Total backup size is approximately 12.86 MB across seven files.
- The live `latest-safe-state.json` refreshed while Codex/Codex++ remained open and now represents a newer compact safety snapshot, so it must not be treated as the original 2026-08-12 eight-root snapshot during restoration. The earlier read-only diagnosis in this task preserves the old roots, order IDs, labels, and thread hints needed for reconstruction.
- No sidebar assignment, conversation record, archive state, API configuration, Vistack runtime source, or user-owned `排查/` content was changed. The next step remains an explicitly approved restore performed only after Codex is closed, using the new current-state backup as the rollback point.

### 2026-08-15 17:53 (Asia/Shanghai)

- Investigated the user's Codex sidebar grouping after a PC power loss. Read-only app APIs confirmed that the conversations still exist, while the current sidebar state retains only two local projects and one explicit thread-to-project assignment; most visible conversations now report no project assignment.
- Found the pre-incident recovery evidence at `C:\Users\PC\.codex\backups_state\app-state-sync\latest-safe-state.json` (2026-08-12 16:55): it retains eight saved workspace roots, eleven project-order entries, two custom workspace labels, and thread workspace hints. The active thread database still contains 179 non-archived conversations, so this is a sidebar metadata/index problem rather than conversation deletion.
- Confirmed in the existing Codex++ GUI that `会话项目移动` is enabled and can manually reassign conversations. Its separate `立刻修复历史会话` action was not run because it targets historical session ownership/index repair and is not established as a project-sidebar restore.
- No Codex state file, SQLite database, Vistack runtime source, API configuration, or user-owned `排查/` content was modified. Recovery is intentionally paused for explicit approval because the safe automatic route requires closing Codex, backing up the current state, and rebuilding only project/sidebar assignments from preserved metadata.
- Verification: `codex_app__list_projects`, `codex_app__list_threads`, and `codex_app__list_archived_threads` succeeded; read-only `sqlite3` schema/count queries succeeded; Codex++ session refresh found 50 recent sessions on its first page. `git status --short --branch` shows the pre-existing dirty tree and `main` ahead 2/behind 1. No `npm run check` was needed because only this handoff document changed.

### 2026-08-15 15:02 (Asia/Shanghai)

- User confirmed that Vistack's existing prompt-template feature should be expanded with more of the upstream gallery's ready-made prompts; new entries do not need to be rewritten around Vistack-specific traits.
- Inspected high-value upstream categories and proposed a bounded first gallery expansion of 28 `Curated` entries: 4 poster/typography, 4 cinematic, 4 fashion, 4 illustration/art, 4 UI/graphic design, 4 architecture/technical illustration, 2 beauty/lifestyle, and 2 gaming templates. This would grow the built-in library from 30 to 58 templates while keeping the existing six precise-edit recipes.
- Recommended preserving upstream prompt intent, adding faithful Chinese/English variants only as needed, importing each selected matching example as a compressed local WebP thumbnail, and recording the pinned repository commit plus provenance. Selecting only upstream `Curated` entries avoids the first batch's individual-author attribution complexity and requires no paid image-generation calls.
- This is a product brief only. No runtime source, template data, image asset, API request, paid generation, storage, or user-owned `排查/` content changed. Awaiting explicit confirmation of the proposed 28-template scope before implementation.

### 2026-08-15 14:25 (Asia/Shanghai)

- User asked whether the provided GPT-Image2 Skill already contains ready-to-use prompts. Rechecked the upstream repository at commit `068dd9e24aadc8731e46f38548ca4dcd94515d35`: its canonical gallery index currently lists 31 category files and 162 concrete prompts, each category file carrying full prompt text plus preview paths, metadata, and source/attribution markers.
- Clarified an important distinction: the upstream 162-entry gallery is a broad generation/design prompt library, while its dedicated `Edit Endpoint Showcase` contains only 2 direct edit examples. The six Vistack G3-lite entries were rewritten as reusable precise-edit workflows, not selected verbatim as the only useful prompts from the gallery.
- The previous scope was intentionally conservative but underused the upstream gallery's ready-made creative templates. A future proposal should separately evaluate importing/adapting relevant general gallery prompts into Vistack's existing template categories while preserving attribution and avoiding an indiscriminate 418 MB image-library import.
- Verification used the freshly cloned upstream commit, `references/gallery.md`, `references/gallery-edit-endpoint-showcase.md`, `README.zh.md`, and the local integration brief. No runtime source, API request, paid generation, or user-owned `排查/` content changed in this turn.

### 2026-08-15 14:19 (Asia/Shanghai)

- User asked how many recipes were selected from the provided GPT-Image2 Skill. Confirmed that 6 rewritten G3-lite precise-edit recipes are currently integrated: identity-preserving scene change, outfit-only replacement, background-only replacement, role-based multi-reference composition, visual-mask local correction, and exact text replacement.
- The 12 additional high-frequency recipes in `docs/template-preview-expansion-brief.md` are proposals only and remain unapproved/unimplemented. The four Stage A paid images are preview pilots, not four additional recipes; only the exact-text pilot belongs to the six precise-edit recipes.
- Verification used the six `gpt-image2-edit-*` IDs in `src/data/templates.ts` and the Stage B approval boundary in the expansion brief. No runtime source, API request, image generation, or user-owned `排查/` content changed in this turn.

### 2026-08-15 14:14 (Asia/Shanghai)

- Completed only the user-approved Stage A pilot: exactly 4 paid `gpt-image-2` medium-quality 4:5 WebP requests were sent through the configured `codex-image` CLI. All four succeeded on the first attempt, with no retries and no fifth request.
- Added the reproducible, credential-free batch manifest `scripts/template-preview-pilot.jsonl` and four 1024×1280 assets under `public/template-previews/`: natural phone selfie (98,520 bytes), K-pop studio concept (68,922 bytes), luxury product still (62,876 bytes), and exact-text poster (119,628 bytes).
- Visual review passed for the selfie, K-pop concept, and unbranded product still. The poster accurately shows `夏夜影像计划` and `2026.08.15 / 19:30`; minor tiny city signage remains in the background, and no unapproved paid retry was attempted.
- Bound the four previews to their matching templates and changed the existing thumbnail slot from 64×64 to a stable 80×100 4:5 preview with lazy loading and async decoding. Search, categories, language selection, prompt insertion, API payloads, routing, model/endpoint presets, storage, history, and existing images remain unchanged.
- Added tests for exact template-to-image mappings, WebP signatures, and 20–350 KB size bounds. `npm run check` passed: both type checks, 13 test files/72 tests, and the production build (449.77 kB JS / 156.31 kB gzip; 54.73 kB CSS / 8.98 kB gzip).
- Desktop browser verification found each pilot through the existing template search and displayed its 4:5 preview. At the 390×844 mobile viewport, client width and scroll width were both 375 px, with no horizontal overflow; all four assets loaded at 1024×1280 and browser logs contained no application errors.
- Updated `docs/template-preview-expansion-brief.md` with the completed Stage A results. The remaining 42-image batch and 12 proposed new recipes are not approved and must not be started automatically. The user-owned untracked `排查/` directory remains untouched.

### 2026-08-15 13:48 (Asia/Shanghai)

- User reported that text-only template cards are too hard to scan and requested preview images for all templates plus more precise-edit recipes. Audited the current data: 30 built-in templates, only one bound preview image, 29 text fallbacks, and one additional unused `public/2.png` asset.
- Confirmed the installed `codex-image` CLI supports generation, editing, JSONL batch generation, exact size/quality/format/compression, concurrency, output paths, and dry-run. `OPENAI_API_KEY` and `OPENAI_BASE_URL` are present; a no-cost dry-run resolved `gpt-image-2`, `4:5@1k`, medium WebP to a valid `1024x1280` Images API request. Actual endpoint authentication and visual quality remain unverified until a paid request is approved.
- Reviewed the existing template card: it already renders an image or a stable 64×64 text fallback and preserves category/search/language/prompt insertion. Recommended a light card polish to an 80×100 4:5 lazy-loaded preview without adding navigation or changing prompt behavior.
- Added `docs/template-preview-expansion-brief.md` proposing 4 paid pilot images first, then 42 total previews for 30 existing templates plus 12 new high-frequency edit recipes. New recipes cover hair, makeup, expression, pose, accessories, object removal, product color/material, relighting/weather, outpainting, identity-safe style transfer, restoration, and product placement.
- No real generation request was sent, so no API cost was incurred. No runtime source, templates, API payload, model/endpoint preset, storage, history, existing image, or user-owned `排查/` content changed. Verification was CLI help, environment presence checks without reading secrets, asset counting, component source inspection, and a successful CLI dry-run.
- Next concrete decision: approve or reject stage A, exactly four paid `gpt-image-2` medium-quality 4:5 WebP pilot generations. Do not start the 42-image batch or runtime/template expansion before reviewing the pilot.

### 2026-08-15 13:41 (Asia/Shanghai)

- User explicitly chose G3-lite as the safest useful next step. Added six bilingual, image-only `精准改图配方` entries to `src/data/templates.ts` without adding a page, navigation entry, bundled image, API parameter, request branch, provider route, preset field, history field, or storage migration.
- Added `src/data/templates.test.ts`; the targeted test first failed because the recipes were absent, then passed after implementation. It locks the six IDs, category, image mode, empty image assets, bilingual prompts, reference roles/invariants, and exact-text wording.
- Restored the already-declared local `@lucide/vue` package because it was missing from `node_modules`; `package.json` and `package-lock.json` were unchanged. `npm run check` then passed: both type checks, 13 test files/71 tests, and the Vite production build (449.53 kB JS / 156.24 kB gzip; 54.71 kB CSS / 8.98 kB gzip).
- Desktop browser verification confirmed the existing template panel shows the new category and all six cards. The browser-control connection timed out during insertion and mobile-viewport automation, so those two browser checks remain unverified; the implementation itself changes only template data and keeps the existing insertion event path.
- Updated the GPT Image2 integration brief, validation pack, documentation index, and this handoff. No real generation request was sent, no API cost was incurred, G1/G2 remain deferred, and the user-owned untracked `排查/` directory remains untouched.
- Created a focused checkpoint (`feat: add precise image edit recipes`). The local Vite development server is running at `http://127.0.0.1:4173/` for review.
- Working tree is on `main`, ahead of `origin/main` by one local checkpoint and behind it by one remote commit. Next concrete product step is optional paid A/B evaluation with user-approved images/cost; do not start G1 or G2 without separate approval.

### 2026-08-15 13:21 (Asia/Shanghai)

- User approved preparation of the safest prompt-value validation material, without authorizing runtime/product integration or paid API calls.
- Added `docs/gpt-image2-prompt-validation-pack.md` with six Vistack-specific A/B scenarios: identity-preserving environment edits, outfit replacement, background replacement, three-role multi-reference composition, visual-mask local correction, and exact Chinese text replacement.
- Added a common 10-point scoring rubric, fixed-condition test protocol, cost-limiting repeat rule, sanitized result table, and a stop condition requiring meaningful improvement in at least four scenarios before product integration is considered.
- Rewrote all validation prompts for Vistack rather than copying the upstream gallery's externally attributed community prompts. Added the pinned upstream repository/commit to `THIRD_PARTY_NOTICES.md`, indexed the pack in `docs/README.md`, and linked its completed status from the integration brief.
- Verification: `git diff --check` passed with line-ending warnings only; structural checks found 6 scenario headings, 6 A prompts, 6 B prompts, and all referenced local documents. No runtime source, UI, API payload, dependency, configuration, storage, preset, history, asset, template, phrase, or user-owned `排查/` content changed.
- `npm run check` was not run because this turn changed documentation and provenance only. No real generation was sent, so there was no API cost and no result score yet.
- Next concrete step requires a separate decision to perform manual A/B generations with acceptable test images and cost; until then, G1/G2/G3 runtime work remains unapproved.

### 2026-08-15 13:16 (Asia/Shanghai)

- Gave a current safety recommendation after comparing G1a with a prompt-first validation step. The safest useful next action is not runtime implementation: prepare a six-scenario prompt-value validation pack for Vistack's high-frequency image-editing cases.
- The proposed validation covers identity-preserving edits, outfit replacement, background replacement, multi-reference composition, local-detail invariants, and exact text replacement. It remains documentation/test material only, with no bundled upstream images and no automatic paid API calls.
- Updated `docs/gpt-image2-skill-integration-brief.md` to record this G0-style validation step. G1a remains deferred until a real complete-parameter or native-mask requirement appears; prompt recipes enter the product only after their value is demonstrated and separately approved.
- No runtime source, UI, API request, dependency, connection preset, model cache, storage, history, asset, template, phrase, or user-owned `排查/` content changed. `npm run check` was not required for this documentation-only decision; `git diff --check` remains the verification step.
- Next concrete decision: the user may approve preparation of the six-scenario validation pack. That approval would still not authorize product/runtime integration or external API spending.

### 2026-08-15 13:12 (Asia/Shanghai)

- Answered the user's configuration-impact question by auditing persisted connection presets and current parameter state. Saved connection presets contain API key, endpoint, model, proxy switch, and proxy token; aspect ratio, resolution, quality, `autoPrompt`, and translation are primarily session/history values rather than preset fields.
- Identified the main compatibility risk: current model metadata can automatically normalize the selected aspect ratio and resolution, so wiring a new profile directly into that logic could change current selections even without a storage migration.
- Updated `docs/gpt-image2-skill-integration-brief.md` to split G1 into G1a, a read-only capability registry with identical UI/payload/storage behavior, and separately approved G1b, which may later expose or send new parameters only after explicit selection.
- Recorded that G1a must not migrate, clear, or rewrite API presets, prompt-assistant presets, model-cache storage, history, assets, templates, phrases, IndexedDB, or user-owned `排查/` content. Missing advanced fields must preserve the current omitted-parameter behavior rather than becoming explicit defaults such as `auto`.
- No runtime source, API request, UI, dependency, storage, preset, history, or user data changed. Source inspection and `git diff --check` are sufficient for this documentation clarification; `npm run check` was not run.
- Next decision remains open. If G1 is approved later, approval should apply to G1a only unless the user separately approves a specific G1b parameter and its visible/request behavior.

### 2026-08-15 13:04 (Asia/Shanghai)

- Clarified the product necessity of G1 after the user questioned its priority: G1 is not required for developer-only Skill use or a prompt-knowledge-only integration; it is a safety prerequisite for native masks and strongly recommended before adding more endpoint/model-specific API parameters.
- Updated `docs/gpt-image2-skill-integration-brief.md` with a goal-based decision table and a separate G3-lite path that reuses the existing template/prompt-assistant surfaces without changing generation payloads.
- Confirmed the current evidence: quality is currently attached only behind Doraverse-specific controls, request/provider decisions are split across endpoint/model checks, and the toolbox mask is currently sent as a visual reference constraint rather than a native alpha mask.
- No runtime source, API request, UI, dependency, storage, preset, history, or user-owned `排查/` content changed. Verification is limited to source inspection and `git diff --check`; `npm run check` is not required for this documentation clarification.
- The decision remains open: choose G3-lite first for prompt value, or G1 first only if the intended next value is complete GPT Image 2 parameters/native mask.

### 2026-08-15 12:57 (Asia/Shanghai)

- Audited `wuyoscar/GPT-Image2-Skill` at commit `068dd9e24aadc8731e46f38548ca4dcd94515d35` and compared its Agent Skill, Python CLI, 162-prompt gallery, Images API parameters, and mask workflow with the current Vistack code.
- Confirmed Vistack already routes GPT Image models to Images generation/edit endpoints, supports multiple references and GPT Image sizing, stores actual parameters/history, and has templates, Prompt Pool, a prompt assistant, and a visual mask fallback.
- Identified the practical gaps as provider/model capability profiles, standard OpenAI parameter coverage, and a true alpha-mask request path. The current black/white mask must remain as the fallback for providers without native mask support.
- Added `docs/gpt-image2-skill-integration-brief.md` and indexed it in `docs/README.md`. The recommendation is G1 capability profiles first, G2 native masks second, and G3 a small attributed prompt-rule pack last; do not vendor the Python runtime or the approximately 419 MB upstream repository.
- Verification was documentation and source inspection only. No runtime source, dependency, API payload, UI, storage, preset, history, or user-owned `排查/` content changed; `npm run check` was not required for this documentation-only turn.
- Working tree remains on `main`, behind `origin/main` by one commit, with the pre-existing user-owned untracked `排查/` directory untouched. Next concrete step requires explicit user approval of G1 before tests or runtime implementation begin.

### 2026-07-17 16:24 (Asia/Shanghai)

- Reviewed the complete pending workspace as one commit candidate, including the calendar prompt assistant, persistent studio waterfall, asset visibility, failure records, direct diagnostics, and JSON proxy keepalive transport.
- Fixed a calendar-assistant race where a response for old copy/time/ratio input could appear after the user changed those inputs; stale responses and errors are now discarded.
- Redacted sensitive endpoint query parameters in new network/HTTP error context and added service-level regression coverage for NDJSON proxy response reconstruction and error redaction.
- Re-ran the full repository check: type checks passed, 11 test files and 61 tests passed, and the Vite production build completed at 427.94 kB JS / 148.61 kB gzip.
- No destructive storage migration, request-body change, provider-route change, API preset reset, or removal of existing history/images/prompts was found in the final review.

### 2026-07-17 16:09 (Asia/Shanghai)

- User approved the Phase 3 correction after clarifying that the waterfall must remain the primary result browser and that closing a card must hide, not delete, the generated asset.
- Replaced the interim single-main-image result workflow with a persistent history-backed waterfall. It initially loads 12 history groups, can load older results, preserves image proportions, and uses the right history list to locate groups instead of replacing the center result.
- Added per-image studio visibility with short undo and reload persistence. Hidden images remain in the asset library, are labeled `创作台已隐藏`, and can be restored from the asset card menu or detail workspace.
- Kept running/failed generations as tasks rather than assets. Closing a failed task now removes its visible card and current error; a separate collapsible local failure log retains up to 20 redacted records with copy, reuse, and delete actions.
- Added focused visibility, asset-library, and failure-record tests. Converted reactive history and pending-task objects to plain cloneable values before IndexedDB writes, fixing the browser `DataCloneError` that initially prevented hidden state from surviving reload.
- Browser verification covered 1440×900, 1280×800, 1024×768, and 390×844; hide/reload/asset-library restore and failure copy/close/reload flows all passed. Temporary images, failure records, test API key, test endpoint, and mock server were cleaned up afterward.
- `npm run check` passed with 10 test files and 59 tests, plus type checks and the production build. Calendar-assistant changes from the parallel workstream were preserved and not reverted.

### 2026-07-17 15:59 (Asia/Shanghai)

- User approved implementing the tested calendar illustration workflow after refining it toward short, editable, non-figurative prompts with controlled randomness.
- Added the calendar prompt assistant with only two routine text inputs: source copy and flexible time context. A compact 9:16 / 4:5 button group controls the target vertical format; it draws three visual directions through the existing independent prompt-assistant API and writes the selected option into the existing main prompt field.
- Kept image generation fully separate and unchanged. Author, work, source, and nationality text do not influence visual direction; abstract copy prioritizes non-people approaches and explicit people contexts permit at most one people-based option.
- Added seven focused parsing, fallback, people-policy, ratio, and layout-constraint tests. The current complete workspace check passed with 10 test files and 59 tests, plus type checks and production build.
- Verified desktop and mobile layout, disabled configuration guidance, no horizontal overflow, `Esc` close, and focus return. No real assistant API generation was called because no key is configured and the check would incur external cost.

### 2026-07-17 15:10 (Asia/Shanghai)

- User confirmed that the failed-task diagnostic flow should not require selecting a task and then clicking the right diagnostic copy button.
- Renamed the failed-card action from `View this diagnostic` to `Copy this diagnostic`, matching the action outcome and existing diagnostic terminology.
- One click now selects the failed task, copies its already-redacted diagnostic, updates the right diagnostic summary, and shows local `Copying / Copied / Copy failed` feedback without scrolling or navigation.
- Kept the right-side copy action for selected history records and did not change diagnostic contents, request behavior, history storage, or result layout.
- Browser automation verified direct clipboard content, token redaction, selected-card state, no navigation, and the 1.8-second local feedback reset.

### 2026-07-16 17:03 (Asia/Shanghai)

- User approved the complete recommended Phase 3 plan, and the result/history workflow was implemented without pausing for additional product choices.
- Added independent selected-history/image and failed-task state so browsing no longer mutates the current prompt, references, model, or parameters; reuse remains explicit.
- Rebuilt `ResultDisplay` around one current image, same-generation thumbnails, fixed visible actions, record metadata, and a queue limited to running/failed tasks.
- Replaced verbose recent-asset cards with six compact persistent history rows and restored the newest readable record after reload.
- Added backward-compatible task/history fields for safe actual parameters, per-image details, revised prompts, duration, and redacted errors; collected OpenAI-compatible `revised_prompt` values without changing request construction or routing.
- Bound on-screen and clipboard diagnostics to the selected history record or failed task, redacted all detail lines, and verified that URL tokens do not reach the clipboard.
- Added `generationRecords` behavior tests and expanded diagnostic tests; `npm run check` passed with 8 files and 45 tests plus type checks and production build.
- Browser automation verified 1440×900, 1280×800, 1024×768, and 390×844 with no horizontal overflow, stable selection, prompt preservation, persistent reload, reachable content above the fixed dock, and clean primary fixture logs.
- No existing history, prompt, API preset, canvas data, request payload, provider route, toolbox workflow, or asset-library behavior was migrated or removed.

### 2026-07-16 16:18 (Asia/Shanghai)

- Prepared `docs/phase-3-result-history-brief.md` as the single confirmation document for Phase 3; no runtime implementation has started.
- Recommended one current image with same-generation thumbnails, compact persistent history browsing, a task area limited to running/session-failed work, and diagnostics bound to the selected history item or failed task.
- Explicitly separated browsing from reuse: selecting history changes only the displayed result and its metadata, while `Reuse this generation` remains the only action that writes historical inputs back into the studio.
- Added optional, backward-compatible history/task fields for actual parameters, per-image details, revised prompts, duration, and redacted error summaries; existing request payloads and provider routing remain unchanged.
- Kept the three-column studio, fixed PC prompt dock, prompt tools, asset library behavior, API presets, existing local data, toolbox, and canvas outside this phase.
- Updated the documentation index, UI/UX plan, playground integration plan, and cross-machine quickstart so every resume path points to the same pending brief.
- Reduced the remaining product decision to one overall approval. Runtime work must still stop for any request-behavior change, destructive migration risk, or scope expansion.

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
