import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { palettes } from '../scripts/build-theme.mjs';
import { loadFixture, icon, theme } from './lib/fixture.mjs';
import { measureSolidContrast } from './lib/cascade.mjs';

test('iOS floating note actions stay tappable and the file drawer follows preferred text size', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    // Model the relevant Obsidian Mobile 1.15.1 layout and button states.
    await page.setContent(`<!doctype html>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { margin: 0; --font-ui-medium: 20px; }
        .workspace-leaf-content { position: relative; display: flex; flex-direction: column; height: 100vh; }
        .view-header { position: fixed; inset: 0 0 auto; z-index: 1; display: flex; border-bottom: 1px solid transparent; }
        .view-actions { display: flex; margin-inline-start: auto; height: 52px; }
        button { border: 0; }
        .clickable-icon { background-color: transparent; }
        .clickable-icon.is-active { background-color: var(--background-modifier-active-hover); }
        .is-phone .view-header .view-action { width: 52px; height: 52px; }
        .is-mobile .file-tree .tree-item-self { font-size: var(--font-ui-small); }
        .view-content { flex: 1; padding: 80px 12px 12px; }
        .workspace-drawer-backdrop { position: fixed; inset: 0; z-index: 5; }
      </style>
      <body class="theme-light is-mobile is-phone is-ios is-floating-nav eye-safe-ui-compact">
        <div class="workspace-leaf-content" data-type="markdown">
          <div class="view-header">
            <div class="view-header-left">
              <button class="view-action clickable-icon mod-raised" data-target="sidebar">Sidebar</button>
            </div>
            <div class="view-actions mod-raised">
              <button class="view-action clickable-icon" data-target="mode">Edit</button>
              <button class="view-action clickable-icon" data-target="more">More</button>
            </div>
          </div>
          <div class="view-content"><button data-target="note">Note action</button></div>
        </div>
        <aside class="workspace-drawer mod-left">
          <div class="file-tree">
            <div class="tree-item-self nav-folder-title"><span class="nav-folder-title-content">Folder</span></div>
            <div class="tree-item-self nav-file-title"><span class="nav-file-title-content">Note</span></div>
          </div>
        </aside>
        <div class="workspace-drawer-backdrop" data-target="backdrop" hidden></div>
      </body>`);
    await page.addStyleTag({ content: theme });
    await page.evaluate(() => {
      document.addEventListener('click', event => {
        document.body.dataset.lastTapped = event.target.closest('[data-target]')?.dataset.target ?? 'content';
      });
    });

    const action = page.locator('[data-target="mode"]');
    const header = page.locator('.view-header');
    const background = locator => locator.evaluate(el => getComputedStyle(el).backgroundColor);
    assert.equal(await background(header), 'rgba(0, 0, 0, 0)');
    assert.equal(await header.evaluate(el => getComputedStyle(el).borderBottomColor), 'rgba(0, 0, 0, 0)');
    assert.equal(await background(action), 'rgba(0, 0, 0, 0)');
    assert.equal(await action.evaluate(el => getComputedStyle(el).borderTopWidth), '0px');
    const { width, height } = await action.boundingBox();
    assert.ok(width >= 44 && height >= 44, 'The native touch area must stay large');
    await action.evaluate(el => el.classList.add('is-active'));
    assert.notEqual(await background(action), 'rgba(0, 0, 0, 0)', 'The active action keeps its native background');
    await action.evaluate(el => el.classList.remove('is-active'));
    for (const name of ['.nav-folder-title-content', '.nav-file-title-content']) {
      assert.equal(await page.locator(name).evaluate(el => getComputedStyle(el).fontSize), '20px');
    }
    await page.locator('body').evaluate(el => el.style.setProperty('--font-ui-medium', '14px'));
    assert.equal(await page.locator('.nav-file-title-content').evaluate(el => getComputedStyle(el).fontSize), '16px');

    async function tap(target, expected = target) {
      const bounds = await page.locator(`[data-target="${target}"]`).boundingBox();
      assert.ok(bounds, `${target} must be visible`);
      await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      assert.equal(await page.locator('body').getAttribute('data-last-tapped'), expected, `Tap on ${target}`);
    }

    for (const target of ['sidebar', 'mode', 'more', 'note']) await tap(target);
    await page.locator('.workspace-drawer-backdrop').evaluate(el => { el.hidden = false; });
    await tap('sidebar', 'backdrop');
  } finally { await browser.close(); }
});

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
