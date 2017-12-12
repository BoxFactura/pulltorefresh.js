var PullToRefresh = (function () {
var _ptrMarkup = function () { return "\n<div class=\"__PREFIX__box\">\n  <div class=\"__PREFIX__content\">\n    <div class=\"__PREFIX__icon\"></div>\n    <div class=\"__PREFIX__text\"></div>\n  </div>\n</div>"; };

var _ptrStyles = function () { return ".__PREFIX__ptr {\n  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);\n  pointer-events: none;\n  font-size: 0.85em;\n  font-weight: bold;\n  top: 0;\n  height: 0;\n  transition: height 0.3s, min-height 0.3s;\n  text-align: center;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  align-content: stretch;\n}\n.__PREFIX__box {\n  padding: 10px;\n  flex-basis: 100%;\n}\n.__PREFIX__pull {\n  transition: none;\n}\n.__PREFIX__text {\n  margin-top: .33em;\n  color: rgba(0, 0, 0, 0.3);\n}\n.__PREFIX__icon {\n  color: rgba(0, 0, 0, 0.3);\n  transition: transform .3s;\n}\n.__PREFIX__top {\n  touch-action: pan-x pan-down pinch-zoom;\n}\n.__PREFIX__release .__PREFIX__icon {\n  transform: rotate(180deg);\n}\n"; };

/* eslint-disable import/no-unresolved */

var _SETTINGS = {};

var _defaults = {
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
  onInit: function () {},
  onRefresh: function () { return location.reload(); },
  resistanceFunction: function (t) { return Math.min(1, t / 2.5); },
  shouldPullToRefresh: function () { return !window.scrollY; },
};

var pullStartY = null;
var pullMoveY = null;
var dist = 0;
var distResisted = 0;

var _state = 'pending';
var _setup = false;
var _enable = false;
var _timeout;

var supportsPassive = false;

try {
  window.addEventListener('test', null, {
    get passive() { // eslint-disable-line getter-return
      supportsPassive = true;
    },
  });
} catch (e) {
  // do nothing
}

function _update() {
  var classPrefix = _SETTINGS.classPrefix;
  var ptrElement = _SETTINGS.ptrElement;
  var iconArrow = _SETTINGS.iconArrow;
  var iconRefreshing = _SETTINGS.iconRefreshing;
  var instructionsRefreshing = _SETTINGS.instructionsRefreshing;
  var instructionsPullToRefresh = _SETTINGS.instructionsPullToRefresh;
  var instructionsReleaseToRefresh = _SETTINGS.instructionsReleaseToRefresh;

  var iconEl = ptrElement.querySelector(("." + classPrefix + "icon"));
  var textEl = ptrElement.querySelector(("." + classPrefix + "text"));

  if (_state === 'refreshing') {
    iconEl.innerHTML = iconRefreshing;
  } else {
    iconEl.innerHTML = iconArrow;
  }

  if (_state === 'releasing') {
    textEl.innerHTML = instructionsReleaseToRefresh;
  }

  if (_state === 'pulling' || _state === 'pending') {
    textEl.innerHTML = instructionsPullToRefresh;
  }

  if (_state === 'refreshing') {
    textEl.innerHTML = instructionsRefreshing;
  }
}

function _setupEvents() {
  function onReset() {
    var cssProp = _SETTINGS.cssProp;
    var ptrElement = _SETTINGS.ptrElement;
    var classPrefix = _SETTINGS.classPrefix;

    ptrElement.classList.remove((classPrefix + "refresh"));
    ptrElement.style[cssProp] = '0px';

    _state = 'pending';
  }

  function _onTouchStart(e) {
    var shouldPullToRefresh = _SETTINGS.shouldPullToRefresh;
    var triggerElement = _SETTINGS.triggerElement;

    if (shouldPullToRefresh()) {
      pullStartY = e.touches[0].screenY;
    }

    if (_state !== 'pending') {
      return;
    }

    clearTimeout(_timeout);

    _enable = triggerElement.contains(e.target);
    _state = 'pending';
    _update();
  }

  function _onTouchMove(e) {
    var cssProp = _SETTINGS.cssProp;
    var classPrefix = _SETTINGS.classPrefix;
    var distMax = _SETTINGS.distMax;
    var distThreshold = _SETTINGS.distThreshold;
    var ptrElement = _SETTINGS.ptrElement;
    var resistanceFunction = _SETTINGS.resistanceFunction;
    var shouldPullToRefresh = _SETTINGS.shouldPullToRefresh;

    if (!_enable) {
      return;
    }

    if (!pullStartY) {
      if (shouldPullToRefresh()) {
        pullStartY = e.touches[0].screenY;
      }
    } else {
      pullMoveY = e.touches[0].screenY;
    }

    if (!_enable || _state === 'refreshing') {
      if (shouldPullToRefresh() && pullStartY < pullMoveY) {
        e.preventDefault();
      }

      return;
    }

    if (_state === 'pending') {
      ptrElement.classList.add((classPrefix + "pull"));
      _state = 'pulling';
      _update();
    }

    if (pullStartY && pullMoveY) {
      dist = pullMoveY - pullStartY;
    }

    if (dist > 0) {
      e.preventDefault();

      ptrElement.style[cssProp] = distResisted + "px";

      distResisted = resistanceFunction(dist / distThreshold)
        * Math.min(distMax, dist);

      if (_state === 'pulling' && distResisted > distThreshold) {
        ptrElement.classList.add((classPrefix + "release"));
        _state = 'releasing';
        _update();
      }

      if (_state === 'releasing' && distResisted < distThreshold) {
        ptrElement.classList.remove((classPrefix + "release"));
        _state = 'pulling';
        _update();
      }
    }
  }

  function _onTouchEnd() {
    var ptrElement = _SETTINGS.ptrElement;
    var onRefresh = _SETTINGS.onRefresh;
    var refreshTimeout = _SETTINGS.refreshTimeout;
    var distThreshold = _SETTINGS.distThreshold;
    var distReload = _SETTINGS.distReload;
    var cssProp = _SETTINGS.cssProp;
    var classPrefix = _SETTINGS.classPrefix;

    if (_state === 'releasing' && distResisted > distThreshold) {
      _state = 'refreshing';

      ptrElement.style[cssProp] = distReload + "px";
      ptrElement.classList.add((classPrefix + "refresh"));

      _timeout = setTimeout(function () {
        var retval = onRefresh(onReset);

        if (retval && typeof retval.then === 'function') {
          retval.then(function () { return onReset(); });
        }

        if (!retval && !onRefresh.length) {
          onReset();
        }
      }, refreshTimeout);
    } else {
      if (_state === 'refreshing') {
        return;
      }

      ptrElement.style[cssProp] = '0px';

      _state = 'pending';
    }

    _update();

    ptrElement.classList.remove((classPrefix + "release"));
    ptrElement.classList.remove((classPrefix + "pull"));

    pullStartY = pullMoveY = null;
    dist = distResisted = 0;
  }

  function _onScroll() {
    var mainElement = _SETTINGS.mainElement;
    var classPrefix = _SETTINGS.classPrefix;
    var shouldPullToRefresh = _SETTINGS.shouldPullToRefresh;

    mainElement.classList.toggle((classPrefix + "top"), shouldPullToRefresh());
  }

  window.addEventListener('touchend', _onTouchEnd);
  window.addEventListener('touchstart', _onTouchStart);
  window.addEventListener('touchmove', _onTouchMove, supportsPassive
    ? { passive: _SETTINGS.passive || false }
    : undefined);

  window.addEventListener('scroll', _onScroll);

  // Store event handlers to use for teardown later
  return {
    onTouchStart: _onTouchStart,
    onTouchMove: _onTouchMove,
    onTouchEnd: _onTouchEnd,
    onScroll: _onScroll,
  };
}

function _run() {
  var mainElement = _SETTINGS.mainElement;
  var getMarkup = _SETTINGS.getMarkup;
  var getStyles = _SETTINGS.getStyles;
  var classPrefix = _SETTINGS.classPrefix;
  var onInit = _SETTINGS.onInit;

  if (!document.querySelector(("." + classPrefix + "ptr"))) {
    var ptr = document.createElement('div');

    if (mainElement !== document.body) {
      mainElement.parentNode.insertBefore(ptr, mainElement);
    } else {
      document.body.insertBefore(ptr, document.body.firstChild);
    }

    ptr.classList.add((classPrefix + "ptr"));
    ptr.innerHTML = getMarkup()
      .replace(/__PREFIX__/g, classPrefix);

    _SETTINGS.ptrElement = ptr;
  }

  // Add the css styles to the style node, and then
  // insert it into the dom
  // ========================================================
  var styleEl;
  if (!document.querySelector('#pull-to-refresh-js-style')) {
    styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'pull-to-refresh-js-style');

    document.head.appendChild(styleEl);
  } else {
    styleEl = document.querySelector('#pull-to-refresh-js-style');
  }

  styleEl.textContent = getStyles()
    .replace(/__PREFIX__/g, classPrefix)
    .replace(/\s+/g, ' ');

  if (typeof onInit === 'function') {
    onInit(_SETTINGS);
  }

  return {
    styleNode: styleEl,
    ptrElement: _SETTINGS.ptrElement,
  };
}

var pulltorefresh = {
  init: function init(options) {
    if ( options === void 0 ) options = {};

    var handlers;
    Object.keys(_defaults).forEach(function (key) {
      _SETTINGS[key] = options[key] || _defaults[key];
    });

    var methods = ['mainElement', 'ptrElement', 'triggerElement'];
    methods.forEach(function (method) {
      if (typeof _SETTINGS[method] === 'string') {
        _SETTINGS[method] = document.querySelector(_SETTINGS[method]);
      }
    });

    if (!_setup) {
      handlers = _setupEvents();
      _setup = true;
    }

    var ref = _run();
    var styleNode = ref.styleNode;
    var ptrElement = ref.ptrElement;

    return {
      destroy: function destroy() {
        clearTimeout(_timeout);

        // Teardown event listeners
        window.removeEventListener('touchstart', handlers.onTouchStart);
        window.removeEventListener('touchend', handlers.onTouchEnd);
        window.removeEventListener('touchmove', handlers.onTouchMove, supportsPassive
          ? { passive: _SETTINGS.passive || false }
          : undefined);
        window.removeEventListener('scroll', handlers.onScroll);

        // Remove ptr element and style tag
        styleNode.parentNode.removeChild(styleNode);
        ptrElement.parentNode.removeChild(ptrElement);

        // Enable setupEvents to run again
        _setup = false;

        // null object references
        handlers = null;
        styleNode = null;
        ptrElement = null;
        _SETTINGS = {};
      },
    };
  },
};

return pulltorefresh;

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy9hY2FicmVyYS9Eb2N1bWVudHMvcHVsbHRvcmVmcmVzaC5qcy9zcmMvX21hcmt1cC5wdWciLCIvVXNlcnMvYWNhYnJlcmEvRG9jdW1lbnRzL3B1bGx0b3JlZnJlc2guanMvc3JjL19zdHlsZXMubGVzcyIsIi9Vc2Vycy9hY2FicmVyYS9Eb2N1bWVudHMvcHVsbHRvcmVmcmVzaC5qcy9zcmMvcHVsbHRvcmVmcmVzaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7IHJldHVybiBcIlxcbjxkaXYgY2xhc3M9XFxcIl9fUFJFRklYX19ib3hcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiX19QUkVGSVhfX2NvbnRlbnRcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJfX1BSRUZJWF9faWNvblxcXCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcIl9fUFJFRklYX190ZXh0XFxcIj48L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2PlwiOyB9IixudWxsLCIvKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuXG5pbXBvcnQgX3B0ck1hcmt1cCBmcm9tICcuL19tYXJrdXAucHVnJztcbmltcG9ydCBfcHRyU3R5bGVzIGZyb20gJy4vX3N0eWxlcy5sZXNzJztcblxubGV0IF9TRVRUSU5HUyA9IHt9O1xuXG5jb25zdCBfZGVmYXVsdHMgPSB7XG4gIGRpc3RUaHJlc2hvbGQ6IDYwLFxuICBkaXN0TWF4OiA4MCxcbiAgZGlzdFJlbG9hZDogNTAsXG4gIGJvZHlPZmZzZXQ6IDIwLFxuICBtYWluRWxlbWVudDogJ2JvZHknLFxuICB0cmlnZ2VyRWxlbWVudDogJ2JvZHknLFxuICBwdHJFbGVtZW50OiAnLnB0cicsXG4gIGNsYXNzUHJlZml4OiAncHRyLS0nLFxuICBjc3NQcm9wOiAnbWluLWhlaWdodCcsXG4gIGljb25BcnJvdzogJyYjODY3NTsnLFxuICBpY29uUmVmcmVzaGluZzogJyZoZWxsaXA7JyxcbiAgaW5zdHJ1Y3Rpb25zUHVsbFRvUmVmcmVzaDogJ1B1bGwgZG93biB0byByZWZyZXNoJyxcbiAgaW5zdHJ1Y3Rpb25zUmVsZWFzZVRvUmVmcmVzaDogJ1JlbGVhc2UgdG8gcmVmcmVzaCcsXG4gIGluc3RydWN0aW9uc1JlZnJlc2hpbmc6ICdSZWZyZXNoaW5nJyxcbiAgcmVmcmVzaFRpbWVvdXQ6IDUwMCxcbiAgZ2V0TWFya3VwOiBfcHRyTWFya3VwLFxuICBnZXRTdHlsZXM6IF9wdHJTdHlsZXMsXG4gIG9uSW5pdDogKCkgPT4ge30sXG4gIG9uUmVmcmVzaDogKCkgPT4gbG9jYXRpb24ucmVsb2FkKCksXG4gIHJlc2lzdGFuY2VGdW5jdGlvbjogdCA9PiBNYXRoLm1pbigxLCB0IC8gMi41KSxcbiAgc2hvdWxkUHVsbFRvUmVmcmVzaDogKCkgPT4gIXdpbmRvdy5zY3JvbGxZLFxufTtcblxubGV0IHB1bGxTdGFydFkgPSBudWxsO1xubGV0IHB1bGxNb3ZlWSA9IG51bGw7XG5sZXQgZGlzdCA9IDA7XG5sZXQgZGlzdFJlc2lzdGVkID0gMDtcblxubGV0IF9zdGF0ZSA9ICdwZW5kaW5nJztcbmxldCBfc2V0dXAgPSBmYWxzZTtcbmxldCBfZW5hYmxlID0gZmFsc2U7XG5sZXQgX3RpbWVvdXQ7XG5cbmxldCBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxudHJ5IHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCB7XG4gICAgZ2V0IHBhc3NpdmUoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ2V0dGVyLXJldHVyblxuICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICB9LFxuICB9KTtcbn0gY2F0Y2ggKGUpIHtcbiAgLy8gZG8gbm90aGluZ1xufVxuXG5mdW5jdGlvbiBfdXBkYXRlKCkge1xuICBjb25zdCB7XG4gICAgY2xhc3NQcmVmaXgsXG4gICAgcHRyRWxlbWVudCxcbiAgICBpY29uQXJyb3csXG4gICAgaWNvblJlZnJlc2hpbmcsXG4gICAgaW5zdHJ1Y3Rpb25zUmVmcmVzaGluZyxcbiAgICBpbnN0cnVjdGlvbnNQdWxsVG9SZWZyZXNoLFxuICAgIGluc3RydWN0aW9uc1JlbGVhc2VUb1JlZnJlc2gsXG4gIH0gPSBfU0VUVElOR1M7XG5cbiAgY29uc3QgaWNvbkVsID0gcHRyRWxlbWVudC5xdWVyeVNlbGVjdG9yKGAuJHtjbGFzc1ByZWZpeH1pY29uYCk7XG4gIGNvbnN0IHRleHRFbCA9IHB0ckVsZW1lbnQucXVlcnlTZWxlY3RvcihgLiR7Y2xhc3NQcmVmaXh9dGV4dGApO1xuXG4gIGlmIChfc3RhdGUgPT09ICdyZWZyZXNoaW5nJykge1xuICAgIGljb25FbC5pbm5lckhUTUwgPSBpY29uUmVmcmVzaGluZztcbiAgfSBlbHNlIHtcbiAgICBpY29uRWwuaW5uZXJIVE1MID0gaWNvbkFycm93O1xuICB9XG5cbiAgaWYgKF9zdGF0ZSA9PT0gJ3JlbGVhc2luZycpIHtcbiAgICB0ZXh0RWwuaW5uZXJIVE1MID0gaW5zdHJ1Y3Rpb25zUmVsZWFzZVRvUmVmcmVzaDtcbiAgfVxuXG4gIGlmIChfc3RhdGUgPT09ICdwdWxsaW5nJyB8fCBfc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgIHRleHRFbC5pbm5lckhUTUwgPSBpbnN0cnVjdGlvbnNQdWxsVG9SZWZyZXNoO1xuICB9XG5cbiAgaWYgKF9zdGF0ZSA9PT0gJ3JlZnJlc2hpbmcnKSB7XG4gICAgdGV4dEVsLmlubmVySFRNTCA9IGluc3RydWN0aW9uc1JlZnJlc2hpbmc7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3NldHVwRXZlbnRzKCkge1xuICBmdW5jdGlvbiBvblJlc2V0KCkge1xuICAgIGNvbnN0IHsgY3NzUHJvcCwgcHRyRWxlbWVudCwgY2xhc3NQcmVmaXggfSA9IF9TRVRUSU5HUztcblxuICAgIHB0ckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShgJHtjbGFzc1ByZWZpeH1yZWZyZXNoYCk7XG4gICAgcHRyRWxlbWVudC5zdHlsZVtjc3NQcm9wXSA9ICcwcHgnO1xuXG4gICAgX3N0YXRlID0gJ3BlbmRpbmcnO1xuICB9XG5cbiAgZnVuY3Rpb24gX29uVG91Y2hTdGFydChlKSB7XG4gICAgY29uc3QgeyBzaG91bGRQdWxsVG9SZWZyZXNoLCB0cmlnZ2VyRWxlbWVudCB9ID0gX1NFVFRJTkdTO1xuXG4gICAgaWYgKHNob3VsZFB1bGxUb1JlZnJlc2goKSkge1xuICAgICAgcHVsbFN0YXJ0WSA9IGUudG91Y2hlc1swXS5zY3JlZW5ZO1xuICAgIH1cblxuICAgIGlmIChfc3RhdGUgIT09ICdwZW5kaW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNsZWFyVGltZW91dChfdGltZW91dCk7XG5cbiAgICBfZW5hYmxlID0gdHJpZ2dlckVsZW1lbnQuY29udGFpbnMoZS50YXJnZXQpO1xuICAgIF9zdGF0ZSA9ICdwZW5kaW5nJztcbiAgICBfdXBkYXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBfb25Ub3VjaE1vdmUoZSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNzc1Byb3AsIGNsYXNzUHJlZml4LCBkaXN0TWF4LCBkaXN0VGhyZXNob2xkLCBwdHJFbGVtZW50LCByZXNpc3RhbmNlRnVuY3Rpb24sXG4gICAgICBzaG91bGRQdWxsVG9SZWZyZXNoLFxuICAgIH0gPSBfU0VUVElOR1M7XG5cbiAgICBpZiAoIV9lbmFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXB1bGxTdGFydFkpIHtcbiAgICAgIGlmIChzaG91bGRQdWxsVG9SZWZyZXNoKCkpIHtcbiAgICAgICAgcHVsbFN0YXJ0WSA9IGUudG91Y2hlc1swXS5zY3JlZW5ZO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwdWxsTW92ZVkgPSBlLnRvdWNoZXNbMF0uc2NyZWVuWTtcbiAgICB9XG5cbiAgICBpZiAoIV9lbmFibGUgfHwgX3N0YXRlID09PSAncmVmcmVzaGluZycpIHtcbiAgICAgIGlmIChzaG91bGRQdWxsVG9SZWZyZXNoKCkgJiYgcHVsbFN0YXJ0WSA8IHB1bGxNb3ZlWSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoX3N0YXRlID09PSAncGVuZGluZycpIHtcbiAgICAgIHB0ckVsZW1lbnQuY2xhc3NMaXN0LmFkZChgJHtjbGFzc1ByZWZpeH1wdWxsYCk7XG4gICAgICBfc3RhdGUgPSAncHVsbGluZyc7XG4gICAgICBfdXBkYXRlKCk7XG4gICAgfVxuXG4gICAgaWYgKHB1bGxTdGFydFkgJiYgcHVsbE1vdmVZKSB7XG4gICAgICBkaXN0ID0gcHVsbE1vdmVZIC0gcHVsbFN0YXJ0WTtcbiAgICB9XG5cbiAgICBpZiAoZGlzdCA+IDApIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgcHRyRWxlbWVudC5zdHlsZVtjc3NQcm9wXSA9IGAke2Rpc3RSZXNpc3RlZH1weGA7XG5cbiAgICAgIGRpc3RSZXNpc3RlZCA9IHJlc2lzdGFuY2VGdW5jdGlvbihkaXN0IC8gZGlzdFRocmVzaG9sZClcbiAgICAgICAgKiBNYXRoLm1pbihkaXN0TWF4LCBkaXN0KTtcblxuICAgICAgaWYgKF9zdGF0ZSA9PT0gJ3B1bGxpbmcnICYmIGRpc3RSZXNpc3RlZCA+IGRpc3RUaHJlc2hvbGQpIHtcbiAgICAgICAgcHRyRWxlbWVudC5jbGFzc0xpc3QuYWRkKGAke2NsYXNzUHJlZml4fXJlbGVhc2VgKTtcbiAgICAgICAgX3N0YXRlID0gJ3JlbGVhc2luZyc7XG4gICAgICAgIF91cGRhdGUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKF9zdGF0ZSA9PT0gJ3JlbGVhc2luZycgJiYgZGlzdFJlc2lzdGVkIDwgZGlzdFRocmVzaG9sZCkge1xuICAgICAgICBwdHJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYCR7Y2xhc3NQcmVmaXh9cmVsZWFzZWApO1xuICAgICAgICBfc3RhdGUgPSAncHVsbGluZyc7XG4gICAgICAgIF91cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfb25Ub3VjaEVuZCgpIHtcbiAgICBjb25zdCB7XG4gICAgICBwdHJFbGVtZW50LCBvblJlZnJlc2gsIHJlZnJlc2hUaW1lb3V0LCBkaXN0VGhyZXNob2xkLCBkaXN0UmVsb2FkLCBjc3NQcm9wLCBjbGFzc1ByZWZpeCxcbiAgICB9ID0gX1NFVFRJTkdTO1xuXG4gICAgaWYgKF9zdGF0ZSA9PT0gJ3JlbGVhc2luZycgJiYgZGlzdFJlc2lzdGVkID4gZGlzdFRocmVzaG9sZCkge1xuICAgICAgX3N0YXRlID0gJ3JlZnJlc2hpbmcnO1xuXG4gICAgICBwdHJFbGVtZW50LnN0eWxlW2Nzc1Byb3BdID0gYCR7ZGlzdFJlbG9hZH1weGA7XG4gICAgICBwdHJFbGVtZW50LmNsYXNzTGlzdC5hZGQoYCR7Y2xhc3NQcmVmaXh9cmVmcmVzaGApO1xuXG4gICAgICBfdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCByZXR2YWwgPSBvblJlZnJlc2gob25SZXNldCk7XG5cbiAgICAgICAgaWYgKHJldHZhbCAmJiB0eXBlb2YgcmV0dmFsLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR2YWwudGhlbigoKSA9PiBvblJlc2V0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXR2YWwgJiYgIW9uUmVmcmVzaC5sZW5ndGgpIHtcbiAgICAgICAgICBvblJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHJlZnJlc2hUaW1lb3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9zdGF0ZSA9PT0gJ3JlZnJlc2hpbmcnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcHRyRWxlbWVudC5zdHlsZVtjc3NQcm9wXSA9ICcwcHgnO1xuXG4gICAgICBfc3RhdGUgPSAncGVuZGluZyc7XG4gICAgfVxuXG4gICAgX3VwZGF0ZSgpO1xuXG4gICAgcHRyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGAke2NsYXNzUHJlZml4fXJlbGVhc2VgKTtcbiAgICBwdHJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYCR7Y2xhc3NQcmVmaXh9cHVsbGApO1xuXG4gICAgcHVsbFN0YXJ0WSA9IHB1bGxNb3ZlWSA9IG51bGw7XG4gICAgZGlzdCA9IGRpc3RSZXNpc3RlZCA9IDA7XG4gIH1cblxuICBmdW5jdGlvbiBfb25TY3JvbGwoKSB7XG4gICAgY29uc3Qge1xuICAgICAgbWFpbkVsZW1lbnQsIGNsYXNzUHJlZml4LCBzaG91bGRQdWxsVG9SZWZyZXNoLFxuICAgIH0gPSBfU0VUVElOR1M7XG5cbiAgICBtYWluRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKGAke2NsYXNzUHJlZml4fXRvcGAsIHNob3VsZFB1bGxUb1JlZnJlc2goKSk7XG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBfb25Ub3VjaEVuZCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgX29uVG91Y2hTdGFydCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBfb25Ub3VjaE1vdmUsIHN1cHBvcnRzUGFzc2l2ZVxuICAgID8geyBwYXNzaXZlOiBfU0VUVElOR1MucGFzc2l2ZSB8fCBmYWxzZSB9XG4gICAgOiB1bmRlZmluZWQpO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBfb25TY3JvbGwpO1xuXG4gIC8vIFN0b3JlIGV2ZW50IGhhbmRsZXJzIHRvIHVzZSBmb3IgdGVhcmRvd24gbGF0ZXJcbiAgcmV0dXJuIHtcbiAgICBvblRvdWNoU3RhcnQ6IF9vblRvdWNoU3RhcnQsXG4gICAgb25Ub3VjaE1vdmU6IF9vblRvdWNoTW92ZSxcbiAgICBvblRvdWNoRW5kOiBfb25Ub3VjaEVuZCxcbiAgICBvblNjcm9sbDogX29uU2Nyb2xsLFxuICB9O1xufVxuXG5mdW5jdGlvbiBfcnVuKCkge1xuICBjb25zdCB7XG4gICAgbWFpbkVsZW1lbnQsIGdldE1hcmt1cCwgZ2V0U3R5bGVzLCBjbGFzc1ByZWZpeCwgb25Jbml0LFxuICB9ID0gX1NFVFRJTkdTO1xuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7Y2xhc3NQcmVmaXh9cHRyYCkpIHtcbiAgICBjb25zdCBwdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIGlmIChtYWluRWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgbWFpbkVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocHRyLCBtYWluRWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHB0ciwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBwdHIuY2xhc3NMaXN0LmFkZChgJHtjbGFzc1ByZWZpeH1wdHJgKTtcbiAgICBwdHIuaW5uZXJIVE1MID0gZ2V0TWFya3VwKClcbiAgICAgIC5yZXBsYWNlKC9fX1BSRUZJWF9fL2csIGNsYXNzUHJlZml4KTtcblxuICAgIF9TRVRUSU5HUy5wdHJFbGVtZW50ID0gcHRyO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBjc3Mgc3R5bGVzIHRvIHRoZSBzdHlsZSBub2RlLCBhbmQgdGhlblxuICAvLyBpbnNlcnQgaXQgaW50byB0aGUgZG9tXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGxldCBzdHlsZUVsO1xuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwdWxsLXRvLXJlZnJlc2gtanMtc3R5bGUnKSkge1xuICAgIHN0eWxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlRWwuc2V0QXR0cmlidXRlKCdpZCcsICdwdWxsLXRvLXJlZnJlc2gtanMtc3R5bGUnKTtcblxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbCk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwdWxsLXRvLXJlZnJlc2gtanMtc3R5bGUnKTtcbiAgfVxuXG4gIHN0eWxlRWwudGV4dENvbnRlbnQgPSBnZXRTdHlsZXMoKVxuICAgIC5yZXBsYWNlKC9fX1BSRUZJWF9fL2csIGNsYXNzUHJlZml4KVxuICAgIC5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG5cbiAgaWYgKHR5cGVvZiBvbkluaXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvbkluaXQoX1NFVFRJTkdTKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3R5bGVOb2RlOiBzdHlsZUVsLFxuICAgIHB0ckVsZW1lbnQ6IF9TRVRUSU5HUy5wdHJFbGVtZW50LFxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGluaXQob3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGhhbmRsZXJzO1xuICAgIE9iamVjdC5rZXlzKF9kZWZhdWx0cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBfU0VUVElOR1Nba2V5XSA9IG9wdGlvbnNba2V5XSB8fCBfZGVmYXVsdHNba2V5XTtcbiAgICB9KTtcblxuICAgIGNvbnN0IG1ldGhvZHMgPSBbJ21haW5FbGVtZW50JywgJ3B0ckVsZW1lbnQnLCAndHJpZ2dlckVsZW1lbnQnXTtcbiAgICBtZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBfU0VUVElOR1NbbWV0aG9kXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgX1NFVFRJTkdTW21ldGhvZF0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKF9TRVRUSU5HU1ttZXRob2RdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghX3NldHVwKSB7XG4gICAgICBoYW5kbGVycyA9IF9zZXR1cEV2ZW50cygpO1xuICAgICAgX3NldHVwID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBsZXQgeyBzdHlsZU5vZGUsIHB0ckVsZW1lbnQgfSA9IF9ydW4oKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkZXN0cm95KCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoX3RpbWVvdXQpO1xuXG4gICAgICAgIC8vIFRlYXJkb3duIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGhhbmRsZXJzLm9uVG91Y2hTdGFydCk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGhhbmRsZXJzLm9uVG91Y2hFbmQpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgaGFuZGxlcnMub25Ub3VjaE1vdmUsIHN1cHBvcnRzUGFzc2l2ZVxuICAgICAgICAgID8geyBwYXNzaXZlOiBfU0VUVElOR1MucGFzc2l2ZSB8fCBmYWxzZSB9XG4gICAgICAgICAgOiB1bmRlZmluZWQpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlcnMub25TY3JvbGwpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBwdHIgZWxlbWVudCBhbmQgc3R5bGUgdGFnXG4gICAgICAgIHN0eWxlTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlTm9kZSk7XG4gICAgICAgIHB0ckVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwdHJFbGVtZW50KTtcblxuICAgICAgICAvLyBFbmFibGUgc2V0dXBFdmVudHMgdG8gcnVuIGFnYWluXG4gICAgICAgIF9zZXR1cCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIG51bGwgb2JqZWN0IHJlZmVyZW5jZXNcbiAgICAgICAgaGFuZGxlcnMgPSBudWxsO1xuICAgICAgICBzdHlsZU5vZGUgPSBudWxsO1xuICAgICAgICBwdHJFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgX1NFVFRJTkdTID0ge307XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl0sIm5hbWVzIjpbImxldCIs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