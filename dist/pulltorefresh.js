(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.PullToRefresh = factory());
}(this, function () {

  function _closestElement(node, selector) {
    var depth = 10;

    do {
      if (!(node && node.tagName) || !depth) {
        return null;
      }

      if (node.tagName && node.tagName === selector.toUpperCase()) {
        return node;
      }

      if (selector.charAt() === '#' && node.id === selector.substr(1)) {
        return node;
      }

      if (selector.charAt() === '.' && node.classList.contains(selector.substr(1))) {
        return node;
      }

      depth -= 1;

      node = node.parentNode;
    } while (node.parentNode);
  }

  function _ptrMarkup(){return "<div class=\"__PREFIX__box\">\n  <div class=\"__PREFIX__content\">---</div>\n</div>";};;

  function _ptrStyles(){return ".__PREFIX__ptr {\n  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);\n  pointer-events: none;\n  font-size: 0.85em;\n  font-weight: bold;\n  top: 0;\n  height: 0;\n  transition: height .3s;\n  text-align: center;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  align-content: stretch;\n}\n.__PREFIX__box {\n  padding: 10px;\n  flex-basis: 100%;\n}\n.__PREFIX__pull {\n  transition: none;\n}";};;

  var _SETTINGS = {};

  var _defaults = {
    distTreshold: 90,
    distMax: 120,
    distReload: 50,
    bodyElement: 'body',
    bodyOffset: 20,
    triggerElement: 'body',
    ptrElement: '.ptr',
    classPrefix: 'ptr--',
    cssProp: 'padding-top',
    refreshTimeout: 500,
    getMarkup: function () { return _ptrMarkup(); },
    getStyles: function () { return _ptrStyles(); },
    refreshFunction: function () { return location.reload(); },
    resistanceFunction: function ( t ) { return Math.min(1, t / 2.5); },
  };

  var pullStartY = null;
  var pullMoveY = null;
  var dist = 0;
  var distResisted = 0;

  var _state = 'pending';
  var _setup = false;
  var _enable = false;
  var _timeout;

  function _setupEvents() {
    var classPrefix = _SETTINGS.classPrefix;

    window.addEventListener('touchstart', function (e) {
      var triggerElement = _SETTINGS.triggerElement;

      clearTimeout(_timeout);

      if (!window.scrollY) {
        pullStartY = e.touches[0].screenY;
      }

      _enable = _closestElement(e.target, triggerElement);
    });

    window.addEventListener('touchmove', function (e) {
      var ptrElement = _SETTINGS.ptrElement, resistanceFunction = _SETTINGS.resistanceFunction, distMax = _SETTINGS.distMax, distTreshold = _SETTINGS.distTreshold;

      if (!_enable) {
        return;
      }

      if (!pullStartY) {
        if (!window.scrollY) {
          pullStartY = e.touches[0].screenY;
        }
      } else {
        pullMoveY = e.touches[0].screenY;
      }

      if (_state === 'pending') {
        ptrElement.classList.add(("" + classPrefix + "pull"));
        _state = 'pulling';
      }

      if (pullStartY && pullMoveY) {
        dist = pullMoveY - pullStartY;
      }

      if (dist > 0) {
        e.preventDefault();

        ptrElement.style.height = "" + distResisted + "px";

        distResisted = resistanceFunction(dist / distTreshold)
          * Math.min(distMax, dist);

        if (_state === 'pulling' && distResisted > distTreshold) {
          ptrElement.classList.add(("" + classPrefix + "release"));
          _state = 'releasing';
        }

        if (_state === 'releasing' && distResisted < distTreshold) {
          ptrElement.classList.remove(("" + classPrefix + "release"));
          _state = 'pulling';
        }
      }
    });

    window.addEventListener('touchend', function () {
      var ptrElement = _SETTINGS.ptrElement, refreshFunction = _SETTINGS.refreshFunction, refreshTimeout = _SETTINGS.refreshTimeout, distTreshold = _SETTINGS.distTreshold, distReload = _SETTINGS.distReload;

      if (_state === 'releasing' && distResisted > distTreshold) {
        _timeout = setTimeout(function () {
          refreshFunction();
          ptrElement.style.height = '0px';
          ptrElement.classList.remove(("" + classPrefix + "refresh"));
        }, refreshTimeout);

        ptrElement.style.height = "" + distReload + "px";
        ptrElement.classList.add(("" + classPrefix + "refresh"));
      } else {
        ptrElement.style.height = '0px';
      }

      ptrElement.classList.remove(("" + classPrefix + "release"));
      ptrElement.classList.remove(("" + classPrefix + "pull"));
      _state = 'pending';

      pullStartY = pullMoveY = null;
      dist = distResisted = 0;
    });
  }

  function _run() {
    var bodyElement = _SETTINGS.bodyElement, getMarkup = _SETTINGS.getMarkup, getStyles = _SETTINGS.getStyles, classPrefix = _SETTINGS.classPrefix;

    if (!_SETTINGS.ptrElement) {
      var ptr = document.createElement('div');

      bodyElement.parentNode.insertBefore(ptr, bodyElement);

      ptr.classList.add(("" + classPrefix + "ptr"));
      ptr.innerHTML = getMarkup()
        .replace(/__PREFIX__/g, classPrefix);

      _SETTINGS.ptrElement = ptr;
    }

    var styleEl = document.createElement('style');

    styleEl.innerText = getStyles()
      .replace(/__PREFIX__/g, classPrefix)
      .replace(/\s+/g, ' ');

    document.head.appendChild(styleEl);
  }

  var index = {
    init: function init(options) {
      if ( options === void 0 ) options = {};

      Object.keys(_defaults).forEach(function (key) {
        _SETTINGS[key] = options[key] || _defaults[key];
      });

      if (!_SETTINGS.triggerElement) {
        _SETTINGS.triggerElement = _SETTINGS.bodyElement;
      }

      if (typeof _SETTINGS.bodyElement === 'string') {
        _SETTINGS.bodyElement = document.querySelector(_SETTINGS.bodyElement);
      }

      if (typeof _SETTINGS.ptrElement === 'string') {
        _SETTINGS.ptrElement = document.querySelector(_SETTINGS.ptrElement);
      }

      if (!_setup) {
        _setupEvents();
        _setup = true;
      }

      _run();
    },
  };

  return index;

}));