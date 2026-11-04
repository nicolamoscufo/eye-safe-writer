// Browser regression coverage for the native QA reader; never app certification.
import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { loadFixture } from './lib/fixture.mjs';
import { checkRibbonLayout } from '../scripts/lib/ribbon-qa.mjs';

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function fixture(fn) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try { await loadFixture(page, 'theme-light'); await fn(page); }
  finally { await page.close(); }
}

test('rendered ribbon geometry passes in light and dark simulated shells', () => fixture(async page => {
  for (const mode of ['light', 'dark']) {
    await page.evaluate(mode => { document.body.className = `theme-${mode}`; }, mode);
    const layout = await checkRibbonLayout(page, true);
    assert.ok(layout.actions.length >= 3);
  }
}));

test('display:none ribbon does not dereference missing row geometry', () => fixture(async page => {
  await page.locator('.workspace-ribbon').evaluate(el => { el.style.display = 'none'; });
  const layout = await checkRibbonLayout(page, false);
  assert.deepEqual(layout.actions, []);
  assert.equal(layout.toggle, null);
  assert.equal(await page.locator('.cm-content').count(), 1);
}));

test('absent ribbon with a separately rendered sidebar toggle is valid', () => fixture(async page => {
  await page.evaluate(() => {
    const toggle = document.querySelector('.sidebar-toggle-button');
    toggle.classList.add('mod-left');
    document.querySelector('.workspace').append(toggle);
    document.querySelector('.workspace-ribbon').remove();
  });
  const layout = await checkRibbonLayout(page, false);
  assert.equal(layout.present, false);
  assert.ok(layout.toggle);
}));

test('visible DOM with missing actions or toggle remains a failing regression', () => fixture(async page => {
  await page.locator('.side-dock-actions').evaluate(el => { el.hidden = true; el.style.display = 'none'; });
  await assert.rejects(checkRibbonLayout(page, true), /rendered action rows/);
  await loadFixture(page, 'theme-light');
  await page.locator('.sidebar-toggle-button').evaluate(el => el.remove());
  await assert.rejects(checkRibbonLayout(page, true), /rendered sidebar toggle/);
}));

test('actual rendered overlaps remain failures', () => fixture(async page => {
  await page.locator('.side-dock-actions .side-dock-ribbon-action').nth(1).evaluate(el => { el.style.transform = 'translateY(-100px)'; });
  await assert.rejects(checkRibbonLayout(page, true), /Native ribbon overlap/);
  await loadFixture(page, 'theme-light');
  await page.locator('.sidebar-toggle-button').evaluate(el => { el.style.top = '80px'; });
  await assert.rejects(checkRibbonLayout(page, true), /toggle overlaps/);
}));

test('hidden ribbon rejects a visible expectation instead of skipping checks', () => fixture(async page => {
  await page.locator('.workspace-ribbon').evaluate(el => { el.style.display = 'none'; });
  await assert.rejects(checkRibbonLayout(page, true), /visibility must match/);
}));
