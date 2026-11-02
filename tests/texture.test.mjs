import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { palettes } from '../scripts/build-theme.mjs';
import { loadFixture } from './lib/fixture.mjs';
import { measureSvgLabels } from './lib/svg-contrast.mjs';

// Measure composited background pixels, not antialiased glyph pixels. The
// foreground is its browser-resolved CSS color; hide only probe ink while
// retaining actual SVG grain, fibers, blend mode, and radial paper background.
test('default textures preserve text contrast across all 16 rendered palettes',async()=>{
  const browser=await chromium.launch();
  const report=[],failures=[];
  const tokens=['text-normal','text-muted','text-faint','bold-color','italic-color','writer-yellow','writer-red','writer-blue','writer-green','writer-purple','writer-berry','writer-orange','link-color','link-color-hover','link-external-color','link-external-color-hover','link-unresolved-color','h1-color','h2-color','h3-color','h4-color','h5-color','h6-color'];
  const lum=rgb=>{
    const c=rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  };
  await mkdir('visual-artifacts',{recursive:true});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    await loadFixture(page);
    await page.addStyleTag({content:'.markdown-preview-sizer { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); column-gap:24px; }'});
    await page.locator('.markdown-preview-sizer').evaluate((el,tokens)=>{el.innerHTML=tokens.map(t=>`<p data-probe="${t}" style="color:var(--${t})">Readable palette text</p>`).join('');},tokens);
    for(const palette of Object.keys(palettes))for(const mode of ['light','dark']) {
      await page.evaluate(({palette,mode})=>{document.body.className=`theme-${mode} eye-safe-palette-${palette}`;}, {palette,mode});
      const probes=await page.locator('[data-probe]').evaluateAll(nodes=>nodes.map(el=>{
        const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle=getComputedStyle(el).color;ctx.fillRect(0,0,1,1);
        const foreground=[...ctx.getImageData(0,0,1,1).data].slice(0,3);
        const range=document.createRange();range.selectNodeContents(el);
        return {token:el.dataset.probe,foreground,rect:range.getBoundingClientRect().toJSON()};
      }));
      const hide=await page.addStyleTag({content:'[data-probe] { color:transparent !important; -webkit-text-fill-color:transparent !important; text-shadow:none !important; }'});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const screenshot=await page.screenshot();
      const png=PNG.sync.read(screenshot);
      await hide.evaluate(el=>el.remove());
      for(const p of probes) {
        assert.ok(p.rect.top>=0&&p.rect.bottom<=png.height,`${p.token} must be captured, not silently skipped`);
        let minimum=Infinity;
        for(let y=Math.ceil(p.rect.top);y<Math.floor(p.rect.bottom);y++)for(let x=Math.ceil(p.rect.left);x<Math.floor(p.rect.right);x++) {
          const i=(y*png.width+x)*4;
          const bg=[png.data[i],png.data[i+1],png.data[i+2]];
          const a=lum(p.foreground),b=lum(bg);
          minimum=Math.min(minimum,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));
        }
        const result={palette,mode,token:p.token,minimum};
        report.push(result);
        if(minimum<4.5)failures.push(result);
      }
      if(failures.some(f=>f.palette===palette&&f.mode===mode))await writeFile(`visual-artifacts/fixture-texture-${palette}-${mode}.png`,screenshot);
    }
  }finally{await browser.close();}
  await writeFile('visual-artifacts/texture-contrast.json',JSON.stringify({method:'Browser-resolved foreground colors against every background pixel within text probes; real composited default texture/gradient, no glyph antialiasing.',report,failures},null,2));
  assert.deepEqual(failures,[],JSON.stringify(failures,null,2));
});

test('SVG contrast sampling includes artwork fills and native dark-mode filters',async()=>{
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage({viewport:{width:500,height:200}});
    await page.setContent('<svg width="400" height="120" style="filter:invert(1) hue-rotate(180deg) saturate(1.25)"><rect x="0" y="0" width="400" height="120" fill="#ececff"/><foreignObject x="20" y="20" width="360" height="80"><div xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel" style="color:#333">Readable SVG label</span></div></foreignObject></svg>');
    const [probe]=await measureSvgLabels(page,'.nodeLabel');
    assert.ok(probe.filter.includes('invert(1)'));
    assert.ok(probe.foreground[0]>180,'Filtered foreground must be light, not the original #333');
    assert.ok(probe.minimum>=4.5,JSON.stringify(probe));
  }finally{await browser.close();}
});
