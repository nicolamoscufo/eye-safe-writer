// Opt-in native QA. All files, settings and plugins belong to a disposable vault
// and profile. Never opens, attaches to, or screenshots a personal vault.
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, readFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { palettes } from './build-theme.mjs';
import { measureSolidContrast } from '../tests/lib/cascade.mjs';
import { measureSvgLabels } from '../tests/lib/svg-contrast.mjs';

const executable = process.env.OBSIDIAN_PATH || 'C:\\Program Files\\Obsidian\\Obsidian.exe';
const version = process.env.OBSIDIAN_VERSION || '1.15.0';
const capture = process.argv.includes('--capture-release');
const temporary = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Temp', 'opencode') : tmpdir();
const root = await mkdtemp(path.join(temporary, 'eye-safe-native-'));
const vault = path.join(root, 'Eye Safe QA'), profile = path.join(root, 'profile');
const config = path.join(vault, '.obsidian');
const artifacts = `native-artifacts/${version}`;
await mkdir(path.join(config, 'themes', 'Eye Safe Writer'), { recursive:true });
await mkdir(profile, { recursive:true });
await mkdir(artifacts, { recursive:true });

async function githubRelease(repo, tag = 'latest') {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/${tag === 'latest' ? tag : `tags/${tag}`}`,{headers:process.env.GH_TOKEN?{Authorization:`Bearer ${process.env.GH_TOKEN}`}:{}});
  assert.equal(response.status, 200, `Official release lookup: ${repo}/${tag}`);
  return response.json();
}
async function download(asset) {
  assert.ok(asset?.browser_download_url?.startsWith('https://github.com/'), 'Expected a GitHub release asset');
  const response = await fetch(asset.browser_download_url);
  assert.equal(response.status, 200, asset.name);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (asset.digest) assert.equal(`sha256:${createHash('sha256').update(buffer).digest('hex')}`, asset.digest, asset.name);
  return buffer;
}

// Use public, digest-verified Obsidian code, retaining the installed Electron
// launcher. 1.13.0 was not published as a public GitHub release; test 1.13.4 too.
const release = await githubRelease('obsidianmd/obsidian-releases', `v${version}`);
const asar = release.assets.find(a => a.name === `obsidian-${version}.asar.gz`);
assert.ok(asar?.digest, 'Native application download must have a SHA-256 digest');
await writeFile(path.join(profile, `obsidian-${version}.asar`), gunzipSync(await download(asar)));

const plugins = [];
for (const repo of ['mgmeyers/obsidian-style-settings', 'obsidian-tasks-group/obsidian-tasks']) {
  const pluginRelease = await githubRelease(repo);
  const manifestAsset = pluginRelease.assets.find(a => a.name === 'manifest.json');
  const manifest = JSON.parse((await download(manifestAsset)).toString('utf8'));
  const destination = path.join(config, 'plugins', manifest.id);
  await mkdir(destination, { recursive:true });
  await writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest));
  for (const filename of ['main.js', 'styles.css']) {
    const asset = pluginRelease.assets.find(a => a.name === filename);
    if (filename === 'main.js') assert.ok(asset, `${repo} main.js`);
    if (asset) await writeFile(path.join(destination, filename), await download(asset));
  }
  plugins.push({ id:manifest.id, version:manifest.version, repository:repo });
}
await writeFile(path.join(profile, 'obsidian.json'), JSON.stringify({ autoUpdate:false, vaults:{ '0123456789abcdef':{ path:vault, ts:Date.now(), open:true } } }));
await writeFile(path.join(config, 'appearance.json'), JSON.stringify({ cssTheme:'Eye Safe Writer', theme:'moonstone', baseFontSize:16 }));
await writeFile(path.join(config, 'app.json'), JSON.stringify({ showInlineTitle:false, livePreview:true, spellcheck:false, safeMode:false }));
await writeFile(path.join(config, 'community-plugins.json'), JSON.stringify(plugins.map(p => p.id)));
await writeFile(path.join(config, 'core-plugins.json'), JSON.stringify(['file-explorer','global-search','switcher','backlink','outline','graph','canvas']));
for (const file of ['theme.css','manifest.json']) await copyFile(file, path.join(config,'themes','Eye Safe Writer',file));

const showcase = '# Eye Safe Writer\n\nA quiet place to think, study, and write.\n\nClear **emphasis**, thoughtful *details*, and [[Research notes|connected ideas]].\n\n## Research notes\n\n> [!theorem] A useful result\n> The expectation of a sum is the sum of the expectations.\n\n> [!proof] From idea to understanding\n> Check assumptions and write the reasoning.\n';
const aliases = ['note','info','tip','warning','danger','quote','definition','definizione','formula','example','esempio','exercise','esercizio','doubt','dubbio','theorem','teorema','proof','dimostrazione','lemma','important','importante'];
const qa = '# Palette verification\n\nNormal **bold** and *italic* text; [[Eye Safe Writer|internal]], [external](https://obsidian.md), [[Unresolved note]]. #study\n\n## Second heading\n### Third heading\n#### Fourth heading\n##### Fifth heading\n###### Sixth heading\n\n$$\\mathbb{E}[X]=\\sum_x xP(X=x)$$\n\n```mermaid\ngraph LR\n  Question --> Evidence --> Understanding\n```\n\n' + aliases.map(type => `> [!${type}] ${type}\n> Readable **emphasis** and *details*.\n`).join('\n') + '\n```js\n// A useful calculation\nconst total = values.reduce((sum, value) => sum + value, 0);\n```\n\n- [ ] Open task\n- [x] Completed task\n  - Nested task\n\n```tasks\nnot done\nlimit 3\n```\n';
for (const [filename, content] of [['Eye Safe Writer.md',showcase],['Research notes.md',qa],['Study callouts.md',await readFile('examples/study-callouts.md','utf8')],['Academic notes.md',await readFile('examples/academic-notes.md','utf8')],['Long document.md','# Long document\n\n'+('A long document with **emphasis** and [[Eye Safe Writer|links]].\n\n'.repeat(1000))+'\n```text\n'+'wide_code_'.repeat(200)+'\n```\n\n|'+(' Column |'.repeat(24))+'\n|'+(' --- |'.repeat(24))+'\n|'+(' WideColumnWithoutSpaces |'.repeat(24))+'\n']]) await writeFile(path.join(vault,filename),content);

const proc = spawn(executable,[`--user-data-dir=${profile}`,'--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--disable-gpu','--no-sandbox'],{ stdio:['ignore','pipe','pipe'] });
const endpoint = await new Promise((resolve,reject) => {
  proc.once('error',reject);
  proc.once('exit',code => reject(new Error(`Obsidian exited early: ${code}`)));
  proc.stderr.on('data',data => { const m=String(data).match(/DevTools listening on (ws:\/\/[^\s]+)/); if(m) resolve(m[1]); });
});
const browser = await chromium.connectOverCDP(endpoint);
const errors = [], measurements = [], diagramMeasurements = [], cases = [];
let nativePdf;
let runtime;
try {
  const context = browser.contexts()[0];
  context.on('page',p=>p.on('pageerror',error=>errors.push(error.message)));
  const page = context.pages()[0] || await context.waitForEvent('page',{timeout:60000});
  page.on('pageerror',error => errors.push(error.message));
  page.on('console',message => { if(message.type()==='error') console.error('Native console:',message.text()); });
  await page.waitForFunction(() => window.app?.workspace?.layoutReady,null,{timeout:60000});
  runtime = await page.evaluate(p => ({ app:JSON.parse(require('fs').readFileSync(p+'/package.json','utf8')).version, electron:process.versions.electron, chromium:process.versions.chrome, vault:app.vault.getName() }),path.join(profile,`obsidian-${version}.asar`));
  assert.equal(runtime.vault,'Eye Safe QA');
  assert.equal(runtime.app,version);
  // This trust decision applies only to our own freshly created QA vault and
  // the two public plugins explicitly requested for compatibility testing.
  const trust = page.getByRole('button',{name:/I trust|Mi fido/});
  if (await trust.count()) {
    // Native trust asynchronously loads plugins and then opens Community
    // Plugins. Wait for that final navigation, not just plugin constructors.
    const popup=context.waitForEvent('page',{timeout:15000}).catch(()=>null);
    await trust.click();
    await popup;
    await page.waitForFunction(()=>app.setting.activeTab?.id==='community-plugins',null,{timeout:60000});
  }
  await page.waitForFunction(ids => ids.every(id => app.plugins.plugins[id]),plugins.map(p => p.id),{timeout:60000});
  await page.setViewportSize({width:1280,height:800});
  const settle = () => page.evaluate(() => Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations !== Infinity).map(a=>a.finished.catch(()=>{}))));
  const state = async (palette,mode,preset='default',extra='') => {
    await page.evaluate(({palette,mode,preset,extra}) => {
      for (const c of [...document.body.classList]) if(c.startsWith('eye-safe-') || c==='theme-light' || c==='theme-dark') document.body.classList.remove(c);
      document.body.classList.add(`theme-${mode}`,`eye-safe-palette-${palette}`,`eye-safe-activity-${preset}`,...extra.split(' ').filter(Boolean));
    },{palette,mode,preset,extra});
    await settle();
  };
  const open = async (filename,mode='preview',source=false) => {
    await page.evaluate(async ({filename,mode,source}) => {
      app.vault.setConfig('livePreview',!source);
      await app.workspace.getLeaf(false).setViewState({type:'markdown',state:{file:filename,mode,source}});
    },{filename,mode,source});
    await page.locator(mode==='preview'?'.markdown-reading-view .markdown-rendered':'.markdown-source-view .cm-content').first().waitFor({state:'visible',timeout:30000});
    if(mode==='preview') {
      const text=await readFile(path.join(vault,filename),'utf8');
      await page.waitForFunction(text=>{const r=app.workspace.activeLeaf.view.previewMode.renderer;return r.text===text&&r.lastText===text&&!r.parsing;},text,{timeout:60000});
      await page.evaluate(()=>{const view=app.workspace.activeLeaf.view;view.scroll=0;view.previewMode.renderer.applyScrollDelayed(0);});
    }
    await settle();
  };
  const endOfNote = async () => {
    await page.evaluate(()=>{const view=app.workspace.activeLeaf.view;view.previewMode.renderer.applyScrollDelayed(view.data.split('\n').length-2);});
    await page.locator('.markdown-preview-view').evaluate(el=>{el.tabIndex=0;el.focus();el.scrollTop=el.scrollHeight;});
    await page.keyboard.press('Control+End');
  };

  // Verify real Style Settings controls, not just our YAML parser.
  let settingsPage=context.pages().find(p=>p!==page);
  if(!settingsPage) {
    const settingsWindow = context.waitForEvent('page',{timeout:10000}).catch(()=>null);
    await page.evaluate(() => app.setting.open());
    settingsPage = await settingsWindow || page;
  }
  await page.evaluate(() => app.setting.openTabById('obsidian-style-settings'));
  await settingsPage.getByText('Eye Safe Writer',{exact:true}).last().click();
  const activity = settingsPage.locator('.setting-item').filter({has:settingsPage.locator('.setting-item-name',{hasText:/^Activity preset$/})}).locator('select:not(.is-measuring)');
  if(!await activity.isVisible()) await settingsPage.getByText('Activity Presets',{exact:true}).click();
  await activity.selectOption({label:'Academic / Research'});
  assert.equal(await page.evaluate(()=>document.body.classList.contains('eye-safe-activity-academic')),true);
  await activity.selectOption({label:'Default (current appearance)'});
  await settingsPage.screenshot({path:`${artifacts}/settings.png`});
  if(settingsPage!==page) await settingsPage.close();
  else await page.evaluate(()=>app.setting.close());

  await open('Research notes.md');
  await page.locator('.markdown-reading-view mjx-container:visible').first().waitFor({state:'visible',timeout:30000});
  // Older public builds separately ask whether this vault's authored Mermaid
  // source may execute. Approve only this self-created, known diagram.
  await page.waitForFunction(()=>document.querySelector('.markdown-reading-view .mermaid svg')||[...document.querySelectorAll('.markdown-reading-view button')].some(b=>/^(Allow|Consenti)$/.test(b.textContent.trim())),null,{timeout:30000});
  const mermaidConsent=page.getByRole('button',{name:/^(Allow|Consenti)$/});
  if(await mermaidConsent.count())await mermaidConsent.click();
  await page.locator('.markdown-reading-view .mermaid svg:visible').first().waitFor({state:'visible',timeout:30000});
  // Mark actual native-rendered components for measured semantic/opacity paint.
  const mark = () => page.evaluate(() => {
    document.querySelectorAll('[data-contrast]').forEach(n=>delete n.dataset.contrast);
    for(const n of document.querySelectorAll('.markdown-reading-view :is(h1,h2,h3,h4,h5,h6,p,strong,em,a.tag,a.internal-link,a.external-link), .nav-file-title-content, .workspace-tab-header-inner-title')) {
      // foreignObject labels are SVG artwork, not Markdown prose. Their fills
      // and native dark-mode filters are checked separately against pixels.
      if(n.closest('.mermaid'))continue;
      if(n.getBoundingClientRect().width && getComputedStyle(n).display!=='none') {n.dataset.contrast='4.5';n.dataset.name=(n.className||n.tagName)+'/'+n.textContent.slice(0,30);}
    }
    for(const n of document.querySelectorAll('.workspace-ribbon .side-dock-ribbon-action svg,.nav-header .clickable-icon svg')) {n.dataset.contrast='3';n.dataset.name='native-navigation-icon';}
  });
  for(const palette of Object.keys(palettes)) for(const mode of ['light','dark']) {
    await state(palette,mode);
    await mark();
    const result=await page.evaluate(measureSolidContrast);
    assert.ok(result.length>=12,'Native measurements must include rendered content and navigation');
    const failures=result.filter(m=>m.ratio<m.minimum);
    measurements.push({palette,mode,checks:result.length,minimum:Math.min(...result.map(m=>m.ratio)),textMinimum:Math.min(...result.filter(m=>m.minimum===4.5).map(m=>m.ratio)),uiMinimum:Math.min(...result.filter(m=>m.minimum===3).map(m=>m.ratio)),failures});
    const diagram=await measureSvgLabels(page);
    assert.equal(diagram.length,3,'All three real Mermaid labels must be measured');
    diagramMeasurements.push({palette,mode,labels:diagram});
    // Keep all failures as audit evidence before failing at the end.
    for(const preset of ['default','study','writing','code','academic']) {
      await state(palette,mode,preset);
      // This vault intentionally has Obsidian's saved 16px baseFontSize. Native
      // font overrides must win; preset line height/width must still change.
      assert.equal(await page.evaluate(()=>parseFloat(getComputedStyle(document.body).getPropertyValue('--font-text-size'))),16,`Native font override ${preset}`);
      assert.equal(await page.evaluate(()=>parseFloat(getComputedStyle(document.body).getPropertyValue('--line-height-normal'))),({default:1.72,study:1.8,writing:1.85,code:1.6,academic:1.78})[preset],`Native preset line height ${preset}`);
      assert.equal(await page.evaluate(()=>parseFloat(getComputedStyle(document.body).getPropertyValue('--file-line-width'))),({default:700,study:760,writing:660,code:1000,academic:820})[preset],`Native preset width ${preset}`);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Native root overflow');
      cases.push({palette,mode,preset,view:'reading',savedNativeFontSize:16});
    }
  }

  // Real editor modes, long-document virtualization, Tasks and native callouts.
  for(const source of [false,true]) {
    await open('Research notes.md','source',source);
    await page.waitForFunction(expected=>document.querySelector('.markdown-source-view')?.classList.contains('is-live-preview')===expected,!source);
    await page.locator('.cm-content').first().focus();
    await settle();
    const rows=await page.locator('.workspace-ribbon .side-dock-actions .side-dock-ribbon-action').evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return [r.top,r.bottom];}));
    for(let i=1;i<rows.length;i++) assert.ok(rows[i][0]>=rows[i-1][1],'Native ribbon overlap');
    const toggle=await page.locator('.sidebar-toggle-button.mod-left').boundingBox();
    assert.ok(toggle.y+toggle.height<=rows[0][0],'Native sidebar toggle overlaps first ribbon action');
    assert.equal(await page.locator('.workspace-ribbon').first().evaluate(el=>getComputedStyle(el).filter),'none');
    await page.screenshot({path:`${artifacts}/${source?'source':'live-preview'}.png`});
    cases.push({view:source?'source':'live-preview',native:true});
  }
  await open('Long document.md');
  await endOfNote();
  await page.locator('.markdown-preview-view pre').first().waitFor({state:'visible',timeout:30000});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Native long-document page overflow');
  assert.ok(await page.locator('.markdown-preview-view').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Native long-document reading view overflow');
  assert.ok(await page.locator('.markdown-preview-view pre').evaluate(el=>el.scrollWidth>el.clientWidth || (getComputedStyle(el).whiteSpace.includes('wrap') && el.clientHeight>parseFloat(getComputedStyle(el).lineHeight)*2)),'Native wide code must wrap per app settings or scroll locally');
  assert.ok(await page.locator('.markdown-preview-view .el-table').evaluate(el=>el.scrollWidth>el.clientWidth),'Native wide table must scroll locally');
  await page.screenshot({path:`${artifacts}/long-document.png`});
  await open('Research notes.md');
  await endOfNote();
  await page.locator('.plugin-tasks-query-result').first().waitFor({state:'visible',timeout:30000});
  cases.push({view:'reading',features:['MathJax','Mermaid','Tasks query','nested lists','checkboxes','native callouts','long document','wide table','wide code']});

  // Native sidebar toggle must work without colliding with app/plugin actions.
  await page.evaluate(()=>app.workspace.leftSplit.collapse());
  assert.equal(await page.evaluate(()=>app.workspace.leftSplit.collapsed),true);
  await page.locator('.sidebar-toggle-button.mod-left').click();
  assert.equal(await page.evaluate(()=>app.workspace.leftSplit.collapsed),false);

  await open('Eye Safe Writer.md');
  await page.setViewportSize({width:1024,height:576});
  for(const mode of ['light','dark']) for(const preset of ['default','academic']) {
    await state('salvia',mode,preset);
    await page.screenshot({path:`${artifacts}/${mode}-${preset}.png`});
  }
  // Narrow desktop is real app QA, not a claim about an Android/iOS binary.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>app.workspace.leftSplit.collapse());
  await page.screenshot({path:`${artifacts}/narrow-desktop.png`});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Native narrow desktop overflow');
  await page.setViewportSize({width:1024,height:576});
  await page.evaluate(()=>app.workspace.leftSplit.expand());
  await state('salvia','light');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.bringToFront();
  await page.keyboard.press('Tab');
  // Older core ribbons use non-focusable div wrappers. CSS cannot give those
  // tabindex semantics; verify a genuinely focusable native Markdown link.
  const keyboardTarget=page.locator('.markdown-reading-view a.internal-link').first();
  await keyboardTarget.focus();
  assert.equal(await keyboardTarget.evaluate(el=>document.activeElement===el),true,'Native link must actually receive keyboard focus');
  assert.equal(await keyboardTarget.evaluate(el=>getComputedStyle(el).outlineStyle),'solid','Native keyboard focus must remain visible');
  assert.ok(parseFloat(await page.locator('.nav-file-title').first().evaluate(el=>getComputedStyle(el).transitionDuration))<=.001,'Native reduced-motion transitions');
  await page.screenshot({path:`${artifacts}/keyboard.png`});
  await open('Academic notes.md');
  await page.locator('.markdown-reading-view mjx-container:visible').first().waitFor({state:'visible',timeout:30000});
  await page.emulateMedia({media:'print'});
  await state('cappuccino','dark','academic','eye-safe-print-academic');
  assert.equal(await page.locator('.markdown-reading-view').evaluate(el=>getComputedStyle(el).color),'rgb(32, 32, 32)','Native dark-palette print color');
  // Electron deliberately omits CDP Page.printToPDF. Exercise Obsidian's own
  // export renderer/backend instead. Capture its real modal instance briefly
  // through the shared Modal.open prototype; only supply the output filepath
  // normally chosen in the OS file dialog. No document/CSS renderer is mocked.
  nativePdf=await page.evaluate(async filepath=>{
    let modal;
    const patches=[];
    for(let proto=Object.getPrototypeOf(app.setting);proto;proto=Object.getPrototypeOf(proto)) {
      if(Object.hasOwn(proto,'open')&&typeof proto.open==='function') {
        const original=proto.open;
        proto.open=function(...args){modal=this;return original.apply(this,args);};
        patches.push([proto,original]);
      }
    }
    try {app.workspace.activeLeaf.view.printToPdf();}
    finally {for(const [proto,original] of patches)proto.open=original;}
    if(!modal||typeof modal.printToPdf!=='function')throw Error('Native PDF export modal was not captured');
    modal.close();
    await modal.printToPdf({filepath,includeName:false,pageSize:'A4',landscape:false,marginsType:0,scaleFactor:100,scale:1,open:false});
    const pdf=require('fs').readFileSync(filepath);
    if(pdf.subarray(0,5).toString()!=='%PDF-'||pdf.length<1000)throw Error('Native PDF export did not produce a valid artifact');
    return {bytes:pdf.length,exporter:'Obsidian native PDF modal/renderer and Electron backend',fileDialog:'QA supplied the artifact path; OS file picker not tested'};
  },path.resolve(`${artifacts}/academic.pdf`));
  await page.emulateMedia({media:'screen',reducedMotion:'no-preference'});
  await open('Eye Safe Writer.md');

  // Honest before/after capture: previous CSS in this same native app/vault.
  const baselineRef=process.env.OBSIDIAN_BASELINE_REF||'c28365c';
  const baseline=execFileSync('git',['show',`${baselineRef}:theme.css`],{encoding:'utf8'});
  const themeSelector=await page.evaluate(()=>[...document.querySelectorAll('style')].findIndex(s=>s.textContent.includes('/* @settings\nname: Eye Safe Writer')));
  assert.ok(themeSelector>=0,'Loaded native theme stylesheet');
  const current=await page.locator('style').nth(themeSelector).textContent();
  await state('salvia','light');
  await page.locator('style').nth(themeSelector).evaluate((el,css)=>{el.textContent=css;},baseline);
  await settle();
  await page.screenshot({path:`${artifacts}/baseline-${baselineRef}.png`});
  await page.locator('style').nth(themeSelector).evaluate((el,css)=>{el.textContent=css;},current);
  await settle();

  if(capture) {
    await mkdir('screenshots',{recursive:true});
    for(const [source,destination] of [['light-default','obsidian-light'],['dark-academic','obsidian-dark-academic'],['narrow-desktop','obsidian-narrow-desktop'],['settings','obsidian-style-settings']]) await copyFile(`${artifacts}/${source}.png`,`screenshots/${destination}.png`);
    const source=await readFile(`${artifacts}/light-default.png`);
    const thumbnail=await page.evaluate(async base64=>{
      const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=288;
      const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,512,288);
      return canvas.toDataURL('image/png').split(',')[1];
    },source.toString('base64'));
    await writeFile('screenshot.png',Buffer.from(thumbnail,'base64'));
  }
  const evidence={date:new Date().toISOString(),scope:'Real Windows Obsidian renderer, installed Electron launcher, isolated public-note vault/profile. Narrow desktop is not a native mobile app test.',runtime,plugins,isolated:true,cases,measurements,diagramMeasurements,nativePdf,errors,baselineRef};
  await writeFile(`${artifacts}/evidence.json`,JSON.stringify(evidence,null,2));
  assert.deepEqual(errors,[],'Native renderer errors');
  const failures=measurements.flatMap(x=>x.failures.map(m=>({palette:x.palette,mode:x.mode,...m})));
  assert.deepEqual(failures,[],`Native contrast failures: ${JSON.stringify(failures.slice(0,12))}`);
  assert.deepEqual(diagramMeasurements.flatMap(c=>c.labels.filter(l=>l.minimum<4.5).map(l=>({palette:c.palette,mode:c.mode,...l}))),[],'Native filtered SVG label contrast');
  console.log(`Native Obsidian ${version}: ${cases.length} cases, ${measurements.reduce((n,m)=>n+m.checks,0)} color/UI checks; plugins ${plugins.map(p=>`${p.id} ${p.version}`).join(', ')}; artifacts ${artifacts}`);
} catch(error) {
  await writeFile(`${artifacts}/failure.json`,JSON.stringify({runtime,errors,measurements,error:String(error)},null,2));
  for(const page of browser.contexts()[0]?.pages()||[]) await page.screenshot({path:`${artifacts}/failure.png`}).catch(()=>{});
  await writeFile(`${artifacts}/failure-dom.json`,JSON.stringify(await Promise.all((browser.contexts()[0]?.pages()||[]).map(async p=>({url:p.url(),text:await p.locator('body').innerText().catch(()=>''),html:await p.locator('body').innerHTML().catch(()=>'' )}))),null,2));
  throw error;
} finally {
  // Only this launch's process is terminated. The disposable profile is retained
  // outside Git for diagnosis; remove it manually when no longer needed.
  proc.kill();
  await browser.close();
}
