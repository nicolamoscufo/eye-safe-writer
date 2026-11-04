import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertRibbonLayout, ribbonAppearance } from '../scripts/lib/ribbon-qa.mjs';

const visible = () => ({
  present: true, visible: true, filter: 'none',
  toggle: { top: 8, bottom: 36, width: 28, height: 28 },
  actions: [{ top: 56, bottom: 92, width: 36, height: 36 }, { top: 100, bottom: 136, width: 36, height: 36 }],
});

test('QA ribbon modes preserve app defaults and isolate explicit visibility preferences', () => {
  assert.deepEqual(ribbonAppearance('default'), {});
  assert.deepEqual(ribbonAppearance('visible'), { showRibbon: true });
  assert.deepEqual(ribbonAppearance('hidden'), { showRibbon: false });
  assert.throws(() => ribbonAppearance('typo'), /OBSIDIAN_RIBBON/);
});

test('hidden or absent ribbon accepts empty rows and a missing toggle', () => {
  for (const present of [true, false]) {
    const layout = { present, visible: false, actions: [], toggle: null, filter: null };
    assert.equal(assertRibbonLayout(layout, false), layout);
  }
});

test('an explicit visibility request cannot silently pass in the other state', () => {
  assert.throws(() => assertRibbonLayout(visible(), false), /visibility must match/);
  assert.throws(() => assertRibbonLayout({ visible: false, actions: [] }, true), /visibility must match/);
});

test('visible ribbon still requires rows and the sidebar toggle', () => {
  assert.throws(() => assertRibbonLayout({ ...visible(), actions: [] }), /rendered action rows/);
  assert.throws(() => assertRibbonLayout({ ...visible(), toggle: null }), /rendered sidebar toggle/);
});

test('visible ribbon still rejects action and toggle overlap or a containing-block filter', () => {
  const overlap = visible(); overlap.actions[1].top = 80;
  assert.throws(() => assertRibbonLayout(overlap), /Native ribbon overlap/);
  assert.throws(() => assertRibbonLayout({ ...visible(), toggle: { bottom: 60 } }), /toggle overlaps/);
  assert.throws(() => assertRibbonLayout({ ...visible(), filter: 'blur(0px)' }), /filtered containing block/);
  assert.doesNotThrow(() => assertRibbonLayout(visible(), true));
});

test('a nominally hidden ribbon cannot leak visible action controls', () => {
  assert.throws(() => assertRibbonLayout({ ...visible(), visible: false }), /must not leave visible actions/);
});
