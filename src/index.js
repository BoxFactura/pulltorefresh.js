/**
---
_bundle: PullToRefresh
---
*/

const _SETTINGS = {};

const _defaults = {
  distTreshold: 90,
  distMax: 120,
  bodyElement: 'body',
  triggerElement: 'body',
  refreshTimeout: 500,
  refreshFunction: () => location.reload(),
  resistanceFunction: t => Math.min(1, t / 2.5),
};

let pullStartY = null;
let pullMoveY = null;
let dist = 0;
let distResisted = 0;

let _state = 'pending';
let _setup = false;
let _enable = false;
let _timeout;

function _closestElement(node, selector) {
  let depth = 10;

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
  window.addEventListener('touchstart', (e) => {
    _enable = _closestElement(e.target, _SETTINGS.triggerElement);

    if(typeof _enable == 'undefined') _enable = _SETTINGS.triggerElement;

    if (_state === 'pending') {
      _SETTINGS.bodyElement.classList.remove('-release');
      _SETTINGS.bodyElement.classList.remove('-refresh');
    }

    clearTimeout(_timeout);

    if (!window.scrollY) {
      pullStartY = e.touches[0].screenY;
    }
  });

  window.addEventListener('touchmove', (e) => {
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
      _SETTINGS.bodyElement.style.webkitTransform = `translate3d(0,${distResisted}px,0)`;

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

  window.addEventListener('touchend', () => {
    if (_state === 'releasing' && distResisted > _SETTINGS.distTreshold) {
      _timeout = setTimeout(() => {
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

export default {
  init(options = {}) {
    Object.keys(_defaults).forEach((key) => {
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
