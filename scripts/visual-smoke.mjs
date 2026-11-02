// This is a simulated shell, not Obsidian/CodeMirror/plugin execution evidence.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { palettes } from './build-theme.mjs';
import { loadFixture, callout } from '../tests/lib/fixture.mjs';

await mkdir('visual-artifacts', { recursive: true });
const browser = await chromium.launch();
const evidence = [], errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: width === 1280 ? 800 : 844 });
    await loadFixture(page);
    await page.locator('#sample-callouts').evaluate((el, html) => { el.innerHTML = html; }, callout('theorem') + callout('proof'));
    for (const palette of Object.keys(palettes)) for (const mode of ['light', 'dark']) for (const preset of ['default', 'study', 'writing', 'code', 'academic']) {
      const classes = `theme-${mode} eye-safe-palette-${palette} eye-safe-activity-${preset}${width < 700 ? ' is-mobile is-phone mod-android' : ''}`;
      await page.evaluate(c => { document.body.className = c; }, classes);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), classes + ' page overflow');
      const expected = width < 700 ? 16 : ({ default:16.5, study:17, writing:18, code:16, academic:17 })[preset];
      assert.equal(await page.evaluate(() => parseFloat(getComputedStyle(document.body).getPropertyValue('--font-text-size'))), expected, classes);
      const rows = await page.locator('.side-dock-actions .side-dock-ribbon-action').evaluateAll(nodes => nodes.map(n => { const r=n.getBoundingClientRect(); return { top:r.top, bottom:r.bottom }; }));
      if (width > 700) {
        for (let i=1; i<rows.length; i++) assert.ok(rows[i].top >= rows[i-1].bottom + 3.5, 'Ribbon overlap');
        const toggle = await page.locator('.sidebar-toggle-button').boundingBox();
        assert.ok(toggle.y + toggle.height <= rows[0].top, 'Sidebar toggle overlaps first action');
        assert.equal(await page.locator('.workspace-ribbon').evaluate(el => getComputedStyle(el).filter), 'none');
      } else assert.equal(await page.locator('.workspace-ribbon').isVisible(), false, 'Fixture mobile classes must be present');
      for (const view of ['reading', 'live-preview', 'source']) {
        await page.evaluate(view => {
          document.querySelector('.markdown-reading-view').hidden = view !== 'reading';
          const source = document.querySelector('.markdown-source-view');
          source.hidden = view === 'reading';
          source.classList.toggle('is-live-preview', view === 'live-preview');
        }, view);
        if (view !== 'reading') await page.locator('.cm-content').focus();
        if (palette === 'salvia' && ['default','academic'].includes(preset) && view !== 'source') await page.screenshot({ path:`visual-artifacts/fixture-${mode}-${preset}-${width}-${view}.png` });
      }
      evidence.push({ palette, mode, preset, width, views:['reading','live-preview','source'] });
    }
    // Regression content deliberately wider/longer than the viewport.
    await page.evaluate(() => {
      document.querySelector('.markdown-source-view').hidden = true;
      document.querySelector('.markdown-reading-view').hidden = false;
      document.querySelector('pre code').textContent = 'wide_code_'.repeat(100);
      document.querySelector('table').innerHTML = '<tr>' + '<td>WideColumnWithoutSpaces</td>'.repeat(16) + '</tr>';
      document.querySelector('.markdown-preview-sizer').insertAdjacentHTML('beforeend', '<p>Long document paragraph.</p>'.repeat(400));
    });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Wide content escapes page');
    assert.ok(await page.locator('pre').evaluate(el => el.scrollWidth > el.clientWidth), 'Wide code must scroll locally');
    assert.ok(await page.locator('.table-wrapper').evaluate(el => el.scrollWidth > el.clientWidth || el.querySelector('table').scrollWidth > el.querySelector('table').clientWidth), 'Wide table must scroll locally (wrapper or narrow table)');
  }
  // Native geometry belongs to native:smoke; this tests configured row spacing.
  await page.setViewportSize({ width:1280, height:400 });
  await loadFixture(page, 'theme-light eye-safe-ui-compact');
  await page.locator('.side-dock-actions').evaluate(el => { el.insertAdjacentHTML('beforeend', '<button class="side-dock-ribbon-action clickable-icon">+</button>'.repeat(25)); });
  assert.ok(await page.locator('.side-dock-actions').evaluate(el => el.scrollHeight > el.clientHeight));
  await page.evaluate(() => { document.body.style.setProperty('--eye-safe-ribbon-gap','24px'); document.body.style.setProperty('--eye-safe-ribbon-hit-area','48px'); });
  assert.equal(await page.locator('.side-dock-ribbon-action').first().evaluate(el => el.getBoundingClientRect().height),48);
  await page.evaluate(() => { document.body.classList.add('css-settings-manager'); });
  await page.addStyleTag({ content:'body.css-settings-manager { --font-text-size:19px; --file-line-width:940px; }' });
  await page.evaluate(() => document.body.classList.add('eye-safe-activity-academic'));
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--font-text-size').trim()),'19px');
  await page.addStyleTag({content:'.markdown-preview-sizer { --text-normal:#123456; }'});
  assert.equal(await page.locator('.markdown-preview-sizer').evaluate(el => getComputedStyle(el).color),'rgb(18, 52, 86)');
  await page.addStyleTag({content:'body.css-settings-manager { --tag-color:#5f2f7f; --link-external-color:#684020; }'});
  await page.locator('.markdown-preview-sizer').evaluate(el=>el.insertAdjacentHTML('afterbegin','<p><a class="tag">#custom</a> <a class="external-link" href="#">External override</a></p>'));
  assert.equal(await page.locator('a.tag').evaluate(el=>getComputedStyle(el).color),'rgb(95, 47, 127)','Saved tag color must not be hardwired to writer-purple');
  assert.equal(await page.locator('a.external-link').evaluate(el=>getComputedStyle(el).color),'rgb(104, 64, 32)','External links must keep their own color token');
  await page.emulateMedia({ reducedMotion:'reduce' });
  assert.ok(parseFloat(await page.locator('.nav-file-title').first().evaluate(el => getComputedStyle(el).transitionDuration)) <= .001);
  await page.emulateMedia({ forcedColors:'active' });
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.sidebar-toggle-button').evaluate(el => getComputedStyle(el).outlineStyle),'solid');
  await page.emulateMedia({ forcedColors:'none', reducedMotion:'no-preference' });
  await page.setViewportSize({width:1280,height:800});
  await loadFixture(page,'theme-dark eye-safe-palette-cappuccino eye-safe-activity-academic');
  await page.locator('.modal').evaluate(el => { el.hidden=false; });
  await page.locator('select').focus();
  assert.ok(await page.locator('select').evaluate(el => el.getBoundingClientRect().right <= innerWidth));
  await page.screenshot({path:'visual-artifacts/fixture-settings.png'});
  await page.locator('.modal').evaluate(el => { el.hidden=true; });
  for (const palette of Object.keys(palettes)) {
    await page.evaluate(p => { document.body.className=`theme-dark eye-safe-palette-${p} eye-safe-print-academic`; },palette);
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.markdown-reading-view').evaluate(el => getComputedStyle(el).color),'rgb(32, 32, 32)',`Print ${palette}`);
    assert.equal(await page.locator('.workspace-ribbon').isVisible(),false);
    assert.equal(await page.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--text-on-accent').trim()),'#fff','Printed checkbox markers must remain light on their dark checked background');
    assert.equal(await page.locator('.workspace-leaf-content[data-type="markdown"]').evaluate(el => getComputedStyle(el,'::before').display),'none');
  }
  await page.pdf({path:'visual-artifacts/fixture-academic.pdf',format:'A4'});
  assert.deepEqual(errors,[]);
  await writeFile('visual-artifacts/smoke.json',JSON.stringify({ scope:'Simulated HTML only; not native Obsidian or mobile app compatibility.', cases:evidence, errors },null,2));
  console.log(`Fixture smoke: ${evidence.length} palette/preset/layout cases, three simulated views each; screenshots, settings and PDF captured.`);
} finally { await browser.close(); }
