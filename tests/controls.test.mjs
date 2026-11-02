import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { palettes } from '../scripts/build-theme.mjs';
import { loadFixture, icon } from './lib/fixture.mjs';
import { measureSolidContrast } from './lib/cascade.mjs';

test('chrome, icons, buttons, controls and focus indicators across all 16 palettes', async () => {
  const browser = await chromium.launch();
  const failures = [], report = [];
  try {
    const page = await browser.newPage();
    await loadFixture(page);
    await page.evaluate(icon => {
      document.body.innerHTML = `<div class="workspace"><aside class="workspace-ribbon mod-primary"><div class="side-dock-actions"><button class="clickable-icon side-dock-ribbon-action" aria-label="Search">${icon}</button></div></aside><aside class="mod-left-split"><div class="workspace-tabs"><div class="workspace-leaf-content" data-type="file-explorer"><div class="nav-header"><button class="clickable-icon" aria-label="New note">${icon}</button></div><div class="nav-file-title" data-contrast>Note</div><div class="nav-file-title is-active" data-contrast>Active note</div><div class="nav-folder-title" data-contrast>Folder</div></div></div></aside><main><div class="workspace-tab-header-container"><div class="workspace-tab-header" data-contrast>Inactive tab</div></div><button class="mod-cta" data-contrast>Save</button><button data-contrast>Cancel</button><input type="text" value="Field" data-contrast data-name="text-input"><button disabled>Disabled (AA exempt)</button><span data-contrast="3" style="color:var(--background-modifier-border-focus)" data-name="focus-ring">Focus</span><span data-contrast="3" style="color:var(--checkbox-marker-color);background:var(--checkbox-color)" data-name="checkbox-marker">✓</span><div class="markdown-source-view mod-cm6"><div class="cm-editor"><div class="cm-content" tabindex="0">Editor</div></div></div></main></div>`;
      for (const svg of document.querySelectorAll('.clickable-icon svg')) { svg.dataset.contrast = '3'; svg.dataset.name = 'navigation-icon'; }
    }, icon);
    for (const palette of Object.keys(palettes)) for (const mode of ['light', 'dark']) for (const setting of ['', 'eye-safe-enhanced-contrast', 'eye-safe-focus-deep eye-safe-enhanced-contrast']) {
      await page.evaluate(({ palette, mode, setting }) => { document.body.className = `theme-${mode} eye-safe-palette-${palette} ${setting}`; }, { palette, mode, setting });
      await page.locator('.cm-content').focus();
      await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
      const measurements = await page.evaluate(measureSolidContrast);
      for (const m of measurements) if (m.ratio < m.minimum) failures.push({ palette, mode, setting, ...m });
      for (const selector of ['button.mod-cta', '.nav-file-title', '.clickable-icon']) {
        await page.locator(selector).first().hover();
        await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
        const checks = await page.evaluate(measureSolidContrast, `${selector} [data-contrast], ${selector}[data-contrast]`);
        for (const m of checks) if (m.ratio < m.minimum) failures.push({ palette, mode, setting: 'hover', ...m });
      }
      report.push({ palette, mode, setting, combinations: measurements.length });
    }
    await page.keyboard.press('Tab');
    const field = page.locator('input');
    await field.focus();
    assert.equal(await field.evaluate(el => getComputedStyle(el).outlineWidth), '2px');
    assert.equal(await field.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    assert.equal(await page.locator('button[disabled]').isDisabled(), true);
    await page.evaluate(()=>{document.body.classList.remove('eye-safe-enhanced-contrast');document.body.classList.add('eye-safe-focus-deep');});
    for(const media of [{contrast:'more'},{contrast:'no-preference',forcedColors:'active'}]) {
      await page.emulateMedia(media);
      await page.locator('.cm-content').focus();
      await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
      assert.equal(await page.locator('.workspace-ribbon').evaluate(el=>getComputedStyle(el).opacity),'1','System accessibility must override Deep focus');
      assert.equal(await page.locator('.nav-header').evaluate(el=>getComputedStyle(el).opacity),'1');
    }
  } finally { await browser.close(); }
  await mkdir('visual-artifacts',{recursive:true});
  await writeFile('visual-artifacts/controls-contrast.json', JSON.stringify({ report, failures }, null, 2));
  assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 15), null, 2));
});
