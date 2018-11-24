import _ptr from './api';
import _shared from './shared';
import _setupEvents from './events';
import _setupHandler from './setup';

// public API
export default {
  setPassiveMode(isPassive) {
    _shared.passive = isPassive;
  },
  destroyAll() {
    if (_shared.events) {
      _shared.events.destroy();
      _shared.events = null;
    }

    _shared.handlers.forEach(h => {
      h.destroy();
    });
  },
  init(options = {}) {
    const handler = _setupHandler(options);

    // store offset for later unsubscription
    handler.offset = _shared.handlers.push(handler) - 1;

    return handler;
  },

  // export utils for testing
  _: {
    setupHandler: _setupHandler,
    setupEvents: _setupEvents,
    setupDOM: _ptr.setupDOM,
    onReset: _ptr.onReset,
    update: _ptr.update,
  },
};
