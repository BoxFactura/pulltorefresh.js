const _shared = {
  pullStartY: null,
  pullMoveY: null,
  handlers: [],
  styleEl: null,
  events: null,
  dist: 0,
  state: 'pending',
  timeout: null,
  distResisted: 0,
  supportsPassive: false,
  supportsPointerEvents: !!window.PointerEvent,
};

try {
  window.addEventListener('test', null, {
    get passive() { // eslint-disable-line getter-return
      _shared.supportsPassive = true;
    },
  });
} catch (e) {
  // do nothing
}

export default _shared;
