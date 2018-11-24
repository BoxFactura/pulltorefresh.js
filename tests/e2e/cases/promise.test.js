import { pullToRefresh, hasMinHeight, isUnmounted } from '../helpers';

/* global fixture, test */

fixture('Promise test')
  .page('http://localhost:8080/promise.html');

test('`onRefresh` also accepts promises instead of callbacks', async () => {
  await isUnmounted();
  await pullToRefresh('body', 100, 200);
  await hasMinHeight();
});
