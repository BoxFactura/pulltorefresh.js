import { pullToRefresh, isUnmounted, hasMinHeight } from '../helpers';

/* global fixture, test */

fixture('Trigger test')
  .page('http://localhost:8080/trigger.html');

test('use `triggerElement` to use a different element for pulling', async () => {
  await isUnmounted();
  await pullToRefresh('.trigger', 100, 200);
  await hasMinHeight();
});
