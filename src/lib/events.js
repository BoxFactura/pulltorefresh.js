import _ptr from './api';
import _shared from './shared';

const screenY = function screenY(event) {
  if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
    return event.screenY;
  }
  return event.touches[0].screenY;
};

export default () => {
  let _el;

  function _onTouchStart(e) {
    // here, we must pick a handler first, and then append their html/css on the DOM
    const target = _shared.handlers.filter(h => h.contains(e.target))[0];

    _shared.enable = !!target;

    if (target && _shared.state === 'pending') {
      _el = _ptr.setupDOM(target);

      if (target.shouldPullToRefresh()) {
        _shared.pullStartY = screenY(e);
      }

      clearTimeout(_shared.timeout);

      _ptr.update(target);
    }
  }

  function _onTouchMove(e) {
    if (!(_el && _el.ptrElement && _shared.enable)) {
      return;
    }

    if (!_shared.pullStartY) {
      if (_el.shouldPullToRefresh()) {
        _shared.pullStartY = screenY(e);
      }
    } else {
      _shared.pullMoveY = screenY(e);
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

    _shared.distExtra = _shared.dist - _el.distIgnore;

    if (_shared.distExtra > 0) {
      e.preventDefault();

      _el.ptrElement.style[_el.cssProp] = `${_shared.distResisted}px`;

      _shared.distResisted = _el.resistanceFunction(_shared.distExtra / _el.distThreshold)
        * Math.min(_el.distMax, _shared.distExtra);

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
    if (!(_el && _el.ptrElement && _shared.enable)) {
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

  if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
    window.addEventListener('pointerup', _onTouchEnd);
    window.addEventListener('pointerdown', _onTouchStart);
    window.addEventListener('pointermove', _onTouchMove, _passiveSettings);
  } else {
    window.addEventListener('touchend', _onTouchEnd);
    window.addEventListener('touchstart', _onTouchStart);
    window.addEventListener('touchmove', _onTouchMove, _passiveSettings);
  }

  window.addEventListener('scroll', _onScroll);

  return {
    onTouchEnd: _onTouchEnd,
    onTouchStart: _onTouchStart,
    onTouchMove: _onTouchMove,
    onScroll: _onScroll,

    destroy() {
      if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
        window.removeEventListener('pointerdown', _onTouchStart);
        window.removeEventListener('pointerup', _onTouchEnd);
        window.removeEventListener('pointermove', _onTouchMove, _passiveSettings);
      } else {
        window.removeEventListener('touchstart', _onTouchStart);
        window.removeEventListener('touchend', _onTouchEnd);
        window.removeEventListener('touchmove', _onTouchMove, _passiveSettings);
      }

      window.removeEventListener('scroll', _onScroll);
    },
  };
};
