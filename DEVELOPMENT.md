# Development, QA and release

## Reproducible setup

Use Node.js **24+** and npm. All dependencies are development-only.

```sh
npm ci
npx playwright install chromium
npm run check
npm run build
npm test
npm run lint
npm run visual:smoke
npm run release:check
npm audit --audit-level=moderate
```

On Linux CI, use `npx playwright install --with-deps chromium`. Check **before** building: otherwise rebuilding could hide stale committed assets. Commit `package-lock.json` whenever dependencies change. `npm ci` must not modify it.

## Source architecture

| Module | Responsibility |
| --- | --- |
| `src/01-settings-and-tokens.css` | Style Settings YAML, shared semantic tokens, typography defaults |
| `src/02-palettes.css` | 16 palette variants and behind-content texture layers |
| `src/03-chrome-and-panels.css` | Workspace, native ribbon actions, navigation and focus settings |
| `src/04-editor-and-content.css` | Editor/reading content and study callouts |
| `src/05-paper-surfaces.css` | Paper surfaces, forms and shared keyboard focus |
| `src/06-accessibility-and-responsive.css` | Responsive, system accessibility and print fallbacks |
| `src/07-academic-and-focus.css` | Academic preset/callouts, Enhanced Contrast and paragraph/print options |

`scripts/build-theme.mjs` concatenates these in order with LF line endings and generates standalone palette snippets from the same palette declarations. Never fix only `theme.css` or a generated snippet. `npm run check` checks **all eight** generated assets byte-for-byte.

Prefer native Obsidian variables and low-specificity selectors. Do not reset inheritable variables throughout the editor: plugins and embeds need component-local values. The ribbon must never acquire a filter/transform/positioning containing block that moves the native sidebar toggle. Do not enforce clipping on every non-Markdown leaf. Textures belong behind note content, not over text or overlays.

The official Stylelint configuration checks the generated concatenation once (including cross-module ordering) and every snippet. Concatenation tests cover the modules without duplicate lint reports. No correctness rules are globally disabled. Configuration narrowly recognizes native `HyperMD-*`/CodeMirror classes and custom elements, and targets **Electron 39+**, including older installers that load newer Obsidian app packages. Five declaration-local comments document doiuse's unrelated multicolumn warnings for supported print pagination. The Community scanner can still report those advisories because it ignores inline comments.

The `multimatch → minimatch` override addresses GHSA-g3hv-75wg-m249 in the compatibility linter's development dependency chain. A regression test checks the `minimatch.match()` API used by that consumer. Do not remove the override without checking `npm audit` and the official linter.

## Automated test scope

- Node tests: manifest/package/lock/version-map consistency, required assets, valid YAML/unique IDs/CSS mappings, all palettes, CSS parsing/security constraints, and deterministic generation.
- Browser contrast: the actual browser cascade, semantic mappings (including CodeMirror formatting and syntax colors), alpha compositing, cumulative group opacity, and resolved gradient stops across primary/paper/alternate/code/table/callout surfaces. All 16 palettes, all heading styles, link settings and hover states, Enhanced Contrast, and accessible Deep/Paragraph combinations are covered.
- Texture contrast: 23 foreground tokens in all 16 palettes are tested against every rendered background pixel under ink-hidden text probes. This includes real SVG grain, fibers, blend modes and paper gradients; it does not confuse antialiased glyph pixels with foreground colors.
- UI contrast: native-like chrome, icons, navigation text, buttons, form text, checkbox markers and focus colors. Disabled controls are checked functionally, not incorrectly held to an active-control WCAG requirement.
- `visual:smoke`: **160** simulated palette/preset/layout cases, three simulated views each; ribbon geometry/scrolling, saved overrides, component-local tokens, overflow, reduced motion, forced colors, settings and print/PDF. Narrow simulations include `is-mobile is-phone mod-android`.

The fixture is deliberately limited HTML, not Obsidian, CodeMirror, MathJax, Mermaid or plugin execution. Its screenshots under `visual-artifacts/fixture-*` must never be presented as native app screenshots. Contrast calculation is based on foreground/background colors, not antialiased glyph pixels; gradient stops are checked individually, and unsupported filters/images fail explicitly. The separate pixel-background test covers actual default texture composition. Arbitrary custom colors, texture intensities, snippets, opacity settings, saved Clean links and intentional Deep/Paragraph dimming are outside blanket accessibility claims.

## Native QA and authentic screenshots

On a machine with Obsidian installed:

```sh
npm run native:smoke
```

