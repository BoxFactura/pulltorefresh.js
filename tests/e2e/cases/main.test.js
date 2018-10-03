/* global fixture, test */

fixture('Some test')
  .page('http://localhost:8080/trigger.html');

test('try to drag', async t => {
  await t
    .click('.trigger')
    .setNativeDialogHandler(() => true)
    .drag('.trigger', 0, 100, { speed: 0.1 })
    .drag('.trigger', 0, 200, { speed: 0.1 });
});
