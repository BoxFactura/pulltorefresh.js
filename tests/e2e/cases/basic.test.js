import { pullToRefresh, hasMinHeight, isUnmounted } from '../helpers';

/* global fixture, test */

fixture('Basic test')
  .page('http://localhost:8080/basic.html');

test('use `mainElement` for prepending before a given element', async () => {
  await isUnmounted();
  await pullToRefresh('body', 100, 200);
  await hasMinHeight();
});
