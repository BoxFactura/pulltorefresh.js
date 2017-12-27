/* global QUnit, PullToRefresh */

const { test, module } = QUnit;

const _ = PullToRefresh._;
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

module('Setup & Teardown');
test('init() & destroy()', assert => {
  assert.equal(typeof PullToRefresh.init, 'function', 'Init is a function');

  const x = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });

  assert.equal(typeof x.destroy, 'function', 'returns a destroy function');

  // attach DOM & events manually
  _.setupDOM(x);

  assert.ok($('.ptr--ptr'), 'it adds the ptr element');
  assert.equal($$('#pull-to-refresh-js-style').length, 1, 'it adds the style element');

  x.destroy();

  _.onReset(x);

  const done = assert.async();

  setTimeout(() => {
    assert.equal($$('.ptr--ptr').length, 0, 'destroy removes the ptr element');
    assert.equal($$('#pull-to-refresh-js-style').length, 0, 'destroy removes the style element');

    done();
  }, x.refreshTimeout + 1);
});

test('Ensure Init is idempotent', assert => {
  const x = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
  const y = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });

  _.setupDOM(x);
  _.setupDOM(y);

  assert.equal($$('.ptr--ptr').length, 2, 'add two ptr elements');
  assert.equal($$('#pull-to-refresh-js-style').length, 1, 'adds the style element once');

  const done = assert.async();

  _.onReset(x);
  _.onReset(y);

  setTimeout(() => {
    assert.equal($$('.ptr--ptr').length, 0, 'remove added ptr elements');
    assert.equal($$('#pull-to-refresh-js-style').length, 0, 'remove style element');

    done();
  }, x.refreshTimeout + 2);
});
