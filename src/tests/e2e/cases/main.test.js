/* global fixture, test */

fixture('Some test')
  .page('http://localhost:3001');

test('just wait', async t => {
  await t.wait(1000);
});
