import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const css=await readFile(new URL('../theme.css',import.meta.url),'utf8');
const m=JSON.parse(await readFile(new URL('../manifest.json',import.meta.url),'utf8'));
test('manifest compatibility and release',()=>{assert.equal(m.version,'1.8.0');assert.equal(m.minAppVersion,'1.13.0');});
test('unique settings IDs',()=>{const settings=css.match(/\/\* @settings([\s\S]*?)\*\//)[1];const ids=[...settings.matchAll(/^\s+id: ([\w-]+)$/gm)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);});
test('academic and accessibility controls',()=>{for(const s of ['eye-safe-activity-academic','eye-safe-paragraph-focus','eye-safe-print-academic','eye-safe-enhanced-contrast','data-callout="teorema"','data-callout="proof"','data-callout="important"'])assert.ok(css.includes(s),s);});
test('CSS braces remain balanced',()=>{const c=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'""');let n=0;for(const ch of c){if(ch==='{')n++;if(ch==='}')assert.ok(--n>=0);}assert.equal(n,0);});
test('accessibility and print safeguards',()=>{for(const s of ['prefers-reduced-motion','forced-colors','@media print','max-width: 700px'])assert.ok(css.includes(s));});
test('Salvia primary text is >= WCAG AA',()=>{const lum=h=>{let v=h.slice(1).match(/.{2}/g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};for(const [a,b] of [['#34302b','#f4f0e7'],['#d8d2c4','#20211e']]){const x=lum(a),y=lum(b);assert.ok((Math.max(x,y)+.05)/(Math.min(x,y)+.05)>=4.5);}});

test('all 16 built-in palette text colors and Enhanced Contrast reach AA', () => {
  const names = ['salvia','gruvbox','amoled','tokyo','rosepine','solarized','nord','cappuccino'];
  const parse = h => h.slice(1).match(/.{2}/g).map(x => parseInt(x,16));
  const lum = rgb => {
    const c=rgb.map(x=>x/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  };
  const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  for(const name of names)for(const mode of ['light','dark']){
    const selector='.theme-'+mode+(name==='salvia'?'':'.eye-safe-palette-'+name);
    const escaped=selector.replace(/\./g,'\\.');
    const block=css.match(new RegExp(escaped+'\\s*\\{([\\s\\S]*?)\\n\\}'));
    assert.ok(block,'Missing palette '+selector);
    const vals=Object.fromEntries([...block[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
    const normal=parse(vals['--text-normal']),bg=parse(vals['--background-primary']);
    assert.ok(contrast(normal,bg)>=4.5,selector+' base text failed');
    for(const pct of [0.97,0.95]){
      const mixed=normal.map((v,i)=>v*pct+bg[i]*(1-pct));
      assert.ok(contrast(mixed,bg)>=4.5,selector+' Enhanced Contrast '+pct+' failed');
    }
  }
});
