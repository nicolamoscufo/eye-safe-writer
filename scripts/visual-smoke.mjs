import {chromium} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
const css=await readFile(new URL('../theme.css',import.meta.url),'utf8');
await mkdir('visual-artifacts',{recursive:true});
const browser=await chromium.launch();
for(const [mode,w,h] of [['light',1280,800],['dark',1280,800],['light',390,820]]){
 const p=await browser.newPage({viewport:{width:w,height:h}});
 await p.setContent(`<!DOCTYPE html><html><head><style>
 body{margin:0;display:flex;background:var(--background-primary);color:var(--text-normal)}
 .workspace-ribbon{display:flex;flex-direction:column;width:44px;min-height:100vh}
 .side-dock-actions{display:flex;flex:1;flex-direction:column;gap:var(--eye-safe-ribbon-gap);padding-top:70px}
 .side-dock-ribbon-action{display:flex;align-items:center;justify-content:center;min-height:var(--eye-safe-ribbon-hit-area)}
 main{padding:28px;flex:1}.callout{padding:14px;margin:18px 0}
 </style></head><body class="theme-${mode} eye-safe-activity-academic eye-safe-enhanced-contrast"><aside class="workspace-ribbon mod-primary"><div class="side-dock-actions"><div class="side-dock-ribbon-action">⌂</div><div class="side-dock-ribbon-action">⌕</div><div class="side-dock-ribbon-action">⚙</div></div></aside><main class="markdown-rendered"><h1>Eye Safe Writer</h1><h2>Academic Mode</h2><p>Clear research notes and formulas.</p><div class="callout" data-callout="teorema"><div class="callout-title">Teorema</div><p>Expected value is linear.</p></div><div class="callout" data-callout="dimostrazione"><div class="callout-title">Dimostrazione</div><p>Apply the integral.</p></div><table><tr><th>Symbol</th><th>Meaning</th></tr><tr><td>E[X]</td><td>Expected value</td></tr></table></main></body></html>`);
 await p.addStyleTag({content:css});
 const boxes=await p.locator('.side-dock-ribbon-action').evaluateAll(xs=>xs.map(x=>{let r=x.getBoundingClientRect();return [r.top,r.bottom];}));
 for(let i=1;i<boxes.length;i++)if(boxes[i][0]<boxes[i-1][1])throw Error('Ribbon overlap');
 await p.screenshot({path:`visual-artifacts/${mode}-${w}.png`,fullPage:true});
 await p.close();
}
await browser.close();
