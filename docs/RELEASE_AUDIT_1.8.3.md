# Eye Safe Writer 1.8.3 release audit

[PR #7](https://github.com/nicolamoscufo/eye-safe-writer/pull/7) landed as `6870c22` on November 15, 2026. The iOS file drawer uses Obsidian’s preferred text size with a 16 px minimum. The note toolbar keeps its native touch areas and pressed and active states.

[PR #9](https://github.com/nicolamoscufo/eye-safe-writer/pull/9) landed as `325733d` on November 16, 2026. The Android reading/editing and note menu buttons and their shared surface are transparent at rest. The candidate uses the stylesheet from that commit.

- [Theme validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43688584694) passed on `6870c22`, including the simulated iOS touch and styling regression.
- [Theme validation for the Android fix](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43825291329) passed on `cc205a8`, including simulated touch input, idle transparency in both color modes, and feedback when the note menu is open.
- [Theme validation for the 1.8.3 candidate](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43825784228) passed on `60bf21e`, including the mobile touch tests, visual smoke tests, dependency audit, and official Obsidian validation.
- [Native Windows QA](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43938718176) tested the same candidate on Obsidian 1.13.4 (Electron 43.1.1) and 1.15.1 (Electron 43.8.9) with Style Settings 1.0.9 and Tasks 8.6.0. Each completed 83 cases, 1,168 color and UI checks, 48 SVG label checks, and native PDF export. The QA commit `470632f` adds only the isolated workflow to `60bf21e`. Light and dark renders were reviewed. Physical iPhone and Android QA is pending.

## Delivery

The [release PR #8](https://github.com/nicolamoscufo/eye-safe-writer/pull/8) merged as [`5d44318f474af6421cb5aeaae6cef2e01c70f2d0`](https://github.com/nicolamoscufo/eye-safe-writer/commit/5d44318f474af6421cb5aeaae6cef2e01c70f2d0). Its tree matches candidate `47b7df7161dd1f26e23c833f6b73558bf2449151`, and tag `1.8.3` points to the merge commit.

[Candidate Theme validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43943535640) passed on its third attempt, including npm audit and the official validation. GitHub withdrew GHSA-fc5q-39xc-vjpf on November 18, 2026; the candidate's independent `npm audit --audit-level=moderate` reported zero vulnerabilities.

The [official release workflow](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/44385331380) passed and created the draft. The [published release](https://github.com/nicolamoscufo/eye-safe-writer/releases/tag/1.8.3) is neither draft nor prerelease. Both draft attachments were downloaded with authenticated API access and their SHA-256 hashes matched the tag files; the public attachments were downloaded and matched again after publication. The public manifest reports version `1.8.3`.

Candidate asset SHA-256 hashes

| Asset | SHA-256 |
| --- | --- |
| `manifest.json` | `d93990911e36fd3cb2b661c555751747a67a8314d061351390cf6fa9acb1d292` |
| `theme.css` | `e989aaf4db876be9b9330369f99fccbeaced4b3c24b1dcb0753d4117c9d7a484` |
