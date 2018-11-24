import { pullToRefresh, hasMinHeight, isUnmounted, isMounted } from '../helpers';

/* global fixture, test */

fixture('Tolerance test')
  .page('http://localhost:8080/tolerance.html');

test('use `distIgnore` to ignore movements below the threshold', async () => {
  await isUnmounted();
  await pullToRefresh('body', 45);
  await isMounted();
  await pullToRefresh('body', 200);
  await hasMinHeight();
});
