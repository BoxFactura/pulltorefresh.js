'use strict';

import _ptrMarkup from './_markup.pug';
import _ptrStyles from './_styles.less';

const _defaults = {
  distThreshold: 60,
  distMax: 80,
  distReload: 50,
  bodyOffset: 20,
  mainElement: 'body',
  triggerElement: 'body',
  ptrElement: '.ptr',
  classPrefix: 'ptr--',
  cssProp: 'min-height',
  iconArrow: '&#8675;',
  iconRefreshing: '&hellip;',
  instructionsPullToRefresh: 'Pull down to refresh',
  instructionsReleaseToRefresh: 'Release to refresh',
  instructionsRefreshing: 'Refreshing',
  refreshTimeout: 500,
  getMarkup: _ptrMarkup,
  getStyles: _ptrStyles,
  onInit: () => {},
  onRefresh: () => location.reload(),
  resistanceFunction: t => Math.min(1, t / 2.5),
  shouldPullToRefresh: () => !window.scrollY,
};

const _methods = ['mainElement', 'ptrElement', 'triggerElement'];

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

const _ptr = {
  setupDOM(handler) {
    if (!handler.ptrElement) {
      const ptr = document.createElement('div');

      if (handler.mainElement !== document.body) {
        handler.mainElement.parentNode.insertBefore(ptr, handler.mainElement);
      } else {
        document.body.insertBefore(ptr, document.body.firstChild);
      }

      ptr.classList.add(`${handler.classPrefix}ptr`);
      ptr.innerHTML = handler.getMarkup()
        .replace(/__PREFIX__/g, handler.classPrefix);

      handler.ptrElement = ptr;

      if (typeof handler.onInit === 'function') {
        handler.onInit(handler);
      }

      // Add the css styles to the style node, and then
      // insert it into the dom
      if (!_shared.styleEl) {
        _shared.styleEl = document.createElement('style');
        _shared.styleEl.setAttribute('id', 'pull-to-refresh-js-style');

        document.head.appendChild(_shared.styleEl);
      }

      _shared.styleEl.textContent = handler.getStyles()
        .replace(/__PREFIX__/g, handler.classPrefix)
        .replace(/\s+/g, ' ');
    }

    return handler;
  },
  onReset(handler) {
    handler.ptrElement.classList.remove(`${handler.classPrefix}refresh`);
    handler.ptrElement.style[handler.cssProp] = '0px';

    setTimeout(() => {
      // remove previous ptr-element from DOM
      if (handler.ptrElement && handler.ptrElement.parentNode) {
        handler.ptrElement.parentNode.removeChild(handler.ptrElement);
        handler.ptrElement = null;
      }

      // remove used stylesheet from DOM
      if (_shared.styleEl) {
        document.head.removeChild(_shared.styleEl);
      }

      // reset state
      _shared.styleEl = null;
      _shared.state = 'pending';
    }, handler.refreshTimeout);
  },
  update(handler) {
    const iconEl = handler.ptrElement.querySelector(`.${handler.classPrefix}icon`);
    const textEl = handler.ptrElement.querySelector(`.${handler.classPrefix}text`);

    if (_shared.state === 'refreshing') {
      iconEl.innerHTML = handler.iconRefreshing;
    } else {
      iconEl.innerHTML = handler.iconArrow;
    }

    if (_shared.state === 'releasing') {
      textEl.innerHTML = handler.instructionsReleaseToRefresh;
    }

    if (_shared.state === 'pulling' || _shared.state === 'pending') {
      textEl.innerHTML = handler.instructionsPullToRefresh;
    }

    if (_shared.state === 'refreshing') {
      textEl.innerHTML = handler.instructionsRefreshing;
    }
  },
};

