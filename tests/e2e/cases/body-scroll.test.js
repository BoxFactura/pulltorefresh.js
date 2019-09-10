import { pullToRefresh, hasMinHeight, isUnmounted } from '../helpers';
import { t, ClientFunction } from 'testcafe';

let getScroll = ClientFunction(()=>{
  return window.scrollY;
});

let setScroll = ClientFunction((val)=>{
  window.scrollTo(0, val);
});

fixture('Basic test')
  .page('http://localhost:8080/body-scroll.html');

// if shouldPullToRefresh depends on mainElement.scrollTop, whenever it is a
// body or an element without overflow, it has an unexpected behaviour once PTR is
// triggered for the first time; you cannot scroll up but you can do it down
test('scrolling in body', async () => {
  await t.setNativeDialogHandler(() => true);

  // once executed, scrolling must be possible
  await isUnmounted();
  await t.drag('body', 0, 150, { offsetY: 300 });

  let y = await getScroll();
  console.log(y);
  await t.drag('body', 0, -500, { offsetY: 500, speed: 0.5 });

  y = await getScroll();
  console.log(y);
});
