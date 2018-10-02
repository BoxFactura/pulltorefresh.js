import { ClientFunction } from 'testcafe';

/* global fixture, test */

// FIXME: add this to demos UI for toggling?
const getTouchEmulator = ClientFunction(() => {
  const s = document.createElement('script');
  s.src = '//unpkg.com/hammer-touchemulator@0.0.2/touch-emulator.js';
  document.getElementsByTagName('head')[0].appendChild(s);
  return new Promise(ok => {
    setTimeout(() => {
      window.TouchEmulator();
      ok();
    }, 1000);
  });
});

fixture('Some test')
  .page('http://localhost:8080/trigger.html')
  .beforeEach(async t => {
    await getTouchEmulator();
  });

test('try to drag', async t => {
  await t
    .click('.trigger')
    .setNativeDialogHandler(() => true)
    .drag('.trigger', 0, 100, { speed: 0.1 })
    .drag('.trigger', 0, 200, { speed: 0.1 });
});
