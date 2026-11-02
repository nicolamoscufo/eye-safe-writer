import { PNG } from 'pngjs';

// SVG fills are not ancestor CSS backgrounds. Measure the rendered artwork
// under ink-hidden labels; use Canvas's real CSS-filter implementation for ink.
export async function measureSvgLabels(page,selector='.mermaid .nodeLabel, .mermaid .pele-label') {
  const probes=await page.locator(selector).evaluateAll(nodes=>nodes.map((node,index)=>{
    const text=node.querySelector('p,text')||node;
    const style=getComputedStyle(text);
    const filters=[];
    let opacity=1;
    for(let ancestor=text;ancestor;ancestor=ancestor.parentElement) {
      const s=getComputedStyle(ancestor);
      opacity*=Number(s.opacity);
      if(s.filter!=='none') {
        if(s.filter.includes('url('))throw Error('SVG URL filters require a separate paint test');
        filters.push(s.filter);
      }
    }
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const filter=filters.join(' ')||'none';
    ctx.filter=filter;
    if(filter!=='none'&&ctx.filter==='none')throw Error('Canvas cannot resolve native SVG filters');
    ctx.fillStyle=text.tagName.toLowerCase()==='text'?style.fill:style.color;
    ctx.fillRect(0,0,1,1);
    const foreground=[...ctx.getImageData(0,0,1,1).data];
    foreground[3]=foreground[3]/255*opacity;
    node.dataset.svgContrastProbe=String(index);
    return {label:node.textContent.trim(),foreground,filter,rect:node.getBoundingClientRect().toJSON()};
  }));
  const hide=await page.addStyleTag({content:'[data-svg-contrast-probe], [data-svg-contrast-probe] * { color:transparent !important; -webkit-text-fill-color:transparent !important; fill:transparent !important; stroke:transparent !important; text-shadow:none !important; }'});
  let screenshot;
  try {screenshot=await page.screenshot();}
  finally {await hide.evaluate(el=>el.remove());}
  const png=PNG.sync.read(screenshot);
  const luminance=rgb=>{
    const c=rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  };
  return probes.map(probe=>{
    const {rect,foreground}=probe;
    if(rect.left<0||rect.top<0||rect.right>png.width||rect.bottom>png.height)throw Error(`SVG label outside captured viewport: ${probe.label}`);
    let minimum=Infinity;
    for(let y=Math.ceil(rect.top);y<Math.floor(rect.bottom);y++)for(let x=Math.ceil(rect.left);x<Math.floor(rect.right);x++) {
      const i=(y*png.width+x)*4;
      const background=[png.data[i],png.data[i+1],png.data[i+2]];
      const ink=background.map((v,i)=>foreground[i]*foreground[3]+v*(1-foreground[3]));
      const a=luminance(ink),b=luminance(background);
      minimum=Math.min(minimum,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));
    }
    if(!Number.isFinite(minimum))throw Error(`Empty SVG label: ${probe.label}`);
    return {label:probe.label,foreground,filter:probe.filter,minimum};
  });
}
