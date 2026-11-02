// Optional reproducible historical comparison; not part of shallow-clone CI.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fixture, theme } from '../tests/lib/fixture.mjs';
import { measureSolidContrast } from '../tests/lib/cascade.mjs';

const ref = process.argv[2] || 'c28365c';
const baseline = execFileSync('git', ['show', `${ref}:theme.css`], { encoding:'utf8' });
const cases = [
  { palette:'rosepine', mode:'light', name:'Italic', element:'em' },
  { palette:'cappuccino', mode:'light', name:'Bold', element:'strong' },
  { palette:'cappuccino', mode:'light', name:'Italic', element:'em' },
  { palette:'solarized', mode:'dark', name:'Hovered internal link', element:'a' },
];
const report=[];
const browser=await chromium.launch();
try {
  for(const c of cases) for(const surface of ['background-primary','paper-surface','code-background']) {
    const measurements={};
    for(const [version,css] of [['before',baseline],['after',theme]]) {
      const page=await browser.newPage();
      await page.setContent(fixture);
      await page.addStyleTag({content:css});
      await page.evaluate(({c,surface})=>{
        document.body.className=`theme-${c.mode} eye-safe-palette-${c.palette}`;
        document.body.innerHTML=`<div class="markdown-rendered" style="background:var(--${surface})"><${c.element} ${c.element==='a'?'class="internal-link" href="#"':''} data-contrast>${c.name}</${c.element}></div>`;
      },{c,surface});
      if(c.element==='a') await page.locator('a').hover();
      const [m]=await page.evaluate(measureSolidContrast);
      measurements[version]={ratio:m.ratio,foreground:m.foreground,background:m.background};
      await page.close();
    }
    report.push({...c,surface,...measurements});
  }
} finally {await browser.close();}
await mkdir('docs/qa',{recursive:true});
await writeFile('docs/qa/contrast-before-after.json',JSON.stringify({baseline:ref,method:'Browser-resolved semantic colors on solid palette swatches; includes alpha. Does not measure antialiased glyph pixels or historical texture overlays.',measurements:report},null,2));
console.log(report.filter(r=>r.surface==='background-primary').map(r=>`${r.palette} ${r.mode} ${r.name}: ${r.before.ratio.toFixed(2)} → ${r.after.ratio.toFixed(2)}`).join('\n'));
