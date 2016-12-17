const { test } = QUnit;

QUnit.module('Setup & Teardown');

test('init()', (assert) => {
  assert.equal(typeof PullToRefresh.init, 'function', 'Init is a function');

  const result = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
  assert.ok(document.querySelector('.ptr--ptr'), 'it adds the ptr element');
  assert.equal(document.querySelectorAll('.pull-to-refresh-js-style').length, 1, 'it adds the style element');

  result.destroy();
});

test('destroy()', (assert) => {
  const result = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
  assert.equal(typeof result.destroy, 'function', 'returns a destroy function');

  result.destroy();
  assert.equal(document.querySelectorAll('.ptr--ptr').length, 0, 'destroy removes the ptr element');
  assert.equal(document.querySelectorAll('.pull-to-refresh-js-style').length, 0, 'destroy removes the style element');
});

test('Ensure Init is idempotent', (assert) => {
  const result = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
  assert.equal(document.querySelectorAll('.ptr--ptr').length, 1, 'it adds ptr element');
  assert.equal(document.querySelectorAll('.pull-to-refresh-js-style').length, 1, 'it adds the style element');

  PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
  assert.equal(document.querySelectorAll('.ptr--ptr').length, 1, 'calling init() a second time does not create another ptr node');
  assert.equal(document.querySelectorAll('.pull-to-refresh-js-style').length, 1, 'calling init() a second time does not create another style node');

  result.destroy();
});
