# Development and QA

This theme's installable output is **theme.css** and **manifest.json**. The CSS is generated from ordered `src/01-*.css` to `src/07-*.css` files.

Run `npm run build` after editing modules. Use `npm run check` and `npm test` before committing. CI verifies the checked-in build, settings IDs, compatibility version, basic CSS structure, default contrast and accessibility safeguards.

For optional screenshots run `npm install`, `npx playwright install chromium`, `npm run visual:smoke`. CI captures three representative HTML fixture screenshots (light/dark/narrow viewport) and checks ribbon row overlap. **This is not an Obsidian-native screenshot baseline**. Inspect screenshots and manually verify in real Obsidian (1.13+, especially 1.14+), on desktop/mobile, keyboard navigation, Reading/Live Preview and PDF export before releasing.

Color contrast should be measured separately for each palette and UI/plugin surface. Faint decorative text must not be the only channel for important information.

The CSS-only Paragraph focus option in Live Preview detects the *active line*, not every line belonging to a multiline Markdown paragraph. Reading view supports paragraph hover/keyboard focus. Full editor paragraph tracking would require a separate Obsidian plugin; the theme does not bundle script execution.
