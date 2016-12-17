/**
---
_bundle: PullToRefresh
---
*/

/* eslint-disable import/no-unresolved */

let _SETTINGS = {};
let defaultStyle;
let defaultHTML;
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
  containerClassName: '',
  boxClassName: '',
  contentClassName: '',
  textClassName: '',
  instructionsPullToRefresh: 'Pull down to refresh',
  instructionsReleaseToRefresh: 'Release to refresh',
  instructionsRefreshing: 'Refreshing',
  refreshTimeout: 500,
  onInit: () => {},
  onRefresh: () => location.reload(),
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

function _update() {
  const {
    classPrefix,
    ptrElement,
    instructionsRefreshing,
    instructionsPullToRefresh,
    instructionsReleaseToRefresh,
  } = _SETTINGS;

  const textEl = ptrElement.querySelector(`.${classPrefix}text`);

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
    const { cssProp, ptrElement, classPrefix } = _SETTINGS;

    ptrElement.classList.remove(`${classPrefix}refresh`);
    ptrElement.style[cssProp] = '0px';

    _state = 'pending';
  }

  function _onTouchStart(e) {
    const { triggerElement } = _SETTINGS;

    if (!window.scrollY) {
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
    const {
      ptrElement, resistanceFunction, distMax, distThreshold, cssProp, classPrefix,
    } = _SETTINGS;

    if (!pullStartY) {
      if (!window.scrollY) {
        pullStartY = e.touches[0].screenY;
      }
    } else {
      pullMoveY = e.touches[0].screenY;
    }

    if (!_enable || _state === 'refreshing') {
      if (!window.scrollY && pullStartY < pullMoveY) {
        e.preventDefault();
      }

      return;
    }

    if (_state === 'pending') {
      ptrElement.classList.add(`${classPrefix}pull`);
      _state = 'pulling';
      _update();
    }

    if (pullStartY && pullMoveY) {
      dist = pullMoveY - pullStartY;
    }

    if (dist > 0) {
      e.preventDefault();

      ptrElement.style[cssProp] = `${distResisted}px`;

      distResisted = resistanceFunction(dist / distThreshold)
        * Math.min(distMax, dist);

      if (_state === 'pulling' && distResisted > distThreshold) {
        ptrElement.classList.add(`${classPrefix}release`);
        _state = 'releasing';
        _update();
      }

      if (_state === 'releasing' && distResisted < distThreshold) {
        ptrElement.classList.remove(`${classPrefix}release`);
        _state = 'pulling';
        _update();
      }
    }
  }

  function _onTouchEnd() {
    const {
      ptrElement, onRefresh, refreshTimeout, distThreshold, distReload, cssProp, classPrefix,
    } = _SETTINGS;

    if (_state === 'releasing' && distResisted > distThreshold) {
      _state = 'refreshing';

      ptrElement.style[cssProp] = `${distReload}px`;
      ptrElement.classList.add(`${classPrefix}refresh`);

      _timeout = setTimeout(() => {
        const retval = onRefresh(onReset);

        if (retval && typeof retval.then === 'function') {
          retval.then(() => onReset());
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

    ptrElement.classList.remove(`${classPrefix}release`);
    ptrElement.classList.remove(`${classPrefix}pull`);

    pullStartY = pullMoveY = null;
    dist = distResisted = 0;
  }

  window.addEventListener('touchend', _onTouchEnd);
  window.addEventListener('touchstart', _onTouchStart);
  window.addEventListener('touchmove', _onTouchMove, { passive: false });

  // Store event handlers to use for teardown later
  return {
    onTouchStart: _onTouchStart,
    onTouchMove: _onTouchMove,
    onTouchEnd: _onTouchEnd,
  };
}

function _run() {
  const {
    mainElement, classPrefix, onInit, containerClassName,
  } = _SETTINGS;

  if (!_SETTINGS.ptrElement) {
    const ptr = document.createElement('div');
    if (mainElement !== document.body) {
      mainElement.parentNode.insertBefore(ptr, mainElement);
    } else {
      document.body.insertBefore(ptr, document.body.firstChild);
    }

    ptr.classList.add(`${classPrefix}ptr`);
    if (containerClassName !== '') {
      ptr.classList.add(`${containerClassName}`);
    }
    ptr.innerHTML = defaultHTML;
    _SETTINGS.ptrElement = ptr;
  }

  const styleEl = document.createElement('style');

  styleEl.textContent = defaultStyle;

  // document.head.appendChild(styleEl);

  document.head.insertBefore(styleEl, document.head.firstChild);

  if (typeof onInit === 'function') {
    onInit(_SETTINGS);
  }

  return {
    styleNode: styleEl,
    ptrElement: _SETTINGS.ptrElement,
  };
}

const updateElement = () => {
  defaultStyle = `
    .${_SETTINGS.classPrefix}ptr {
      background: #E0E0E0;
      pointer-events: none;
      font-size: 0.85em;
      font-weight: bold;
      top: 0;
      height: 0;
      transition: height 0.3s, min-height 0.3s;
      text-align: center;
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      align-content: stretch;
    }
    .${_SETTINGS.classPrefix}box {
      padding: 10px;
      flex-basis: 100%;
    }
    .${_SETTINGS.classPrefix}pull {
      transition: none;
    }
    .${_SETTINGS.classPrefix}release .${_SETTINGS.classPrefix}icon {
      transform: rotate(180deg);
    }
  `;

  defaultHTML = `
    <div class="${_SETTINGS.classPrefix}box${_SETTINGS.boxClassName ? ` ${_SETTINGS.boxClassName}` : ''}">
      <div class="${_SETTINGS.classPrefix}content${_SETTINGS.contentClassName ? ` ${_SETTINGS.contentClassName}` : ''}">
        <div class="${_SETTINGS.classPrefix}text${_SETTINGS.textClassName ? ` ${_SETTINGS.textClassName}` : ''}"></div>
      </div>
    </div>
  `;
};

export default {
  init(options = {}) {
    let handlers;
    Object.keys(_defaults).forEach((key) => {
      _SETTINGS[key] = options[key] || _defaults[key];
    });

    if (typeof _SETTINGS.mainElement === 'string') {
      _SETTINGS.mainElement = document.querySelector(_SETTINGS.mainElement);
    }

    if (typeof _SETTINGS.ptrElement === 'string') {
      _SETTINGS.ptrElement = document.querySelector(_SETTINGS.ptrElement);
    }

    if (typeof _SETTINGS.triggerElement === 'string') {
      _SETTINGS.triggerElement = document.querySelector(_SETTINGS.triggerElement);
    }

    updateElement();

    if (!_setup) {
      handlers = _setupEvents();
      _setup = true;
    }

    let { styleNode, ptrElement } = _run();

    return {
      destroy() {
        // Teardown event listeners
        window.removeEventListener('touchstart', handlers.onTouchStart);
        window.removeEventListener('touchend', handlers.onTouchEnd);
        window.removeEventListener('touchmove', handlers.onTouchMove);

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
