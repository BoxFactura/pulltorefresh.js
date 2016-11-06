(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.PullToRefresh = factory());
}(this, (function () {

/*
*/

var _SETTINGS = {};

var _defaults = {
  distTreshold: 90,
  distMax: 120,
  bodyElement: 'body',
  triggerElement: 'body',
  refreshTimeout: 500,
  styleFunction: function (){
    var styleEl = document.createElement('style');
    var cssCont = "\n      .ptr {\n        pointer-events: none;\n        transition: all .3s;\n        background: silver;\n        position: fixed;\n        z-index: 0;\n        left: 0;\n        top: -120px;\n        height: 120px;\n        right: 0;\n        bottom: 0;\n      }\n      .box {\n        height: 100%;\n        position: relative;\n      }\n      .box .content {\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        width: 10em;\n        height: 20px;\n        line-height: 20px;\n        margin: auto;\n        position: absolute;\n        text-align: center;\n      }\n      .box .content span {\n        transition: all .3s;\n      }\n    ";
    styleEl.innerText = cssCont;
    document.head.appendChild(styleEl);
  },
  refreshFunction: function () { return location.reload(); },
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

function _closestElement(node, selector) {
  var depth = 10;

  do {
    if (!(node && node.tagName) || !depth) {
      return null;
    }

    if (node.tagName && node.tagName === selector) {
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

function _setupEvents() {
  if(typeof _SETTINGS.styleFunction == 'function') { _SETTINGS.styleFunction(); }
  window.addEventListener('touchstart', function (e) {
    _enable = _closestElement(e.target, _SETTINGS.triggerElement);

    if(typeof _enable == 'undefined') { _enable = _SETTINGS.triggerElement; }

    if (_state === 'pending') {
      _SETTINGS.bodyElement.classList.remove('-release');
      _SETTINGS.bodyElement.classList.remove('-refresh');
    }

    clearTimeout(_timeout);

    if (!window.scrollY) {
      pullStartY = e.touches[0].screenY;
    }
  });

  window.addEventListener('touchmove', function (e) {
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
      _SETTINGS.bodyElement.classList.add('-pull');
      _state = 'pulling';
    }

    if (pullStartY && pullMoveY) {
      dist = pullMoveY - pullStartY;
    }

    if (dist > 0) {
      e.preventDefault();

      _SETTINGS.bodyElement.style.transform =
      _SETTINGS.bodyElement.style.webkitTransform = "translate3d(0," + distResisted + "px,0)";

      distResisted = _SETTINGS.resistanceFunction(dist / _SETTINGS.distTreshold)
        * Math.min(_SETTINGS.distMax, dist);

      if (_state === 'pulling' && distResisted > _SETTINGS.distTreshold) {
        _SETTINGS.bodyElement.classList.add('-release');
        _state = 'releasing';
      }

      if (_state === 'releasing' && distResisted < _SETTINGS.distTreshold) {
        _SETTINGS.bodyElement.classList.remove('-release');
        _state = 'pulling';
      }
    }
  });

  window.addEventListener('touchend', function () {
    if (_state === 'releasing' && distResisted > _SETTINGS.distTreshold) {
      _timeout = setTimeout(function () {
        _SETTINGS.refreshFunction();
      }, _SETTINGS.refreshTimeout);

      _SETTINGS.bodyElement.classList.add('-refresh');
    }

    _SETTINGS.bodyElement.classList.remove('-release');
    _SETTINGS.bodyElement.classList.remove('-pull');
    _SETTINGS.bodyElement.style.transform = '';
    _state = 'pending';

    pullStartY = pullMoveY = null;
    dist = distResisted = 0;
  });
}

var index = {
  init: function init(options) {
    if ( options === void 0 ) options = {};

    Object.keys(_defaults).forEach(function (key) {
      _SETTINGS[key] = options[key] || _defaults[key];
    });

    if (typeof _SETTINGS.bodyElement === 'string') {
      _SETTINGS.bodyElement = document.querySelector(_SETTINGS.bodyElement);
    }

    if (!_setup) {
      _setupEvents();
      _setup = true;
    }
  },
};

return index;

})));
