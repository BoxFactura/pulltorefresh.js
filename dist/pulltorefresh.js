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
  bodyElement: '#main',
  bodyOffset: 20,
  triggerElement: 'body',
  ptrElement: '.ptr',
  cssProp: 'padding-top',
  refreshTimeout: 500,
  markupFunction: function (){
    var ptr = document.createElement('div');
    _SETTINGS.bodyElement.parentNode.insertBefore(ptr, _SETTINGS.bodyElement);
    ptr.outerHTML = '<div class="ptr"><div class="box"><div class="content">---</div></div></div>';
  },
  styleFunction: function (){
    var styleEl = document.createElement('style');
    var cssCont = "\n      .ptr {\n        box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);\n        pointer-events: none;\n        font-size: 0.85em;\n        font-weight: bold;\n        position: relative;\n        top: 0;\n        height: 0;\n        text-align: center;\n        width: 100%;\n        overflow: hidden;\n        display: flex;\n        align-items: flex-end;\n        align-content: stretch;\n      }\n      .box {\n        padding: 10px;\n        flex-basis: 100%;\n      }\n      .box .content {\n      }\n      .box .content span {\n      }\n    ";
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
      _SETTINGS.bodyElement.style[_SETTINGS.cssProp] = (_SETTINGS.bodyOffset) + "px";
      e.preventDefault();

      _SETTINGS.ptrElement.style.height = distResisted + "px";

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

  if(typeof _SETTINGS.styleFunction == 'function') { _SETTINGS.styleFunction(); }
  if(typeof _SETTINGS.markupFunction == 'function') { _SETTINGS.markupFunction(); }

  if (typeof _SETTINGS.ptrElement === 'string') {
    _SETTINGS.ptrElement = document.querySelector(_SETTINGS.ptrElement);
  }
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
