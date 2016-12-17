const { test } = QUnit;

QUnit.module('Setup & Teardown');

test('Init', (assert) => {
  assert.equal(typeof PullToRefresh.init, 'function', 'Init is a function');
});

test('Integration', (assert) => {
  const result = PullToRefresh.init({
    mainElement: '#ptr-trigger-element',
    triggerElement: '#ptr-trigger-element',
  });

  assert.equal(typeof result.destroy, 'function', 'returns a destroy function');
  assert.ok(document.querySelector('.ptr--ptr'), 'it adds the ptr element');
  assert.ok(document.querySelector('#pull-to-refresh-js-style'), 'it adds the style element');

  result.destroy();

  assert.notOk(
    document.querySelector('.ptr--ptr'),
    'destroy removes the ptr element'
  );

  assert.notOk(
    document.querySelector('#pull-to-refresh-js-style'),
    'destroy removes the style element'
  );
});
