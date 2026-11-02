import { readFile } from 'node:fs/promises';

export const fixture = await readFile(new URL('../fixtures/obsidian-shell.html', import.meta.url), 'utf8');
export const theme = await readFile(new URL('../../theme.css', import.meta.url), 'utf8');
export const icon = '<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/></svg>';
export const callouts = ['note', 'info', 'todo', 'abstract', 'tip', 'success', 'question', 'warning', 'failure', 'danger', 'bug', 'quote', 'definition', 'definizione', 'formula', 'example', 'esempio', 'exercise', 'esercizio', 'doubt', 'dubbio', 'theorem', 'teorema', 'proof', 'dimostrazione', 'lemma', 'important', 'importante'];
export const callout = type => `<div class="callout" data-callout="${type}"><div class="callout-title"><span class="callout-icon">${icon}</span><span class="callout-title-inner">${type}</span></div><div class="callout-content"><p>Clear notes with <strong>emphasis</strong> and <em>details</em>.</p></div></div>`;

export async function loadFixture(page, classes = '') {
  await page.setContent(fixture);
  await page.addStyleTag({ content: theme });
  await page.evaluate(classes => { document.body.className = classes; }, classes);
}

export function semanticMarkup() {
  return ['background-primary', 'paper-surface', 'background-primary-alt', 'table-header-background', 'code-background'].map(surface => `
    <section class="markdown-rendered qa-surface" style="background:var(--${surface})">
    <span data-contrast data-name="${surface}/normal">Normal</span>
    <span class="qa-muted" data-contrast data-name="${surface}/muted">Muted</span>
    <span class="qa-faint" data-contrast data-name="${surface}/faint">Faint</span>
    <strong data-contrast data-name="${surface}/bold">Bold</strong>
    <em data-contrast data-name="${surface}/italic">Italic</em>
    ${[1, 2, 3, 4, 5, 6].map(h => `<h${h} data-contrast data-name="${surface}/h${h}">Heading ${h}</h${h}>`).join('')}
    <a class="internal-link" href="#" data-contrast data-name="${surface}/internal">Internal</a>
    <a class="external-link" href="#" data-contrast data-name="${surface}/external">External</a>
    <a class="internal-link is-unresolved" href="#" data-contrast data-name="${surface}/unresolved">Unresolved</a>
    <a class="tag" href="#" data-contrast data-name="${surface}/tag">#study</a>
    <code data-contrast data-name="${surface}/inline-code">inline code</code>
    <mark data-contrast data-name="${surface}/highlight">Highlight</mark>
    <div class="markdown-source-view mod-cm6">
      ${['strong','em','formatting-strong','formatting-em','link'].map(token=>`<span class="cm-${token}" data-contrast data-name="${surface}/cm-${token}">${token}</span>`).join('')}
      ${['normal','comment','keyword','string','function','important','operator','property','tag','value','punctuation'].map(token=>`<span style="color:var(--code-${token})" data-contrast data-name="${surface}/code-${token}">${token}</span>`).join('')}
    </div>
    </section>`).join('') + `<section class="markdown-rendered">${callouts.map(callout).join('')}</section>`;
}
