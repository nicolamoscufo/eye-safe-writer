# Eye Safe Writer 1.8.3 release audit

[PR #7](https://github.com/nicolamoscufo/eye-safe-writer/pull/7) landed as `6870c22` on November 15, 2026. The iOS file drawer uses Obsidian’s preferred text size with a 16 px minimum. The note toolbar keeps its native touch areas and pressed and active states.

[PR #9](https://github.com/nicolamoscufo/eye-safe-writer/pull/9) landed as `325733d` on November 16, 2026. The Android reading/editing and note menu buttons and their shared surface are transparent at rest. The candidate uses the stylesheet from that commit.

- [Theme validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43688584694) passed on `6870c22`, including the simulated iOS touch and styling regression.
- [Theme validation for the Android fix](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43825291329) passed on `cc205a8`, including simulated touch input, idle transparency in both color modes, and feedback when the note menu is open.
- [Native Windows QA](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43688441087) passed on Obsidian 1.13.4 and 1.15.1 with Style Settings 1.0.9 and Tasks 8.6.0. This run used the stylesheet from PR #7. Physical iPhone and Android QA are pending.

This is an unpublished candidate. Finalize the changelog date and record the tag, release workflow, draft and public asset comparisons, and publication in this audit when delivery is complete.
