# Eye Safe Writer 1.8.2 release audit

## Scope

Obsidian Mobile's floating note header overlaps the Markdown content area. In the published 1.8.1 stylesheet, the theme assigned the same stacking level to both. The content comes later in the view and can intercept taps meant for the sidebar button, reading/editing toggle, and note menu.

The patch lets Obsidian determine the order of those elements on mobile. The paper texture remains below them within the isolated Markdown leaf. The existing desktop stacking rules, eight palettes, and Style Settings identifiers are retained. The minimum supported app version remains 1.13.0.

The analysis uses the app stylesheet and the construction order of the header and content from the digest-verified [Obsidian Mobile 1.15.0 Android package](https://github.com/obsidianmd/obsidian-releases/releases/tag/v1.15.0). The original stylesheet was matched to the SHA-256 of the [published 1.8.1 theme asset](https://github.com/nicolamoscufo/eye-safe-writer/releases/tag/1.8.1).

## Verification

- The Playwright regression models an overlapping mobile header and sends touch input to the three controls and the note. It also checks that the sidebar backdrop receives a tap while open.
- The [1.8.1 audit](RELEASE_AUDIT_1.8.1.md) contains the historical desktop QA and authentic screenshot evidence. A fresh native app run is pending for 1.8.2.
- Physical-device verification in Obsidian Mobile is pending.

## Delivery

Release candidate. The PR checks, tested main commit, version tag, release workflow, and attachment hashes will be recorded as each is verified.