function _setupEvents() {
  let _el;

  function _onTouchStart(e) {
    // here, we must pick a handler first, and then append their html/css on the DOM
    const target = _shared.handlers.filter(h => h.contains(e.target))[0];

    _shared.enable = !!target;

    if (target && _shared.state === 'pending') {
      _el = _ptr.setupDOM(target);

      if (target.shouldPullToRefresh()) {
        _shared.pullStartY = e.touches[0].screenY;
      }

      clearTimeout(_shared.timeout);

      _ptr.update(target);
    }
  }

  function _onTouchMove(e) {
    if (!_shared.enable) {
      return;
    }

    if (!_shared.pullStartY) {
      if (_el.shouldPullToRefresh()) {
        _shared.pullStartY = e.touches[0].screenY;
      }
    } else {
      _shared.pullMoveY = e.touches[0].screenY;
    }

    if (_shared.state === 'refreshing') {
      if (_el.shouldPullToRefresh() && _shared.pullStartY < _shared.pullMoveY) {
        e.preventDefault();
      }

      return;
    }

    if (_shared.state === 'pending') {
      _el.ptrElement.classList.add(`${_el.classPrefix}pull`);
      _shared.state = 'pulling';
      _ptr.update(_el);
    }

    if (_shared.pullStartY && _shared.pullMoveY) {
      _shared.dist = _shared.pullMoveY - _shared.pullStartY;
    }

    if (_shared.dist > 0) {
      e.preventDefault();

      _el.ptrElement.style[_el.cssProp] = `${_shared.distResisted}px`;

      _shared.distResisted = _el.resistanceFunction(_shared.dist / _el.distThreshold)
        * Math.min(_el.distMax, _shared.dist);

      if (_shared.state === 'pulling' && _shared.distResisted > _el.distThreshold) {
        _el.ptrElement.classList.add(`${_el.classPrefix}release`);
        _shared.state = 'releasing';
        _ptr.update(_el);
      }

      if (_shared.state === 'releasing' && _shared.distResisted < _el.distThreshold) {
        _el.ptrElement.classList.remove(`${_el.classPrefix}release`);
        _shared.state = 'pulling';
        _ptr.update(_el);
      }
    }
  }

  function _onTouchEnd() {
    if (!_shared.enable) {
      return;
    }

    if (_shared.state === 'releasing' && _shared.distResisted > _el.distThreshold) {
      _shared.state = 'refreshing';

      _el.ptrElement.style[_el.cssProp] = `${_el.distReload}px`;
      _el.ptrElement.classList.add(`${_el.classPrefix}refresh`);

      _shared.timeout = setTimeout(() => {
        const retval = _el.onRefresh(() => _ptr.onReset(_el));

        if (retval && typeof retval.then === 'function') {
          retval.then(() => _ptr.onReset(_el));
        }

        if (!retval && !_el.onRefresh.length) {
          _ptr.onReset(_el);
        }
      }, _el.refreshTimeout);
    } else {
      if (_shared.state === 'refreshing') {
        return;
      }

      _el.ptrElement.style[_el.cssProp] = '0px';

      _shared.state = 'pending';
    }

    _ptr.update(_el);

    _el.ptrElement.classList.remove(`${_el.classPrefix}release`);
    _el.ptrElement.classList.remove(`${_el.classPrefix}pull`);

    _shared.pullStartY = _shared.pullMoveY = null;
    _shared.dist = _shared.distResisted = 0;
  }

  function _onScroll() {
    if (_el) {
      _el.mainElement.classList.toggle(`${_el.classPrefix}top`, _el.shouldPullToRefresh());
    }
  }

  const _passiveSettings = _shared.supportsPassive
    ? { passive: _shared.passive || false }
    : undefined;

  window.addEventListener('touchend', _onTouchEnd);
  window.addEventListener('touchstart', _onTouchStart);
  window.addEventListener('touchmove', _onTouchMove, _passiveSettings);
  window.addEventListener('scroll', _onScroll);

  return {
    onTouchEnd: _onTouchEnd,
    onTouchStart: _onTouchStart,
    onTouchMove: _onTouchMove,
    onScroll: _onScroll,

    destroy() {
      // Teardown event listeners
      window.removeEventListener('touchstart', _onTouchStart);
      window.removeEventListener('touchend', _onTouchEnd);
      window.removeEventListener('touchmove', _onTouchMove, _passiveSettings);
      window.removeEventListener('scroll', _onScroll);
    },
  };
}

function _setupHandler(options) {
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
  };

  return _handler;
}

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