Set `OBSIDIAN_PATH` to another executable location. The default Windows path is `C:\Program Files\Obsidian\Obsidian.exe`. `OBSIDIAN_VERSION` defaults to `1.15.0`; also test `1.13.4` (earliest available public 1.13 package). The declared minimum `1.13.0` uses the full-color callout API but is not available as a public GitHub release for repeat testing.

The script downloads public Obsidian ASAR release code, verifies its SHA-256 release digest, and launches it using the installed Electron runtime. It creates a new isolated profile and vault under the OpenCode temporary directory on Windows (the OS temporary directory elsewhere), installs public Style Settings/Tasks releases **only there**, and approves only that self-created vault's plugin/known Mermaid execution. It never opens or screenshots a personal vault/profile, connects accounts, or accepts directory developer policies. Downloads are QA tooling, not theme CSS network dependencies. Set `GH_TOKEN` only if public API rate limits require existing authenticated read access; it is used only for GitHub API metadata, not forwarded to asset hosts or written to disk.

Outputs go to ignored `native-artifacts/<app-version>/`. The isolated temporary profile is retained for diagnosis; remove only that specific QA directory when no longer needed. The script checks real reading/editor modes, native sidebar toggling, all palette/preset combinations, native-rendered color/UI contrast, MathJax, Mermaid and Tasks, long documents, narrow **desktop** layouts, settings and PDF. Electron omits CDP `Page.printToPDF`, so QA invokes Obsidian's real PDF modal/renderer/backend with a supplied artifact filepath; the OS file picker itself is not tested. It compares the previous CSS in the same app/vault. This does not certify Android/iOS, macOS/Linux or every installer/plugin version.

To intentionally replace the public screenshot assets after reviewing native results:

```sh
npm run native:smoke -- --capture-release
```

This copies actual renderer screenshots to `screenshots/` and downsamples the genuine light capture to root `screenshot.png` (512×288, 16:9). No synthetic UI, composited content or personal vault data. Keep a sanitized evidence JSON under `docs/qa/` and record the app, Electron, plugin versions and limitations in the release audit. A missing genuine screenshot is a manual submission blocker, not an invitation to fabricate one.

## Release procedure

1. Inspect remote branches, tags and **published/draft** releases; never reuse a version or move a tag.
2. Work on a release branch. Update `manifest.json`, `package.json`, the lockfile, `versions.json`, changelog, README and audit. Retain stable Style Settings IDs.
3. Run every check above and native/visual QA. Review the diff, screenshots and dependency audit. Commit only intended source, generated assets, documentation, lockfile and sanitized evidence.
4. Push and open a PR. Require successful **Theme validation**; respect repository protections. Merge, then verify the exact main commit.
5. Create an unprefixed version tag equal to `manifest.version`, such as `1.8.1`, on the tested main commit. Push it once.
6. `.github/workflows/release.yml` reuses the complete CI suite. It checks that the tag commit is on main, validates exact tag/manifest versions and tracked assets, rebuilds deterministically, then invokes **`obsidianmd/obsidian-workflows@v1`** with `type: theme`, `mode: release`, `strict: true`. Only that job has release/attestation write permissions.
7. The official action creates **one draft release** and attaches `manifest.json` and `theme.css`, with release notes and attestations. Do not publish if checks failed or blocking issues remain.
8. Download both draft attachments using authenticated API access; compare their SHA-256 hashes with the tested tag files. Review notes and publish. Download the public assets again and verify hashes, manifest version, tag commit, and non-draft/non-prerelease status.
9. Record real commit/PR/run/release links and asset verification in the audit. Do not claim a tag, release, native test or submission that was not verified.

## Community directory

Use [community.obsidian.md](https://community.obsidian.md), **not** a `community-css-themes.json` PR. The owner must personally sign in, connect GitHub, choose ownership, accept Developer Policies and confirm ongoing maintenance. The assistant must stop at account authorization, legal/support attestation or CAPTCHA.

After the default branch and published release are ready, select **Themes → New theme**:

- Repository: `https://github.com/nicolamoscufo/eye-safe-writer`
- Name: `Eye Safe Writer` (from the committed manifest)
- Author: `Nicola`; GitHub owner: `nicolamoscufo`
- Screenshot path: `screenshot.png`
- Supported modes: **Light and Dark**
- Owner: the user's linked Community profile (or an explicitly chosen organization)

`community-theme.json` is a local checklist, not a submission API or acceptance record. The directory reads `manifest.json` from default-branch HEAD and downloads the two release attachments from the exact version tag. Inspect automated review results after submission; increment the version if a new release is required. See [current official instructions](https://docs.obsidian.md/community-directory/set-up-and-claim).
