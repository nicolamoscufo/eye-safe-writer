# Eye Safe Writer

Warm, low-distraction Obsidian theme for long writing sessions.

![Eye Safe Writer screenshot](screenshot.png)

## Features

- Light and dark palettes tuned for eye comfort.
- Style Settings palette selector: Salvia, Gruvbox, AMOLED, Tokyo Night, Rose Pine, Solarized, Nord, Cappuccino.
- Full UI token system controlling workspace, text, accents, navigation, code, tables, callouts, and focus states.
- Typography, line width, headings, links, UI density, compact ribbon spacing, panels, shadows, and paper texture controls.
- Writing focus mode with reduced visual distraction and optional clearer navigation.
- Optional current-line guidance and flat editor background for different writing preferences.
- Built-in compatibility layer for productivity workflows.
- Eye Safe Pomodoro integration snippet for focused writing sessions.
- Reduced-motion, high-contrast, forced-colors, print, and small-screen support.

## Install

1. Create `.obsidian/themes/Eye Safe Writer/` inside your vault.
2. Copy `theme.css` and `manifest.json` into that folder.
3. Select **Eye Safe Writer** under **Settings → Appearance → Themes**.
4. Install the optional Style Settings plugin to customize palettes and readability.
5. For Pomodoro support, copy `snippets/eye-safe-pomodoro.css` to `.obsidian/snippets/` and enable it under Appearance → CSS snippets.

To update an existing manual installation, replace `theme.css` and `manifest.json`; your vault notes are unaffected.

## Troubleshooting left sidebar / ribbon overlap

Version 1.6.3 fixes the sidebar toggle overlapping the first ribbon action in Obsidian 1.14+. The theme now supports both the new `.mod-primary` ribbon class and the earlier `.mod-left` class. It also avoids graphical filters that move the toggle into the ribbon action area, including while hovering or focusing the editor.

1. Update **both** `.obsidian/themes/Eye Safe Writer/theme.css` and `manifest.json` from this repository.
2. Fully quit and reopen Obsidian.
3. If you previously enabled an `eye-safe-ribbon-fix` CSS snippet, disable it: the fix is now built into the theme.
4. If the overlap remains, temporarily disable other ribbon CSS snippets and test again; custom snippets may override the theme.
5. Test with Obsidian's default theme: if the issue disappears, check that Eye Safe Writer 1.6.3 is the version actually loaded.

### Ribbon spacing

Actions are grouped near the top with compact spacing by default. To customize it, open **Settings → Style Settings → Eye Safe Writer → Layout and Typography → Left ribbon spacing** (in some Style Settings versions, the section is nested under Layout and Typography):

- **Space between ribbon icons:** default 8px; range 4–60px.
- **Ribbon button row height:** default 36px; range 32–72px.
- **Distribute ribbon icons vertically:** off by default; enable it only if you prefer full-height distribution on tall displays.

The compact UI density preset uses 4px gaps and 32px rows; the spacious preset uses 12px gaps and 40px rows. Explicit ribbon values in Style Settings take precedence. Existing saved preferences are preserved when updating: to match the compact defaults, set the gap to **8**, the row height to **36**, and turn **Distribute ribbon icons vertically** off.

On short windows with many plugin shortcuts, the left ribbon action list scrolls instead of letting buttons shrink into each other.

## Recommended Workflow

Eye Safe Writer works well with:

- Obsidian Style Settings for theme customization.
- Pomodoro Timer plugins for timed deep-work sessions.
- Focus mode plugins for distraction-free writing.
- Daily notes, Canvas, Tasks, and markdown-based knowledge management.

## Style Settings

Available controls:

- Palette variants and light/dark themes.
- Manual colors for links, accents, tags, emphasis, and headings.
- Heading styles.
- Typography scale and reading width.
- UI density.
- Panel appearance.
- Paper textures.
- Writing focus intensity.
- **Clear navigation:** keep tabs, sidebar controls and inactive panes easy to read even when the editor has focus.
- **Active writing line:** optionally highlight the current line in the source editor.
- **Flat editor background:** remove the paper-like vignette while preserving palette colors.

The three new readability options are off by default. Open **Settings → Style Settings → Eye Safe Writer → Readability and Accessibility** to enable them.

## Pomodoro Integration

The included `eye-safe-pomodoro.css` snippet provides:

- Calm timer cards matching the current theme palette.
- Large readable countdown typography.
- Soft buttons and reduced visual noise.
- Reduced-motion accessibility support.

It is designed to work with modern Obsidian Pomodoro plugins without changing plugin functionality.

## QA Checklist

- Obsidian desktop on Windows, macOS, Linux.
- Obsidian mobile and narrow layouts.
- Light and dark mode.
- Sidebar, ribbon, tabs, search, backlinks, graph, canvas, settings, modals.
- Zoom 80%, 100%, 150%.
- Keyboard navigation and focus states.
- Ribbon toggle and action separation on Obsidian 1.14+, with both legacy and current ribbon classes.
- Ribbon spacing in comfortable, compact, and spacious density, with full-height distribution both off and on.
- Short-window ribbon scrolling with many plugin shortcuts and custom spacing values.
- Reduced motion, high contrast, forced colors, print/export.
- Readability settings enabled individually, including keyboard-only navigation.
- Long tables and code blocks at narrow screen widths.

## Release

- Update `manifest.json` version.
- Add entry to `CHANGELOG.md`.
- Test supported Obsidian workflows.
- Update screenshots when releasing major visual changes.

## Community Theme Submission

```json
{
  "name": "Eye Safe Writer",
  "author": "Nicola",
  "repo": "nicolamoscufo/eye-safe-writer"
}
```
