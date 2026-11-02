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

**Delivery status at preparation:** not yet released or submitted. GitHub delivery results are recorded below only after execution. Community account authorization and developer-policy/support attestations must be performed personally by the owner.

## Findings and disposition

Severity describes impact, not a claim of a security vulnerability. “Confirmed” means reproduced in the cascade, tests or real app; “risk” means a problematic pattern without a reproduced plugin-specific failure.

| Severity / type | Finding | Repair / evidence |
| --- | --- | --- |
| High / confirmed release blocker | No GitHub release assets, release workflow, recognized root `LICENSE`, or authentic thumbnail | Root MIT license renamed without changing its terms; real screenshots; version/tag/asset gates and official draft-release workflow |
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
- Build, release validation, lint, historical contrast, native and fixture smoke scripts; Node/browser tests and shared fixtures/contrast helpers.
- `.github/workflows/theme-ci.yml`, reusable `validate.yml`, and a single `release.yml` publisher.
- `LICENSE` (unchanged MIT terms, renamed from `LICENSE.md`); `community-theme.json` replaces obsolete PR-submission metadata.
- README, development guide, changelog, authentic screenshot assets, this audit and sanitized evidence.

## GitHub delivery record

- Working branch: `release/eye-safe-writer-1.8.1`.
- Commit / PR / Actions: **pending execution**.
- Main merge / exact tag `1.8.1`: **not created yet**.
- GitHub Release and downloadable asset verification: **not published yet**.
- Publication is prohibited until mandatory checks pass and both release attachments match the tested tag files.

## Community directory status

**Not submitted by this audit.** The public compatibility registry had no matching repository entry when checked; authenticated draft/review state is not accessible. The current directory login flow requires the owner's Obsidian account and GitHub connection. No developer policies, account authorization, maintenance attestation or CAPTCHA has been accepted on the owner's behalf.

Exact entry information and the owner's remaining steps are in [`COMMUNITY_SUBMISSION.md`](COMMUNITY_SUBMISSION.md). After GitHub publication, sign in, link GitHub personally, select or claim the theme, enter `screenshot.png` and both modes, review/accept the policies personally, submit, and inspect automated review results. Acceptance/listing is not claimed.

**Current disposition: release preparation complete locally; GitHub delivery pending.**
