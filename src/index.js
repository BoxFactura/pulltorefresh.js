/**
---
_bundle: PullToRefresh
---
*/

const _SETTINGS = {};

const _defaults = {
  distTreshold: 90,
  distMax: 120,
  distReload: 50,
  bodyElement: '#main',
  bodyOffset: 20,
  triggerElement: 'body',
  ptrElement: '.ptr',
  classPrefix: 'ptr--',
  cssProp: 'padding-top',
  refreshTimeout: 500,
  markupFunction: ()=>{
    let ptr = document.createElement('div');
    _SETTINGS.bodyElement.parentNode.insertBefore(ptr, _SETTINGS.bodyElement);
    ptr.outerHTML = '<div class="ptr"><div class="box"><div class="content">---</div></div></div>'
  },
  styleFunction: ()=>{
    let styleEl = document.createElement('style');
    let cssCont = `
      .ptr {
        box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);
        pointer-events: none;
        font-size: 0.85em;
        font-weight: bold;
        position: relative;
        top: 0;
        height: 0;
        text-align: center;
        width: 100%;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        align-content: stretch;
      }
      .ptr--refresh{
        transition: height 0.12s;
      }
      .box {
        padding: 10px;
        flex-basis: 100%;
      }
      .box .content {
      }
      .box .content span {
      }
    `
    styleEl.innerText = cssCont;
    document.head.appendChild(styleEl);
  },
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
      _SETTINGS.ptrElement.classList.remove(`${_SETTINGS.classPrefix}release`);
      _SETTINGS.ptrElement.classList.remove(`${_SETTINGS.classPrefix}refresh`);
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
      _SETTINGS.ptrElement.classList.add(`${_SETTINGS.classPrefix}pull`);
      _state = 'pulling';
    }

    if (pullStartY && pullMoveY) {
      dist = pullMoveY - pullStartY;
    }

    if (dist > 0) {
      _SETTINGS.bodyElement.style[_SETTINGS.cssProp] = `${_SETTINGS.bodyOffset}px`;
      e.preventDefault();

      _SETTINGS.ptrElement.style.height = `${distResisted}px`;

      distResisted = _SETTINGS.resistanceFunction(dist / _SETTINGS.distTreshold)
        * Math.min(_SETTINGS.distMax, dist);

      if (_state === 'pulling' && distResisted > _SETTINGS.distTreshold) {
        _SETTINGS.ptrElement.classList.add(`${_SETTINGS.classPrefix}release`);
        _state = 'releasing';
      }

      if (_state === 'releasing' && distResisted < _SETTINGS.distTreshold) {
        _SETTINGS.ptrElement.classList.remove(`${_SETTINGS.classPrefix}release`);
        _state = 'pulling';
      }
    }
  });

  window.addEventListener('touchend', () => {
    if (_state === 'releasing' && distResisted > _SETTINGS.distTreshold) {
      _timeout = setTimeout(() => {
        _SETTINGS.refreshFunction();
        _SETTINGS.ptrElement.style.height = `0px`;
      }, _SETTINGS.refreshTimeout);

      _SETTINGS.ptrElement.style.height = `${_SETTINGS.distReload}px`;

      _SETTINGS.ptrElement.classList.add(`${_SETTINGS.classPrefix}refresh`);
    } else {
      _SETTINGS.ptrElement.style.height = `0px`;
    }

    _SETTINGS.ptrElement.classList.remove(`${_SETTINGS.classPrefix}release`);
    _SETTINGS.ptrElement.classList.remove(`${_SETTINGS.classPrefix}pull`);
    _state = 'pending';

    pullStartY = pullMoveY = null;
    dist = distResisted = 0;
  });

  if(typeof _SETTINGS.styleFunction == 'function') _SETTINGS.styleFunction()
  if(typeof _SETTINGS.markupFunction == 'function') _SETTINGS.markupFunction()

  if (typeof _SETTINGS.ptrElement === 'string') {
    _SETTINGS.ptrElement = document.querySelector(_SETTINGS.ptrElement);
  }
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
