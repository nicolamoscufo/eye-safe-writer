import {readFile,writeFile} from 'node:fs/promises';
const sources=["src/01-settings-and-tokens.css","src/02-palettes.css","src/03-chrome-and-panels.css","src/04-editor-and-content.css","src/05-paper-surfaces.css","src/06-accessibility-and-responsive.css","src/07-academic-and-focus.css"];
const css=(await Promise.all(sources.map(p=>readFile(new URL('../'+p,import.meta.url),'utf8')))).join('');
const dest=new URL('../theme.css',import.meta.url);
if(process.argv.includes('--check')){
  if(css!==(await readFile(dest,'utf8'))){console.error('theme.css out of sync: npm run build');process.exitCode=1;}
  else console.log('Generated theme is up-to-date');
}else{await writeFile(dest,css);console.log('Updated theme.css');}
