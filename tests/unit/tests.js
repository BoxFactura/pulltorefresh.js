(function () {
  

  var test = QUnit.test;
  var module$1 = QUnit.module;

  var _ = PullToRefresh._;
  var $ = function (selector) { return document.querySelector(selector); };
  var $$ = function (selector) { return document.querySelectorAll(selector); };

  module$1('Setup & Teardown');
  test('init() & destroy()', function (assert) {
    assert.equal(typeof PullToRefresh.init, 'function', 'Init is a function');

    var x = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });

    assert.equal(typeof x.destroy, 'function', 'returns a destroy function');

    // attach DOM & events manually
    _.setupDOM(x);

    assert.ok($('.ptr--ptr'), 'it adds the ptr element');
    assert.equal($$('#pull-to-refresh-js-style').length, 1, 'it adds the style element');

    x.destroy();

    _.onReset(x);

    var done = assert.async();

    setTimeout(function () {
      assert.equal($$('.ptr--ptr').length, 0, 'destroy removes the ptr element');
      assert.equal($$('#pull-to-refresh-js-style').length, 0, 'destroy removes the style element');

      done();
    }, x.refreshTimeout + 1);
  });

  test('Ensure Init is idempotent', function (assert) {
    var x = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
    var y = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });

    _.setupDOM(x);
    _.setupDOM(y);

    assert.equal($$('.ptr--ptr').length, 2, 'add two ptr elements');
    assert.equal($$('#pull-to-refresh-js-style').length, 1, 'adds the style element once');

    var done = assert.async();

    _.onReset(x);
    _.onReset(y);

    setTimeout(function () {
      assert.equal($$('.ptr--ptr').length, 0, 'remove added ptr elements');
      assert.equal($$('#pull-to-refresh-js-style').length, 0, 'remove style element');

      done();
    }, x.refreshTimeout + 2);
  });

}());
