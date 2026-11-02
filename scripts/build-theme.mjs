import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const sources = [
  'src/01-settings-and-tokens.css',
  'src/02-palettes.css',
  'src/03-chrome-and-panels.css',
  'src/04-editor-and-content.css',
  'src/05-paper-surfaces.css',
  'src/06-accessibility-and-responsive.css',
  'src/07-academic-and-focus.css',
];
export const palettes = {
  salvia: null, gruvbox: 'gruvbox', amoled: 'amoled', tokyo: 'tokyo-night',
  rosepine: 'rose-pine', solarized: 'solarized', nord: 'nord', cappuccino: 'cappuccino',
};
const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');

export async function generatedAssets() {
  const modules = await Promise.all(sources.map(read));
  // Explicit LF normalization also makes non-Git source archives reproducible.
  const result = { 'theme.css': modules.map(css => css.replace(/\r\n/g, '\n')).join('') };
  for (const [name, filename] of Object.entries(palettes)) {
    if (!filename) continue;
    const blocks = ['light', 'dark'].map(mode => {
      const selector = `.theme-${mode}.eye-safe-palette-${name}`;
      const block = modules[1].match(new RegExp(selector.replaceAll('.', '\\.') + '\\s*\\{([^}]+)\\}'));
      if (!block) throw new Error(`Missing palette: ${selector}`);
      return `body.theme-${mode} {${block[1].replace(/\r\n/g, '\n')}}\n`;
    });
    result[`snippets/eye-safe-palette-${filename}.css`] = `/* Generated from src/02-palettes.css. Enable only one palette snippet at a time. */\n\n${blocks.join('\n')}`;
  }
  return result;
}

export async function build(check = false) {
  for (const [file, content] of Object.entries(await generatedAssets())) {
    if (check) {
      if (await read(file) !== content) throw new Error(`${file} is out of sync: npm run build`);
    } else await writeFile(new URL(file, root), content);
  }
  console.log(check ? 'Generated theme and palette snippets are up-to-date' : 'Built theme.css and palette snippets');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await build(process.argv.includes('--check'));
}
