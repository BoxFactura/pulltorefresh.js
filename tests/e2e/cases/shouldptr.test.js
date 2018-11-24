import { pullToRefresh, hasMinHeight, isUnmounted, isMounted } from '../helpers';

/* global fixture, test */

fixture('Should PTR test')
  .page('http://localhost:8080/shouldptr.html');

test('use `shouldPullToRefresh` to enable it dynamically', async t => {
  await isUnmounted();
  await pullToRefresh('body', 200);
  await isMounted();
  await hasMinHeight(false);

  await t.click('#shouldptr');
  await pullToRefresh('body', 200);
  await hasMinHeight();
});
