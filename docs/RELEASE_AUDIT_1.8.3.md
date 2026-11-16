# Eye Safe Writer 1.8.3 release audit

[PR #7](https://github.com/nicolamoscufo/eye-safe-writer/pull/7) landed as `6870c22` on November 15, 2026. The iOS file drawer uses Obsidian’s preferred text size with a 16 px minimum. The note toolbar keeps its native touch areas and pressed and active states. This candidate keeps the exact stylesheet from that commit.

- [Theme validation](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43688584694) passed on `6870c22`, including the simulated iOS touch and styling regression.
- [Native Windows QA](https://github.com/nicolamoscufo/eye-safe-writer/actions/runs/43688441087) passed on Obsidian 1.13.4 and 1.15.1 with Style Settings 1.0.9 and Tasks 8.6.0. The QA branch adds only its workflow to the tested PR source. Physical iPhone QA is pending.

This is an unpublished candidate. Finalize the changelog date and record the tag, release workflow, draft and public asset comparisons, and publication in this audit when delivery is complete.
