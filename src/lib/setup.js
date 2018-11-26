import _setupEvents from './events';
import _defaults from './defaults';
import _shared from './shared';

const _methods = ['mainElement', 'ptrElement', 'triggerElement'];

export default options => {
  const _handler = {};

  // merge options with defaults
  Object.keys(_defaults).forEach(key => {
    _handler[key] = options[key] || _defaults[key];
  });

  // normalize timeout value, even if it is zero
  _handler.refreshTimeout = typeof options.refreshTimeout === 'number'
    ? options.refreshTimeout
    : _defaults.refreshTimeout;

  // normalize elements
  _methods.forEach(method => {
    if (typeof _handler[method] === 'string') {
      _handler[method] = document.querySelector(_handler[method]);
    }
  });

  // attach events lazily
  if (!_shared.events) {
    _shared.events = _setupEvents();
  }

  _handler.contains = target => {
    return _handler.triggerElement.contains(target);
  };

  _handler.destroy = () => {
    // stop pending any pending callbacks
    clearTimeout(_shared.timeout);

    // remove handler from shared state
    _shared.handlers.splice(_handler.offset, 1);

    // reset state
    _shared.state = 'pending';
  };

  return _handler;
};
