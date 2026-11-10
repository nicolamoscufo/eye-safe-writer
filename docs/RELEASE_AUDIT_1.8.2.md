# Eye Safe Writer 1.8.2 release audit

## Scope

Obsidian Mobile's floating note header overlaps the Markdown content area. In the published 1.8.1 stylesheet, the theme assigned the same stacking level to both. The content comes later in the view and can intercept taps meant for the sidebar button, reading/editing toggle, and note menu.

The patch lets Obsidian determine the order of those elements on mobile. The paper texture remains below them within the isolated Markdown leaf. The existing desktop stacking rules, eight palettes, and Style Settings identifiers are retained. The minimum supported app version remains 1.13.0.

The analysis uses the app stylesheet and the construction order of the header and content from the digest-verified [Obsidian Mobile 1.15.0 Android package](https://github.com/obsidianmd/obsidian-releases/releases/tag/v1.15.0). The original stylesheet was matched to the SHA-256 of the [published 1.8.1 theme asset](https://github.com/nicolamoscufo/eye-safe-writer/releases/tag/1.8.1).

## Verification

- [Theme validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/42069416624) passed on `2ec3520`. This includes all 16 tests, lint, the visual smoke suite, the dependency audit, and the official Obsidian validation action. The Playwright regression sends touch input to the three toolbar controls, the note, and the open sidebar backdrop.
- [Native Windows QA](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/42069411695) passed on Obsidian 1.13.4 and 1.15.0. Each run completed 83 cases and 1,168 color/UI checks with Style Settings 1.0.9 and Tasks 8.6.0. The QA branch adds only its workflow to the tested code. The native script recognizes the app's trust prompt in the disposable vault.
- The [1.8.1 audit](RELEASE_AUDIT_1.8.1.md) contains the previous accessibility measurements and authentic screenshots. Physical-device verification in Obsidian Mobile is pending for 1.8.2.

## Delivery

Published the stable [Eye Safe Writer 1.8.2 release](https://github.com/nicolamoscufo/eye-safe-writer/releases/tag/1.8.2) on 2026-11-05.

- [PR #5](https://github.com/nicolamoscufo/eye-safe-writer/pull/5) was squash merged as [`8cdd105`](https://github.com/nicolamoscufo/eye-safe-writer/commit/8cdd1059fda43903715516c931dae3a460470d0c) with the same tree as the tested candidate. [Theme validation on main](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/42078108125) passed for that commit.
- The annotated `1.8.2` tag resolves to that commit. The [release workflow](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/42078473328) passed and generated the draft attachments. The GitHub attestation record for `theme.css` matched the CSS digest and the release workflow invocation.
- The authenticated draft downloads and both anonymous public downloads matched the tagged files byte for byte. The public manifest reports version `1.8.2`, and GitHub lists the release as the latest stable version.

Verified asset SHA-256 hashes

| Asset | SHA-256 |
| --- | --- |
| `manifest.json` | `f4e109f86dbd6841bb65b78b98505f64d5439232b412582c881edb5185d822ed` |
| `theme.css` | `4295853fbe1d9a98f28b8792e57399cea067a5d12afd81be0d9d633dbb0b237f` |

## Release scanner

The pinned project dependency audit reported zero vulnerabilities. The release scanner reported zero errors and seven compatibility warnings. Five concern multicolumn print styles and two concern the MathJax `mjx-container` element. Native Windows QA covered PDF export and MathJax rendering.
