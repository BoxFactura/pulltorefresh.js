import { Selector, t } from 'testcafe';

const ptrElement = Selector('.ptr--ptr');

export async function pullToRefresh(target, ...offsets) {
  await t.setNativeDialogHandler(() => true);

  for (let i = 0; i < offsets.length; i += 1) {
    await t.drag(target, 0, parseInt(offsets[i], 10)); // eslint-disable-line
  }
}

export async function hasMinHeight(greaterThan) {
  const data = await ptrElement();
  const height = data.getStyleProperty('min-height');
  const value = parseInt(height, 10);

  if (greaterThan === false) {
    return t.expect(value).eql(0);
  }

  return t.expect(value).gt(0);
}

export async function isUnmounted() {
  await t
    .expect(ptrElement.exists)
    .notOk();
}

export async function isMounted() {
  await t
    .expect(ptrElement.exists)
    .ok();
}

export async function hasCount(nth) {
  await t
    .expect(ptrElement.count)
    .eql(nth);
}

export default {
  pullToRefresh,
  hasMinHeight,
  isUnmounted,
  isMounted,
};
