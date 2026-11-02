import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { palettes } from '../scripts/build-theme.mjs';
import { loadFixture, semanticMarkup } from './lib/fixture.mjs';
import { measureSolidContrast } from './lib/cascade.mjs';

test('rendered semantic cascade reaches AA across 16 palettes and accessible settings', async () => {
  const browser = await chromium.launch();
  const report = [];
  const failures = [];
  try {
    const page = await browser.newPage();
    await loadFixture(page);
    await page.evaluate(markup => {
      document.querySelector('.workspace').remove();
      document.querySelector('.modal').remove();
      document.querySelector('#semantic-tests').innerHTML = markup;
      for (const node of document.querySelectorAll('.callout-title-inner, .callout-content p, .callout-content strong, .callout-content em')) {
        node.dataset.contrast = '4.5';
        node.dataset.name = `${node.closest('.callout').dataset.callout}/${node.className || node.tagName}`;
      }
    }, semanticMarkup());
    const settings = ['', 'eye-safe-enhanced-contrast', 'eye-safe-headings-mono', 'eye-safe-headings-accent', 'eye-safe-headings-muted', 'eye-safe-links-underlined', 'eye-safe-links-high-contrast', 'eye-safe-focus-deep eye-safe-paragraph-focus eye-safe-enhanced-contrast'];
    for (const palette of Object.keys(palettes)) for (const mode of ['light', 'dark']) for (const setting of settings) {
      await page.evaluate(({ palette, mode, setting }) => { document.body.className = `theme-${mode} eye-safe-palette-${palette} ${setting}`; }, { palette, mode, setting });
      const measurements = await page.evaluate(measureSolidContrast);
      for (const m of measurements) if (m.ratio < m.minimum) failures.push({ palette, mode, setting, ...m });
      report.push({ palette, mode, setting: setting || 'default', combinations: measurements.length, minimum: Math.min(...measurements.map(m => m.ratio)) });
    }
    // Hover is an actual pseudo-state, not a hand-parsed token substitution.
    for (const palette of Object.keys(palettes)) for (const mode of ['light', 'dark']) {
      await page.evaluate(({ palette, mode }) => { document.body.className = `theme-${mode} eye-safe-palette-${palette}`; }, { palette, mode });
      for (const selector of ['.internal-link', '.external-link', '.internal-link.is-unresolved']) {
        const link = page.locator(selector).first();
        await link.hover();
        const [m] = await page.evaluate(measureSolidContrast, selector);
        if (m.ratio < 4.5) failures.push({ palette, mode, setting: 'hover', ...m });
      }
    }
    await page.evaluate(()=>{document.body.className='theme-light';});
    assert.ok((await page.locator('a.internal-link').first().evaluate(el=>getComputedStyle(el).textDecorationLine)).includes('underline'),'Default links must not rely on color alone');
    await page.evaluate(()=>document.body.classList.add('eye-safe-links-clean'));
    assert.equal(await page.locator('a.internal-link').first().evaluate(el=>getComputedStyle(el).textDecorationLine),'none','Saved Clean preference is retained');
    await page.evaluate(()=>document.body.classList.add('eye-safe-enhanced-contrast'));
    assert.ok((await page.locator('a.internal-link').first().evaluate(el=>getComputedStyle(el).textDecorationLine)).includes('underline'),'Enhanced Contrast restores a non-color link cue');
  } finally { await browser.close(); }
  await mkdir('visual-artifacts', { recursive: true });
  await writeFile('visual-artifacts/contrast.json', JSON.stringify({ report, failures }, null, 2));
  assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 20), null, 2));
});

test('contrast compositor accounts for foreground alpha and stacked group opacity', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<body style="margin:0;background:#fff"><div style="background:#000;opacity:.5"><span data-contrast style="color:#fff;opacity:.5">Text</span></div></body>');
    const [m] = await page.evaluate(measureSolidContrast);
    assert.equal(m.opacity, .25);
    assert.ok(m.ratio < 4.5, 'Opacity stacking must not falsely pass AA');
    assert.ok(Math.abs(m.background[0] - 127.5) < 1);
    assert.ok(Math.abs(m.foreground[0] - 191.25) < 1);
  } finally { await browser.close(); }
});
