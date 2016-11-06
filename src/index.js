/**
---
_bundle: PullToRefresh
---
*/

import { _closestElement } from './_helpers';

/* eslint-disable import/no-unresolved */

import _ptrMarkup from './_markup';
import _ptrStyles from './_styles';

const _SETTINGS = {};

const _defaults = {
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
  getMarkup: () => _ptrMarkup(),
  getStyles: () => _ptrStyles(),
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

function _setupEvents() {
  const { classPrefix } = _SETTINGS;

  window.addEventListener('touchstart', (e) => {
    const { triggerElement } = _SETTINGS;

    clearTimeout(_timeout);

    if (!window.scrollY) {
      pullStartY = e.touches[0].screenY;
    }

    _enable = _closestElement(e.target, triggerElement);
  });

  window.addEventListener('touchmove', (e) => {
    const {
      ptrElement, resistanceFunction, distMax, distTreshold,
    } = _SETTINGS;

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
      ptrElement.classList.add(`${classPrefix}pull`);
      _state = 'pulling';
    }

    if (pullStartY && pullMoveY) {
      dist = pullMoveY - pullStartY;
    }

    if (dist > 0) {
      e.preventDefault();

      ptrElement.style.height = `${distResisted}px`;

      distResisted = resistanceFunction(dist / distTreshold)
        * Math.min(distMax, dist);

      if (_state === 'pulling' && distResisted > distTreshold) {
        ptrElement.classList.add(`${classPrefix}release`);
        _state = 'releasing';
      }

      if (_state === 'releasing' && distResisted < distTreshold) {
        ptrElement.classList.remove(`${classPrefix}release`);
        _state = 'pulling';
      }
    }
  });

  window.addEventListener('touchend', () => {
    const {
      ptrElement, refreshFunction, refreshTimeout, distTreshold, distReload,
    } = _SETTINGS;

    if (_state === 'releasing' && distResisted > distTreshold) {
      _timeout = setTimeout(() => {
        refreshFunction();
        ptrElement.style.height = '0px';
        ptrElement.classList.remove(`${classPrefix}refresh`);
      }, refreshTimeout);

      ptrElement.style.height = `${distReload}px`;
      ptrElement.classList.add(`${classPrefix}refresh`);
    } else {
      ptrElement.style.height = '0px';
    }

    ptrElement.classList.remove(`${classPrefix}release`);
    ptrElement.classList.remove(`${classPrefix}pull`);
    _state = 'pending';

    pullStartY = pullMoveY = null;
    dist = distResisted = 0;
  });
}

function _run() {
  const {
    bodyElement, getMarkup, getStyles, classPrefix,
  } = _SETTINGS;

  if (!_SETTINGS.ptrElement) {
    const ptr = document.createElement('div');

    bodyElement.parentNode.insertBefore(ptr, bodyElement);

    ptr.classList.add(`${classPrefix}ptr`);
    ptr.innerHTML = getMarkup()
      .replace(/__PREFIX__/g, classPrefix);

    _SETTINGS.ptrElement = ptr;
  }

  const styleEl = document.createElement('style');

  styleEl.innerText = getStyles()
    .replace(/__PREFIX__/g, classPrefix)
    .replace(/\s+/g, ' ');

  document.head.appendChild(styleEl);
}

export default {
  init(options = {}) {
    Object.keys(_defaults).forEach((key) => {
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
