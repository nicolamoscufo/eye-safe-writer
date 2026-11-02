import stylelint from 'stylelint';
import { sources } from './build-theme.mjs';

// Lint the concatenation once: this catches cross-module cascade ordering as
// well as every source declaration, without reporting the same errors twice.
// check/build tests independently prove it is exactly the source concatenation.
await import('./validate-release.mjs');
const result = await stylelint.lint({ files: ['theme.css', 'snippets/*.css'], formatter: 'string' });
if (result.report) console.log(result.report);
if (result.errored || result.results.some(r => r.warnings.length)) process.exitCode = 1;
else console.log(`Official Obsidian Stylelint: ${sources.length} modules via theme.css, plus all snippets; no warnings.`);
