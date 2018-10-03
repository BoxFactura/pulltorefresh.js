import { pullToRefresh, hasMinHeight, isUnmounted } from '../helpers';

/* global fixture, test */

fixture('Callback test')
  .page('http://localhost:8080/callback.html');

test('`onRefresh` will receive an optional callback to complete the action', async () => {
  await isUnmounted();
  await pullToRefresh('body', 100, 200);
  await hasMinHeight();
});
