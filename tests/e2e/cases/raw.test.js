import { pullToRefresh, hasMinHeight, isUnmounted } from '../helpers';

/* global fixture, test */

fixture('Raw test')
  .page('http://localhost:8080/raw.html');

test('by default, `body` will be used as trigger', async () => {
  await isUnmounted();
  await pullToRefresh('body', 100, 200);
  await hasMinHeight();
});
