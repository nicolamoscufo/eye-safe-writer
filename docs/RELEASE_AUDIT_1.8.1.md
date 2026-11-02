# Eye Safe Writer 1.8.1 release audit

## Baseline (2026-11-02)

- Empty workspace cloned from https://github.com/nicolamoscufo/eye-safe-writer.
- Clean `main` at `c28365c` (1.8.0); no tags or published/draft releases, verified with authenticated GitHub API.
- Working branch: `release/eye-safe-writer-1.8.1`. No pre-existing local changes.
- Windows, Node 24.14.1, npm 11.11.0, Git 2.53.0. Manifest minimum: Obsidian 1.13.0.
- `npm run check`, `npm run build`, `npm test`: pass (7 tests).
- `npm run visual:smoke`: initially missing dependencies; passed after `npm install --no-package-lock` and Playwright Chromium installation. Three simplified HTML screenshots; not native compatibility evidence.
- No lockfile, lint configuration, release workflow, root `LICENSE`, or `versions.json`.
- Existing tests check normal text only; they do not measure actual semantic/UI cascade or cumulative opacity.
- Authenticated GitHub owner has repository admin/push access. Real Windows Obsidian installation available; native QA will use an isolated vault/profile.

## Authoritative sources reviewed

Current upstream documentation and action interface read before source edits:

