import _shared from './shared';

function setupDOM(handler) {
  if (!handler.ptrElement) {
    const ptr = document.createElement('div');

    if (handler.mainElement !== document.body) {
      handler.mainElement.parentNode.insertBefore(ptr, handler.mainElement);
    } else {
      document.body.insertBefore(ptr, document.body.firstChild);
    }

    ptr.classList.add(`${handler.classPrefix}ptr`);
    ptr.innerHTML = handler.getMarkup()
      .replace(/__PREFIX__/g, handler.classPrefix);

    handler.ptrElement = ptr;

    if (typeof handler.onInit === 'function') {
      handler.onInit(handler);
    }

    // Add the css styles to the style node, and then
    // insert it into the dom
    if (!_shared.styleEl) {
      _shared.styleEl = document.createElement('style');
      _shared.styleEl.setAttribute('id', 'pull-to-refresh-js-style');

      document.head.appendChild(_shared.styleEl);
    }

    _shared.styleEl.textContent = handler.getStyles()
      .replace(/__PREFIX__/g, handler.classPrefix)
      .replace(/\s+/g, ' ');
  }

  return handler;
}

function onReset(handler) {
  handler.ptrElement.classList.remove(`${handler.classPrefix}refresh`);
  handler.ptrElement.style[handler.cssProp] = '0px';

  setTimeout(() => {
    // remove previous ptr-element from DOM
    if (handler.ptrElement && handler.ptrElement.parentNode) {
      handler.ptrElement.parentNode.removeChild(handler.ptrElement);
      handler.ptrElement = null;
    }

    // reset state
    _shared.state = 'pending';
  }, handler.refreshTimeout);
}

function update(handler) {
  const iconEl = handler.ptrElement.querySelector(`.${handler.classPrefix}icon`);
  const textEl = handler.ptrElement.querySelector(`.${handler.classPrefix}text`);

  if (iconEl) {
    if (_shared.state === 'refreshing') {
      iconEl.innerHTML = handler.iconRefreshing;
    } else {
      iconEl.innerHTML = handler.iconArrow;
    }
  }

  if (textEl) {
    if (_shared.state === 'releasing') {
      textEl.innerHTML = handler.instructionsReleaseToRefresh;
    }

    if (_shared.state === 'pulling' || _shared.state === 'pending') {
      textEl.innerHTML = handler.instructionsPullToRefresh;
    }

    if (_shared.state === 'refreshing') {
      textEl.innerHTML = handler.instructionsRefreshing;
    }
  }
}

export default {
  setupDOM,
  onReset,
  update,
};
