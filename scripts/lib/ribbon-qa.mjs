import assert from 'node:assert/strict';

// Only applied to the disposable native QA vault's appearance.json.
export function ribbonAppearance(mode) {
  assert.ok(['default', 'visible', 'hidden'].includes(mode), 'OBSIDIAN_RIBBON must be default, visible or hidden');
  return mode === 'default' ? {} : { showRibbon: mode === 'visible' };
}

// Serialized by Playwright into the real renderer or the explicitly simulated
// fixture. Keep this function self-contained; return measurements, not DOM nodes.
export function readRibbonLayout() {
  const box = element => {
    if (!element) return null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility)
      || !element.getClientRects().length || rect.width <= 0 || rect.height <= 0) return null;
    return { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
  };
  const ribbon = document.querySelector('.workspace-ribbon.mod-primary')
    || document.querySelector('.workspace-ribbon.mod-left')
    || document.querySelector('.workspace-ribbon:not(.mod-right)');
  const actions = [...(ribbon?.querySelectorAll('.side-dock-actions .side-dock-ribbon-action') || [])]
    .map(box).filter(Boolean);
  const toggle = [...document.querySelectorAll('.sidebar-toggle-button.mod-left, .sidebar-toggle-button:not(.mod-right)')]
    .map(box).find(Boolean) || null;
  return {
    present: Boolean(ribbon), visible: Boolean(box(ribbon)), actions, toggle,
    filter: ribbon ? getComputedStyle(ribbon).filter : null,
  };
}

export function assertRibbonLayout(layout, expectedVisible) {
  if (expectedVisible !== undefined) assert.equal(layout.visible, expectedVisible, 'Native ribbon visibility must match the requested QA mode');
  if (!layout.visible) {
    assert.equal(layout.actions.length, 0, 'A hidden ribbon must not leave visible actions');
    return layout;
  }
  assert.ok(layout.actions.length > 0, 'Visible ribbon must contain rendered action rows');
  assert.ok(layout.toggle, 'Visible ribbon must have a rendered sidebar toggle');
  for (let i = 1; i < layout.actions.length; i++) {
    assert.ok(layout.actions[i].top >= layout.actions[i - 1].bottom, 'Native ribbon overlap');
  }
  assert.ok(layout.toggle.bottom <= layout.actions[0].top, 'Native sidebar toggle overlaps first ribbon action');
  assert.equal(layout.filter, 'none', 'Native ribbon must not create a filtered containing block');
  return layout;
}

export async function checkRibbonLayout(page, expectedVisible) {
  return assertRibbonLayout(await page.evaluate(readRibbonLayout), expectedVisible);
}
