# Changelog

## 1.8.0 - 2026-10-30

- Added optional Academic / Research typography and bilingual theorem, proof, lemma, and important callouts.
- Added enhanced contrast (AA-targeted across all built-in palettes), CSS-only prose-line/reading-paragraph focus, and academic print layout.
- Split CSS into seven maintainable source modules, keeping the distributable theme.css intact.
- Added reproducible build checks, Node tests, and CI Playwright HTML visual smoke artifacts.
- Updated minimum Obsidian compatibility to 1.13.0 for the full-color callout API.


## 1.7.0 - 2026-10-29

- Added opt-in Study, Writing, and Code activity presets in Style Settings, with a Default option that preserves the existing appearance.
- Presets adjust prose size, line height, reading width, paragraph spacing, and writing font or code size without changing palettes, ribbon spacing, UI density, or saved typography overrides.
- Added palette-aware Definition, Formula, Example, Exercise, and Doubt callouts with English and Italian names and distinct native icons.
- Kept study callout text in the normal reading color, with explicit titles and neutral print and forced-color styles for legibility without relying on color alone.
- Added copyable study callout examples, including mathematics, nested callouts, and collapsible exercises.


## 1.6.3 - 2026-10-18

- Fixed the sidebar toggle overlapping the first ribbon action by disabling ribbon filters, including hover and editor-focus states.
- Added support for Obsidian 1.14's `.mod-primary` ribbon class while retaining compatibility with `.mod-left`.
- Made the ribbon compact by default: 8px gaps, 36px button rows, and actions grouped near the top. Full-height distribution remains opt-in.
- Adjusted compact and spacious density presets consistently and expanded the ribbon controls to 4–60px gaps and 32–72px button rows.
- Kept action rows fixed-height, constrained their width, and preserved scrolling on short windows without overriding the chosen spacing.
- Integrated the local ribbon fix into the theme; a separate ribbon-fix CSS snippet is no longer required.


## 1.6.2 - 2026-10-18

- Increased left ribbon action spacing and button hit-area height to prevent densely packed icons on tall windows.
- Added Style Settings controls for ribbon gap (8–60px) and action row height (36–72px).
- Added optional full-height vertical distribution of left ribbon actions.
- Kept button rows fixed-height and action lists scrollable on shorter desktop windows.


## 1.6.1 - 2026-10-18

- Fixed overlapping or clipped controls in the left ribbon and sidebar header after Obsidian UI changes.
- Removed theme-enforced ribbon layout, top padding, action positions, and fixed sidebar tab header sizing so the app can manage native chrome.
- Prevented decorative ribbon pseudo-element backgrounds and borders from painting over the toolbar junction.
- Kept plugin ribbon actions from shrinking and allowed vertical scrolling when there are more actions than available height.
- Preserved compact and spacious ribbon width settings via Obsidian's native `--ribbon-width` token.


## 1.6.0 - 2026-10-17

- Improved default navigation legibility with clearer inactive tabs, toolbar icons, sidebar controls, and window actions.
- Added Style Settings toggles for Clear navigation, Active writing line, and Flat editor background.
- Made keyboard focus reveal otherwise dimmed view controls and titlebar actions.
- Improved long code and table overflow handling on narrow screens.
- Strengthened system high-contrast, forced-colors focus outlines, and print readability in dark mode.
- Updated repository metadata to match the canonical GitHub owner.

## 1.5.0 - 2026-09-13

- Added Eye Safe Pomodoro integration snippet for distraction-free focus sessions.
- Added calm timer cards with adaptive theme variables and reduced-motion support.
- Improved compatibility with modern Obsidian workflows and productivity plugins.
- Updated release metadata for the latest theme iteration.

## 1.4.0 - 2026-06-18

- Added broad Style Settings controls for palette, heading style, link style, typography, UI density, panels, paper texture, and writing focus.
- Added manual color overrides for links, accents, tags, emphasis, and headings.
- Added a true light variant for AMOLED palette.
- Added selectable texture styles: paper grain, fine dust, linen weave, speckles, diagonal fibers, and none.
- Fixed duplicated dropdown arrows in Obsidian settings controls.
- Switched license to MIT for community distribution.

## 1.3.0 - 2026-06-16

- Added minimal paper-panel design for Obsidian sidebars, modals, menus, prompts, settings, metadata, search, and non-markdown panels.
- Hidden rectangular sidebar leaf backgrounds behind rounded paper panels.
- Kept active/selected states text-led and subtle to avoid competing geometries.

## 1.2.0 - 2026-06-16

- Integrated sidebar/ribbon overlap fix into theme.
- Fixed vault profile footer overflow in narrow sidebars.
- Simplified active file marker in file explorer.
- Dimmed window chrome further while writing in focused markdown editor.
- Completed palette-owned tokens for focus and paper texture values.
- Added fallback declarations for browsers without `color-mix()`.
- Added visible keyboard focus styles.
- Added high-contrast, forced-colors, print, reduced-motion, and small-screen rules.
- Added Style Settings toggle to disable paper texture.
- Added release README and QA checklist.

## 1.1.1

- Local theme version before production hardening.
