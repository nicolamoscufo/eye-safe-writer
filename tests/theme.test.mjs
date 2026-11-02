import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { spawnSync } from 'node:child_process';
import { parseDocument } from 'yaml';
import { generatedAssets, sources, palettes } from '../scripts/build-theme.mjs';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const css = await read('theme.css');
const ast = postcss.parse(css);
const manifest = JSON.parse(await read('manifest.json'));
const settingsDoc = parseDocument(css.match(/\/\* @settings([\s\S]*?)\*\//)[1], { uniqueKeys: true });
const settings = settingsDoc.toJS();

test('manifest schema, release consistency, required files and compatibility', async () => {
  await import('../scripts/validate-release.mjs');
  const [major, minor] = manifest.minAppVersion.split('.').map(Number);
  assert.ok(major > 1 || (major === 1 && minor >= 13), 'Full-color callouts require Obsidian 1.13+');
});

test('all CSS modules are concatenated once in stable order; generated files match exactly', async () => {
  const modules = (await readdir(new URL('src/', root))).filter(n => n.endsWith('.css')).map(n => `src/${n}`).sort();
  assert.deepEqual(sources, modules);
  assert.equal(css, (await Promise.all(sources.map(read))).map(c => c.replace(/\r\n/g, '\n')).join(''));
  const first = await generatedAssets();
  assert.deepEqual(await generatedAssets(), first);
  for (const [file, expected] of Object.entries(first)) assert.equal(await read(file), expected, file);
});

test('Style Settings is valid YAML with unique identifiers and mapped controls', () => {
  assert.deepEqual(settingsDoc.errors, []);
  assert.equal(settings.id, 'eye-safe-writer');
  const ids = settings.settings.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  const noops = new Set(['eye-safe-activity-default', 'eye-safe-palette-salvia', 'eye-safe-headings-colored', 'eye-safe-ui-comfortable', 'eye-safe-panels-paper', 'eye-safe-texture-paper', 'eye-safe-focus-calm']);
  for (const setting of settings.settings) {
    assert.ok(setting.title && setting.type && setting.id);
    if (setting.type.startsWith('variable-')) assert.ok(css.includes(`--${setting.id}:`), setting.id);
    if (setting.type === 'class-toggle') assert.ok(css.includes(`.${setting.id}`), setting.id);
    if (setting.type === 'class-select') {
      const values = setting.options.map(o => o.value);
      assert.equal(new Set(values).size, values.length);
      assert.ok(values.includes(setting.default));
      for (const value of values) assert.ok(noops.has(value) || css.includes(`.${value}`), value);
    }
    if (setting.type === 'variable-number-slider') assert.ok(setting.min <= setting.default && setting.default <= setting.max && setting.step > 0, setting.id);
  }
});

test('all eight palettes provide complete semantic tokens in both modes', () => {
  const required = ['--background-primary', '--background-secondary', '--paper-surface', '--text-normal', '--text-muted', '--text-faint', '--text-accent', '--text-accent-hover', '--interactive-accent', '--text-on-accent', '--icon-color', '--code-normal', '--table-header-background', '--writer-yellow', '--writer-red', '--writer-blue', '--writer-green', '--writer-purple', '--writer-berry', '--writer-orange'];
  for (const palette of Object.keys(palettes)) for (const mode of ['light', 'dark']) {
    const selector = `.theme-${mode}${palette === 'salvia' ? '' : `.eye-safe-palette-${palette}`}`;
    const rule = ast.nodes.find(n => n.type === 'rule' && n.selector === selector);
    assert.ok(rule, selector);
    const properties = new Set(rule.nodes.filter(n => n.type === 'decl').map(n => n.prop));
    for (const property of required) assert.ok(properties.has(property), `${selector} ${property}`);
  }
});

test('CSS parses, has no external dependencies, broad has scans or important overrides', () => {
  ast.walkAtRules('import', () => assert.fail('Distribution must be self-contained'));
  ast.walkDecls(d => {
    assert.equal(Boolean(d.important), false, d.toString());
    if (d.value.includes('url(')) assert.ok(!/url\(["']?(?:https?:|file:|\/\/)/i.test(d.value));
  });
  ast.walkRules(r => assert.ok(!r.selector.includes(':has('), r.selector));
});

test('accessibility, responsive, native callouts and print safeguards are retained', () => {
  for (const value of ['prefers-reduced-motion', 'forced-colors', 'prefers-contrast', '@media print', 'width <= 700px', 'eye-safe-print-academic', 'eye-safe-paragraph-focus', 'eye-safe-enhanced-contrast', ':focus-visible', 'data-callout="proof"', 'data-callout="teorema"']) assert.ok(css.includes(value), value);
  assert.ok(!css.includes('--text-normal: inherit'), 'Do not reset plugin-local variables');
});

test('legacy standalone palette snippets share the canonical, current palette tokens', async () => {
  const generated = await generatedAssets();
  assert.equal(Object.keys(generated).length, 8);
  for (const [file, content] of Object.entries(generated)) if (file.startsWith('snippets/')) {
    assert.equal(postcss.parse(content).nodes.filter(n => n.type === 'rule').length, 2, file);
  }
});

test('minimatch security override preserves the official compatibility linter glob API', async () => {
  const { default: multimatch } = await import('multimatch');
  assert.deepEqual(multimatch(['src/a.css', 'src/b.js', 'theme.css'], ['**/*.css', '!theme.css']), ['src/a.css']);
});

test('release tag validation rejects mismatches and v prefixes', () => {
  for(const tag of [`v${manifest.version}`,'0.0.0']) {
    const result=spawnSync(process.execPath,['scripts/validate-release.mjs'],{cwd:root,env:{...process.env,RELEASE_TAG:tag},encoding:'utf8'});
    assert.notEqual(result.status,0,tag);
    assert.match(result.stderr,/Release tag must exactly equal/);
  }
});

test('workflow YAML retains gated release, deterministic installation and least privilege',async()=>{
  const workflows={};
  for(const file of ['theme-ci.yml','validate.yml','release.yml']) {
    const document=parseDocument(await read(`.github/workflows/${file}`),{uniqueKeys:true});
    assert.deepEqual(document.errors,[],file);
    workflows[file]=document.toJS();
    assert.equal(workflows[file].permissions.contents,'read');
  }
  const release=workflows['release.yml'];
  assert.deepEqual(release.on.push.tags,['*']);
  assert.equal(release.jobs['draft-release'].needs,'validate');
  const action=release.jobs['draft-release'].steps.find(s=>s.uses==='obsidianmd/obsidian-workflows@v1');
  assert.equal(action.with.type,'theme');
  assert.equal(action.with.mode,'release');
  assert.equal(action.with.strict,'true');
  const checks=workflows['validate.yml'].jobs.checks.steps.filter(s=>s.run).map(s=>s.run);
  assert.ok(checks.includes('npm ci'));
  assert.ok(checks.indexOf('npm run check')<checks.indexOf('npm run build'));
  for(const command of ['npm test','npm run lint','npm run visual:smoke'])assert.ok(checks.includes(command));
});
