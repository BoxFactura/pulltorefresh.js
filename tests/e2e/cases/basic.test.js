import { pullToRefresh, hasMinHeight, isUnmounted } from '../helpers';
import { t } from 'testcafe';

/* global fixture, test */

fixture('Basic test')
  .page('http://localhost:8080/basic.html');

test('use `mainElement` for prepending before a given element', async () => {
  await isUnmounted();
  await pullToRefresh('body', 100, 200);
  await hasMinHeight();
});

test('should remove PTR-element if no move intentions are made', async () => {
  await isUnmounted();
  await t.click('body').wait(500);
  await isUnmounted();
});