- [Submit your theme](https://docs.obsidian.md/Themes/App%20themes/Submit%20your%20theme)
- [Manifest](https://docs.obsidian.md/Reference/Manifest)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)
- [Official Stylelint configuration](https://github.com/obsidianmd/stylelint-config)
- [Official workflows](https://github.com/obsidianmd/obsidian-workflows), including `v1/action.yml`
- [Sample theme](https://github.com/obsidianmd/obsidian-sample-theme)
- [Theme guidelines](https://docs.obsidian.md/Themes/App%20themes/Theme%20guidelines)

Documentation uses the Community directory, not a registry pull request. Tags must equal `x.y.z` manifest versions; both installable files must be release attachments. Official release action supports `type: theme`, `mode: release`, `strict: true` and creates a draft. Owner must personally complete account authorization and developer-policy/support attestations.

## Executive summary

The stable patch candidate retains all eight palettes, all five activity presets, stable Style Settings identifiers, and native Markdown functionality. It fixes semantic contrast, composited-texture contrast, opacity stacking, native pane overflow, customization mappings and print specificity. The illustrated thumbnail has been replaced by a genuine Obsidian capture. Build/metadata/contrast/browser tests and native Windows QA pass.

**Delivery status: RELEASED — READY FOR COMMUNITY SUBMISSION.** [Version 1.8.1](https://github.com/nicolamoscufo/eye-safe-writer/releases/tag/1.8.1) was published after green PR/main/tag checks and exact draft-asset verification. Both unauthenticated public downloads match the immutable tag; CSS provenance is verified. Community account authorization and developer-policy/support attestations must still be performed personally by the owner. Submission/acceptance is not claimed.

## Findings and disposition

Severity describes impact, not a claim of a security vulnerability. “Confirmed” means reproduced in the cascade, tests or real app; “risk” means a problematic pattern without a reproduced plugin-specific failure.

| Severity / type | Finding | Repair / evidence |
| --- | --- | --- |
| High / confirmed release blocker | No GitHub release assets/release workflow or authentic thumbnail; root license used `LICENSE.md` | Standardized the root MIT filename to `LICENSE` without changing its terms (the official action also recognizes `LICENSE.md`); real screenshots; version/tag/asset gates and official draft-release workflow |
| Medium / confirmed | Low-contrast emphasis, headings, faint text, links, code and button colors across several palettes | Palette-specific changes in `src/02-palettes.css`; semantic, UI and texture tests |
| Medium / confirmed | Solid swatches alone missed dark-palette failures after SVG grain/fiber compositing | Rendered-background pixel tests exposed failures in Gruvbox, Rose Pine, Solarized and Nord; adjusted affected colors while retaining texture controls and palette character |
| Medium / confirmed | Navigation accumulated container, icon and SVG opacity; Enhanced Contrast did not reveal every layer | Readable Calm defaults, no unintended nested dimming, complete Enhanced/system overrides in modules 01, 03, 06 and 07; explicit saved dimming remains supported |
| Medium / confirmed | “High contrast” links sometimes used a less legible button-hover color; external/tag settings were bypassed | Independent link/tag variables and overrides in modules 03–04; actual hover and manual-override regression tests |
| Medium / confirmed | Default clean links relied only on color | Underlined defaults; saved Clean selection retained as an explicit preference; Enhanced Contrast restores underlines |
| Medium / confirmed native layout bug | Code/Academic widths could exceed the native Reading View content box despite a non-overflowing page | Bound width itself with `min(var(--file-line-width), 100%)` in module 04; native view-level overflow assertions |
| Medium / confirmed native layout bug | Wide desktop tables escaped their local content surface | Native `.el-table` scrolling in module 04; 24-column native table and 1,000-paragraph note tested |
| Medium / confirmed | Dark palette selectors could outrank print resets; checked-marker colors could remain dark | Palette-specificity-aware print tokens, light marker color, texture/chrome removal and wrapping/pagination in modules 06–07 |
| Low / confirmed | Component-local variables could be reset by the editor's blanket `inherit` declarations | Removed redundant resets; stylesheet-level component override regression in module 04 / visual smoke |
| Low / confirmed | Body-wide relational selectors and texture overlays affected unrelated overlays | Removed every `:has()` and moved texture behind note content; workspace-local `:focus-within` instead |
| Low / confirmed | Mobile fixture lacked native mobile classes; generated snippets diverged from canonical palettes | Explicit mobile classes and deterministic snippet generation; no claim that fixtures certify native mobile |
| Low / confirmed | Academic example double-escaped TeX commands | Corrected `examples/academic-notes.md`; real MathJax rendering and native PDF export |
| Medium / mitigated risk | Blanket `overflow:hidden` could clip plugin dropdowns and focus rings | Removed theme-enforced clipping in module 05; preserve native per-view behavior; real Style Settings/Tasks checks |
| Low / mitigated risk | High specificity, redundant fallbacks, important rules and inconsistent formatting complicated overrides | Official lint cleanup, narrow native-class recognition, lower-specificity scopes; zero production `!important` declarations |

### Accessibility measurements

All numbers are contrast ratios, rounded here only. Full values and foreground/background colors are in [`qa/contrast-before-after.json`](qa/contrast-before-after.json).

| Palette / element | 1.8.0 | 1.8.1 |
| --- | ---: | ---: |
| Rose Pine Light italic | 2.05 | 5.35 |
| Cappuccino Light bold | 2.34 | 5.68 |
| Cappuccino Light italic | 2.64 | 5.71 |
| Solarized Dark hovered internal link | 4.08 | 6.28 |

These before/after examples use browser-resolved semantic colors over each palette's solid primary surface, not guessed hex-token roles. Historical over-text texture is not included in these four swatch comparisons. Current texture composition is tested separately against actual rendered background pixels.

- **Semantic cascade:** 35,456 measured combinations in 128 palette/settings cases; minimum **4.6068:1**, zero failures. Includes headings H1–H6, emphasis, native/custom callouts, links/hover/unresolved states, tags, code, CodeMirror formatting/syntax tokens, and primary/paper/alternate/code/table surfaces.
- **Default rendered textures:** 368 foreground-token/palette probes, sampling every background pixel under ink-hidden text. Minimum **4.5784:1**; zero failures. SVG grain, fibers, blend mode and radial paper gradients remain active.
- **Controls:** 528 default/enhanced UI measurements plus actual hover checks; zero failures. Normal text uses 4.5:1; essential icons, focus colors and checkbox markers use 3:1. Disabled controls are functionally checked, not incorrectly treated as active-control AA failures.
- **Native app:** each app version completed 1,168 semantic/UI checks. Minimum normal-text contrast **4.8543:1**, essential UI **3.5044:1**. Each also measured 48 real diagram labels against rendered SVG backgrounds, including native filters. Diagram minima: **10.8350:1** (1.13.4) and **5.1407:1** (1.15.0).
- Alpha and nested group opacity are composited; a dedicated regression test proves opacity stacking cannot falsely pass. Large headings are conservatively held to the normal-text threshold in these tests.
- Antialiased glyph pixels are not used as the foreground color. SVG artwork uses actual background pixels and Canvas-resolved native filter output; ordinary gradient tests evaluate resolved stops rather than inventing an average background.

These are tested scenarios, **not** universal WCAG conformance or medical claims. Saved Clean links, custom colors/snippets, increased texture intensities, deliberate Deep/Paragraph dimming and arbitrary plugin content can change accessibility. Enhanced Contrast and system accessibility preferences reveal navigation/dimmed content.

## CSS, lint, compatibility and security

- Official `stylelint-config-obsidianmd` is used, with zero local lint errors or warnings.
- Lint checks the generated concatenation once, plus snippets; independent exact-concatenation checks cover all seven source modules without duplicate diagnostics.
- No global correctness-rule suppression. Narrow configuration recognizes native `HyperMD-*`, CodeMirror camel-case classes and custom elements. Five declaration-local compatibility comments explain doiuse's unrelated multicolumn warnings for supported paged-media properties. The official release scanner ignores inline comments and may report these as advisories.
- Browser target is Electron 39+, matching the installed launcher used to load newer app packages. Actual tested runtime: **Electron 39.8.3 / Chromium 142.0.7444.265**.
- `npm ci` and the committed lockfile are reproducible. A tested `multimatch → minimatch 11.0.1` override fixes the official compatibility linter's development-only advisory chain. `npm audit --audit-level=moderate`: **zero vulnerabilities**.
- No runtime npm dependencies, remote CSS assets, production scripts, account credentials or private vault data are included. Fonts are local/system fallbacks; texture assets are embedded.
- Minimum remains **Obsidian 1.13.0** for full-color callouts. The exact 1.13.0 app package is not available as a public GitHub release; the earliest public 1.13 package, **1.13.4**, was tested instead.

## Checks executed

| Check | Result |
| --- | --- |
| `npm ci` | Pass; lockfile retained |
| `npm run build` / `npm run check` | Pass; theme and all seven palette snippets match source |
| `npm test` | **15 tests pass**, including large browser matrices and negative tag checks |
| `npm run lint` | Pass; zero errors/warnings |
| `npm run visual:smoke` | **160 palette/preset/layout cases**, three simulated views each; settings, overflow, reduced motion, forced colors and PDF |
| `npm run release:check` | Pass; manifest/package/lock/map/license/screenshot/assets checked |
| `npm audit --audit-level=moderate` | Pass; zero vulnerabilities |
| Native Obsidian **1.13.4** | **83 cases**, 1,168 HTML/UI color checks, 48 SVG-label checks; zero renderer errors |
| Native Obsidian **1.15.0** | **83 cases**, 1,168 HTML/UI color checks, 48 SVG-label checks; zero renderer errors |

Native cases cover the 80 palette/preset Reading View combinations, actual Live Preview and Source Mode, real Style Settings controls, Tasks query output, MathJax, diagrams, native callouts, nested lists/checkboxes, sidebar toggle operation, ribbon separation, long documents, wide tables/code, reduced motion, keyboard focus and Academic PDF export. A saved native 16px font preference is deliberately retained while preset line heights and widths change.

Native plugin versions: **Style Settings 1.0.9**, **Tasks 8.6.0**. Tests use disposable profiles and public example notes, not personal vaults. The older app's explicit Mermaid permission is approved only for the known authored test diagram.

### Visual evidence

- [`screenshot.png`](../screenshot.png): genuine Obsidian light capture, downsampled to **512×288**, 16:9; no synthetic UI or private notes.
- [`screenshots/obsidian-light.png`](../screenshots/obsidian-light.png), [`obsidian-dark-academic.png`](../screenshots/obsidian-dark-academic.png): authentic desktop captures.
- [`obsidian-live-preview.png`](../screenshots/obsidian-live-preview.png), [`obsidian-source.png`](../screenshots/obsidian-source.png): actual editor modes.
- [`obsidian-style-settings.png`](../screenshots/obsidian-style-settings.png), [`obsidian-narrow-desktop.png`](../screenshots/obsidian-narrow-desktop.png): real controls and narrow desktop layout.
- [`obsidian-1.8.0-baseline.png`](../screenshots/obsidian-1.8.0-baseline.png): previous CSS in the same native app/public vault, not a claim that the old app binary was tested.
- [`qa/academic-export.pdf`](qa/academic-export.pdf): actual Obsidian Academic example export, including MathJax and callouts. The OS save dialog is replaced only by supplying the artifact filepath; the native renderer and Electron PDF backend are real.
- Sanitized machine evidence: [`qa/native-1.13.4.json`](qa/native-1.13.4.json), [`qa/native-1.15.0.json`](qa/native-1.15.0.json), [`qa/semantic-contrast.json`](qa/semantic-contrast.json), [`qa/texture-contrast.json`](qa/texture-contrast.json), [`qa/controls-contrast.json`](qa/controls-contrast.json).

The HTML fixture is explicitly simulated. Its narrow viewport includes `is-mobile is-phone mod-android`; neither it nor narrow Windows screenshots prove Android/iOS compatibility.

### Remaining compatibility limitations

1. Native testing is Windows-only with the stated launcher/app/plugin versions. macOS, Linux and native Android/iOS are not certified by this audit.
2. CSS-only Paragraph Focus follows editor prose **lines**, not complete multiline paragraphs or caret semantics. Source Mode may not expose prose classes.
3. Some older core ribbon controls are non-focusable `div` wrappers. CSS cannot add keyboard semantics; native keyboard visibility is verified on a genuinely focusable Markdown link, while ribbon toggle/geometry is tested separately.
4. Native PDF export and content were tested, but the OS file-picker UI was not. Very large tables may need landscape paper or shorter cells.
5. Optional generic Pomodoro styling and arbitrary third-party plugin versions are not certified. Plugin-specific SVGs, custom settings and snippets can introduce new paint combinations.

## Files changed

- All seven `src/` modules and generated `theme.css`; generated palette snippets (all seven); corrected Academic Markdown example. Pomodoro snippet retained.
- `manifest.json`, `package.json`, `package-lock.json`, `versions.json`, `.gitattributes`, `.gitignore`, `.stylelintrc.json`.
- Build, release validation, lint, historical contrast, native and fixture smoke scripts; Node/browser tests and shared fixtures/contrast helpers; sanitized publication/hash/provenance evidence.
- `.github/workflows/theme-ci.yml`, reusable `validate.yml`, and a single `release.yml` publisher.
- `LICENSE` (unchanged MIT terms, renamed from `LICENSE.md`); `community-theme.json` replaces obsolete PR-submission metadata.
- README, development guide, changelog, authentic screenshot assets, this audit and sanitized evidence.

## GitHub delivery record

- Working branch: `release/eye-safe-writer-1.8.1`.
- Source commit: [`0348935`](https://github.com/nicolamoscufo/eye-safe-writer/commit/0348935d8611e085285fbd4288a4ac89875f252d).
- [PR #3](https://github.com/nicolamoscufo/eye-safe-writer/pull/3) passed [PR validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/41533100724) and was squash-merged on **2026-11-02 at 22:00:10 UTC**, without bypassing checks.
- Main release commit: [`efc6cb7`](https://github.com/nicolamoscufo/eye-safe-writer/commit/efc6cb7889a09e1905a39e815f373e6d562398d8), tree-identical to the tested source commit. Its separate [main validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/41533410763) passed before tagging.
- Exact annotated tag [`1.8.1`](https://github.com/nicolamoscufo/eye-safe-writer/tree/1.8.1) points to `efc6cb7889a09e1905a39e815f373e6d562398d8`; tag object `f0ced0b94b85f78fca8cc7544b165bd18b78a9dc`. It was created/pushed once; no existing tag/release was overwritten or force-pushed.
- [Release workflow](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/41533774969): both complete validation and the official strict draft-release job passed. The official action resolved to `obsidianmd/obsidian-workflows@8167caed39664214d82c86fdfa32e06d8d55f61d`.
- Downloaded both draft attachments at **22:05:17 UTC** and compared their bytes and SHA-256 with `git show 1.8.1:<filename>`. Both matched. Reviewed/filled the initially empty release notes before publication.
- [Published release 1.8.1](https://github.com/nicolamoscufo/eye-safe-writer/releases/tag/1.8.1): **2026-11-02 at 22:06:32 UTC**; release ID `432018955`; verified **not draft, not prerelease**, with exactly the two expected installable assets.
- Public downloads were independently fetched **without authentication** at **22:06:40 UTC**. Both returned **HTTP 200**, matched the tagged files byte-for-byte, and had the expected GitHub SHA-256 digests. The downloaded manifest declares `1.8.1` and minimum `1.13.0`.
- `gh attestation verify` on the draft **and public** `theme.css`, constrained to this repository's `.github/workflows/release.yml`, passed. SLSA v1 provenance identifies tag `refs/tags/1.8.1` and source commit `efc6cb7`; official attestation ID `62851389`. The action attests **CSS only**; the manifest is separately byte/hash-verified.

| Public asset | Bytes | SHA-256 |
| --- | ---: | --- |
| [`theme.css`](https://github.com/nicolamoscufo/eye-safe-writer/releases/download/1.8.1/theme.css) | 103800 | `5c41b26717c82fe815cd335ccff58b6383592caa6d6fc9ac69ff6b2515f323a6` |
| [`manifest.json`](https://github.com/nicolamoscufo/eye-safe-writer/releases/download/1.8.1/manifest.json) | 156 | `754d0d063bdcdd70ca6b8c7d1242f9c63b21190ae92e5b4e8b0e71a58ff7b8d7` |

Machine-readable delivery evidence: [`qa/release-1.8.1.json`](qa/release-1.8.1.json). Post-publication audit/README/CI maintenance does not change the released CSS, manifest, version or tag.

### Non-blocking upstream advisories actually observed

The official strict release action reported **0 errors, 8 warnings**; it was not a warning-free scan:

- Five compatibility warnings classify supported print pagination declarations as partially supported **multicolumn** features; native PDF output was tested and visually inspected.
- Two unknown-type warnings concern MathJax's genuine **`mjx-container`** custom element; actual native mathematics and PDF rendering passed.
- One README warning matched the explanatory installation prefix **`<your vault>`**, not unfilled project identity/template content. The default-branch follow-up clarifies the path without that prefix.

The official scanner's **isolated temporary npm installation** also reported **4 moderate advisories** in its upstream tool dependencies. This is separate from the repository's pinned, overridden dev dependency tree, whose mandatory `npm audit --audit-level=moderate` gate passed with **zero vulnerabilities**. No npm dependencies are shipped in the two theme assets; the upstream scanner notice is recorded, not hidden or represented as clean.

GitHub emitted a Node 20 deprecation warning for the tagged workflow's `actions/upload-artifact@v4` (successfully forced to Node 24). The default-branch follow-up updates it to the documented Node 24 **`@v7`** interface with unchanged artifact inputs. Runner-image migration notices are infrastructure information, not theme failures.

## Community directory status

**Not submitted by this audit.** The public compatibility registry had no matching name/repository entry when rechecked at **2026-11-02 22:06:39 UTC**; authenticated draft/review state is not accessible. The public [Themes portal](https://community.obsidian.md/themes) exposes a Sign in gate. The current directory flow requires the owner's Obsidian account and personal GitHub connection. No developer policies, account authorization, maintenance attestation or CAPTCHA has been accepted on the owner's behalf.

Exact entry information and the owner's remaining steps are in [`COMMUNITY_SUBMISSION.md`](COMMUNITY_SUBMISSION.md). GitHub publication and public asset verification are complete. Sign in, inspect any existing account draft, link GitHub personally, select or claim the theme, enter `screenshot.png` and both modes, review/accept the policies personally, submit, and inspect automated review results. No obsolete registry PR was opened. Acceptance/listing is not claimed.

**Final disposition: RELEASED — READY FOR COMMUNITY SUBMISSION.**
