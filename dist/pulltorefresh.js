(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.PullToRefresh = factory());
}(this, (function () {

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

function _getIcon(state) {
  if (state === 'refreshing') {
    return '&hellip;';
  }

  return '&darr;';
}

function _getLabel(state) {
  if (state === 'releasing') {
    return 'Release to refresh';
  }

  if (state === 'pulling' || state === 'pending') {
    return 'Pull down to refresh';
  }

  if (state === 'refreshing') {
    return 'Refreshing';
  }
}

var _ptrMarkup = function(){return "<div class=\"__PREFIX__box\">\n  <div class=\"__PREFIX__content\">\n    <div class=\"__PREFIX__icon\"></div>\n    <div class=\"__PREFIX__text\"></div>\n  </div>\n</div>";};

var _ptrStyles = function(){return ".__PREFIX__ptr {\n  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);\n  pointer-events: none;\n  font-size: 0.85em;\n  font-weight: bold;\n  top: 0;\n  height: 0;\n  transition: height .3s;\n  text-align: center;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  align-content: stretch;\n}\n.__PREFIX__box {\n  padding: 10px;\n  flex-basis: 100%;\n}\n.__PREFIX__pull {\n  transition: none;\n}\n.__PREFIX__text {\n  margin-top: .33em;\n  color: rgba(0, 0, 0, 0.3);\n}\n.__PREFIX__icon {\n  color: rgba(0, 0, 0, 0.3);\n  transition: transform .3s;\n}\n.__PREFIX__release .__PREFIX__icon {\n  transform: rotate(180deg);\n}";};

/*
*/

/* eslint-disable import/no-unresolved */

var _SETTINGS = {};

var _defaults = {
  distTreshold: 60,
  distMax: 80,
  distReload: 50,
  bodyOffset: 20,
  mainElement: 'body',
  triggerElement: 'body',
  ptrElement: '.ptr',
  classPrefix: 'ptr--',
  cssProp: 'padding-top',
  refreshTimeout: 500,
  getIcon: _getIcon,
  getLabel: _getLabel,
  getMarkup: _ptrMarkup,
  getStyles: _ptrStyles,
  onRefresh: function () { return location.reload(); },
  resistanceFunction: function (t) { return Math.min(1, t / 2.5); },
};

var pullStartY = null;
var pullMoveY = null;
var dist = 0;
var distResisted = 0;

var _state = 'pending';
var _setup = false;
var _enable = false;
var _timeout;

function _update() {
  var getIcon = _SETTINGS.getIcon;
  var getLabel = _SETTINGS.getLabel;
  var ptrElement = _SETTINGS.ptrElement;
  var classPrefix = _SETTINGS.classPrefix;

  ptrElement.querySelector(("." + classPrefix + "icon")).innerHTML = getIcon(_state);
  ptrElement.querySelector(("." + classPrefix + "text")).innerHTML = getLabel(_state);
}

function _setupEvents() {
  var classPrefix = _SETTINGS.classPrefix;

  window.addEventListener('touchstart', function (e) {
    var triggerElement = _SETTINGS.triggerElement;

    clearTimeout(_timeout);

    if (!window.scrollY) {
      pullStartY = e.touches[0].screenY;
    }

    _enable = _closestElement(e.target, triggerElement);
    _state = 'pending';
    _update();
  });

  window.addEventListener('touchmove', function (e) {
    var ptrElement = _SETTINGS.ptrElement;
    var resistanceFunction = _SETTINGS.resistanceFunction;
    var distMax = _SETTINGS.distMax;
    var distTreshold = _SETTINGS.distTreshold;

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
      ptrElement.classList.add((classPrefix + "pull"));
      _state = 'pulling';
      _update();
    }

    if (pullStartY && pullMoveY) {
      dist = pullMoveY - pullStartY;
    }

    if (dist > 0) {
      e.preventDefault();

      ptrElement.style.height = distResisted + "px";

      distResisted = resistanceFunction(dist / distTreshold)
        * Math.min(distMax, dist);

      if (_state === 'pulling' && distResisted > distTreshold) {
        ptrElement.classList.add((classPrefix + "release"));
        _state = 'releasing';
        _update();
      }

      if (_state === 'releasing' && distResisted < distTreshold) {
        ptrElement.classList.remove((classPrefix + "release"));
        _state = 'pulling';
        _update();
      }
    }
  });

  window.addEventListener('touchend', function () {
    var ptrElement = _SETTINGS.ptrElement;
    var onRefresh = _SETTINGS.onRefresh;
    var refreshTimeout = _SETTINGS.refreshTimeout;
    var distTreshold = _SETTINGS.distTreshold;
    var distReload = _SETTINGS.distReload;

    if (_state === 'releasing' && distResisted > distTreshold) {
      _state = 'refreshing';

      ptrElement.style.height = distReload + "px";
      ptrElement.classList.add((classPrefix + "refresh"));

      release = function(){
        ptrElement.classList.remove((classPrefix + "refresh"));
        ptrElement.style.height = '0px';
      };

      _timeout = setTimeout(function () {
        onRefresh();
      }, refreshTimeout);
    } else {
      _state = 'pending';

      ptrElement.style.height = '0px';
    }

    _update();

    ptrElement.classList.remove((classPrefix + "release"));
    ptrElement.classList.remove((classPrefix + "pull"));

    pullStartY = pullMoveY = null;
    dist = distResisted = 0;
  });
}

function _run() {
  var mainElement = _SETTINGS.mainElement;
  var getMarkup = _SETTINGS.getMarkup;
  var getStyles = _SETTINGS.getStyles;
  var classPrefix = _SETTINGS.classPrefix;

  if (!_SETTINGS.ptrElement) {
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

    if (typeof _SETTINGS.mainElement === 'string') {
      _SETTINGS.mainElement = document.querySelector(_SETTINGS.mainElement);
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

})));
