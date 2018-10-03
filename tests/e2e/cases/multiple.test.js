import { pullToRefresh, hasMinHeight, isUnmounted, hasCount } from '../helpers';

/* global fixture, test */

fixture('Multiple test')
  .page('http://localhost:8080/multiple.html');

test('you can setup multiple elements at once', async () => {
  await isUnmounted();
  await pullToRefresh('#area1', 100);
  await hasCount(1);

  await pullToRefresh('#area2', 100);
  await hasCount(2);

  await pullToRefresh('#area1', 200);
  await hasMinHeight();

  await pullToRefresh('#area2', 200);
  await hasMinHeight();
});
